import React, { useState, useEffect, useCallback, useMemo } from "react";

const DuplicateManager = ({ duplicateResults, onResolve, onCancel }) => {
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [resolutionMode, setResolutionMode] = useState("smart"); // smart, manual, batch
  const [previewGroup, setPreviewGroup] = useState(null);
  const [resolutionInProgress, setResolutionInProgress] = useState(false);
  const [resolutionProgress, setResolutionProgress] = useState(0);
  const [resolutionStats, setResolutionStats] = useState({
    spaceFreed: 0,
    filesRemoved: 0,
    filesKept: 0,
    errors: 0,
  });
  const [sortBy, setSortBy] = useState("wastedSpace"); // wastedSpace, confidence, fileCount
  const [filterBy, setFilterBy] = useState("all"); // all, high_confidence, large_files
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // إحصائيات مجموعة
  const groupStats = useMemo(() => {
    if (!duplicateResults?.groups) return null;

    return {
      totalGroups: duplicateResults.groups.length,
      totalWastedSpace: duplicateResults.summary.totalWastedSpace,
      totalDuplicates: duplicateResults.summary.totalDuplicates,
      potentialSavings: duplicateResults.summary.potentialSavings,
      averageConfidence:
        duplicateResults.groups.reduce(
          (sum, group) => sum + group.confidence,
          0,
        ) / duplicateResults.groups.length,
      highConfidenceGroups: duplicateResults.groups.filter(
        (group) => group.confidence > 0.9,
      ).length,
    };
  }, [duplicateResults]);

  // فلترة وترتيب المجموعات
  const filteredAndSortedGroups = useMemo(() => {
    if (!duplicateResults?.groups) return [];

    let filtered = duplicateResults.groups.filter((group) => {
      switch (filterBy) {
        case "high_confidence":
          return group.confidence > 0.9;
        case "large_files":
          return group.wastedSpace > 50 * 1024 * 1024; // أكبر من 50 ميجا
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "wastedSpace":
          return b.wastedSpace - a.wastedSpace;
        case "confidence":
          return b.confidence - a.confidence;
        case "fileCount":
          return b.files.length - a.files.length;
        default:
          return b.wastedSpace - a.wastedSpace;
      }
    });
  }, [duplicateResults, filterBy, sortBy]);

  // معالجة تحديد المجموعات
  const handleGroupSelect = (groupId, selected) => {
    setSelectedGroups((prev) =>
      selected ? [...prev, groupId] : prev.filter((id) => id !== groupId),
    );
  };

  // تحديد الكل
  const handleSelectAll = () => {
    if (selectedGroups.length === filteredAndSortedGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredAndSortedGroups.map((group) => group.id));
    }
  };

  // تطبيق حل ذكي
  const applySmartResolution = useCallback(async () => {
    setResolutionInProgress(true);
    setResolutionProgress(0);

    const groupsToResolve = filteredAndSortedGroups.filter((group) =>
      selectedGroups.includes(group.id),
    );

    let totalSpaceFreed = 0;
    let totalFilesRemoved = 0;
    let totalFilesKept = groupsToResolve.length;
    let errors = 0;

    try {
      for (let i = 0; i < groupsToResolve.length; i++) {
        const group = groupsToResolve[i];

        // اختيار أفضل استراتيجية حل
        const strategy = selectBestResolutionStrategy(group);

        try {
          // محاكاة تطبيق الحل
          await simulateResolution(group, strategy);

          // تحديث الإحصائيات
          if (strategy.type === "delete_duplicates") {
            totalSpaceFreed += group.wastedSpace;
            totalFilesRemoved += group.files.length - 1;
          }
        } catch (error) {
          console.error(`خطأ في حل مجموعة ${group.id}:`, error);
          errors++;
        }

        setResolutionProgress(((i + 1) / groupsToResolve.length) * 100);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setResolutionStats({
        spaceFreed: totalSpaceFreed,
        filesRemoved: totalFilesRemoved,
        filesKept: totalFilesKept,
        errors: errors,
      });

      // إشعار النجاح
      if (onResolve) {
        onResolve({
          resolvedGroups: groupsToResolve.length,
          spaceFreed: totalSpaceFreed,
          strategy: "smart",
        });
      }
    } finally {
      setResolutionInProgress(false);
      setResolutionProgress(0);
    }
  }, [selectedGroups, filteredAndSortedGroups, onResolve]);

  // اختيار أفضل استراتيجية حل
  const selectBestResolutionStrategy = (group) => {
    // تحليل خصائص المجموعة
    const files = group.files;
    const hasBackups = files.some(
      (file) =>
        file.path.toLowerCase().includes("backup") ||
        file.path.toLowerCase().includes("نسخة"),
    );

    const hasDownloads = files.some(
      (file) =>
        file.path.toLowerCase().includes("download") ||
        file.path.toLowerCase().includes("تحميل"),
    );

    // اختيار الاستراتيجية
    if (group.confidence > 0.95) {
      if (hasBackups) {
        return {
          type: "delete_backups",
          description: "حذف النسخ الاحتياطية المكررة",
          risk: "low",
        };
      } else if (hasDownloads) {
        return {
          type: "delete_downloads",
          description: "حذف النسخ من مجلد التحميل",
          risk: "low",
        };
      } else {
        return {
          type: "delete_oldest",
          description: "حذف النسخ الأقدم",
          risk: "medium",
        };
      }
    } else {
      return {
        type: "move_to_archive",
        description: "نقل إلى مجلد الأرشيف للمراجعة",
        risk: "very_low",
      };
    }
  };

  // محاكاة تطبيق الحل
  const simulateResolution = async (group, strategy) => {
    // محاكاة العملية
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 1000 + 500),
    );

    // تسجيل العملية
    console.log(`تم تطبيق ${strategy.type} على مجموعة ${group.id}`);

    return {
      success: true,
      strategy: strategy.type,
      filesAffected: group.files.length - 1,
      spaceFreed: strategy.type.includes("delete") ? group.wastedSpace : 0,
    };
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes) => {
    const sizes = ["بايت", "كيلو بايت", "ميجا بايت", "جيجا بايت"];
    if (bytes === 0) return "0 بايت";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // الحصول على أيقونة الملف
  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    const icons = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      jpg: "🖼️",
      jpeg: "🖼��",
      png: "🖼️",
      gif: "🖼️",
      mp4: "🎥",
      avi: "🎥",
      mov: "🎥",
      mp3: "🎵",
      wav: "🎵",
      zip: "📦",
      rar: "📦",
      txt: "📄",
      xlsx: "📊",
      xls: "📊",
    };
    return icons[ext] || "📁";
  };

  // رندر معاينة المجموعة
  const renderGroupPreview = (group) => (
    <div className="glass-card rounded-xl p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            🔗 {group.type}
            <span className="text-sm bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
              {group.files.length} ملفات
            </span>
          </h3>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>الثقة: {Math.round(group.confidence * 100)}%</span>
            <span>المساحة المهدرة: {formatFileSize(group.wastedSpace)}</span>
          </div>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-sm ${
            group.confidence > 0.9
              ? "bg-green-500/20 text-green-400"
              : group.confidence > 0.7
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-red-500/20 text-red-400"
          }`}
        >
          {group.confidence > 0.9
            ? "✅ موثوق"
            : group.confidence > 0.7
              ? "⚠️ متوسط"
              : "❌ ضعيف"}
        </div>
      </div>

      {/* ملفات المجموعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {group.files.map((file, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              index === 0
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-lg">{getFileIcon(file.name)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm truncate flex items-center gap-2">
                  {file.name}
                  {index === 0 && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-1 py-0.5 rounded">
                      الأصلي
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  📁 {file.path}
                </div>
                <div className="text-xs text-gray-400">
                  💾 {formatFileSize(file.size)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* اقتراحات الحل */}
      <div className="border-t border-gray-700 pt-4">
        <h4 className="font-medium text-white mb-3 text-sm">
          💡 اقتراحات الحل:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {group.recommendations?.map((rec, index) => (
            <div key={index} className="glass-button p-3 rounded-lg text-right">
              <div className="font-medium text-white text-sm mb-1">
                {rec.title}
              </div>
              <div className="text-xs text-gray-400 mb-2">
                {rec.description}
              </div>
              {rec.spaceFreed > 0 && (
                <div className="text-xs text-green-400">
                  💾 توفير: {formatFileSize(rec.spaceFreed)}
                </div>
              )}
            </div>
          )) || (
            <div className="text-xs text-gray-400">لا توجد اقتراحات متاحة</div>
          )}
        </div>
      </div>
    </div>
  );

  if (
    !duplicateResults ||
    !duplicateResults.groups ||
    duplicateResults.groups.length === 0
  ) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          لا توجد ملفات مكررة!
        </h2>
        <p className="text-gray-400">نظام الملفات لديك منظم بشكل مثالي</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* الإحصائيات العامة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400 mb-1">
            {groupStats.totalGroups}
          </div>
          <div className="text-sm text-gray-400">مجموعات مكررة</div>
        </div>

        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400 mb-1">
            {groupStats.totalDuplicates}
          </div>
          <div className="text-sm text-gray-400">ملفات مكررة</div>
        </div>

        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {formatFileSize(groupStats.totalWastedSpace)}
          </div>
          <div className="text-sm text-gray-400">مساحة مهدرة</div>
        </div>

        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {Math.round(groupStats.averageConfidence * 100)}%
          </div>
          <div className="text-sm text-gray-400">متوسط الثقة</div>
        </div>
      </div>

      {/* أدوات التحكم */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">
              🛠️ إدارة التكرارات
            </h2>
            <span className="text-sm text-gray-400">
              {selectedGroups.length} من {filteredAndSortedGroups.length} محدد
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="glass-button px-4 py-2 rounded-lg text-sm hover:bg-blue-500/20 transition-all"
            >
              {selectedGroups.length === filteredAndSortedGroups.length
                ? "❌ إلغاء الكل"
                : "✅ تحديد الكل"}
            </button>

            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="glass-button px-4 py-2 rounded-lg text-sm hover:bg-purple-500/20 transition-all"
            >
              ⚙️ خيارات متقدمة
            </button>
          </div>
        </div>

        {/* الخيارات المتقدمة */}
        {showAdvancedOptions && (
          <div className="border-t border-gray-700 pt-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  نمط الحل
                </label>
                <select
                  value={resolutionMode}
                  onChange={(e) => setResolutionMode(e.target.value)}
                  className="w-full glass-button p-2 rounded-lg text-sm"
                >
                  <option value="smart">حل ذكي تلقائي</option>
                  <option value="manual">مراجعة يدوية</option>
                  <option value="batch">معالجة دفعية</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ترتيب حسب
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full glass-button p-2 rounded-lg text-sm"
                >
                  <option value="wastedSpace">المساحة المهدرة</option>
                  <option value="confidence">مستوى الثقة</option>
                  <option value="fileCount">عدد الملفات</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  فلترة
                </label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full glass-button p-2 rounded-lg text-sm"
                >
                  <option value="all">جميع المجموعات</option>
                  <option value="high_confidence">ثقة عالية فقط</option>
                  <option value="large_files">ملفات كبيرة فقط</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* أزرار العمل */}
        <div className="flex gap-3">
          <button
            onClick={applySmartResolution}
            disabled={selectedGroups.length === 0 || resolutionInProgress}
            className="primary-button px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resolutionInProgress
              ? "⏳ جارٍ المعالجة..."
              : "�� تطبيق الحل الذكي"}
          </button>

          <button
            onClick={() => setPreviewGroup(selectedGroups[0])}
            disabled={selectedGroups.length !== 1}
            className="glass-button px-6 py-3 rounded-xl font-medium hover:bg-blue-500/20 transition-all disabled:opacity-50"
          >
            👁️ معاينة
          </button>

          <button
            onClick={onCancel}
            className="glass-button px-6 py-3 rounded-xl font-medium hover:bg-red-500/20 transition-all"
          >
            ❌ إلغاء
          </button>
        </div>

        {/* شريط التقدم */}
        {resolutionInProgress && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-400">
                جاري حل التكرارات...
              </span>
              <span className="text-sm text-gray-400">
                {Math.round(resolutionProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 relative"
                style={{ width: `${resolutionProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* نتائج المعالجة */}
        {resolutionStats.spaceFreed > 0 && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <h3 className="font-medium text-green-400 mb-2">
              ✅ تم الانتهاء من المعالجة
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">مساحة محررة:</span>
                <div className="font-medium text-white">
                  {formatFileSize(resolutionStats.spaceFreed)}
                </div>
              </div>
              <div>
                <span className="text-gray-400">ملفات محذوفة:</span>
                <div className="font-medium text-white">
                  {resolutionStats.filesRemoved}
                </div>
              </div>
              <div>
                <span className="text-gray-400">ملفات محفوظة:</span>
                <div className="font-medium text-white">
                  {resolutionStats.filesKept}
                </div>
              </div>
              <div>
                <span className="text-gray-400">أخطاء:</span>
                <div className="font-medium text-white">
                  {resolutionStats.errors}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* قائمة المجموعات */}
      <div className="space-y-4">
        {filteredAndSortedGroups.map((group, index) => (
          <div
            key={group.id}
            className={`glass-card rounded-xl p-6 transition-all duration-300 ${
              selectedGroups.includes(group.id)
                ? "ring-2 ring-blue-500/50 bg-blue-500/5"
                : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedGroups.includes(group.id)}
                onChange={(e) => handleGroupSelect(group.id, e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />

              {/* محتوى المجموعة */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      🔗 مجموعة {index + 1}: {group.type}
                      <span className="text-sm bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                        {group.files.length} ملفات
                      </span>
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>الثقة: {Math.round(group.confidence * 100)}%</span>
                      <span>
                        المساحة المهدرة: {formatFileSize(group.wastedSpace)}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-sm ${
                      group.confidence > 0.9
                        ? "bg-green-500/20 text-green-400"
                        : group.confidence > 0.7
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {group.confidence > 0.9
                      ? "✅ موثوق"
                      : group.confidence > 0.7
                        ? "⚠️ متوسط"
                        : "❌ ضعيف"}
                  </div>
                </div>

                {/* ملفات مضغوطة */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {group.files.slice(0, 4).map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className={`p-2 rounded border text-xs ${
                        fileIndex === 0
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-red-500/10 border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-sm">
                          {getFileIcon(file.name)}
                        </span>
                        <span className="truncate font-medium text-white">
                          {file.name}
                          {fileIndex === 0 && " (أصلي)"}
                        </span>
                      </div>
                      <div className="text-gray-400 truncate">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  ))}
                  {group.files.length > 4 && (
                    <div className="p-2 rounded border border-gray-600 bg-gray-800/50 text-xs flex items-center justify-center">
                      +{group.files.length - 4} أخرى
                    </div>
                  )}
                </div>

                {/* أزرار العمل السريع */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewGroup(group)}
                    className="glass-button px-3 py-1 rounded text-xs hover:bg-blue-500/20 transition-colors"
                  >
                    👁️ معاينة
                  </button>

                  {group.recommendations &&
                    group.recommendations.length > 0 && (
                      <button className="glass-button px-3 py-1 rounded text-xs hover:bg-green-500/20 transition-colors">
                        💡 حل سريع: {group.recommendations[0].title}
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* نافذة المعاينة */}
      {previewGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                معاينة المجموعة
              </h2>
              <button
                onClick={() => setPreviewGroup(null)}
                className="glass-button p-2 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                ❌
              </button>
            </div>
            <div className="p-6">{renderGroupPreview(previewGroup)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuplicateManager;
