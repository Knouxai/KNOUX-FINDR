const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs-extra");
const { app } = require("electron");

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = null;
  }

  async initialize() {
    try {
      // Create database directory
      const userDataPath = app.getPath("userData");
      const dbDir = path.join(userDataPath, "database");
      await fs.ensureDir(dbDir);

      this.dbPath = path.join(dbDir, "knoux_findr.db");

      // Initialize database
      this.db = new sqlite3.Database(this.dbPath);

      await this.createTables();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Database initialization error:", error);
      throw error;
    }
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const tables = [
        // Files table
        `CREATE TABLE IF NOT EXISTS files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          path TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          extension TEXT,
          size INTEGER,
          created_at DATETIME,
          modified_at DATETIME,
          accessed_at DATETIME,
          content_hash TEXT,
          mime_type TEXT,
          extracted_text TEXT,
          metadata TEXT,
          category TEXT,
          tags TEXT,
          ai_analyzed BOOLEAN DEFAULT 0,
          indexed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        // Search index table
        `CREATE TABLE IF NOT EXISTS search_index (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          file_id INTEGER,
          term TEXT NOT NULL,
          frequency INTEGER DEFAULT 1,
          weight REAL DEFAULT 1.0,
          FOREIGN KEY (file_id) REFERENCES files (id),
          UNIQUE(file_id, term)
        )`,

        // Categories table
        `CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          color TEXT,
          icon TEXT,
          ai_generated BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        // Tags table
        `CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          usage_count INTEGER DEFAULT 0,
          ai_generated BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        // File analysis results
        `CREATE TABLE IF NOT EXISTS ai_analysis (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          file_id INTEGER,
          analysis_type TEXT NOT NULL,
          result TEXT,
          confidence REAL,
          analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (file_id) REFERENCES files (id)
        )`,

        // User activity log
        `CREATE TABLE IF NOT EXISTS activity_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT NOT NULL,
          file_path TEXT,
          details TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
      ];

      const indexes = [
        "CREATE INDEX IF NOT EXISTS idx_files_path ON files(path)",
        "CREATE INDEX IF NOT EXISTS idx_files_name ON files(name)",
        "CREATE INDEX IF NOT EXISTS idx_files_extension ON files(extension)",
        "CREATE INDEX IF NOT EXISTS idx_files_category ON files(category)",
        "CREATE INDEX IF NOT EXISTS idx_files_modified ON files(modified_at)",
        "CREATE INDEX IF NOT EXISTS idx_search_term ON search_index(term)",
        "CREATE INDEX IF NOT EXISTS idx_search_file ON search_index(file_id)",
        "CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(name, extracted_text, tags, content=files, content_rowid=id)",

        // FTS triggers
        `CREATE TRIGGER IF NOT EXISTS files_ai AFTER INSERT ON files BEGIN
          INSERT INTO files_fts(rowid, name, extracted_text, tags) 
          VALUES (new.id, new.name, new.extracted_text, new.tags);
        END`,

        `CREATE TRIGGER IF NOT EXISTS files_au AFTER UPDATE ON files BEGIN
          UPDATE files_fts SET name=new.name, extracted_text=new.extracted_text, tags=new.tags 
          WHERE rowid=new.id;
        END`,

        `CREATE TRIGGER IF NOT EXISTS files_ad AFTER DELETE ON files BEGIN
          DELETE FROM files_fts WHERE rowid=old.id;
        END`,
      ];

      let completed = 0;
      const total = tables.length + indexes.length;

      const executeQueries = (queries, callback) => {
        if (queries.length === 0) {
          callback();
          return;
        }

        const query = queries.shift();
        this.db.run(query, (err) => {
          if (err) {
            console.error("SQL Error:", err);
            reject(err);
            return;
          }

          completed++;
          if (completed === total) {
            resolve();
          } else {
            executeQueries(queries, callback);
          }
        });
      };

      executeQueries([...tables, ...indexes], () => {});
    });
  }

  async insertFile(fileData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT OR REPLACE INTO files 
        (path, name, extension, size, created_at, modified_at, accessed_at, 
         content_hash, mime_type, extracted_text, metadata, category, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(
        query,
        [
          fileData.path,
          fileData.name,
          fileData.extension,
          fileData.size,
          fileData.createdAt,
          fileData.modifiedAt,
          fileData.accessedAt,
          fileData.contentHash,
          fileData.mimeType,
          fileData.extractedText || "",
          JSON.stringify(fileData.metadata || {}),
          fileData.category || "Uncategorized",
          JSON.stringify(fileData.tags || []),
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        },
      );
    });
  }

  async searchFiles(query, options = {}) {
    return new Promise((resolve, reject) => {
      let sql;
      let params = [];

      if (options.useFTS && query.trim()) {
        // Full-text search
        sql = `
          SELECT f.*, 
                 rank,
                 snippet(files_fts, 1, '<mark>', '</mark>', '...', 64) as snippet
          FROM files_fts 
          JOIN files f ON files_fts.rowid = f.id
          WHERE files_fts MATCH ?
          ORDER BY rank
          LIMIT ?
        `;
        params = [query, options.limit || 100];
      } else {
        // Traditional search
        const searchTerm = `%${query}%`;
        sql = `
          SELECT * FROM files 
          WHERE name LIKE ? OR extracted_text LIKE ? OR tags LIKE ?
          ORDER BY modified_at DESC
          LIMIT ?
        `;
        params = [searchTerm, searchTerm, searchTerm, options.limit || 100];
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Parse JSON fields
          const files = rows.map((row) => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : {},
            tags: row.tags ? JSON.parse(row.tags) : [],
          }));
          resolve(files);
        }
      });
    });
  }

  async getFileStatistics() {
    return new Promise((resolve, reject) => {
      const queries = [
        "SELECT COUNT(*) as totalFiles FROM files",
        "SELECT SUM(size) as totalSize FROM files",
        "SELECT COUNT(DISTINCT extension) as totalTypes FROM files",
        "SELECT COUNT(*) as analyzedFiles FROM files WHERE ai_analyzed = 1",
        `SELECT extension, COUNT(*) as count 
         FROM files 
         WHERE extension IS NOT NULL 
         GROUP BY extension 
         ORDER BY count DESC 
         LIMIT 10`,
        `SELECT category, COUNT(*) as count 
         FROM files 
         GROUP BY category 
         ORDER BY count DESC`,
      ];

      const results = {};
      let completed = 0;

      queries.forEach((query, index) => {
        this.db.all(query, (err, rows) => {
          if (err) {
            console.error("Stats query error:", err);
          } else {
            switch (index) {
              case 0:
                results.totalFiles = rows[0].totalFiles;
                break;
              case 1:
                results.totalSize = rows[0].totalSize || 0;
                break;
              case 2:
                results.totalTypes = rows[0].totalTypes;
                break;
              case 3:
                results.analyzedFiles = rows[0].analyzedFiles;
                break;
              case 4:
                results.topExtensions = rows;
                break;
              case 5:
                results.categories = rows;
                break;
            }
          }

          completed++;
          if (completed === queries.length) {
            resolve(results);
          }
        });
      });
    });
  }

  async getRecentFiles(limit = 10) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM files 
        ORDER BY accessed_at DESC, modified_at DESC 
        LIMIT ?
      `;

      this.db.all(sql, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const files = rows.map((row) => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : {},
            tags: row.tags ? JSON.parse(row.tags) : [],
          }));
          resolve(files);
        }
      });
    });
  }

  async updateFileCategory(fileId, category, tags = []) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE files 
        SET category = ?, tags = ?, ai_analyzed = 1 
        WHERE id = ?
      `;

      this.db.run(
        sql,
        [category, JSON.stringify(tags), fileId],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        },
      );
    });
  }

  async findDuplicateFiles() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT content_hash, COUNT(*) as count, 
               GROUP_CONCAT(path, '|') as paths,
               GROUP_CONCAT(size, '|') as sizes
        FROM files 
        WHERE content_hash IS NOT NULL 
        GROUP BY content_hash 
        HAVING count > 1
        ORDER BY count DESC
      `;

      this.db.all(sql, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const duplicates = rows.map((row) => ({
            hash: row.content_hash,
            count: row.count,
            files: row.paths.split("|").map((path, index) => ({
              path,
              size: parseInt(row.sizes.split("|")[index]),
            })),
          }));
          resolve(duplicates);
        }
      });
    });
  }

  async removeFile(filePath) {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM files WHERE path = ?";

      this.db.run(sql, [filePath], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  async getUncategorizedFiles() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM files 
        WHERE category = 'Uncategorized' OR category IS NULL
        LIMIT 100
      `;

      this.db.all(sql, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async logActivity(action, filePath = null, details = null) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO activity_log (action, file_path, details)
        VALUES (?, ?, ?)
      `;

      this.db.run(sql, [action, filePath, details], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  async resetDatabase() {
    return new Promise((resolve, reject) => {
      const tables = [
        "files",
        "search_index",
        "categories",
        "tags",
        "ai_analysis",
        "activity_log",
      ];
      let completed = 0;

      tables.forEach((table) => {
        this.db.run(`DELETE FROM ${table}`, (err) => {
          if (err) {
            console.error(`Error clearing ${table}:`, err);
          }
          completed++;
          if (completed === tables.length) {
            resolve();
          }
        });
      });
    });
  }

  async close() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close((err) => {
          if (err) {
            console.error("Database close error:", err);
          }
          resolve();
        });
      });
    }
  }
}

module.exports = DatabaseManager;
