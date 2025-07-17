const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

// Import new AI and File System modules
const SmartIndexer = require("./modules/smartIndexer");

let mainWindow;
let smartIndexer;

async function createWindow() {
  // Initialize smart indexer
  smartIndexer = new SmartIndexer();
  await smartIndexer.initialize();

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false, // Only for development
    },
    icon: path.join(__dirname, "assets/icon.png"),
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    frame: true,
    show: false,
    backgroundColor: "#0F123B",
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Start initial indexing in background
    setTimeout(() => {
      startInitialIndexing();
    }, 2000);
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Setup application menu
  setupApplicationMenu();
}

async function startInitialIndexing() {
  try {
    const homeDir = require("os").homedir();
    const commonPaths = [
      path.join(homeDir, "Documents"),
      path.join(homeDir, "Desktop"),
      path.join(homeDir, "Downloads"),
      path.join(homeDir, "Pictures"),
    ];

    // Send indexing status to renderer
    mainWindow.webContents.send("indexing-status", {
      status: "started",
      message: "🚀 بدء الفهرسة الذكية مع FTS5...",
    });

    for (const scanPath of commonPaths) {
      if (require("fs").existsSync(scanPath)) {
        console.log(`📁 فهرسة: ${scanPath}`);

        await smartIndexer.indexDirectory(scanPath, (progress) => {
          mainWindow.webContents.send("indexing-progress", {
            ...progress,
            path: scanPath,
          });
        });
      }
    }

    const stats = smartIndexer.getStats();
    mainWindow.webContents.send("indexing-status", {
      status: "completed",
      message: `✅ اكتملت الفهرسة: ${stats.totalFiles} ملف مفهرس`,
      stats: stats,
    });
  } catch (error) {
    console.error("Indexing error:", error);
    mainWindow.webContents.send("indexing-status", {
      status: "error",
      message: "❌ خطأ في الفهرسة: " + error.message,
    });
  }
}

