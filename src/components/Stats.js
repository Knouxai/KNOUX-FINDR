import React, { useState, useEffect, useRef } from "react";

const Stats = () => {
  const [stats, setStats] = useState({});
  const [timeRange, setTimeRange] = useState("month");
  const [chartType, setChartType] = useState("fileTypes");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("size");
  const chartRef = useRef(null);

  // تحميل الإحصائيات
  useEffect(() => {
    loadStats();
  }, [timeRange, chartType]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      if (window.electronAPI) {
        // تحميل إحصائيات حقيقية من Electron backend
        const realStats = await window.electronAPI.getFileStatistics({
          timeRange,
          includeCategorization: true,
          includeEncryption: true,
          includeDuplicates: true,
        });
        setStats(realStats);
      } else {
        // تحميل إحصائيات من web backend
        const response = await fetch("/api/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeRange, chartType }),
          credentials: "include",
        });

        if (response.ok) {
          const realStats = await response.json();
          setStats(realStats);
        } else {
          // Fallback للبيانات الوهمية
          const mockStats = generateMockStats(timeRange);
          setStats(mockStats);
        }
      }
    } catch (error) {
      console.error("خطأ في تحميل الإحصائيات:", error);
      // Fallback للبيانات الوهمية في حالة الخطأ
      const mockStats = generateMockStats(timeRange);
      setStats(mockStats);
    } finally {
      setIsLoading(false);
    }
  };

  // توليد إحصائيات وهمية
  const generateMockStats = (range) => {
    const fileTypes = [
      {
        name: "PDF",
        count: 245,
        size: 1200000000,
        color: "#ef4444",
        icon: "📄",
      },
      {
        name: "Word",
        count: 189,
        size: 800000000,
        color: "#3b82f6",
        icon: "📝",
      },
      {
        name: "Images",
        count: 567,
        size: 2100000000,
        color: "#10b981",
        icon: "🖼️",
      },
      {
        name: "Videos",
        count: 78,
        size: 5600000000,
        color: "#f59e0b",
        icon: "🎥",
      },
      {
        name: "Audio",
        count: 156,
        size: 900000000,
        color: "#8b5cf6",
        icon: "🎵",
      },
      {
        name: "Code",
        count: 234,
        size: 150000000,
        color: "#06b6d4",
        icon: "💻",
      },
      {
        name: "Archives",
        count: 89,
        size: 1800000000,
        color: "#ec4899",
        icon: "📦",
      },
      {
        name: "Other",
        count: 123,
        size: 400000000,
        color: "#6b7280",
        icon: "📁",
      },
    ];

    const categories = [
      { name: "Documents", count: 678, size: 2800000000, growth: 12 },
      { name: "Media", count: 801, size: 8600000000, growth: -3 },
      { name: "Development", count: 456, size: 450000000, growth: 25 },
      { name: "Archives", count: 234, size: 2200000000, growth: 8 },
      { name: "System", count: 123, size: 300000000, growth: -5 },
    ];

    const dailyActivity = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      filesCreated: Math.floor(Math.random() * 20) + 5,
      filesModified: Math.floor(Math.random() * 35) + 10,
      filesAccessed: Math.floor(Math.random() * 80) + 20,
      storageUsed: Math.random() * 1000000000 + 500000000,
    }));

    const topFiles = [
      {
        name: "مشروع_العرض_النهائي.pptx",
        accessCount: 87,
        lastAccess: "منذ ساعتين",
        size: 25000000,
      },
      {
        name: "تقرير_المبيعات_Q4.xlsx",
        accessCount: 65,
        lastAccess: "منذ يوم",
        size: 12000000,
      },
      {
        name: "دليل_المستخدم.pdf",
        accessCount: 54,
        lastAccess: "منذ 3 أيام",
        size: 8500000,
      },
      {
        name: "قاعدة_البيانات.db",
        accessCount: 43,
        lastAccess: "منذ ساعة",
        size: 156000000,
      },
      {
        name: "صور_المؤتمر",
        accessCount: 38,
        lastAccess: "منذ أسبوع",
        size: 450000000,
      },
    ];

    const duplicates = [
      { name: "CV_النسخة_النهائية", count: 5, totalSize: 25000000 },
      { name: "عرض_الشركة", count: 8, totalSize: 120000000 },
      { name: "لقطة_الشاشة", count: 23, totalSize: 45000000 },
      { name: "ملف_جديد", count: 12, totalSize: 2400000 },
      { name: "نسخة_احتياطية", count: 6, totalSize: 890000000 },
    ];

    return {
      fileTypes,
      categories,
      dailyActivity,
      topFiles,
      duplicates,
      totalFiles: fileTypes.reduce((sum, type) => sum + type.count, 0),
      totalSize: fileTypes.reduce((sum, type) => sum + type.size, 0),
      averageFileSize:
        fileTypes.reduce((sum, type) => sum + type.size, 0) /
        fileTypes.reduce((sum, type) => sum + type.count, 0),
      duplicateCount: duplicates.reduce((sum, dup) => sum + dup.count, 0),
      duplicateSize: duplicates.reduce((sum, dup) => sum + dup.totalSize, 0),
    };
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes) => {
    const sizes = ["بايت", "كيلو بايت", "ميجا بايت", "جيجا بايت", "تيرا بايت"];
    if (bytes === 0) return "0 بايت";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // تنسيق الأرقام
  const formatNumber = (num) => {
    return new Intl.NumberFormat("ar-SA").format(num);
  };

  // رسم المخطط البياني
  const renderChart = () => {
    if (!stats.fileTypes) return null;

    const data = chartType === "fileTypes" ? stats.fileTypes : stats.categories;
    const total = data.reduce(
      (sum, item) => sum + (selectedMetric === "size" ? item.size : item.count),
      0,
    );

    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const value = selectedMetric === "size" ? item.size : item.count;
          const percentage = (value / total) * 100;

          return (
            <div key={index} className="flex items-center gap-4">
              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">
                    {selectedMetric === "size"
                      ? formatFileSize(value)
                      : formatNumber(value)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color || "#3b82f6",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // رسم النشاط اليومي
  const renderActivityChart = () => {
    if (!stats.dailyActivity) return null;

    const maxValue = Math.max(
      ...stats.dailyActivity.map((day) =>
        Math.max(day.filesCreated, day.filesModified, day.filesAccessed),
      ),
    );

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
          <span>النشاط اليومي</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>إنشاء</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>تعديل</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>وصول</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-15 gap-1 h-32">
          {stats.dailyActivity.slice(-15).map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="flex-1 flex flex-col justify-end gap-px">
                <div
                  className="bg-green-500 w-full rounded-sm min-h-[2px]"
                  style={{ height: `${(day.filesCreated / maxValue) * 100}%` }}
                  title={`${day.filesCreated} ملف جديد`}
                ></div>
                <div
                  className="bg-blue-500 w-full rounded-sm min-h-[2px]"
                  style={{ height: `${(day.filesModified / maxValue) * 100}%` }}
                  title={`${day.filesModified} ملف معدل`}
                ></div>
                <div
                  className="bg-yellow-500 w-full rounded-sm min-h-[2px]"
                  style={{ height: `${(day.filesAccessed / maxValue) * 100}%` }}
                  title={`${day.filesAccessed} ملف مفتوح`}
                ></div>
              </div>
              <div className="text-[8px] text-gray-500 text-center">
                {day.date.getDate()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta text-white p-6"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* العنوان والتحكم */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                📊 إحصائيات الملفات
              </h1>
              <p className="text-gray-400">
                تحليل شامل لاستخدام ملفاتك وأنماط العمل
              </p>
            </div>

            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="glass-button px-4 py-2 rounded-lg text-sm"
              >
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
                <option value="quarter">هذ�� الربع</option>
                <option value="year">هذا العام</option>
              </select>

              <button
                onClick={loadStats}
                className="primary-button px-4 py-2 rounded-lg text-sm"
              >
                🔄 تحديث
              </button>
            </div>
          </div>
        </div>

        {/* البطاقات الإحصائية الرئيسية */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">📁</div>
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {formatNumber(stats.totalFiles || 0)}
            </div>
            <div className="text-sm text-gray-400">إجمالي الملفات</div>
            <div className="text-xs text-green-400 mt-1">+12% هذا الشهر</div>
          </div>

          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">💾</div>
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {formatFileSize(stats.totalSize || 0)}
            </div>
            <div className="text-sm text-gray-400">إجمالي التخزين</div>
            <div className="text-xs text-orange-400 mt-1">78% من السعة</div>
          </div>

          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {formatFileSize(stats.averageFileSize || 0)}
            </div>
            <div className="text-sm text-gray-400">متوسط حجم الملف</div>
            <div className="text-xs text-blue-400 mt-1">-5% من المتوسط</div>
          </div>

          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">🔄</div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {formatNumber(stats.duplicateCount || 0)}
            </div>
            <div className="text-sm text-gray-400">ملفات مكررة</div>
            <div className="text-xs text-red-400 mt-1">
              {formatFileSize(stats.duplicateSize || 0)} مهدرة
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* توزيع أنواع الملفات */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">📂 توزيع الملفات</h3>
              <div className="flex gap-2">
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="glass-button px-3 py-1 rounded text-sm"
                >
                  <option value="fileTypes">حسب النوع</option>
                  <option value="categories">حسب التصنيف</option>
                </select>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="glass-button px-3 py-1 rounded text-sm"
                >
                  <option value="count">العدد</option>
                  <option value="size">الحجم</option>
                </select>
              </div>
            </div>
            {renderChart()}
          </div>

          {/* النشاط اليومي */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6">📈 النشاط اليومي</h3>
            {renderActivityChart()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* أكثر الملفات استخداماً */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6">
              🔥 أكثر الملفات استخداماً
            </h3>
            <div className="space-y-4">
              {stats.topFiles?.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 glass-button rounded-lg"
                >
                  <div className="text-2xl">📄</div>
                  <div className="flex-1">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-sm text-gray-400">
                      {file.accessCount} مرة فتح • {file.lastAccess}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* الملفات المكررة */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6">🔄 الملفات المكررة</h3>
            <div className="space-y-4">
              {stats.duplicates?.map((duplicate, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 glass-button rounded-lg"
                >
                  <div className="text-2xl">⚠️</div>
                  <div className="flex-1">
                    <div className="font-medium">{duplicate.name}</div>
                    <div className="text-sm text-gray-400">
                      {duplicate.count} نسخة مكررة
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-400">
                      {formatFileSize(duplicate.totalSize)}
                    </div>
                    <button className="text-xs text-blue-400 hover:text-blue-300">
                      تنظيف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* نصائح التحسين */}
        <div className="glass-card rounded-xl p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">💡 نصائح التحسين</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-button p-4 rounded-lg">
              <div className="text-2xl mb-2">🧹</div>
              <div className="font-medium mb-1">تنظيف الملفات المكررة</div>
              <div className="text-sm text-gray-400">
                يمكن ت��فير {formatFileSize(stats.duplicateSize || 0)} من
                المساحة
              </div>
            </div>

            <div className="glass-button p-4 rounded-lg">
              <div className="text-2xl mb-2">📦</div>
              <div className="font-medium mb-1">ضغط الملفات الكبيرة</div>
              <div className="text-sm text-gray-400">
                ضغط ملفات الوسائط يمكن أن يوفر مساحة كبيرة
              </div>
            </div>

            <div className="glass-button p-4 rounded-lg">
              <div className="text-2xl mb-2">🗂️</div>
              <div className="font-medium mb-1">تنظيم المجلدات</div>
              <div className="text-sm text-gray-400">
                إعادة تنظيم الملفات حسب الاستخدام والتاريخ
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
