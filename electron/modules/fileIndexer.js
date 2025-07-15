const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");
const chokidar = require("chokidar");
const mime = require("mime-types");
const { promisify } = require("util");

class FileIndexer {
  constructor(databaseManager) {
    this.db = databaseManager;
    this.watchers = new Map();
    this.isIndexing = false;
    this.indexingQueue = [];
    this.supportedExtensions = new Set([
      // Documents
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      ".rtf",
      ".odt",
      ".pages",
      // Spreadsheets
      ".xls",
      ".xlsx",
      ".csv",
      ".ods",
      ".numbers",
      // Presentations
      ".ppt",
      ".pptx",
      ".odp",
      ".key",
      // Images
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".tiff",
      ".svg",
      ".webp",
      // Videos
      ".mp4",
      ".avi",
      ".mov",
      ".wmv",
      ".flv",
      ".mkv",
      ".webm",
      // Audio
      ".mp3",
      ".wav",
      ".flac",
      ".aac",
      ".ogg",
      ".wma",
      // Archives
      ".zip",
      ".rar",
      ".7z",
      ".tar",
      ".gz",
      // Code
      ".js",
      ".html",
      ".css",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".php",
      // Others
      ".json",
      ".xml",
      ".md",
      ".log",
    ]);
  }

  async indexDirectory(directoryPath, progressCallback = null) {
    if (!(await fs.pathExists(directoryPath))) {
      throw new Error(`المجلد غير موجود: ${directoryPath}`);
    }

    this.isIndexing = true;
    let processedFiles = 0;
    let totalFiles = 0;

    try {
      // Count total files first
      totalFiles = await this.countFiles(directoryPath);

      if (progressCallback) {
        progressCallback({
          current: 0,
          total: totalFiles,
          status: "بدء الفهرسة...",
          path: directoryPath,
        });
      }

      await this.processDirectory(directoryPath, (fileProcessed) => {
        processedFiles++;
        if (progressCallback) {
          progressCallback({
            current: processedFiles,
            total: totalFiles,
            status: `معالجة: ${path.basename(fileProcessed)}`,
            path: fileProcessed,
            progress: Math.round((processedFiles / totalFiles) * 100),
          });
        }
      });

      // Setup file watcher for this directory
      this.setupWatcher(directoryPath);

      // Log activity
      await this.db.logActivity(
        "directory_indexed",
        directoryPath,
        `${processedFiles} files processed`,
      );

      console.log(`فهرسة مكتملة: ${processedFiles} ملف في ${directoryPath}`);
    } catch (error) {
      console.error("خطأ في الفهرسة:", error);
      throw error;
    } finally {
      this.isIndexing = false;
    }
  }

  async countFiles(directoryPath) {
    let count = 0;

    const processDir = async (dir) => {
      try {
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
          if (item.name.startsWith(".")) continue;

          const fullPath = path.join(dir, item.name);

          if (item.isDirectory()) {
            await processDir(fullPath);
          } else if (item.isFile()) {
            const ext = path.extname(item.name).toLowerCase();
            if (this.supportedExtensions.has(ext) || ext === "") {
              count++;
            }
          }
        }
      } catch (error) {
        console.error(`خطأ في قراءة المجلد ${dir}:`, error.message);
      }
    };

