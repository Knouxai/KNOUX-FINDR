import React, { useState, useEffect } from "react";

const DesktopApp = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [fileStats, setFileStats] = useState({});
  const [recentFiles, setRecentFiles] = useState([]);
  const [indexingStatus, setIndexingStatus] = useState(null);
  const [indexingProgress, setIndexingProgress] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchFilters, setSearchFilters] = useState({
    useAI: true,
    category: "all",
    dateFrom: "",
    dateTo: "",
    fileType: "all",
  });
  const [duplicateFiles, setDuplicateFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("search");

  useEffect(() => {
    // Check if running in Electron
    if (window.electronAPI) {
      setIsElectron(true);
      initializeApp();
    }
  }, []);

  const initializeApp = async () => {
    try {
      // Get initial file statistics
      const stats = await window.electronAPI.getFileStats();
      setFileStats(stats);

      // Get recent files
      const recent = await window.electronAPI.getRecentFiles(10);
      setRecentFiles(recent);

      // Setup event listeners
      window.electronAPI.onIndexingStatus((status) => {
        setIndexingStatus(status);
      });

      window.electronAPI.onIndexingProgress((progress) => {
        setIndexingProgress(progress);
      });

      window.electronAPI.onAIAnalyzeContent(() => {
        handleAIAnalyzeContent();
      });

      window.electronAPI.onAIAutoCategorize(() => {
        handleAIAutoCategorize();
      });

      window.electronAPI.onAISmartSuggestions(() => {
        handleGetSmartSuggestions();
      });
    } catch (error) {
      console.error("تهيئة التطبيق فشلت:", error);
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

      // Get AI suggestions based on search
      if (searchFilters.useAI) {
        const suggestions = await window.electronAPI.getFileSuggestions({
          currentQuery: searchQuery,
          recentSearches: [searchQuery],
          fileCategories: fileStats.categories,
        });
        setAiSuggestions(suggestions);
      }
    } catch (error) {
      console.error("خطأ في البحث:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAIAnalyzeContent = async () => {
    try {
      const categorizedCount = await window.electronAPI.categorizeFiles();
      alert(`تم تصنيف ${categorizedCount} ملف بواسطة الذكاء الاصطناعي`);

      // Refresh file stats
      const stats = await window.electronAPI.getFileStats();
      setFileStats(stats);
    } catch (error) {
      console.error("خطأ في التحليل التلقائي:", error);
    }
  };

  const handleAIAutoCategorize = async () => {
    await handleAIAnalyzeContent();
  };

  const handleGetSmartSuggestions = async () => {
    try {
      const suggestions = await window.electronAPI.getFileSuggestions({
        recentSearches: [searchQuery],
        fileCategories: fileStats.categories,
      });
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("خطأ في الاقتراحات الذكية:", error);
    }
  };

  const handleOpenFileLocation = async (filePath) => {
    try {
      await window.electronAPI.openFileLocation(filePath);
    } catch (error) {
      console.error("خطأ في فتح موقع الملف:", error);
    }
  };

  const handleDeleteFile = async (filePath) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الملف؟")) {
      try {
        const success = await window.electronAPI.deleteFile(filePath);
        if (success) {
          setSearchResults((prev) =>
            prev.filter((file) => file.path !== filePath),
          );
          alert("تم حذف الملف بنجاح");
        } else {
          alert("فشل في حذف الملف");
        }
      } catch (error) {
        console.error("خطأ في حذف الملف:", error);
      }
    }
  };

  const handleFindDuplicates = async () => {
    try {
      const duplicates = await window.electronAPI.getDuplicateFiles();
      setDuplicateFiles(duplicates);
      setActiveTab("duplicates");
    } catch (error) {
      console.error("خطأ في البحث عن الملفات المكررة:", error);
    }
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

  if (!isElectron) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold mb-4">KNOUX FINDR Desktop</h1>
          <p className="text-gray-400">
            يرجى تشغيل التطبيق من Electron للوصول للميزات الكاملة
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta text-white"
      dir="rtl"
    >
      {/* Header */}
      <header className="glass-card border-b-2 border-white/10 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold gradient-text">KNOUX FINDR</div>
            <div className="text-xs bg-blue-500/20 px-2 py-1 rounded-full">
              🤖 AI Powered Desktop
            </div>
            {indexingStatus && (
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  indexingStatus.status === "started"
                    ? "bg-orange-500/20"
                    : indexingStatus.status === "completed"
                      ? "bg-green-500/20"
                      : "bg-red-500/20"
                }`}
              >
                {indexingStatus.message}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              className="glass-button px-3 py-1 rounded-lg text-xs"
              onClick={handleFindDuplicates}
            >
              🔍 البحث عن المكررات
            </button>
            <button
              className="glass-button px-3 py-1 rounded-lg text-xs"
              onClick={handleAIAnalyzeContent}
            >
              🤖 تحليل ذكي
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {indexingProgress && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>{indexingProgress.status}</span>
              <span>{indexingProgress.progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${indexingProgress.progress || 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </header>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <aside className="w-80 p-4 space-y-4 overflow-y-auto">
          {/* Search Filters */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">🔧 فلاتر البحث</h3>

            <div className="space-y-3">
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
                <span className="text-sm">🤖 البحث بالذكاء الاصطناعي</span>
              </label>

              <div>
                <label className="text-sm block mb-1">التصنيف:</label>
                <select
                  value={searchFilters.category}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm"
                >
                  <option value="all">جميع التصنيفات</option>
                  <option value="Documents">مستندات</option>
                  <option value="Images">صور</option>
                  <option value="Videos">فيديوهات</option>
                  <option value="Audio">صوتيات</option>
                  <option value="Work">عمل</option>
                  <option value="Personal">شخصي</option>
                </select>
              </div>

              <div>
                <label className="text-sm block mb-1">نوع الملف:</label>
                <select
                  value={searchFilters.fileType}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      fileType: e.target.value,
                    }))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value=".pdf">PDF</option>
                  <option value=".doc">Word</option>
                  <option value=".jpg">صور</option>
                  <option value=".mp4">فيديو</option>
                  <option value=".mp3">صوت</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Statistics */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">📊 إحصائيات ��لملفات</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>إجمالي الملفات:</span>
                <span className="text-blue-400">
                  {fileStats.totalFiles?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>الحجم الكلي:</span>
                <span className="text-green-400">
                  {formatFileSize(fileStats.totalSize || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>أنواع الملفات:</span>
                <span className="text-purple-400">
                  {fileStats.totalTypes || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>محلل بالـ AI:</span>
                <span className="text-orange-400">
                  {fileStats.analyzedFiles || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Files */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">📋 ملفات حديثة</h3>
            <div className="space-y-2">
              {recentFiles.slice(0, 5).map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 hover:bg-white/5 rounded cursor-pointer text-xs"
                  onClick={() => handleOpenFileLocation(file.path)}
                >
                  <span className="text-lg">
                    {getFileIcon(file.extension, file.mime_type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{file.name}</div>
                    <div className="text-gray-400 text-xs">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="glass-card rounded-xl p-4">
              <h3 className="text-lg font-bold mb-3">🤖 اقتراحات ذكية</h3>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index}>
                    <div className="text-sm font-semibold text-blue-400 mb-1">
                      {suggestion.title}
                    </div>
                    {suggestion.items.slice(0, 3).map((item, itemIndex) => (
                      <button
                        key={itemIndex}
                        className="block w-full text-left text-xs p-1 hover:bg-white/5 rounded"
                        onClick={() => setSearchQuery(item.text)}
                      >
                        {item.text}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          {/* Search Bar */}
          <div className="glass-card rounded-xl p-4 mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="🔍 ابحث في ملفاتك... (دعم البحث بالذكاء الاصطناعي)"
                  className="w-full h-12 px-4 rounded-lg glass-card text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                {isSearching && (
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-2 primary-button rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                بحث
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === "search" ? "primary-button" : "glass-button"
              }`}
              onClick={() => setActiveTab("search")}
            >
              🔍 نتائج البحث ({searchResults.length})
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === "duplicates" ? "primary-button" : "glass-button"
              }`}
              onClick={() => setActiveTab("duplicates")}
            >
              🔄 الملفات المكررة ({duplicateFiles.length})
            </button>
          </div>

          {/* Search Results */}
          {activeTab === "search" && (
            <div className="glass-card rounded-xl p-4">
              <h2 className="text-xl font-bold mb-4">
                📁 نتائج البحث{" "}
                {searchResults.length > 0 && `(${searchResults.length})`}
              </h2>

              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {searchQuery ? "لم يتم العثور على نتائج" : "أدخل كلمة للبحث"}
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 glass-button rounded-lg hover:scale-[1.02] transition-transform group"
                    >
                      <div className="text-2xl">
                        {getFileIcon(file.extension, file.mime_type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate group-hover:text-blue-400 transition-colors">
                          {file.name}
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                          📁 {file.path}
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                          <span>💾 {formatFileSize(file.size)}</span>
                          <span>
                            📅{" "}
                            {new Date(file.modified_at).toLocaleDateString(
                              "ar",
                            )}
                          </span>
                          {file.category && <span>🏷️ {file.category}</span>}
                          {file.aiRelevanceScore && (
                            <span className="text-blue-400">
                              🤖 {Math.round(file.aiRelevanceScore * 100)}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenFileLocation(file.path)}
                          className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/40 rounded text-xs transition-colors"
                          title="فتح موقع الملف"
                        >
                          📂 فتح
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.path)}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 rounded text-xs transition-colors"
                          title="حذف الملف"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Duplicate Files */}
          {activeTab === "duplicates" && (
            <div className="glass-card rounded-xl p-4">
              <h2 className="text-xl font-bold mb-4">
                🔄 الملفات المكررة{" "}
                {duplicateFiles.length > 0 &&
                  `(${duplicateFiles.length} مجموعة)`}
              </h2>

              {duplicateFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  لا توجد ملفات مكررة
                </div>
              ) : (
                <div className="space-y-4">
                  {duplicateFiles.map((group, groupIndex) => (
                    <div
                      key={groupIndex}
                      className="glass-button rounded-lg p-4"
                    >
                      <div className="font-semibold mb-2 text-orange-400">
                        📋 مجموعة {groupIndex + 1} - {group.count} ملفات مكررة
                      </div>
                      <div className="space-y-2">
                        {group.files.map((file, fileIndex) => (
                          <div
                            key={fileIndex}
                            className="flex justify-between items-center p-2 bg-white/5 rounded"
                          >
                            <div className="flex-1 truncate">
                              📄 {file.path}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatFileSize(file.size)}
                            </div>
                            <button
                              onClick={() => handleDeleteFile(file.path)}
                              className="mr-2 px-2 py-1 bg-red-500/20 hover:bg-red-500/40 rounded text-xs"
                            >
                              حذف
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DesktopApp;
