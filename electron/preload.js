const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // File operations
  searchFiles: (query, options) =>
    ipcRenderer.invoke("search-files", query, options),
  getFileStats: () => ipcRenderer.invoke("get-file-stats"),
  getRecentFiles: (limit) => ipcRenderer.invoke("get-recent-files", limit),
  openFileLocation: (filePath) =>
    ipcRenderer.invoke("open-file-location", filePath),
  deleteFile: (filePath) => ipcRenderer.invoke("delete-file", filePath),
  getDuplicateFiles: () => ipcRenderer.invoke("get-duplicate-files"),

  // AI operations
  analyzeFileContent: (filePath) =>
    ipcRenderer.invoke("analyze-file-content", filePath),
  getFileSuggestions: (context) =>
    ipcRenderer.invoke("get-file-suggestions", context),
  categorizeFiles: () => ipcRenderer.invoke("categorize-files"),
  extractFileText: (filePath) =>
    ipcRenderer.invoke("extract-file-text", filePath),

  // Event listeners
  onIndexingStatus: (callback) => {
    ipcRenderer.on("indexing-status", (event, data) => callback(data));
  },
  onIndexingProgress: (callback) => {
    ipcRenderer.on("indexing-progress", (event, progress) =>
      callback(progress),
    );
  },
  onDatabaseReset: (callback) => {
    ipcRenderer.on("database-reset", () => callback());
  },
  onAIAnalyzeContent: (callback) => {
    ipcRenderer.on("ai-analyze-content", () => callback());
  },
  onAIAutoCategorize: (callback) => {
    ipcRenderer.on("ai-auto-categorize", () => callback());
  },
  onAISmartSuggestions: (callback) => {
    ipcRenderer.on("ai-smart-suggestions", () => callback());
  },

  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // System info
  platform: process.platform,

  // App version
  getVersion: () => require("../package.json").version,
});

// Additional context for Arabic RTL support
contextBridge.exposeInMainWorld("appConfig", {
  language: "ar",
  direction: "rtl",
  theme: "dark",
  features: {
    aiEnabled: true,
    offlineMode: true,
    smartCategorization: true,
    duplicateDetection: true,
    contentAnalysis: true,
  },
});
