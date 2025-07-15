const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs-extra");
const { app } = require("electron");

class FTSDatabase {
  constructor() {
    this.db = null;
    this.dbPath = null;
    this.isReady = false;
  }

  async initialize() {
    try {
      // Create database directory
      const userDataPath = app.getPath("userData");
      const dbDir = path.join(userDataPath, "database");
      await fs.ensureDir(dbDir);

      this.dbPath = path.join(dbDir, "knoux-findr-fts.db");

      // Initialize database
      this.db = new sqlite3.Database(this.dbPath);

      // Enable performance optimizations
      await this.executeQuery("PRAGMA journal_mode = WAL");
      await this.executeQuery("PRAGMA synchronous = NORMAL");
      await this.executeQuery("PRAGMA cache_size = 1000000");
      await this.executeQuery("PRAGMA temp_store = memory");

      await this.createTables();
      console.log("✅ قاعدة البيانات FTS5 جاهزة");
      this.isReady = true;
    } catch (error) {
      console.error("❌ خطأ في تهيئة قاعدة البيانات:", error);
      throw error;
    }
  }

  async executeQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  async selectQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async selectOne(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async createTables() {
    try {
      // إنشاء جدول الملفات الأساسي
      await this.executeQuery(`
        CREATE TABLE IF NOT EXISTS files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          path TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          type TEXT,
          size INTEGER,
          modified INTEGER,
          created INTEGER,
          accessed INTEGER,
          hash TEXT,
          mime_type TEXT,
          directory TEXT,
          category TEXT DEFAULT 'Other',
          tags TEXT,
          indexed_at INTEGER DEFAULT (strftime('%s', 'now')),
          content_extracted BOOLEAN DEFAULT 0
        )
      `);

      // إنشاء فهرس FTS5 للبحث في المحتوى
      await this.executeQuery(`
        CREATE VIRTUAL TABLE IF NOT EXISTS files_fts 
        USING fts5(
          name, 
          content, 
          tags,
          category,
          content='files', 
          content_rowid='id'
        )
      `);

      // إنشاء جدول للمحتوى المستخرج منفصل
      await this.executeQuery(`
        CREATE TABLE IF NOT EXISTS file_content (
          file_id INTEGER PRIMARY KEY,
          content TEXT,
          content_length INTEGER,
          language TEXT,
          keywords TEXT,
          summary TEXT,
          FOREIGN KEY (file_id) REFERENCES files (id) ON DELETE CASCADE
        )
      `);

      // إنشاء الفهارس للأداء
      await this.executeQuery(
        "CREATE INDEX IF NOT EXISTS idx_files_path ON files(path)",
      );
      await this.executeQuery(
        "CREATE INDEX IF NOT EXISTS idx_files_type ON files(type)",
      );
      await this.executeQuery(
        "CREATE INDEX IF NOT EXISTS idx_files_modified ON files(modified)",
      );
      await this.executeQuery(
        "CREATE INDEX IF NOT EXISTS idx_files_size ON files(size)",
      );
      await this.executeQuery(
        "CREATE INDEX IF NOT EXISTS idx_files_category ON files(category)",
      );
      await this.executeQuery(
        "CREATE INDEX IF NOT EXISTS idx_files_directory ON files(directory)",
      );

      // إنشاء التريغرز للحفاظ على تزامن FTS
      await this.executeQuery(`
        CREATE TRIGGER IF NOT EXISTS files_ai AFTER INSERT ON files
        BEGIN
          INSERT INTO files_fts(rowid, name, content, tags, category) 
          VALUES (
            new.id, 
            new.name, 
            COALESCE((SELECT content FROM file_content WHERE file_id = new.id), ''),
            COALESCE(new.tags, ''),
            COALESCE(new.category, '')
          );
        END
      `);

      await this.executeQuery(`
        CREATE TRIGGER IF NOT EXISTS files_au AFTER UPDATE ON files
        BEGIN
          UPDATE files_fts SET 
            name = new.name,
            tags = COALESCE(new.tags, ''),
            category = COALESCE(new.category, '')
          WHERE rowid = new.id;
        END
      `);

      await this.executeQuery(`
        CREATE TRIGGER IF NOT EXISTS files_ad AFTER DELETE ON files
        BEGIN
          DELETE FROM files_fts WHERE rowid = old.id;
          DELETE FROM file_content WHERE file_id = old.id;
        END
      `);

      // تريغر لتحديث المحتوى في FTS عند تغيير file_content
      await this.executeQuery(`
        CREATE TRIGGER IF NOT EXISTS content_au AFTER UPDATE ON file_content
        BEGIN
          UPDATE files_fts SET content = new.content WHERE rowid = new.file_id;
        END
      `);

      console.log("✅ تم إنشاء الجداول والفهارس بنجاح");
    } catch (error) {
      console.error("❌ خطأ في إنشاء الجداول:", error);
      throw error;
    }
  }

  // إضافة ملف جديد للفهرسة
  async insertFile(fileData) {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      const result = await this.executeQuery(
        `
        INSERT OR REPLACE INTO files 
        (path, name, type, size, modified, created, accessed, hash, mime_type, directory, category, tags, content_extracted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          fileData.path,
          fileData.name,
          fileData.type,
          fileData.size,
          fileData.modified,
          fileData.created,
          fileData.accessed,
          fileData.hash,
          fileData.mimeType,
          fileData.directory,
          fileData.category || "Other",
          JSON.stringify(fileData.tags || []),
          fileData.contentExtracted ? 1 : 0,
        ],
      );

      return result.lastID;
    } catch (error) {
      console.error("❌ خطأ في إدراج الملف:", error);
      throw error;
    }
  }

  // إضافة محتوى الملف المستخرج
  async insertFileContent(fileId, contentData) {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      await this.executeQuery(
        `
        INSERT OR REPLACE INTO file_content 
        (file_id, content, content_length, language, keywords, summary)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          fileId,
          contentData.content,
          contentData.content?.length || 0,
          contentData.language,
          JSON.stringify(contentData.keywords || []),
          contentData.summary,
        ],
      );

      // تحديث حالة استخراج المحتوى
      await this.executeQuery(
        `
        UPDATE files SET content_extracted = 1 WHERE id = ?
      `,
        [fileId],
      );

      console.log(`✅ تم حفظ محتوى الملف ID: ${fileId}`);
    } catch (error) {
      console.error("❌ خطأ في حفظ المحتوى:", error);
      throw error;
    }
  }

  // البحث الفوري باستخدام FTS5
  async searchFiles(query, options = {}) {
    if (!this.isReady) throw new Error("Database not ready");

    const limit = options.limit || 50;
    const offset = options.offset || 0;

    let searchQuery = query.trim();

    // تحسين الاستعلام للبحث العربي والإنجليزي
    if (searchQuery) {
      // إضافة wildcards للبحث الجزئي
      const terms = searchQuery.split(/\s+/).map((term) => {
        // إذا كان المصطلح يحتوي على أحرف عربية
        if (/[\u0600-\u06FF]/.test(term)) {
          return `"${term}"*`;
        }
        return `${term}*`;
      });
      searchQuery = terms.join(" OR ");
    }

    try {
      const results = await this.selectQuery(
        `
        SELECT 
          f.id,
          f.path,
          f.name,
          f.type,
          f.size,
          f.modified,
          f.category,
          f.tags,
          f.mime_type,
          f.directory,
          fc.content_length,
          fc.language,
          fts.rank
        FROM files_fts fts
        JOIN files f ON f.id = fts.rowid
        LEFT JOIN file_content fc ON fc.file_id = f.id
        WHERE files_fts MATCH ?
        ORDER BY fts.rank
        LIMIT ? OFFSET ?
      `,
        [searchQuery, limit, offset],
      );

      // تحويل النتائج وتنسيقها
      return results.map((row) => ({
        id: row.id,
        path: row.path,
        name: row.name,
        type: row.type,
        size: row.size,
        modified: new Date(row.modified * 1000),
        category: row.category,
        tags: row.tags ? JSON.parse(row.tags) : [],
        mimeType: row.mime_type,
        directory: row.directory,
        contentLength: row.content_length,
        language: row.language,
        rank: row.rank,
        relevanceScore: Math.abs(row.rank || 0),
      }));
    } catch (error) {
      console.error("❌ خطأ في البحث:", error);
      return [];
    }
  }

  // البحث المتقدم مع فلاتر
  async advancedSearch(query, filters = {}) {
    if (!this.isReady) throw new Error("Database not ready");

    let sql = `
      SELECT 
        f.id, f.path, f.name, f.type, f.size, f.modified, f.category, f.tags, f.mime_type,
        fc.content_length, fc.language,
        COALESCE(fts.rank, 0) as rank
      FROM files f
      LEFT JOIN file_content fc ON fc.file_id = f.id
      LEFT JOIN files_fts fts ON f.id = fts.rowid AND files_fts MATCH ?
      WHERE 1=1
    `;

    const params = [query || ""];

    // إضافة الفلاتر
    if (filters.category && filters.category !== "all") {
      sql += " AND f.category = ?";
      params.push(filters.category);
    }

    if (filters.type && filters.type !== "all") {
      sql += " AND f.type = ?";
      params.push(filters.type);
    }

    if (filters.sizeMin) {
      sql += " AND f.size >= ?";
      params.push(filters.sizeMin);
    }

    if (filters.sizeMax) {
      sql += " AND f.size <= ?";
      params.push(filters.sizeMax);
    }

    if (filters.dateFrom) {
      sql += " AND f.modified >= ?";
      params.push(Math.floor(new Date(filters.dateFrom).getTime() / 1000));
    }

    if (filters.dateTo) {
      sql += " AND f.modified <= ?";
      params.push(Math.floor(new Date(filters.dateTo).getTime() / 1000));
    }

    if (filters.directory) {
      sql += " AND f.directory LIKE ?";
      params.push(`%${filters.directory}%`);
    }

    // ترتيب النتائج
    if (query) {
      sql += " ORDER BY rank DESC, f.modified DESC";
    } else {
      sql += " ORDER BY f.modified DESC";
    }

    sql += ` LIMIT ${filters.limit || 100}`;

    try {
      const results = await this.selectQuery(sql, params);

      return results.map((row) => ({
        id: row.id,
        path: row.path,
        name: row.name,
        type: row.type,
        size: row.size,
        modified: new Date(row.modified * 1000),
        category: row.category,
        tags: row.tags ? JSON.parse(row.tags) : [],
        mimeType: row.mime_type,
        contentLength: row.content_length,
        language: row.language,
        relevanceScore: Math.abs(row.rank || 0),
      }));
    } catch (error) {
      console.error("❌ خطأ في البحث المتقدم:", error);
      return [];
    }
  }

  // الحصول على إحصائيات سريعة
  async getStats() {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      const stats = await this.selectOne(`
        SELECT 
          COUNT(*) as totalFiles,
          SUM(size) as totalSize,
          COUNT(DISTINCT type) as totalTypes,
          COUNT(CASE WHEN content_extracted = 1 THEN 1 END) as indexedFiles,
          COUNT(DISTINCT category) as totalCategories
        FROM files
      `);

      const typeStats = await this.selectQuery(`
        SELECT type, COUNT(*) as count, SUM(size) as totalSize
        FROM files 
        WHERE type IS NOT NULL 
        GROUP BY type 
        ORDER BY count DESC 
        LIMIT 10
      `);

      const categoryStats = await this.selectQuery(`
        SELECT category, COUNT(*) as count 
        FROM files 
        GROUP BY category 
        ORDER BY count DESC
      `);

      return {
        ...stats,
        typeBreakdown: typeStats,
        categoryBreakdown: categoryStats,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("❌ خطأ في جلب الإحصائيات:", error);
      return {};
    }
  }

  // البحث عن الملفات المكررة
  async findDuplicates() {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      const duplicates = await this.selectQuery(`
        SELECT hash, COUNT(*) as count, 
               GROUP_CONCAT(path, '|||') as paths,
               GROUP_CONCAT(size, '|||') as sizes,
               GROUP_CONCAT(name, '|||') as names
        FROM files 
        WHERE hash IS NOT NULL 
        GROUP BY hash 
        HAVING count > 1
        ORDER BY count DESC
      `);

      return duplicates.map((dup) => ({
        hash: dup.hash,
        count: dup.count,
        files: dup.paths.split("|||").map((path, index) => ({
          path,
          name: dup.names.split("|||")[index],
          size: parseInt(dup.sizes.split("|||")[index]),
        })),
      }));
    } catch (error) {
      console.error("❌ خطأ في البحث عن المكررات:", error);
      return [];
    }
  }

  // حذف ملف من الفهرسة
  async deleteFile(filePath) {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      const result = await this.executeQuery(
        "DELETE FROM files WHERE path = ?",
        [filePath],
      );
      return result.changes > 0;
    } catch (error) {
      console.error("❌ خطأ في حذف الملف:", error);
      return false;
    }
  }

  // تحديث تصنيف الملف
  async updateFileCategory(fileId, category, tags = []) {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      const result = await this.executeQuery(
        `
        UPDATE files 
        SET category = ?, tags = ? 
        WHERE id = ?
      `,
        [category, JSON.stringify(tags), fileId],
      );
      return result.changes > 0;
    } catch (error) {
      console.error("❌ خطأ في تحديث التصنيف:", error);
      return false;
    }
  }

  // إعادة بناء فهرس FTS
  async rebuildFTSIndex() {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      await this.executeQuery(
        "INSERT INTO files_fts(files_fts) VALUES('rebuild')",
      );
      console.log("✅ تم إعادة بناء فهرس FTS بنجاح");
    } catch (error) {
      console.error("❌ خطأ في إعادة بناء الف��رس:", error);
    }
  }

  // تحسين قاعدة البيانات
  async optimize() {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      await this.executeQuery("VACUUM");
      await this.executeQuery("ANALYZE");
      await this.executeQuery(
        "INSERT INTO files_fts(files_fts) VALUES('optimize')",
      );
      console.log("✅ تم تحسين قاعدة البيانات بنجاح");
    } catch (error) {
      console.error("❌ خطأ في تحسين قاعدة البيانات:", error);
    }
  }

  // إغلاق قاعدة البيانات
  close() {
    if (this.db) {
      try {
        this.db.close((err) => {
          if (err) {
            console.error("❌ خطأ في إغلاق قاعدة البيانات:", err);
          } else {
            console.log("✅ تم إغلاق قاعدة البيانات");
          }
        });
      } catch (error) {
        console.error("❌ خطأ في إغلاق قاعدة البيانات:", error);
      }
    }
  }

  // معلومات قاعدة البيانات
  getInfo() {
    if (!this.isReady) return null;

    try {
      const size = require("fs").statSync(this.dbPath).size;

      return {
        path: this.dbPath,
        size: size,
        isReady: this.isReady,
        version: "2.0-FTS5-SQLite3",
      };
    } catch (error) {
      console.error("❌ خطأ في جلب معلومات قاعدة البيانات:", error);
      return null;
    }
  }
}

module.exports = FTSDatabase;
