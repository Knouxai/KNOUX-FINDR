const Database = require("better-sqlite3");
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

      // Initialize database with better-sqlite3
      this.db = new Database(this.dbPath);

      // Enable Write-Ahead Logging for better performance
      this.db.pragma("journal_mode = WAL");
      this.db.pragma("synchronous = NORMAL");
      this.db.pragma("cache_size = 1000000");
      this.db.pragma("temp_store = memory");
      this.db.pragma("mmap_size = 268435456"); // 256MB

      await this.createTables();
      console.log("✅ قاعدة البيانات FTS5 جاهزة");
      this.isReady = true;
    } catch (error) {
      console.error("❌ خطأ في تهيئة قاعدة البيانات:", error);
      throw error;
    }
  }

  async createTables() {
    try {
      // إنشاء جدول الملفات الأساسي
      this.db.exec(`
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
        );
      `);

      // إنشاء فهرس FTS5 للبحث في المحتوى
      this.db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS files_fts 
        USING fts5(
          name, 
          content, 
          tags,
          category,
          content='files', 
          content_rowid='id',
          tokenize='porter unicode61'
        );
      `);

      // إنشاء جدول للمحتوى المستخرج منفصل لتوفير الذاكرة
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS file_content (
          file_id INTEGER PRIMARY KEY,
          content TEXT,
          content_length INTEGER,
          language TEXT,
          keywords TEXT,
          summary TEXT,
          FOREIGN KEY (file_id) REFERENCES files (id) ON DELETE CASCADE
        );
      `);

      // إنشاء الفهارس للأداء
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
        CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);
        CREATE INDEX IF NOT EXISTS idx_files_modified ON files(modified);
        CREATE INDEX IF NOT EXISTS idx_files_size ON files(size);
        CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
        CREATE INDEX IF NOT EXISTS idx_files_directory ON files(directory);
      `);

      // إنشاء التريغرز للحفاظ على تزامن FTS
      this.db.exec(`
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
        END;
      `);

      this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS files_au AFTER UPDATE ON files
        BEGIN
          UPDATE files_fts SET 
            name = new.name,
            tags = COALESCE(new.tags, ''),
            category = COALESCE(new.category, '')
          WHERE rowid = new.id;
        END;
      `);

      this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS files_ad AFTER DELETE ON files
        BEGIN
          DELETE FROM files_fts WHERE rowid = old.id;
          DELETE FROM file_content WHERE file_id = old.id;
        END;
      `);

      // تريغر لتحديث المحتوى في FTS عند تغيير file_content
      this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS content_au AFTER UPDATE ON file_content
        BEGIN
          UPDATE files_fts SET content = new.content WHERE rowid = new.file_id;
        END;
      `);

      console.log("✅ تم إنشاء الجداول والفهارس بنجاح");
    } catch (error) {
      console.error("❌ خطأ في إنشاء الجداول:", error);
      throw error;
    }
  }

  // إضافة ملف جديد للفهرسة
  insertFile(fileData) {
    if (!this.isReady) throw new Error("Database not ready");

    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO files 
      (path, name, type, size, modified, created, accessed, hash, mime_type, directory, category, tags, content_extracted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      const result = insert.run(
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
      );

      return result.lastInsertRowid;
    } catch (error) {
      console.error("❌ خطأ في إدراج الملف:", error);
      throw error;
    }
  }

  // إضافة محتوى الملف المستخرج
  insertFileContent(fileId, contentData) {
    if (!this.isReady) throw new Error("Database not ready");

    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO file_content 
      (file_id, content, content_length, language, keywords, summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      insert.run(
        fileId,
        contentData.content,
        contentData.content?.length || 0,
        contentData.language,
        JSON.stringify(contentData.keywords || []),
        contentData.summary,
      );

      // تحديث حالة استخراج المحتوى
      const updateFile = this.db.prepare(`
        UPDATE files SET content_extracted = 1 WHERE id = ?
      `);
      updateFile.run(fileId);

      console.log(`✅ تم حفظ محتوى الملف ID: ${fileId}`);
    } catch (error) {
      console.error("❌ خطأ في حفظ المحتوى:", error);
      throw error;
    }
  }

  // البحث الفوري باستخدام FTS5
  searchFiles(query, options = {}) {
    if (!this.isReady) throw new Error("Database not ready");

    const limit = options.limit || 50;
    const offset = options.offset || 0;

    let searchQuery = query.trim();

    // تحسين الاستعلام للبحث العربي والإنجليزي
    if (searchQuery) {
      // إضافة wildcards للبحث الجزئي
      const terms = searchQuery.split(/\s+/).map((term) => {
        // إذا كان المصط��ح يحتوي على أحرف عربية
        if (/[\u0600-\u06FF]/.test(term)) {
          return `"${term}"*`;
        }
        return `${term}*`;
      });
      searchQuery = terms.join(" OR ");
    }

    try {
      const stmt = this.db.prepare(`
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
          fts.rank,
          snippet(files_fts, 1, '<mark>', '</mark>', '...', 32) as snippet
        FROM files_fts fts
        JOIN files f ON f.id = fts.rowid
        LEFT JOIN file_content fc ON fc.file_id = f.id
        WHERE files_fts MATCH ?
        ORDER BY fts.rank
        LIMIT ? OFFSET ?
      `);

      const results = stmt.all(searchQuery, limit, offset);

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
        snippet: row.snippet,
        relevanceScore: Math.abs(row.rank), // تحويل النتيجة السالبة إلى موجبة
      }));
    } catch (error) {
      console.error("❌ خطأ في البحث:", error);
      return [];
    }
  }

  // البحث المتقدم مع فلاتر
  advancedSearch(query, filters = {}) {
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
      const stmt = this.db.prepare(sql);
      const results = stmt.all(...params);

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
  getStats() {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      const stats = this.db
        .prepare(
          `
        SELECT 
          COUNT(*) as totalFiles,
          SUM(size) as totalSize,
          COUNT(DISTINCT type) as totalTypes,
          COUNT(CASE WHEN content_extracted = 1 THEN 1 END) as indexedFiles,
          COUNT(DISTINCT category) as totalCategories
        FROM files
      `,
        )
        .get();

      const typeStats = this.db
        .prepare(
          `
        SELECT type, COUNT(*) as count, SUM(size) as totalSize
        FROM files 
        WHERE type IS NOT NULL 
        GROUP BY type 
        ORDER BY count DESC 
        LIMIT 10
      `,
        )
        .all();

      const categoryStats = this.db
        .prepare(
          `
        SELECT category, COUNT(*) as count 
        FROM files 
        GROUP BY category 
        ORDER BY count DESC
      `,
        )
        .all();

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
  findDuplicates() {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      const duplicates = this.db
        .prepare(
          `
        SELECT hash, COUNT(*) as count, 
               GROUP_CONCAT(path, '|||') as paths,
               GROUP_CONCAT(size, '|||') as sizes,
               GROUP_CONCAT(name, '|||') as names
        FROM files 
        WHERE hash IS NOT NULL 
        GROUP BY hash 
        HAVING count > 1
        ORDER BY count DESC
      `,
        )
        .all();

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
  deleteFile(filePath) {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      const stmt = this.db.prepare("DELETE FROM files WHERE path = ?");
      const result = stmt.run(filePath);
      return result.changes > 0;
    } catch (error) {
      console.error("❌ خطأ في حذف الملف:", error);
      return false;
    }
  }

  // تحديث تصنيف الملف
  updateFileCategory(fileId, category, tags = []) {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      const stmt = this.db.prepare(`
        UPDATE files 
        SET category = ?, tags = ? 
        WHERE id = ?
      `);
      const result = stmt.run(category, JSON.stringify(tags), fileId);
      return result.changes > 0;
    } catch (error) {
      console.error("❌ خطأ في تحديث التصنيف:", error);
      return false;
    }
  }

  // إعادة بناء فهرس FTS
  rebuildFTSIndex() {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      this.db.exec("INSERT INTO files_fts(files_fts) VALUES('rebuild');");
      console.log("✅ تم إعادة بناء فهرس FTS بنجاح");
    } catch (error) {
      console.error("❌ خطأ في إعادة بناء الفهرس:", error);
    }
  }

  // تحسين قاعدة البيانات
  optimize() {
    if (!this.isReady) throw new Error("Database not ready");

    try {
      this.db.exec("VACUUM;");
      this.db.exec("ANALYZE;");
      this.db.exec("INSERT INTO files_fts(files_fts) VALUES('optimize');");
      console.log("✅ تم تحسين قاعدة البيانات ب��جاح");
    } catch (error) {
      console.error("❌ خطأ في تحسين قاعدة البيانات:", error);
    }
  }

  // إغلاق قاعدة البيانات
  close() {
    if (this.db) {
      try {
        this.db.close();
        console.log("✅ تم إغلاق قاعدة البيانات");
      } catch (error) {
        console.error("❌ خطأ في إغلاق قاعدة البيانات:", error);
      }
    }
  }

  // معلومات قاعدة البيانات
  getInfo() {
    if (!this.isReady) return null;

    try {
      const info = this.db
        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
        .all();
      const size = require("fs").statSync(this.dbPath).size;

      return {
        path: this.dbPath,
        size: size,
        tables: info.map((t) => t.name),
        isReady: this.isReady,
        version: "2.0-FTS5",
      };
    } catch (error) {
      console.error("❌ خطأ في جلب معلومات قاعدة البيانات:", error);
      return null;
    }
  }
}

module.exports = FTSDatabase;