function setupApplicationMenu() {
  const template = [
    {
      label: "ملف",
      submenu: [
        {
          label: "🔍 فهرسة مجلد جديد",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ["openDirectory"],
              title: "اختر مجلد للفهرسة الذكية",
            });

            if (!result.canceled && result.filePaths.length > 0) {
              const selectedPath = result.filePaths[0];
              console.log(`📁 فهرسة مجلد محدد: ${selectedPath}`);

              await smartIndexer.indexDirectory(selectedPath, (progress) => {
                mainWindow.webContents.send("indexing-progress", {
                  ...progress,
                  path: selectedPath,
                });
              });
            }
          },
        },
        { type: "separator" },
        {
          label: "🔄 إعادة بناء الفهرس",
          click: async () => {
            if (smartIndexer) {
              smartIndexer.optimize();
              mainWindow.webContents.send("database-optimized");
            }
          },
        },
        {
          label: "📊 إحصائيات الفهرسة",
          click: () => {
            const stats = smartIndexer ? smartIndexer.getStats() : {};
            mainWindow.webContents.send("show-stats", stats);
          },
        },
        { type: "separator" },
        {
          label: "خروج",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "عرض",
      submenu: [
        { role: "reload", label: "إعادة تحميل" },
        { role: "forceReload", label: "إعادة تحميل قسري" },
        { role: "toggleDevTools", label: "أدوات المطور" },
        { type: "separator" },
        { role: "resetZoom", label: "إعادة تعيين التكبير" },
        { role: "zoomIn", label: "تكبير" },
        { role: "zoomOut", label: "تصغير" },
        { type: "separator" },
        { role: "togglefullscreen", label: "ملء الشاشة" },
      ],
    },
    {
      label: "🔍 بحث متقدم",
      submenu: [
        {
          label: "🚀 بحث فوري (FTS5)",
          accelerator: "CmdOrCtrl+F",
          click: () => {
            mainWindow.webContents.send("focus-search");
          },
        },
        {
          label: "🔄 البحث عن المكررات",
          click: async () => {
            const duplicates = smartIndexer
              ? await smartIndexer.findDuplicates()
              : [];
            mainWindow.webContents.send("show-duplicates", duplicates);
          },
        },
        {
          label: "📂 تصنيف الملفات",
          click: () => {
            mainWindow.webContents.send("show-categories");
          },
        },
      ],
    },
    {
      label: "⚙️ أدوات",
      submenu: [
        {
          label: "🔧 تحسين قاعدة البيانات",
          click: () => {
            if (smartIndexer) {
              smartIndexer.optimize();
              mainWindow.webContents.send("database-optimized");
            }
          },
        },
        {
          label: "📋 معلومات النظام",
          click: () => {
            const info = smartIndexer ? smartIndexer.getInfo() : {};
            mainWindow.webContents.send("show-system-info", info);
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers for the new system
ipcMain.handle("search-files", async (event, query, options = {}) => {
  try {
    console.log(`🔍 بحث: "${query}"`);
    const results = await smartIndexer.searchFiles(query, {
      limit: options.limit || 50,
      ...options,
    });

    console.log(`📋 النتائج: ${results.length} ملف`);
    return results;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
});

ipcMain.handle("advanced-search", async (event, query, filters = {}) => {
  try {
    console.log(`🔍 بحث متقدم: "${query}"`);
    console.log("🔧 المرشحات:", filters);

    const results = await smartIndexer.advancedSearch(query, filters);
    console.log(`📋 النتائج المتقدمة: ${results.length} ملف`);

    return results;
  } catch (error) {
    console.error("Advanced search error:", error);
    return [];
  }
});

ipcMain.handle("get-file-stats", async () => {
  try {
    return smartIndexer ? smartIndexer.getStats() : {};
  } catch (error) {
    console.error("Stats error:", error);
    return {};
  }
});

ipcMain.handle("get-recent-files", async (event, limit = 10) => {
  try {
    const results = await smartIndexer.advancedSearch("", {
      limit: limit,
      sortBy: "modified",
    });
    return results;
  } catch (error) {
    console.error("Recent files error:", error);
    return [];
  }
});

ipcMain.handle("get-duplicate-files", async () => {
  try {
    return smartIndexer ? await smartIndexer.findDuplicates() : [];
  } catch (error) {
    console.error("Duplicates error:", error);
    return [];
  }
});

// AI-powered suggestions and analysis
ipcMain.handle("get-ai-suggestions", async (event, filePath) => {
  try {
    return smartIndexer && smartIndexer.aiProcessor
      ? await smartIndexer.aiProcessor.getSmartSuggestions(filePath)
      : [];
  } catch (error) {
    console.error("AI suggestions error:", error);
    return [];
  }
});

ipcMain.handle("get-smart-suggestions", async (event, query) => {
  try {
    return smartIndexer && smartIndexer.aiProcessor
      ? await smartIndexer.aiProcessor.generateSmartSuggestions(query)
      : [];
  } catch (error) {
    console.error("Smart suggestions error:", error);
    return [];
  }
});

ipcMain.handle("analyze-file-content", async (event, filePath) => {
  try {
    return smartIndexer && smartIndexer.aiProcessor
      ? await smartIndexer.aiProcessor.analyzeContent(filePath)
      : {};
  } catch (error) {
    console.error("Content analysis error:", error);
    return {};
  }
});

// Auto Organization
ipcMain.handle(
  "auto-organize-files",
  async (event, directoryPath, options = {}) => {
    try {
      if (smartIndexer && smartIndexer.intelligentCategorizer) {
        const result =
          await smartIndexer.intelligentCategorizer.autoOrganizeDirectory(
            directoryPath,
            options,
          );
        mainWindow.webContents.send("organization-complete", result);
        return result;
      }
      return { success: false, message: "Categorizer not available" };
    } catch (error) {
      console.error("Auto organize error:", error);
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle("categorize-file", async (event, filePath) => {
  try {
    return smartIndexer && smartIndexer.intelligentCategorizer
      ? await smartIndexer.intelligentCategorizer.categorizeFile(filePath)
      : "Unknown";
  } catch (error) {
    console.error("Categorize file error:", error);
    return "Unknown";
  }
});

ipcMain.handle("suggest-categories", async (event, filePath) => {
  try {
    return smartIndexer && smartIndexer.intelligentCategorizer
      ? await smartIndexer.intelligentCategorizer.suggestCategories(filePath)
      : [];
  } catch (error) {
    console.error("Suggest categories error:", error);
    return [];
  }
});

// Advanced Duplicate Detection
ipcMain.handle("find-advanced-duplicates", async (event, options = {}) => {
  try {
    if (smartIndexer && smartIndexer.duplicateDetector) {
      return await smartIndexer.duplicateDetector.findAllDuplicates(
        (progress) => {
          mainWindow.webContents.send("indexing-progress", {
            ...progress,
            type: "duplicate-detection",
          });
        },
      );
    }
    return [];
  } catch (error) {
    console.error("Advanced duplicates error:", error);
    return [];
  }
});

ipcMain.handle("analyze-similarity", async (event, file1, file2) => {
  try {
    return smartIndexer && smartIndexer.duplicateDetector
      ? await smartIndexer.duplicateDetector.calculateSimilarity(file1, file2)
      : 0;
  } catch (error) {
    console.error("Similarity analysis error:", error);
    return 0;
  }
});

// Indexing Control
ipcMain.handle("start-indexing", async (event, directoryPath) => {
  try {
    if (smartIndexer) {
      await smartIndexer.indexDirectory(directoryPath, (progress) => {
        mainWindow.webContents.send("indexing-progress", progress);
      });
      return { success: true };
    }
    return { success: false, message: "Indexer not available" };
  } catch (error) {
    console.error("Start indexing error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("stop-indexing", async () => {
  try {
    if (smartIndexer && smartIndexer.stopIndexing) {
      smartIndexer.stopIndexing();
      return { success: true };
    }
    return { success: false, message: "Cannot stop indexing" };
  } catch (error) {
    console.error("Stop indexing error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-indexing-status", async () => {
  try {
    return smartIndexer
      ? {
          isIndexing: smartIndexer.isIndexing || false,
          progress: smartIndexer.getIndexingProgress
            ? smartIndexer.getIndexingProgress()
            : {},
          stats: smartIndexer.getStats(),
        }
      : { isIndexing: false, progress: {}, stats: {} };
  } catch (error) {
    console.error("Get indexing status error:", error);
    return { isIndexing: false, progress: {}, stats: {} };
  }
});

// File Encryption (placeholder - to be implemented)
ipcMain.handle("encrypt-file", async (event, filePath, password) => {
  try {
    // TODO: Implement actual file encryption
    console.log("File encryption requested for:", filePath);
    return { success: false, message: "Encryption feature coming soon" };
  } catch (error) {
    console.error("Encrypt file error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("decrypt-file", async (event, filePath, password) => {
  try {
    // TODO: Implement actual file decryption
    console.log("File decryption requested for:", filePath);
    return { success: false, message: "Decryption feature coming soon" };
  } catch (error) {
    console.error("Decrypt file error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("open-file-location", async (event, filePath) => {
  const { shell } = require("electron");
  try {
    shell.showItemInFolder(filePath);
    return true;
  } catch (error) {
    console.error("Open location error:", error);
    return false;
  }
});

ipcMain.handle("delete-file", async (event, filePath) => {
  const fs = require("fs-extra");
  try {
    await fs.remove(filePath);
    if (smartIndexer) {
      smartIndexer.deleteFile(filePath);
    }
    return true;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
  }
});

ipcMain.handle(
  "update-file-category",
  async (event, fileId, category, tags = []) => {
    try {
      return smartIndexer
        ? smartIndexer.updateFileCategory(fileId, category, tags)
        : false;
    } catch (error) {
      console.error("Update category error:", error);
      return false;
    }
  },
);

ipcMain.handle("reindex-file", async (event, filePath) => {
  try {
    if (smartIndexer) {
      await smartIndexer.reindexFile(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Reindex error:", error);
    return false;
  }
});

ipcMain.handle("optimize-database", async () => {
  try {
    if (smartIndexer) {
      smartIndexer.optimize();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Optimize error:", error);
    return false;
  }
});

ipcMain.handle("get-system-info", async () => {
  try {
    return smartIndexer ? smartIndexer.getInfo() : {};
  } catch (error) {
    console.error("System info error:", error);
    return {};
  }
});

// App event handlers
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app closing
app.on("before-quit", async () => {
  if (smartIndexer) {
    await smartIndexer.close();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
  });
});

// Handle certificate errors in development
app.on(
  "certificate-error",
  (event, webContents, url, error, certificate, callback) => {
    if (isDev) {
      event.preventDefault();
      callback(true);
    } else {
      callback(false);
    }
  },
);
