const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Advanced file operations with FTS5
  searchFiles: (query, options) =>
    ipcRenderer.invoke("search-files", query, options),
  advancedSearch: (query, filters) =>
    ipcRenderer.invoke("advanced-search", query, filters),
  getFileStats: () => ipcRenderer.invoke("get-file-stats"),
  getRecentFiles: (limit) => ipcRenderer.invoke("get-recent-files", limit),
  getDuplicateFiles: () => ipcRenderer.invoke("get-duplicate-files"),

  // AI-powered features
  getAISuggestions: (filePath) =>
    ipcRenderer.invoke("get-ai-suggestions", filePath),
  getSmartSuggestions: (query) =>
    ipcRenderer.invoke("get-smart-suggestions", query),
  analyzeFileContent: (filePath) =>
    ipcRenderer.invoke("analyze-file-content", filePath),

  // Auto Organization
  autoOrganizeFiles: (directoryPath, options) =>
    ipcRenderer.invoke("auto-organize-files", directoryPath, options),
  categorizeFile: (filePath) => ipcRenderer.invoke("categorize-file", filePath),
  suggestCategories: (filePath) =>
    ipcRenderer.invoke("suggest-categories", filePath),

  // Advanced Duplicate Detection
  findAdvancedDuplicates: (options) =>
    ipcRenderer.invoke("find-advanced-duplicates", options),
  analyzeSimilarity: (file1, file2) =>
    ipcRenderer.invoke("analyze-similarity", file1, file2),

  // Indexing and Monitoring
  startIndexing: (directoryPath) =>
    ipcRenderer.invoke("start-indexing", directoryPath),
  stopIndexing: () => ipcRenderer.invoke("stop-indexing"),
  getIndexingStatus: () => ipcRenderer.invoke("get-indexing-status"),

  // File Encryption (placeholder for future)
  encryptFile: (filePath, password) =>
    ipcRenderer.invoke("encrypt-file", filePath, password),
  decryptFile: (filePath, password) =>
    ipcRenderer.invoke("decrypt-file", filePath, password),

  // File management
  openFileLocation: (filePath) =>
    ipcRenderer.invoke("open-file-location", filePath),
  deleteFile: (filePath) => ipcRenderer.invoke("delete-file", filePath),
  updateFileCategory: (fileId, category, tags) =>
    ipcRenderer.invoke("update-file-category", fileId, category, tags),
  reindexFile: (filePath) => ipcRenderer.invoke("reindex-file", filePath),

  // System operations
  optimizeDatabase: () => ipcRenderer.invoke("optimize-database"),
  getSystemInfo: () => ipcRenderer.invoke("get-system-info"),

  // Event listeners
  onIndexingStatus: (callback) => {
    ipcRenderer.on("indexing-status", (event, data) => callback(data));
  },
  onIndexingProgress: (callback) => {
    ipcRenderer.on("indexing-progress", (event, progress) =>
      callback(progress),
    );
  },
  onDatabaseOptimized: (callback) => {
    ipcRenderer.on("database-optimized", () => callback());
  },
  onShowStats: (callback) => {
    ipcRenderer.on("show-stats", (event, stats) => callback(stats));
  },
  onShowDuplicates: (callback) => {
    ipcRenderer.on("show-duplicates", (event, duplicates) =>
      callback(duplicates),
    );
  },
  onShowCategories: (callback) => {
    ipcRenderer.on("show-categories", () => callback());
  },
  onFocusSearch: (callback) => {
    ipcRenderer.on("focus-search", () => callback());
  },
  onShowSystemInfo: (callback) => {
    ipcRenderer.on("show-system-info", (event, info) => callback(info));
  },
  onAISuggestionsReady: (callback) => {
    ipcRenderer.on("ai-suggestions-ready", (event, suggestions) =>
      callback(suggestions),
    );
  },
  onOrganizationComplete: (callback) => {
    ipcRenderer.on("organization-complete", (event, result) =>
      callback(result),
    );
  },
  onEncryptionProgress: (callback) => {
    ipcRenderer.on("encryption-progress", (event, progress) =>
      callback(progress),
    );
  },

  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // System info
  platform: process.platform,

  // App version
  getVersion: () => require("../package.json").version,

  // FTS5 specific features
  features: {
    fts5Search: true,
    contentExtraction: true,
    smartIndexing: true,
    realTimeWatch: true,
    duplicateDetection: true,
    categoryClassification: true,
    advancedFilters: true,
  },
});

