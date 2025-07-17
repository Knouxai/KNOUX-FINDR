import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * Session Context for KNOUX FINDR
 * Manages user session, app state, and settings
 */

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  // Core session state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // App state
  const [appInitialized, setAppInitialized] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [isElectronMode, setIsElectronMode] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // File system state
  const [indexedFiles, setIndexedFiles] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [favoriteFiles, setFavoriteFiles] = useState([]);
  const [fileStats, setFileStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    totalTypes: 0,
    analyzedFiles: 0,
    duplicateGroups: 0,
  });

  // AI and analysis state
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);

  // Operations state
  const [activeOperations, setActiveOperations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Settings
  const [settings, setSettings] = useState({
    theme: "dark",
    language: "ar",
    autoSave: true,
    notifications: true,
    aiEnabled: true,
    indexingEnabled: true,
  });

  // Initialize session
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Generate session ID
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      setSessionStartTime(new Date());

      // Check if running in Electron
      if (window.electronAPI) {
        setIsElectronMode(true);
        console.log("✅ Electron mode detected");

        // Auto-authenticate for Electron
        await authenticateElectronUser();
      }

      // Load stored session data
      await loadStoredSessionData();

      setAppInitialized(true);
      console.log("✅ Session initialized successfully");
    } catch (error) {
      console.error("❌ Session initialization failed:", error);
      setAppInitialized(true); // Continue anyway
    }
  };

  const authenticateElectronUser = async () => {
    try {
      const electronUser = {
        id: "electron_user",
        name: "مستخدم سطح المكتب",
        email: "desktop@knouxfindr.local",
        provider: "electron",
        avatar: null,
        permissions: ["read", "write", "admin"],
        isDesktopUser: true,
      };

      setUser(electronUser);
      setIsAuthenticated(true);

      // Load file stats if available
      if (window.electronAPI.getFileStats) {
        const stats = await window.electronAPI.getFileStats();
        setFileStats(stats);
      }

      console.log("✅ Electron user authenticated");
    } catch (error) {
      console.error("❌ Electron authentication failed:", error);
    }
  };

  const loadStoredSessionData = async () => {
    try {
      // Load from localStorage
      const storedData = localStorage.getItem("knoux_session_data");
      if (storedData) {
        const sessionData = JSON.parse(storedData);
        setSearchHistory(sessionData.searchHistory || []);
        setFavoriteFiles(sessionData.favoriteFiles || []);
        setSettings({ ...settings, ...sessionData.settings });
      }
    } catch (error) {
      console.error("Failed to load session data:", error);
    }
  };

  const saveSessionData = () => {
    try {
      const sessionData = {
        searchHistory,
        favoriteFiles,
        settings,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem("knoux_session_data", JSON.stringify(sessionData));
    } catch (error) {
      console.error("Failed to save session data:", error);
    }
  };

  // Auto-save session data
  useEffect(() => {
    if (appInitialized) {
      const saveInterval = setInterval(saveSessionData, 30000); // Save every 30 seconds
      return () => clearInterval(saveInterval);
    }
  }, [appInitialized, searchHistory, favoriteFiles, settings]);

  // Session management functions
  const login = async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    addNotification("تم تسجيل الدخول بنجاح", "success");
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView("auth");
    addNotification("تم تسجيل الخروج", "info");
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // File management functions
  const updateFileStats = (newStats) => {
    setFileStats((prev) => ({ ...prev, ...newStats }));
  };

  const addRecentFile = (file) => {
    setRecentFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== file.id);
      return [file, ...filtered].slice(0, 20); // Keep only 20 recent files
    });
  };

  const addToFavorites = (file) => {
    setFavoriteFiles((prev) => {
      if (prev.find((f) => f.id === file.id)) return prev;
      return [...prev, file];
    });
    addNotification("تم إضافة الملف للمفضلة", "success");
  };

  const removeFromFavorites = (fileId) => {
    setFavoriteFiles((prev) => prev.filter((f) => f.id !== fileId));
    addNotification("تم إزالة الملف من المفضلة", "info");
  };

  // Search and AI functions
  const addToSearchHistory = (query) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((q) => q !== query);
      return [query, ...filtered].slice(0, 50); // Keep only 50 recent searches
    });
  };

  const updateAiSuggestions = (suggestions) => {
    setAiSuggestions(suggestions);
  };

  const addAnalysisResult = (result) => {
    setAnalysisResults((prev) => [result, ...prev].slice(0, 100));
  };

  // Operations management
  const addOperation = (operation) => {
    const opWithId = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      startTime: new Date(),
      status: "running",
    };
    setActiveOperations((prev) => [...prev, opWithId]);
    return opWithId.id;
  };

  const updateOperation = (id, updates) => {
    setActiveOperations((prev) =>
      prev.map((op) => (op.id === id ? { ...op, ...updates } : op)),
    );
  };

  const completeOperation = (id, result = null) => {
    setActiveOperations((prev) =>
      prev.map((op) =>
        op.id === id
          ? { ...op, status: "completed", endTime: new Date(), result }
          : op,
      ),
    );

    // Remove completed operations after 5 seconds
    setTimeout(() => {
      setActiveOperations((prev) => prev.filter((op) => op.id !== id));
    }, 5000);
  };

  // Notifications
  const addNotification = (message, type = "info", duration = 5000) => {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      message,
      type,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto-remove notification
    setTimeout(() => {
      removeNotification(notification.id);
    }, duration);

    return notification.id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Session info
  const getSessionInfo = () => ({
    sessionId,
    startTime: sessionStartTime,
    duration: sessionStartTime ? Date.now() - sessionStartTime.getTime() : 0,
    isElectronMode,
    isOfflineMode,
    isAuthenticated,
    user,
  });

  const value = {
    // Core session
    user,
    isAuthenticated,
    sessionId,
    sessionStartTime,
    appInitialized,
    currentView,
    isElectronMode,
    isOfflineMode,

    // File system
    indexedFiles,
    recentFiles,
    favoriteFiles,
    fileStats,

    // AI and analysis
    aiSuggestions,
    searchHistory,
    analysisResults,

    // Operations
    activeOperations,
    notifications,

    // Settings
    settings,

    // Actions
    login,
    logout,
    updateUser,
    updateSettings,
    setCurrentView,
    setIsOfflineMode,

    // File actions
    updateFileStats,
    addRecentFile,
    addToFavorites,
    removeFromFavorites,

    // Search and AI actions
    addToSearchHistory,
    updateAiSuggestions,
    addAnalysisResult,

    // Operation actions
    addOperation,
    updateOperation,
    completeOperation,

    // Notification actions
    addNotification,
    removeNotification,

    // Utility
    getSessionInfo,
    saveSessionData,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export default SessionContext;
