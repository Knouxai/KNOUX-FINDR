const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

// Import AI and File System modules
const FileIndexer = require("./modules/fileIndexer");
const AIProcessor = require("./modules/aiProcessor");
const DatabaseManager = require("./modules/databaseManager");

let mainWindow;
let fileIndexer;
let aiProcessor;
let dbManager;

async function createWindow() {
  // Initialize core modules
  dbManager = new DatabaseManager();
  await dbManager.initialize();

  fileIndexer = new FileIndexer(dbManager);
  aiProcessor = new AIProcessor();
  await aiProcessor.initialize();

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
    titleBarStyle: "hiddenInset",
    frame: process.platform === "darwin" ? false : true,
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

    // Start file indexing in background
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
      message: "بدء فهرسة الملفات...",
    });

    for (const scanPath of commonPaths) {
      await fileIndexer.indexDirectory(scanPath, (progress) => {
        mainWindow.webContents.send("indexing-progress", progress);
      });
    }

    mainWindow.webContents.send("indexing-status", {
      status: "completed",
      message: "تم إكمال فهرسة الملفات بنجاح",
    });
  } catch (error) {
    console.error("Indexing error:", error);
    mainWindow.webContents.send("indexing-status", {
      status: "error",
      message: "خطأ في فهرسة الملفات",
    });
  }
}

function setupApplicationMenu() {
  const template = [
    {
      label: "ملف",
      submenu: [
        {
          label: "فهرسة مجلد جديد",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ["openDirectory"],
              title: "اختر مجلد للفهرسة",
            });

            if (!result.canceled && result.filePaths.length > 0) {
              await fileIndexer.indexDirectory(
                result.filePaths[0],
                (progress) => {
                  mainWindow.webContents.send("indexing-progress", progress);
                },
              );
            }
          },
        },
        { type: "separator" },
        {
          label: "إعادة تعيين قاعدة البيانات",
          click: async () => {
            await dbManager.resetDatabase();
            mainWindow.webContents.send("database-reset");
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
      label: "ذكاء اصطناعي",
      submenu: [
        {
          label: "تحليل المحتوى",
          click: () => {
            mainWindow.webContents.send("ai-analyze-content");
          },
        },
        {
          label: "تصنيف تلقائي",
          click: () => {
            mainWindow.webContents.send("ai-auto-categorize");
          },
        },
        {
          label: "اقتراحات ذكية",
          click: () => {
            mainWindow.webContents.send("ai-smart-suggestions");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle("search-files", async (event, query, options = {}) => {
  try {
    const results = await fileIndexer.searchFiles(query, options);

    // AI-enhanced search results
    if (options.useAI && results.length > 0) {
      const enhancedResults = await aiProcessor.enhanceSearchResults(
        query,
        results,
      );
      return enhancedResults;
    }

    return results;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
});

ipcMain.handle("get-file-stats", async () => {
  return await dbManager.getFileStatistics();
});

ipcMain.handle("get-recent-files", async (event, limit = 10) => {
  return await dbManager.getRecentFiles(limit);
});

ipcMain.handle("analyze-file-content", async (event, filePath) => {
  return await aiProcessor.analyzeFileContent(filePath);
});

ipcMain.handle("get-file-suggestions", async (event, context) => {
  return await aiProcessor.getSmartSuggestions(context);
});

ipcMain.handle("categorize-files", async () => {
  const files = await dbManager.getUncategorizedFiles();
  const categorizedFiles = await aiProcessor.categorizeFiles(files);

  for (const file of categorizedFiles) {
    await dbManager.updateFileCategory(file.id, file.category, file.tags);
  }

  return categorizedFiles.length;
});

ipcMain.handle("extract-file-text", async (event, filePath) => {
  return await aiProcessor.extractTextFromFile(filePath);
});

ipcMain.handle("get-duplicate-files", async () => {
  return await dbManager.findDuplicateFiles();
});

ipcMain.handle("open-file-location", async (event, filePath) => {
  const { shell } = require("electron");
  shell.showItemInFolder(filePath);
});

ipcMain.handle("delete-file", async (event, filePath) => {
  const fs = require("fs-extra");
  try {
    await fs.remove(filePath);
    await dbManager.removeFile(filePath);
    return true;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
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
  if (dbManager) {
    await dbManager.close();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
  });
});
