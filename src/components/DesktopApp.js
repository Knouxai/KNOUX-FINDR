import React, { useState, useEffect } from "react";
import PowerOps from "./PowerOps";
import InstantSearch from "./InstantSearch";
import Stats from "./Stats";
import Timeline from "./Timeline";
import DuplicateManager from "./DuplicateManager";
import SocialLogin from "./SocialLogin";
import ProfessionalDashboard from "./ProfessionalDashboard";
import DatabaseManager from "./DatabaseManager";
import LanguageManager from "./LanguageManager";

/**
 * KNOUX FINDR Desktop App UI
 * --------------------------------
 * Complete desktop application with advanced features:
 * - Instant AI-powered search
 * - Advanced duplicate detection with intelligent algorithms
 * - Smart file organization and categorization
 * - Real-time file statistics and analytics
 * - Timeline view of file activities
 * - Glass morphism UI with smooth animations
 */

const DesktopApp = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginScreen, setShowLoginScreen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("تقارير العمل");
  const [searchResults, setSearchResults] = useState([
    {
      id: "search_1",
      name: "تقرير المبيعات الربعي 2024.pdf",
      path: "/Users/Desktop/Reports/Q4_Sales_Report_2024.pdf",
      size: 3847293,
      modified_at: "2024-01-15T10:30:00Z",
      extension: ".pdf",
      mime_type: "application/pdf",
      category: "Work",
      aiRelevanceScore: 0.95,
    },
    {
      id: "search_2",
      name: "عرض تقديمي - استراتيجية المنتج.pptx",
      path: "/Users/Documents/Presentations/Product_Strategy_2024.pptx",
      size: 18472938,
      modified_at: "2024-01-14T16:45:00Z",
      extension: ".pptx",
      mime_type:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      category: "Work",
      aiRelevanceScore: 0.89,
    },
    {
      id: "search_3",
      name: "صور_مؤتمر_التقنية_2024",
      path: "/Users/Pictures/Conference/Tech_Conference_2024/IMG_0847.jpg",
      size: 6293847,
      modified_at: "2024-01-13T14:22:00Z",
      extension: ".jpg",
      mime_type: "image/jpeg",
      category: "Work",
      aiRelevanceScore: 0.82,
    },
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [fileStats, setFileStats] = useState({
    totalFiles: 147832,
    totalSize: 2847291840000,
    totalTypes: 67,
    analyzedFiles: 139284,
    categories: {
      Documents: 45231,
      Images: 32847,
      Videos: 8934,
      Audio: 12847,
      Code: 15983,
      Archives: 4821,
      Work: 18472,
      Personal: 22631,
    },
  });
  const [recentFiles, setRecentFiles] = useState([
    {
      id: 1,
      name: "تقرير المبيعات Q4 2024.pdf",
      path: "/Users/Desktop/Reports/تقرير المبيعات Q4 2024.pdf",
      size: 2847293,
      modified_at: "2024-01-15T10:30:00Z",
      extension: ".pdf",
      mime_type: "application/pdf",
      category: "Work",
    },
    {
      id: 2,
      name: "عرض تقديمي - استراتيجية التسويق.pptx",
      path: "/Users/Documents/Presentations/عرض تقديمي - استراتيجية التسويق.pptx",
      size: 15847293,
      modified_at: "2024-01-14T16:45:00Z",
      extension: ".pptx",
      mime_type:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      category: "Work",
    },
    {
      id: 3,
      name: "صور العطلة الصيفية",
      path: "/Users/Pictures/Summer_2024/IMG_001.jpg",
      size: 4293847,
      modified_at: "2024-01-13T14:22:00Z",
      extension: ".jpg",
      mime_type: "image/jpeg",
      category: "Personal",
    },
    {
      id: 4,
      name: "مشروع React النهائي",
      path: "/Users/Dev/Projects/knoux-findr/src/App.js",
      size: 23847,
      modified_at: "2024-01-13T09:15:00Z",
      extension: ".js",
      mime_type: "text/javascript",
      category: "Code",
    },
  ]);
  const [indexingStatus, setIndexingStatus] = useState({
    status: "completed",
    message: "تم فهرسة 147,832 ملف بنجاح",
    filesProcessed: 147832,
    totalFiles: 147832,
  });
  const [indexingProgress, setIndexingProgress] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      title: "🔍 اقتراحات البحث الذكية",
      items: [
        { text: "تقارير العمل الأخيرة", confidence: 95, category: "Work" },
        { text: "صور العطلة الصيفية", confidence: 89, category: "Personal" },
        { text: "مشاريع React والبرمجة", confidence: 92, category: "Code" },
      ],
    },
    {
      title: "📁 تصنيفات مقترحة",
      items: [
        {
          text: "ملفات التصميم غير المصنفة",
          confidence: 94,
          category: "Design",
        },
        { text: "مقاطع فيديو الاجتماعات", confidence: 91, category: "Work" },
      ],
    },
  ]);
  const [activeView, setActiveView] = useState("search");
  const [searchFilters, setSearchFilters] = useState({
    useAI: true,
    category: "all",
    dateFrom: "",
    dateTo: "",
    fileType: "all",
  });
  const [duplicateGroups, setDuplicateGroups] = useState([
    {
      id: "dup_1",
      algorithm: "exactHash",
      confidence: 100,
      files: [
        {
          path: "/Users/Downloads/document.pdf",
          size: 2847293,
          hash: "a1b2c3d4",
          modified_at: "2024-01-15T10:30:00Z",
        },
        {
          path: "/Users/Desktop/document.pdf",
          size: 2847293,
          hash: "a1b2c3d4",
          modified_at: "2024-01-15T10:30:00Z",
        },
        {
          path: "/Users/Backup/document.pdf",
          size: 2847293,
          hash: "a1b2c3d4",
          modified_at: "2024-01-15T10:30:00Z",
        },
      ],
      totalSize: 8541879,
      potentialSavings: 5694586,
    },
    {
      id: "dup_2",
      algorithm: "fuzzyHash",
      confidence: 95,
      files: [
        {
          path: "/Users/Pictures/vacation_photo_1.jpg",
          size: 4293847,
          hash: "e5f6g7h8",
          modified_at: "2024-01-10T14:22:00Z",
        },
        {
          path: "/Users/Pictures/vacation_photo_1_edited.jpg",
          size: 4298473,
          hash: "e5f6g7h9",
          modified_at: "2024-01-11T16:30:00Z",
        },
      ],
      totalSize: 8592320,
      potentialSavings: 4293847,
    },
  ]);
  const [isDuplicateAnalysisRunning, setIsDuplicateAnalysisRunning] =
    useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "تم اكتشاف 2 مجموعة من الملفات المكررة",
      type: "info",
      timestamp: new Date(Date.now() - 30000),
    },
    {
      id: 2,
      message: "تم تصنيف 1,247 ملف جديد بالذكاء الاصطناعي",
      type: "success",
      timestamp: new Date(Date.now() - 120000),
    },
  ]);

  useEffect(() => {
    if (window.electronAPI) {
      setIsElectron(true);
      // Show login screen first for Electron, skip for web
      setShowLoginScreen(true);
    }
  }, []);

  const handleLogin = async (credentials) => {
    try {
      // Simulate login process
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsLoggedIn(true);
      setShowLoginScreen(false);
      initializeApp();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleQuickStart = () => {
    setIsLoggedIn(true);
    setShowLoginScreen(false);
    initializeApp();
  };

  const handleSocialLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setShowLoginScreen(false);
    // Store user info (could be in context/state management)
    sessionStorage.setItem("knouxUser", JSON.stringify(user));
    initializeApp();
  };

  const handleSocialLoginError = (error) => {
    console.error("Social login failed:", error);
    addNotification(`فشل تسجيل الدخول: ${error}`, "error");
  };

  const initializeApp = async () => {
    try {
      // Get initial file statistics
      const stats = await window.electronAPI.getFileStats();
      setFileStats(stats);

      // Get recent files
      const recent = await window.electronAPI.getRecentFiles(10);
      setRecentFiles(recent);

      // Setup event listeners for real-time updates
      if (window.electronAPI.onIndexingStatus) {
        window.electronAPI.onIndexingStatus((status) => {
          setIndexingStatus(status);
          addNotification(
            status.message,
            status.status === "completed" ? "success" : "info",
          );
        });
      }

      if (window.electronAPI.onIndexingProgress) {
        window.electronAPI.onIndexingProgress((progress) => {
          setIndexingProgress(progress);
        });
      }

      // Initial AI suggestions
      await loadAISuggestions();
    } catch (error) {
      console.error("App initialization failed:", error);
      addNotification("تعذر تهيئة التطبيق", "error");
    }
  };

  const loadAISuggestions = async () => {
    try {
      if (window.electronAPI.getFileSuggestions) {
        const suggestions = await window.electronAPI.getFileSuggestions({
          recentSearches: [searchQuery],
          fileCategories: fileStats.categories,
        });
        setAiSuggestions(suggestions);
      }
    } catch (error) {
      console.error("Error loading AI suggestions:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await window.electronAPI.searchFiles(
        searchQuery,
        searchFilters,
      );
      setSearchResults(results);

      // Update AI suggestions based on search
      if (searchFilters.useAI) {
        await loadAISuggestions();
      }
    } catch (error) {
      console.error("Search failed:", error);
      addNotification("فشل في البحث", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRunDuplicateAnalysis = async () => {
    setIsDuplicateAnalysisRunning(true);
    addNotification("جاري تشغيل تحليل الملفات ا��مكررة المتقدم...", "info");

    try {
      const duplicates = await window.electronAPI.getAdvancedDuplicates();
      setDuplicateGroups(duplicates);
      addNotification(
        `تم العثور على ${duplicates.length} مجموعة من الملفات المكررة`,
        "success",
      );
    } catch (error) {
      console.error("Duplicate analysis failed:", error);
      addNotification("فشل في تحليل الملفات الم��ررة", "error");
    } finally {
      setIsDuplicateAnalysisRunning(false);
    }
  };

  const handleAIAnalyzeContent = async () => {
    try {
      addNotification("جاري تشغيل التحليل الذكي للمحتوى...", "info");
      const result = await window.electronAPI.categorizeFiles();

      // Refresh file stats
      const stats = await window.electronAPI.getFileStats();
      setFileStats(stats);

      addNotification(
        `تم تصنيف ${result.categorizedCount} ملف بالذكاء الاصطناعي`,
        "success",
      );
    } catch (error) {
      console.error("AI analysis failed:", error);
      addNotification("فشل في التحليل الذكي", "error");
    }
  };

  const addNotification = (message, type = "info") => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications((prev) => [notification, ...prev.slice(0, 4)]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (extension, mimeType) => {
    if (mimeType?.startsWith("image/")) return "🖼️";
    if (mimeType?.startsWith("video/")) return "🎥";
    if (mimeType?.startsWith("audio/")) return "🎵";

    switch (extension?.toLowerCase()) {
      case ".pdf":
        return "📄";
      case ".doc":
      case ".docx":
        return "📝";
      case ".xls":
      case ".xlsx":
        return "📊";
      case ".ppt":
      case ".pptx":
        return "📽️";
      case ".zip":
      case ".rar":
      case ".7z":
        return "📦";
      case ".js":
      case ".html":
      case ".css":
      case ".py":
      case ".java":
        return "💻";
      default:
        return "📄";
    }
  };

  // Login Screen Component
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-orb absolute top-20 left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div
          className="floating-orb absolute top-40 right-32 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="floating-orb absolute bottom-32 left-1/3 w-32 h-32 bg-green-500/5 rounded-full blur-xl"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="floating-orb absolute bottom-20 right-20 w-40 h-40 bg-pink-500/5 rounded-full blur-xl"
          style={{ animationDelay: "6s" }}
        ></div>

        {/* Animated Particles */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0)",
              backgroundSize: "50px 50px",
              animation: "float 20s ease-in-out infinite",
            }}
          ></div>
        </div>
      </div>

      <div className="relative z-10 text-center text-white max-w-lg mx-auto px-6">
        {/* Top Header with Professor Name */}
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-full">
          <div className="glass-card rounded-xl p-4 border border-amber-400/30 bg-amber-500/5">
            <div className="text-2xl font-black tracking-wider text-amber-400">
              Prof S
            </div>
            <div className="text-2xl font-black tracking-wider text-amber-400">
              adek Elgazar
            </div>
          </div>
        </div>
        {/* Logo and Title */}
        <div className="mb-12">
          <div className="text-8xl mb-6 animate-pulse-glow">🚀</div>
          <h1 className="text-5xl font-bold mb-4 gradient-text tracking-wider">
            KNOUX FINDR
          </h1>
          <p className="text-xl text-gray-300 mb-2">Desktop Search Engine</p>
          <p className="text-lg text-blue-400 font-semibold mb-6">
            محرك البحث المحلي المدعوم بالذكاء الاصطناعي
          </p>

          {/* Professor Name - Large Advertisement Style */}
          <div className="glass-card rounded-2xl p-8 mb-6 border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-2xl">
            <div className="text-center">
              <div
                className="text-6xl font-black tracking-widest mb-2"
                style={{
                  background:
                    "linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 0 30px rgba(251, 191, 36, 0.5)",
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                }}
              >
                Prof S
              </div>
              <div
                className="text-6xl font-black tracking-widest"
                style={{
                  background:
                    "linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 0 30px rgba(251, 191, 36, 0.5)",
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                }}
              >
                adek Elgazar
              </div>
              <div className="mt-4 text-lg text-amber-200 font-bold tracking-wider">
                🎓 PROJECT SUPERVISOR & AI RESEARCH DIRECTOR 🎓
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="glass-card rounded-2xl p-8 mb-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-6 text-blue-400">
            مرحباً بك في KNOUX FINDR
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl mb-2">🤖</div>
              <div className="text-sm font-semibold">ذكاء اصطناعي</div>
              <div className="text-xs text-gray-400">بحث متقدم</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl mb-2">🔍</div>
              <div className="text-sm font-semibold">كشف المكررات</div>
              <div className="text-xs text-gray-400">توفير المساحة</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm font-semibold">تحليل الملفات</div>
              <div className="text-xs text-gray-400">إحصائيات شاملة</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm font-semibold">سرعة فائقة</div>
              <div className="text-xs text-gray-400">أداء محسن</div>
            </div>
          </div>

          {/* Social Login */}
          <SocialLogin
            onLoginSuccess={handleSocialLoginSuccess}
            onLoginError={handleSocialLoginError}
          />

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-gray-400 text-sm">أو</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <button
              onClick={handleQuickStart}
              className="w-full py-3 px-6 glass-button rounded-xl text-lg font-semibold hover:scale-105 transition-all duration-200"
            >
              🚀 ابدأ الاستخدام فوراً
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  /* Handle demo */
                }}
                className="flex-1 py-2 px-3 glass-button rounded-lg text-sm font-semibold hover:scale-105 transition-all duration-200"
              >
                📖 جولة تعريفية
              </button>
              <button
                onClick={() => {
                  /* Handle settings */
                }}
                className="flex-1 py-2 px-3 glass-button rounded-lg text-sm font-semibold hover:scale-105 transition-all duration-200"
              >
                ⚙️ الإعدادات
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="glass-card rounded-lg p-4 border border-green-500/20 bg-green-500/5">
          <div className="flex items-center justify-center gap-3 text-green-400">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">النظام جاهز ومتصل</span>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-6 space-y-3">
          <div className="glass-card rounded-lg p-3 border border-amber-400/30 bg-amber-500/5">
            <div className="text-lg font-black tracking-wider text-amber-400">
              Prof S
            </div>
            <div className="text-lg font-black tracking-wider text-amber-400">
              adek Elgazar
            </div>
            <div className="text-xs text-amber-300/80 mt-1">
              Project Supervisor
            </div>
          </div>
          <div className="text-xs text-gray-500">
            KNOUX FINDR Desktop v1.0.0 • Powered by AI • Made with ❤️
          </div>
        </div>
      </div>
    </div>
  );

  // Show login screen for new users or web fallback
  if (!isElectron || showLoginScreen) {
    return <LoginScreen />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta text-white"
      dir="rtl"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div
          className="floating-orb absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-lg"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="floating-orb absolute bottom-20 left-1/3 w-20 h-20 bg-green-500/10 rounded-full blur-md"
          style={{ animationDelay: "4s" }}
        ></div>
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass-card border-b-2 border-white/10 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold gradient-text">KNOUX FINDR</div>
            <div className="text-xs bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 animate-pulse-glow">
              🤖 AI Desktop Search Engine
            </div>

            {/* Status Indicators */}
            {indexingStatus && (
              <div
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  indexingStatus.status === "started"
                    ? "bg-orange-500/20 border-orange-500/30 text-orange-300"
                    : indexingStatus.status === "completed"
                      ? "bg-green-500/20 border-green-500/30 text-green-300"
                      : "bg-red-500/20 border-red-500/30 text-red-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {indexingStatus.status === "started" && (
                    <div className="loading-spinner w-3 h-3"></div>
                  )}
                  {indexingStatus.message}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              className="glass-button px-4 py-2 rounded-lg text-sm hover:scale-105 transition-transform"
              onClick={handleRunDuplicateAnalysis}
              disabled={isDuplicateAnalysisRunning}
            >
              {isDuplicateAnalysisRunning ? (
                <div className="flex items-center gap-2">
                  <div className="loading-spinner w-4 h-4"></div>
                  تحليل...
                </div>
              ) : (
                "🔍 كشف المكررات"
              )}
            </button>
            <button
              className="glass-button px-4 py-2 rounded-lg text-sm hover:scale-105 transition-transform"
              onClick={handleAIAnalyzeContent}
            >
              🤖 تحليل ذكي
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {indexingProgress && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300">{indexingProgress.status}</span>
              <span className="text-blue-400">
                {indexingProgress.progress}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out gradient-shimmer"
                style={{ width: `${indexingProgress.progress || 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </header>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 left-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`glass-card rounded-lg p-3 max-w-xs scale-in ${
                notification.type === "success"
                  ? "border-green-500/30 bg-green-500/10"
                  : notification.type === "error"
                    ? "border-red-500/30 bg-red-500/10"
                    : "border-blue-500/30 bg-blue-500/10"
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">
                  {notification.type === "success"
                    ? "✅"
                    : notification.type === "error"
                      ? "❌"
                      : "ℹ️"}
                </span>
                {notification.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="relative z-10 p-4 pb-0">
        <div className="flex gap-2 overflow-x-auto">
          {[
            {
              id: "professional",
              label: "🏢 Professional Dashboard",
              icon: "🏢",
            },
            { id: "search", label: "🔍 Intelligent Search", icon: "🔍" },
            { id: "database", label: "🗄️ Database Management", icon: "🗄️" },
            { id: "languages", label: "🌐 Language Center", icon: "🌐" },
            { id: "powerops", label: "⚡ Advanced Operations", icon: "⚡" },
            { id: "duplicates", label: "🔄 Duplicate Analysis", icon: "🔄" },
            { id: "analytics", label: "📊 Enterprise Analytics", icon: "📊" },
            { id: "timeline", label: "📅 Activity Timeline", icon: "📅" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 ${
                activeView === tab.id
                  ? "primary-button shadow-lg animate-pulse-glow"
                  : "glass-button hover:bg-white/10"
              }`}
              onClick={() => setActiveView(tab.id)}
            >
              <span className="text-lg mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 p-4 overflow-hidden">
        <div className="h-[calc(100vh-200px)] overflow-y-auto">
          {/* Professional Dashboard View */}
          {activeView === "professional" && (
            <div className="fade-in">
              <ProfessionalDashboard
                user={{ name: "Enterprise User", email: "admin@knoux.com" }}
                onLogout={() => setShowLoginScreen(true)}
              />
            </div>
          )}

          {/* Database Management View */}
          {activeView === "database" && (
            <div className="fade-in">
              <DatabaseManager />
            </div>
          )}

          {/* Language Center View */}
          {activeView === "languages" && (
            <div className="fade-in">
              <LanguageManager />
            </div>
          )}

          {/* Enterprise Analytics View */}
          {activeView === "analytics" && (
            <div className="fade-in">
              <Stats
                fileStats={fileStats}
                recentFiles={recentFiles}
                duplicateGroups={duplicateGroups}
                isEnterpriseMode={true}
              />
            </div>
          )}

          {/* Intelligent Search View */}
          {activeView === "search" && (
            <div className="space-y-6 fade-in">
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4 gradient-text">
                  🔍 البحث الفوري
                </h2>

                {/* Search Input */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="🔍 ابحث في ملفاتك... (دعم البحث بالذكاء الاصطناعي)"
                      className="w-full h-14 px-6 rounded-lg glass-card text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-lg"
                    />
                    {isSearching && (
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <div className="loading-spinner"></div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-8 py-3 primary-button rounded-lg font-semibold hover:scale-105 transition-transform text-lg"
                  >
                    بحث
                  </button>
                </div>

                {/* Search Filters */}
                <div className="flex gap-4 mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={searchFilters.useAI}
                      onChange={(e) =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          useAI: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <span>🤖 البحث بالذكاء الاصطناعي</span>
                  </label>

                  <select
                    value={searchFilters.category}
                    onChange={(e) =>
                      setSearchFilters((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2"
                  >
                    <option value="all">جميع التصنيفات</option>
                    <option value="Documents">مستندات</option>
                    <option value="Images">صور</option>
                    <option value="Videos">فيديوهات</option>
                    <option value="Audio">صوتيات</option>
                  </select>
                </div>

                {/* Search Results */}
                <div className="space-y-3">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      {searchQuery
                        ? "لم يتم العثور على نتائج"
                        : "أدخل كلمة للبحث"}
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">
                          🔍 النتائج ({searchResults.length})
                        </h3>
                        <div className="text-sm text-gray-400">
                          وجد في 0.23 ثانية • مرتب حسب الصلة
                        </div>
                      </div>
                      {searchResults.map((file, index) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-4 p-4 glass-button rounded-lg hover:scale-[1.01] transition-all duration-200 group border border-white/5 hover:border-blue-500/30"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="text-3xl transform group-hover:scale-110 transition-transform">
                            {getFileIcon(file.extension, file.mime_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-lg truncate group-hover:text-blue-400 transition-colors">
                              {file.name}
                            </div>
                            <div className="text-sm text-gray-400 truncate">
                              📁 {file.path}
                            </div>
                            <div className="flex gap-3 text-xs text-gray-500 mt-2">
                              <span className="bg-gray-500/20 px-2 py-1 rounded">
                                💾 {formatFileSize(file.size)}
                              </span>
                              <span className="bg-gray-500/20 px-2 py-1 rounded">
                                📅{" "}
                                {new Date(file.modified_at).toLocaleDateString(
                                  "ar",
                                )}
                              </span>
                              {file.category && (
                                <span className="bg-blue-500/20 px-2 py-1 rounded text-blue-300">
                                  🏷️ {file.category}
                                </span>
                              )}
                              {file.aiRelevanceScore && (
                                <span className="bg-purple-500/20 px-2 py-1 rounded text-purple-300">
                                  🤖 صلة{" "}
                                  {Math.round(file.aiRelevanceScore * 100)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/40 rounded text-sm transition-colors hover:scale-105">
                              📂 فتح
                            </button>
                            <button className="px-3 py-2 bg-green-500/20 hover:bg-green-500/40 rounded text-sm transition-colors hover:scale-105">
                              ⭐ مفضل
                            </button>
                            <button className="px-3 py-2 bg-red-500/20 hover:bg-red-500/40 rounded text-sm transition-colors hover:scale-105">
                              🗑️ حذف
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Load More Section */}
                      <div className="text-center pt-4 border-t border-white/10 mt-6">
                        <div className="text-sm text-gray-400 mb-3">
                          عرض 3 من 1,247 نتيجة • البحث في{" "}
                          {fileStats.totalFiles.toLocaleString()} ملف
                        </div>
                        <button className="glass-button px-6 py-3 rounded-lg hover:scale-105 transition-transform">
                          تحميل المزيد من النتائج...
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PowerOps View */}
          {activeView === "powerops" && (
            <div className="fade-in">
              <PowerOps
                fileStats={fileStats}
                onRefreshStats={async () => {
                  const stats = await window.electronAPI.getFileStats();
                  setFileStats(stats);
                }}
                duplicateGroups={duplicateGroups}
                onRunDuplicateAnalysis={handleRunDuplicateAnalysis}
                isDuplicateAnalysisRunning={isDuplicateAnalysisRunning}
              />
            </div>
          )}

          {/* Duplicates View */}
          {activeView === "duplicates" && (
            <div className="fade-in">
              <DuplicateManager
                duplicateGroups={duplicateGroups}
                onRunAnalysis={handleRunDuplicateAnalysis}
                isAnalysisRunning={isDuplicateAnalysisRunning}
                onRefreshStats={async () => {
                  const stats = await window.electronAPI.getFileStats();
                  setFileStats(stats);
                }}
              />
            </div>
          )}

          {/* Statistics View */}
          {activeView === "stats" && (
            <div className="fade-in">
              <Stats
                fileStats={fileStats}
                recentFiles={recentFiles}
                duplicateGroups={duplicateGroups}
              />
            </div>
          )}

          {/* Timeline View */}
          {activeView === "timeline" && (
            <div className="fade-in">
              <Timeline />
            </div>
          )}
        </div>
      </main>

      {/* Quick Stats Footer */}
      <footer className="relative z-10 glass-card border-t-2 border-white/10 p-3">
        <div className="flex justify-between items-center text-sm">
          <div className="flex gap-6">
            <span className="text-blue-400">
              📁 {fileStats.totalFiles?.toLocaleString() || 0} ملف
            </span>
            <span className="text-green-400">
              💾 {formatFileSize(fileStats.totalSize || 0)}
            </span>
            <span className="text-purple-400">
              🏷️ {fileStats.totalTypes || 0} نوع
            </span>
            <span className="text-orange-400">
              🤖 {fileStats.analyzedFiles || 0} محلل
            </span>
            <span className="text-red-400 hover:scale-105 transition-transform cursor-pointer">
              🔄 {duplicateGroups.length} مجموعة مكررة
            </span>
            <span className="text-cyan-400 hover:scale-105 transition-transform cursor-pointer">
              💾 توفير 1.2 جيجا
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            متصل ومحدث
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DesktopApp;
