import React, { useState, useEffect, useRef, useCallback } from "react";

const InstantSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStats, setSearchStats] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    category: "all",
    type: "all",
    sizeMin: "",
    sizeMax: "",
    dateFrom: "",
    dateTo: "",
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedResult, setSelectedResult] = useState(-1);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // البحث الفوري مع debouncing
  const performSearch = useCallback(
    async (query, filters = {}) => {
      if (!window.electronAPI || !query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const startTime = Date.now();

        // استخدام البحث المتقدم مع الفلاتر
        const results = await window.electronAPI.advancedSearch(query, {
          ...selectedFilters,
          ...filters,
          limit: 100,
        });

        const searchTime = Date.now() - startTime;

        setSearchResults(results);
        setSearchStats({
          resultCount: results.length,
          searchTime: searchTime,
          query: query,
        });

        // إضافة إلى تاريخ البحث
        if (query.trim() && !searchHistory.includes(query.trim())) {
          setSearchHistory((prev) => [query.trim(), ...prev.slice(0, 9)]);
        }
      } catch (error) {
        console.error("خطأ في البحث:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [selectedFilters, searchHistory],
  );

  // تنفيذ البحث مع تأخير
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300); // 300ms delay
    } else {
      setSearchResults([]);
      setSearchStats({});
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // الحصول على اقتراحات البحث
  useEffect(() => {
    if (searchQuery.length > 2) {
      // اقتراحات بناءً على تاريخ البحث
      const querySuggestions = searchHistory
        .filter(
          (item) =>
            item.toLowerCase().includes(searchQuery.toLowerCase()) &&
            item !== searchQuery,
        )
        .slice(0, 5);

      setSuggestions(querySuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, searchHistory]);

  // معالجة تغيير المرشحات
  const handleFilterChange = (filterName, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // تطبيق المرشحات
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery, selectedFilters);
    }
  }, [selectedFilters, performSearch, searchQuery]);

  // معالجة الكيبورد navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedResult((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedResult((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedResult >= 0) {
      e.preventDefault();
      handleOpenFile(searchResults[selectedResult]);
    } else if (e.key === "Escape") {
      setSearchQuery("");
      setSelectedResult(-1);
    }
  };

  // فتح الملف
  const handleOpenFile = async (file) => {
    if (window.electronAPI) {
      await window.electronAPI.openFileLocation(file.path);
    }
  };

  // حذف الملف
  const handleDeleteFile = async (file) => {
    if (window.confirm(`هل أنت متأكد من حذف "${file.name}"؟`)) {
      const success = await window.electronAPI.deleteFile(file.path);
      if (success) {
        setSearchResults((prev) => prev.filter((f) => f.id !== file.id));
        alert("تم حذف الملف بنجاح");
      } else {
        alert("فشل في حذف الملف");
      }
    }
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // تنسيق التاريخ
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // الحصول على أيقونة الملف
  const getFileIcon = (type, mimeType) => {
    if (mimeType?.startsWith("image/")) return "🖼️";
    if (mimeType?.startsWith("video/")) return "🎥";
    if (mimeType?.startsWith("audio/")) return "🎵";

    switch (type?.toLowerCase()) {
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
      default:
        return "📄";
    }
  };

  // تمييز النص المطابق
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    return text.replace(regex, "<mark>$1</mark>");
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta text-white p-6"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* عنوان رئيسي */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            🔍 KNOUX FINDR
          </h1>
          <p className="text-gray-400 text-lg">
            البحث الفوري المدعوم بـ FTS5 - ابحث في جميع ملفاتك لحظياً
          </p>
        </div>

        {/* شريط البحث الرئيسي */}
        <div className="glass-card rounded-2xl p-6 mb-6 relative">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="🔍 ابحث في ملفاتك... (PDF, DOCX, TXT وأكثر)"
              className="w-full h-16 px-6 pr-16 rounded-xl glass-card text-white placeholder-gray-400 text-lg focus:outline-none focus:border-blue-500 transition-all duration-300"
              autoFocus
            />

            {/* أيقونة البحث أو التحميل */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <div className="loading-spinner"></div>
              ) : (
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* اقتراحات البحث */}
          {suggestions.length > 0 && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-lg border border-white/20 z-50 max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm"
                  onClick={() => setSearchQuery(suggestion)}
                >
                  🔍 {suggestion}
                </div>
              ))}
            </div>
          )}

          {/* إحصائيات البحث */}
          {searchStats.resultCount !== undefined && (
            <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
              <div>
                وُجد{" "}
                <span className="text-blue-400 font-semibold">
                  {searchStats.resultCount}
                </span>{" "}
                ملف
                {searchStats.searchTime && (
                  <span>
                    {" "}
                    في{" "}
                    <span className="text-green-400">
                      {searchStats.searchTime}ms
                    </span>
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="glass-button px-3 py-1 rounded-lg text-xs hover:bg-white/10 transition-colors"
              >
                {showAdvancedFilters ? "🔽" : "🔼"} فلاتر متقدمة
              </button>
            </div>
          )}
        </div>

        {/* الفلاتر المتقدمة */}
        {showAdvancedFilters && (
          <div className="glass-card rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">التصنيف</label>
              <select
                value={selectedFilters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">جميع التصنيفات</option>
                <option value="Documents">مستندات</option>
                <option value="Images">صور</option>
                <option value="Videos">فيديوهات</option>
                <option value="Audio">صوتيات</option>
                <option value="Development">برمجة</option>
                <option value="Archives">أرشيف</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                نوع الملف
              </label>
              <select
                value={selectedFilters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">جميع الأنواع</option>
                <option value="pdf">PDF</option>
                <option value="docx">Word</option>
                <option value="txt">نص</option>
                <option value="jpg">صو�� JPG</option>
                <option value="mp4">فيديو MP4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                حجم أدنى (MB)
              </label>
              <input
                type="number"
                value={selectedFilters.sizeMin}
                onChange={(e) =>
                  handleFilterChange(
                    "sizeMin",
                    e.target.value
                      ? parseInt(e.target.value) * 1024 * 1024
                      : "",
                  )
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                حجم أقصى (MB)
              </label>
              <input
                type="number"
                value={selectedFilters.sizeMax}
                onChange={(e) =>
                  handleFilterChange(
                    "sizeMax",
                    e.target.value
                      ? parseInt(e.target.value) * 1024 * 1024
                      : "",
                  )
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">من تاريخ</label>
              <input
                type="date"
                value={selectedFilters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={selectedFilters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* النتائج */}
        <div className="glass-card rounded-xl p-6">
          {searchResults.length === 0 && searchQuery ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <div className="text-xl text-gray-400 mb-2">
                لم يتم العثور على نتائج
              </div>
              <div className="text-sm text-gray-500">
                جرب مصطلحات بحث مختلفة أو قم بتعديل الفلاتر
              </div>
            </div>
          ) : searchResults.length === 0 && !searchQuery ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <div className="text-xl text-gray-400 mb-2">ابدأ البحث</div>
              <div className="text-sm text-gray-500">
                اكتب في شريط البحث للعثور على ملفاتك
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((file, index) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-white/5 ${
                    selectedResult === index
                      ? "bg-blue-500/20 border border-blue-500/40"
                      : "glass-button"
                  }`}
                >
                  {/* أيقونة الملف */}
                  <div className="text-3xl">
                    {getFileIcon(file.type, file.mimeType)}
                  </div>

                  {/* معلومات الملف */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-semibold text-lg truncate hover:text-blue-400 transition-colors cursor-pointer"
                      onClick={() => handleOpenFile(file)}
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(file.name, searchQuery),
                      }}
                    />

                    <div className="text-sm text-gray-400 truncate mt-1">
                      📁 {file.directory}
                    </div>

                    <div className="flex gap-4 text-xs text-gray-500 mt-2">
                      <span>💾 {formatFileSize(file.size)}</span>
                      <span>📅 {formatDate(file.modified)}</span>
                      <span>🏷️ {file.category}</span>
                      {file.relevanceScore > 0 && (
                        <span className="text-blue-400">
                          🎯 {Math.round(file.relevanceScore * 100)}%
                        </span>
                      )}
                      {file.contentLength && (
                        <span className="text-green-400">
                          📄 {file.contentLength} حرف
                        </span>
                      )}
                    </div>
                  </div>

                  {/* أزرار العمليات */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenFile(file)}
                      className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/40 rounded text-xs transition-colors"
                      title="فتح موقع الملف"
                    >
                      📂 فتح
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file)}
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

        {/* تاريخ البحث */}
        {searchHistory.length > 0 && !searchQuery && (
          <div className="glass-card rounded-xl p-4 mt-6">
            <h3 className="text-lg font-semibold mb-3">📋 عمليات بحث سابقة</h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1 glass-button rounded-full text-sm hover:bg-white/10 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstantSearch;