    await processDir(directoryPath);
    return count;
  }

  async processDirectory(directoryPath, fileCallback = null) {
    const processDir = async (dir) => {
      try {
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
          if (item.name.startsWith(".")) continue;

          const fullPath = path.join(dir, item.name);

          if (item.isDirectory()) {
            await processDir(fullPath);
          } else if (item.isFile()) {
            await this.processFile(fullPath);
            if (fileCallback) {
              fileCallback(fullPath);
            }
          }
        }
      } catch (error) {
        console.error(`خطأ في معالجة المجلد ${dir}:`, error.message);
      }
    };

    await processDir(directoryPath);
  }

  async processFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) return;

      const fileName = path.basename(filePath);
      const extension = path.extname(fileName).toLowerCase();

      // Skip unsupported files (unless no extension)
      if (extension && !this.supportedExtensions.has(extension)) {
        return;
      }

      // Generate content hash for duplicate detection
      const contentHash = await this.generateFileHash(filePath);

      // Get MIME type
      const mimeType = mime.lookup(filePath) || "application/octet-stream";

      // Extract metadata
      const metadata = await this.extractMetadata(filePath, stats);

      const fileData = {
        path: filePath,
        name: fileName,
        extension: extension || null,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        accessedAt: stats.atime,
        contentHash,
        mimeType,
        metadata,
        category: this.autoDetectCategory(fileName, extension, mimeType),
        tags: this.generateTags(fileName, extension),
      };

      await this.db.insertFile(fileData);
    } catch (error) {
      console.error(`خطأ في معالجة الملف ${filePath}:`, error.message);
    }
  }

  async generateFileHash(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      return crypto.createHash("md5").update(buffer).digest("hex");
    } catch (error) {
      console.error(`خطأ في إنشاء hash للملف ${filePath}:`, error);
      return null;
    }
  }

  async extractMetadata(filePath, stats) {
    const metadata = {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
    };

    try {
      const extension = path.extname(filePath).toLowerCase();

      // For images, try to get dimensions
      if (
        [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff"].includes(extension)
      ) {
        try {
          const sharp = require("sharp");
          const imageInfo = await sharp(filePath).metadata();
          metadata.width = imageInfo.width;
          metadata.height = imageInfo.height;
          metadata.format = imageInfo.format;
          metadata.density = imageInfo.density;
        } catch (sharpError) {
          // Sharp might not be available or image might be corrupted
          console.log("Could not extract image metadata:", sharpError.message);
        }
      }

      // For videos, try to get duration and format info
      if ([".mp4", ".avi", ".mov", ".wmv", ".mkv"].includes(extension)) {
        // Would need ffprobe or similar for video metadata
        metadata.type = "video";
      }

      // For audio files
      if ([".mp3", ".wav", ".flac", ".aac"].includes(extension)) {
        metadata.type = "audio";
      }
    } catch (error) {
      console.error("خطأ في استخراج metadata:", error.message);
    }

    return metadata;
  }

  autoDetectCategory(fileName, extension, mimeType) {
    const name = fileName.toLowerCase();
    const ext = extension?.toLowerCase() || "";

    // Documents
    if ([".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"].includes(ext)) {
      if (
        name.includes("invoice") ||
        name.includes("bill") ||
        name.includes("فاتورة")
      )
        return "Finance";
      if (
        name.includes("contract") ||
        name.includes("agreement") ||
        name.includes("عقد")
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

    // Images
    if (mimeType?.startsWith("image/")) {
      if (
        name.includes("screenshot") ||
        name.includes("screen") ||
        name.includes("لقطة")
      )
        return "Screenshots";
      if (
        name.includes("photo") ||
        name.includes("img") ||
        name.includes("صورة")
      )
        return "Photos";
      if (
        name.includes("logo") ||
        name.includes("icon") ||
        name.includes("شعار")
      )
        return "Design";
      return "Images";
    }

    // Videos
    if (mimeType?.startsWith("video/")) {
      if (
        name.includes("tutorial") ||
        name.includes("course") ||
        name.includes("درس")
      )
        return "Education";
      if (
        name.includes("meeting") ||
        name.includes("conference") ||
        name.includes("اجتماع")
      )
        return "Work";
      return "Videos";
    }

    // Audio
    if (mimeType?.startsWith("audio/")) {
      if (
        name.includes("music") ||
        name.includes("song") ||
        name.includes("موسيقى")
      )
        return "Music";
      if (name.includes("podcast") || name.includes("بودكاست"))
        return "Podcasts";
      if (
        name.includes("record") ||
        name.includes("meeting") ||
        name.includes("تسجيل")
      )
        return "Recordings";
      return "Audio";
    }

    // Code files
    if (
      [".js", ".html", ".css", ".py", ".java", ".cpp", ".php"].includes(ext)
    ) {
      return "Development";
    }

    // Archives
    if ([".zip", ".rar", ".7z", ".tar", ".gz"].includes(ext)) {
      return "Archives";
    }

    // Spreadsheets
    if ([".xls", ".xlsx", ".csv", ".ods"].includes(ext)) {
      return "Spreadsheets";
    }

    return "Other";
  }

  generateTags(fileName, extension) {
    const tags = [];
    const name = fileName.toLowerCase();
    const ext = extension?.toLowerCase();

    // File type tags
    if (ext) tags.push(ext.substring(1));

    // Content-based tags
    if (name.includes("backup")) tags.push("backup");
    if (name.includes("temp")) tags.push("temporary");
    if (name.includes("copy")) tags.push("copy");
    if (name.includes("draft")) tags.push("draft");
    if (name.includes("final")) tags.push("final");
    if (name.includes("v1") || name.includes("v2")) tags.push("version");

    // Date patterns
    const datePattern = /\d{4}[-_]\d{2}[-_]\d{2}/;
    if (datePattern.test(name)) tags.push("dated");

    // Arabic tags
    if (name.includes("مشروع")) tags.push("project");
    if (name.includes("تقرير")) tags.push("report");
    if (name.includes("عرض")) tags.push("presentation");

    return tags;
  }

  setupWatcher(directoryPath) {
    if (this.watchers.has(directoryPath)) {
      this.watchers.get(directoryPath).close();
    }

    const watcher = chokidar.watch(directoryPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      depth: 10,
    });

    watcher
      .on("add", async (filePath) => {
        console.log(`ملف جديد: ${filePath}`);
        await this.processFile(filePath);
        await this.db.logActivity("file_added", filePath);
      })
      .on("change", async (filePath) => {
        console.log(`ملف محدث: ${filePath}`);
        await this.processFile(filePath);
        await this.db.logActivity("file_modified", filePath);
      })
      .on("unlink", async (filePath) => {
        console.log(`ملف محذوف: ${filePath}`);
        await this.db.removeFile(filePath);
        await this.db.logActivity("file_deleted", filePath);
      });

    this.watchers.set(directoryPath, watcher);
  }

  async searchFiles(query, options = {}) {
    const searchOptions = {
      useFTS: options.useAI || true,
      limit: options.limit || 100,
      category: options.category,
      extension: options.extension,
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
      sizeMin: options.sizeMin,
      sizeMax: options.sizeMax,
    };

    try {
      let results = await this.db.searchFiles(query, searchOptions);

      // Apply additional filters
      if (searchOptions.category && searchOptions.category !== "all") {
        results = results.filter(
          (file) => file.category === searchOptions.category,
        );
      }

      if (searchOptions.extension) {
        results = results.filter(
          (file) => file.extension === searchOptions.extension,
        );
      }

      if (searchOptions.dateFrom || searchOptions.dateTo) {
        results = results.filter((file) => {
          const fileDate = new Date(file.modified_at);
          const fromDate = searchOptions.dateFrom
            ? new Date(searchOptions.dateFrom)
            : null;
          const toDate = searchOptions.dateTo
            ? new Date(searchOptions.dateTo)
            : null;

          return (
            (!fromDate || fileDate >= fromDate) &&
            (!toDate || fileDate <= toDate)
          );
        });
      }

      if (searchOptions.sizeMin || searchOptions.sizeMax) {
        results = results.filter((file) => {
          return (
            (!searchOptions.sizeMin || file.size >= searchOptions.sizeMin) &&
            (!searchOptions.sizeMax || file.size <= searchOptions.sizeMax)
          );
        });
      }

      // Log search activity
      await this.db.logActivity(
        "search_performed",
        null,
        JSON.stringify({
          query,
          resultCount: results.length,
          options: searchOptions,
        }),
      );

      return results;
    } catch (error) {
      console.error("خطأ في البحث:", error);
      throw error;
    }
  }

  stopAllWatchers() {
    for (const [path, watcher] of this.watchers) {
      watcher.close();
      console.log(`تم إيقاف مراقبة: ${path}`);
    }
    this.watchers.clear();
  }

  isFileSupported(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    return this.supportedExtensions.has(extension) || extension === "";
  }

  getIndexingStatus() {
    return {
      isIndexing: this.isIndexing,
      queueLength: this.indexingQueue.length,
      watchedDirectories: Array.from(this.watchers.keys()),
    };
  }
}

module.exports = FileIndexer;