// Additional context for Arabic RTL support and FTS features
contextBridge.exposeInMainWorld("appConfig", {
  language: "ar",
  direction: "rtl",
  theme: "dark",
  searchEngine: "FTS5",
  version: "2.0",
  features: {
    instantSearch: true,
    contentSearch: true,
    smartFilters: true,
    realTimeIndexing: true,
    duplicateDetection: true,
    categoryClassification: true,
    multiLanguageSupport: true,
    offlineMode: true,
  },
  supportedFileTypes: [
    "PDF",
    "DOC",
    "DOCX",
    "TXT",
    "MD",
    "RTF",
    "ODT",
    "HTML",
    "HTM",
    "XML",
    "JSON",
    "CSV",
    "JS",
    "JSX",
    "TS",
    "TSX",
    "PY",
    "JAVA",
    "CPP",
    "C",
    "PHP",
    "CSS",
    "SCSS",
    "LESS",
    "SQL",
    "LOG",
    "JPG",
    "JPEG",
    "PNG",
    "GIF",
    "BMP",
    "TIFF",
    "SVG",
    "WEBP",
    "MP4",
    "AVI",
    "MOV",
    "WMV",
    "MKV",
    "WEBM",
    "FLV",
    "MP3",
    "WAV",
    "FLAC",
    "AAC",
    "OGG",
    "WMA",
    "ZIP",
    "RAR",
    "7Z",
    "TAR",
    "GZ",
    "XLS",
    "XLSX",
    "ODS",
    "PPT",
    "PPTX",
  ],
});

// FTS5 Search helpers
contextBridge.exposeInMainWorld("searchHelpers", {
  // Build FTS5 queries
  buildQuery: (terms, options = {}) => {
    if (!terms || terms.trim().length === 0) return "";

    const cleanTerms = terms.trim();

    // Handle Arabic and English text
    const isArabic = /[\u0600-\u06FF]/.test(cleanTerms);

    if (options.exact) {
      return `"${cleanTerms}"`;
    }

    if (options.prefix) {
      return cleanTerms
        .split(/\s+/)
        .map((term) => `${term}*`)
        .join(" ");
    }

    if (options.phrase) {
      return `"${cleanTerms}"`;
    }

    // Default: OR search with wildcards
    return cleanTerms
      .split(/\s+/)
      .map((term) => {
        if (isArabic) {
          return `"${term}"*`;
        }
        return `${term}*`;
      })
      .join(" OR ");
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Format date in Arabic
  formatDate: (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Get file icon
  getFileIcon: (extension, mimeType) => {
    if (mimeType?.startsWith("image/")) return "🖼️";
    if (mimeType?.startsWith("video/")) return "🎥";
    if (mimeType?.startsWith("audio/")) return "🎵";

    switch (extension?.toLowerCase()) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "ppt":
      case "pptx":
        return "📽️";
      case "zip":
      case "rar":
      case "7z":
        return "📦";
      case "js":
      case "html":
      case "css":
      case "py":
      case "java":
        return "💻";
      case "txt":
      case "md":
        return "📄";
      default:
        return "📄";
    }
  },

  // Highlight search terms in text
  highlightText: (text, searchTerms) => {
    if (!text || !searchTerms) return text;

    const terms = searchTerms.split(/\s+/).filter((term) => term.length > 2);
    let result = text;

    terms.forEach((term) => {
      const regex = new RegExp(`(${term})`, "gi");
      result = result.replace(regex, "<mark>$1</mark>");
    });

    return result;
  },
});
