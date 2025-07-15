const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs-extra");
const crypto = require("crypto");
const FTSDatabase = require("./ftsDatabase");
const ContentExtractor = require("./contentExtractor");

class SmartIndexer {
  constructor() {
    this.db = new FTSDatabase();
    this.extractor = new ContentExtractor();
    this.watchers = new Map();
    this.isIndexing = false;
    this.indexingQueue = [];
    this.stats = {
      filesProcessed: 0,
      filesWithContent: 0,
      totalSize: 0,
      errors: 0,
      startTime: null,
    };
    this.batchSize = 100; // معالجة 100 ملف في كل دفعة
    this.concurrentLimit = 5; // حد أقصى 5 ملفات متزامنة
  }

  async initialize() {
    try {
      console.log("🚀 تهيئة محرك الفهرسة الذكي...");

      // تهيئة قاعدة البيانات
      await this.db.initialize();

      console.log("✅ محرك الفهرسة جاهز");
      return true;
    } catch (error) {
      console.error("❌ فشل في تهيئة محرك الفهرسة:", error);
      throw error;
    }
  }

  // فهرسة مجلد كامل
  async indexDirectory(directoryPath, progressCallback = null) {
    if (this.isIndexing) {
      throw new Error("عملية فهرسة أخرى قيد التنفيذ");
    }

    if (!(await fs.pathExists(directoryPath))) {
      throw new Error(`المجلد غير موجود: ${directoryPath}`);
    }

    this.isIndexing = true;
    this.stats = {
      filesProcessed: 0,
      filesWithContent: 0,
      totalSize: 0,
      errors: 0,
      startTime: Date.now(),
    };

    try {
      console.log(`📁 بدء فهرسة المجلد: ${directoryPath}`);

      // جمع جميع الملفات أولاً
      const files = await this.collectFiles(directoryPath);
      console.log(`📊 تم العثور على ${files.length} ملف`);

      if (progressCallback) {
        progressCallback({
          phase: "collecting",
          current: 0,
          total: files.length,
          message: `تم العثور على ${files.length} ملف`,
        });
      }

      // معالجة الملفات في دفعات
      const batches = this.createBatches(files, this.batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        if (progressCallback) {
          progressCallback({
            phase: "indexing",
            current: i * this.batchSize,
            total: files.length,
            message: `معالجة الدفعة ${i + 1} من ${batches.length}`,
            filesProcessed: this.stats.filesProcessed,
            filesWithContent: this.stats.filesWithContent,
            errors: this.stats.errors,
          });
        }

        await this.processBatch(batch);
      }

      // إعداد مراقب للملفات الجديدة
      this.setupWatcher(directoryPath);

      const duration = Date.now() - this.stats.startTime;
      console.log(`✅ اكتملت الفهرسة في ${duration}ms`);
      console.log(
        `📊 الإحصائيات: ${this.stats.filesProcessed} ملف، ${this.stats.filesWithContent} بمحتوى، ${this.stats.errors} خطأ`,
      );

      if (progressCallback) {
        progressCallback({
          phase: "completed",
          current: files.length,
          total: files.length,
          message: "اكتملت الفهرسة بنجاح",
          stats: this.stats,
          duration: duration,
        });
      }
    } catch (error) {
      console.error("❌ خطأ في فهرسة المجلد:", error);
      throw error;
    } finally {
      this.isIndexing = false;
    }
  }

  // جمع جميع الملفات من المجلد
  async collectFiles(directoryPath) {
    const files = [];

    const scanDirectory = async (dirPath) => {
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });

        for (const item of items) {
          if (item.name.startsWith(".")) continue; // تجاهل الملفات المخفية

          const fullPath = path.join(dirPath, item.name);

          if (item.isDirectory()) {
            // فحص المجلدات الفرعية
            await scanDirectory(fullPath);
          } else if (item.isFile()) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.error(`❌ خطأ في قراءة المجلد ${dirPath}:`, error.message);
      }
    };

    await scanDirectory(directoryPath);
    return files;
  }

  // إنشاء دفعات ��ن الملفات
  createBatches(files, batchSize) {
    const batches = [];
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    return batches;
  }

  // معالجة دفعة من الملفات
  async processBatch(files) {
    const promises = [];

    for (let i = 0; i < files.length; i += this.concurrentLimit) {
      const chunk = files.slice(i, i + this.concurrentLimit);
      const chunkPromises = chunk.map((filePath) => this.processFile(filePath));

      // انتظار المجموعة الحالية قبل البدء في المجموعة التالية
      await Promise.allSettled(chunkPromises);
    }
  }

  // معالجة ملف واحد
  async processFile(filePath) {
    try {
      // الحصول على معلومات الملف
      const fileInfo = await this.extractor.getFileInfo(filePath);
      if (!fileInfo) {
        this.stats.errors++;
        return;
      }

      // حساب hash للملف للتحقق من التكرار
      const fileHash = await this.generateFileHash(filePath);

      // تحديد التصنيف الأولي
      const category = this.determineCategory(fileInfo);

      // إدراج الملف في قاعدة البيانات
      const fileId = this.db.insertFile({
        path: filePath,
        name: fileInfo.name,
        type: fileInfo.type,
        size: fileInfo.size,
        modified: fileInfo.modified,
        created: fileInfo.created,
        accessed: fileInfo.accessed,
        hash: fileHash,
        mimeType: this.getMimeType(filePath),
        directory: fileInfo.directory,
        category: category,
        tags: [],
        contentExtracted: false,
      });

      this.stats.filesProcessed++;
      this.stats.totalSize += fileInfo.size;

      // استخراج المحتوى إذا كان ممكناً
      if (fileInfo.canExtract) {
        const contentResult = await this.extractor.extractContent(filePath);

        if (contentResult.success) {
          // حفظ المحتوى المستخرج
          this.db.insertFileContent(fileId, {
            content: contentResult.content,
            language: contentResult.language,
            keywords: contentResult.keywords,
            summary: contentResult.summary,
          });

          this.stats.filesWithContent++;
          console.log(`✅ تم استخراج المحتوى: ${path.basename(filePath)}`);
        } else {
          console.log(
            `⚠️ فشل استخراج المحتوى: ${path.basename(filePath)} - ${contentResult.error}`,
          );
        }
      }
    } catch (error) {
      console.error(`❌ خطأ في معالجة الملف ${filePath}:`, error.message);
      this.stats.errors++;
    }
  }

  // إنشاء hash للملف
  async generateFileHash(filePath) {
    try {
      // للملفات الكبيرة، نحسب hash لأول وآخر جزء
      const stats = await fs.stat(filePath);

      if (stats.size > 10 * 1024 * 1024) {
        // 10MB
        const fd = await fs.open(filePath, "r");
        const chunkSize = 64 * 1024; // 64KB

        const startBuffer = Buffer.alloc(chunkSize);
        const endBuffer = Buffer.alloc(chunkSize);

        await fs.read(fd, startBuffer, 0, chunkSize, 0);
        await fs.read(
          fd,
          endBuffer,
          0,
          chunkSize,
          Math.max(0, stats.size - chunkSize),
        );
        await fs.close(fd);

        const hash = crypto.createHash("md5");
        hash.update(startBuffer);
        hash.update(endBuffer);
        hash.update(stats.size.toString());

        return hash.digest("hex");
      } else {
        // للملفات الصغيرة، نحسب hash كامل
        const buffer = await fs.readFile(filePath);
        return crypto.createHash("md5").update(buffer).digest("hex");
      }
    } catch (error) {
      console.error(`❌ خطأ في حساب hash: ${error.message}`);
      return null;
    }
  }

  // تحديد تصنيف الملف
  determineCategory(fileInfo) {
    const name = fileInfo.name.toLowerCase();
    const type = fileInfo.type.toLowerCase();
    const dir = fileInfo.directory.toLowerCase();

    // تصنيف حسب النوع
    if (["pdf", "doc", "docx", "txt", "rtf", "odt"].includes(type)) {
      if (
        name.includes("invoice") ||
        name.includes("فاتورة") ||
        name.includes("bill")
      )
        return "Finance";
      if (
        name.includes("contract") ||
        name.includes("عقد") ||
        name.includes("agreement")
      )
        return "Legal";
      if (
        name.includes("resume") ||
        name.includes("cv") ||
        name.includes("سيرة")
      )
        return "Personal";
      return "Documents";
    }

    if (
      ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "svg", "webp"].includes(type)
    ) {
      if (name.includes("screenshot") || name.includes("لقطة"))
        return "Screenshots";
      if (dir.includes("photo") || dir.includes("صور")) return "Photos";
      return "Images";
    }

    if (["mp4", "avi", "mov", "wmv", "mkv", "webm", "flv"].includes(type)) {
      return "Videos";
    }

    if (["mp3", "wav", "flac", "aac", "ogg", "wma"].includes(type)) {
      return "Audio";
    }

    if (
      [
        "js",
        "jsx",
        "ts",
        "tsx",
        "py",
        "java",
        "cpp",
        "c",
        "php",
        "html",
        "css",
      ].includes(type)
    ) {
      return "Development";
    }

    if (["zip", "rar", "7z", "tar", "gz"].includes(type)) {
      return "Archives";
    }

    if (["xls", "xlsx", "csv", "ods"].includes(type)) {
      return "Spreadsheets";
    }

    // تصنيف حسب المجلد
    if (dir.includes("download")) return "Downloads";
    if (dir.includes("desktop") || dir.includes("سطح المكتب")) return "Desktop";
    if (dir.includes("document") || dir.includes("مستندات")) return "Documents";

    return "Other";
  }

  // الحصول على نوع MIME
  getMimeType(filePath) {
    const mime = require("mime-types");
    return mime.lookup(filePath) || "application/octet-stream";
  }

  // إعداد مراقب الملفات
  setupWatcher(directoryPath) {
    if (this.watchers.has(directoryPath)) {
      this.watchers.get(directoryPath).close();
    }

    const watcher = chokidar.watch(directoryPath, {
      ignored: /(^|[\/\\])\../, // تجاهل الملفات المخفية
      persistent: true,
      ignoreInitial: true,
      depth: 99,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100,
      },
    });

    watcher
      .on("add", async (filePath) => {
        console.log(`➕ ملف جديد: ${filePath}`);
        await this.processFile(filePath);
      })
      .on("change", async (filePath) => {
        console.log(`🔄 ملف محدث: ${filePath}`);
        await this.processFile(filePath);
      })
      .on("unlink", async (filePath) => {
        console.log(`➖ ملف محذوف: ${filePath}`);
        this.db.deleteFile(filePath);
      });

    this.watchers.set(directoryPath, watcher);
    console.log(`👁️ تم إعداد مراقب للمجلد: ${directoryPath}`);
  }

  // البحث في الملفات
  async searchFiles(query, options = {}) {
    if (!query || query.trim().length === 0) {
      // إرجاع أحدث الملفات إذا لم يكن هناك استعلام
      return this.db.advancedSearch("", {
        ...options,
        limit: options.limit || 20,
      });
    }

    // البحث باستخدام FTS5
    return this.db.searchFiles(query, options);
  }

  // البحث المتقدم
  async advancedSearch(query, filters = {}) {
    return this.db.advancedSearch(query, filters);
  }

  // الحصول على إحصائيات
  getStats() {
    const dbStats = this.db.getStats();
    return {
      ...dbStats,
      indexingStats: this.stats,
      watchedDirectories: Array.from(this.watchers.keys()),
      isIndexing: this.isIndexing,
    };
  }

  // البحث عن الملفات المكررة
  findDuplicates() {
    return this.db.findDuplicates();
  }

  // حذف ملف
  deleteFile(filePath) {
    return this.db.deleteFile(filePath);
  }

  // تحديث تصنيف ملف
  updateFileCategory(fileId, category, tags = []) {
    return this.db.updateFileCategory(fileId, category, tags);
  }

  // إعادة فهرسة ملف
  async reindexFile(filePath) {
    // حذف الملف القديم من الفهرس
    this.db.deleteFile(filePath);

    // إعادة معالجة الملف
    await this.processFile(filePath);
  }

  // تحسين قاعدة البيانات
  optimize() {
    return this.db.optimize();
  }

  // إيقاف جميع المراقبين
  stopAllWatchers() {
    for (const [path, watcher] of this.watchers) {
      watcher.close();
      console.log(`⏹️ تم إيقاف مراقبة: ${path}`);
    }
    this.watchers.clear();
  }

  // إغلاق المحرك
  async close() {
    this.stopAllWatchers();

    if (this.db) {
      this.db.close();
    }

    console.log("✅ تم إغلاق محرك الفهرسة");
  }

  // معلومات المحرك
  getInfo() {
    return {
      version: "2.0-FTS5",
      isReady: this.db.isReady,
      isIndexing: this.isIndexing,
      watchedDirectories: Array.from(this.watchers.keys()),
      queueLength: this.indexingQueue.length,
      extractorStats: this.extractor.getExtractionStats(),
      databaseInfo: this.db.getInfo(),
    };
  }
}

module.exports = SmartIndexer;
