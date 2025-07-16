import React, { useState, useEffect, useRef } from "react";

const Timeline = () => {
  const [timelineData, setTimelineData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [viewMode, setViewMode] = useState("day");
  const [groupBy, setGroupBy] = useState("time");
  const [isLoading, setIsLoading] = useState(false);
  const timelineRef = useRef(null);

  // تحميل بيانات الخط الزمني
  useEffect(() => {
    loadTimelineData();
  }, [selectedPeriod, groupBy]);

  const loadTimelineData = async () => {
    setIsLoading(true);
    try {
      if (window.electronAPI) {
        // تحميل أحداث حقيقية من Electron backend
        const realEvents = await window.electronAPI.getTimelineEvents({
          period: selectedPeriod,
          groupBy: groupBy,
          includeFileOperations: true,
          includeSystemEvents: true,
          includeUserActions: true,
        });
        setTimelineData(realEvents);
      } else {
        // تحميل أحداث من web backend
        const response = await fetch("/api/timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            period: selectedPeriod,
            groupBy: groupBy,
            viewMode: viewMode,
          }),
          credentials: "include",
        });

        if (response.ok) {
          const realEvents = await response.json();
          setTimelineData(realEvents);
        } else {
          // Fallback للبيانات الوهمية
          const mockData = generateTimelineData(selectedPeriod);
          setTimelineData(mockData);
        }
      }
    } catch (error) {
      console.error("خطأ في تحميل بيانات الخط الزمني:", error);
      // Fallback للبيانات الوهمية في حالة الخطأ
      const mockData = generateTimelineData(selectedPeriod);
      setTimelineData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  // توليد بيانات وهمية للخط الزمني
  const generateTimelineData = (period) => {
    const data = [];
    const now = new Date();

    const periods = {
      today: 1,
      week: 7,
      month: 30,
      year: 365,
    };

    const daysBack = periods[period] || 7;

    for (let i = 0; i < daysBack; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // عدد عشوائي من الملفات لكل يوم
      const fileCount = Math.floor(Math.random() * 15) + 1;

      for (let j = 0; j < fileCount; j++) {
        const fileDate = new Date(date);
        fileDate.setHours(Math.floor(Math.random() * 24));
        fileDate.setMinutes(Math.floor(Math.random() * 60));

        const fileTypes = ["pdf", "docx", "jpg", "png", "mp4", "txt", "xlsx"];
        const categories = [
          "Documents",
          "Images",
          "Videos",
          "Archives",
          "Development",
        ];
        const actions = ["created", "modified", "accessed", "moved"];

        data.push({
          id: `file_${i}_${j}`,
          name: `ملف_${Math.floor(Math.random() * 1000)}.${fileTypes[Math.floor(Math.random() * fileTypes.length)]}`,
          timestamp: fileDate,
          action: actions[Math.floor(Math.random() * actions.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          size: Math.floor(Math.random() * 10000000) + 1000,
          path: `/Documents/Folder${Math.floor(Math.random() * 10)}/`,
          type: fileTypes[Math.floor(Math.random() * fileTypes.length)],
        });
      }
    }

    return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // تجميع البيانات حسب الفترة الزمنية
  const groupTimelineData = () => {
    const grouped = {};

    timelineData.forEach((item) => {
      let key;
      const date = new Date(item.timestamp);

      switch (groupBy) {
        case "hour":
          key = `${date.toDateString()} ${date.getHours()}:00`;
          break;
        case "day":
          key = date.toDateString();
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `أسبوع ${weekStart.toLocaleDateString("ar-SA")}`;
          break;
        case "month":
          key = date.toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
          });
          break;
        default:
          key = date.toDateString();
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return grouped;
  };

  // تنسيق الوقت
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // تنسيق التاريخ
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes) => {
    const sizes = ["بايت", "كيلو بايت", "ميجا بايت", "جيجا بايت"];
    if (bytes === 0) return "0 بايت";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // الحصول على أيقونة الملف
  const getFileIcon = (type) => {
    const icons = {
      pdf: "📄",
      docx: "📝",
      txt: "📃",
      jpg: "🖼️",
      png: "🖼️",
      mp4: "🎥",
      xlsx: "📊",
      zip: "📦",
    };
    return icons[type] || "📄";
  };

  // الحصول على لون العملية
  const getActionColor = (action) => {
    const colors = {
      created: "text-green-400",
      modified: "text-blue-400",
      accessed: "text-yellow-400",
      moved: "text-purple-400",
    };
    return colors[action] || "text-gray-400";
  };

  // الحصول على نص العملية
  const getActionText = (action) => {
    const texts = {
      created: "تم إنشاؤه",
      modified: "تم تعديله",
      accessed: "تم الوصول إليه",
      moved: "تم نقله",
    };
    return texts[action] || action;
  };

  const groupedData = groupTimelineData();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta text-white p-6"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* العنوان والتحكم */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                📅 الخط الزمني للملفات
              </h1>
              <p className="text-gray-400">تتبع نشاط ملفاتك عبر الزمن</p>
            </div>

            <div className="flex gap-4">
              {/* اختيار الفترة */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="glass-button px-4 py-2 rounded-lg text-sm"
              >
                <option value="today">اليوم</option>
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
                <option value="year">هذا العام</option>
              </select>

              {/* طريقة التجميع */}
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="glass-button px-4 py-2 rounded-lg text-sm"
              >
                <option value="hour">بالساعة</option>
                <option value="day">باليوم</option>
                <option value="week">بالأسبوع</option>
                <option value="month">بالشهر</option>
              </select>

              {/* طريقة العرض */}
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="glass-button px-4 py-2 rounded-lg text-sm"
              >
                <option value="timeline">خط زمني</option>
                <option value="calendar">تقويم</option>
                <option value="chart">مخطط</option>
              </select>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="glass-button rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">
                {timelineData.length}
              </div>
              <div className="text-sm text-gray-400">إجمالي الأحداث</div>
            </div>
            <div className="glass-button rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {
                  timelineData.filter((item) => item.action === "created")
                    .length
                }
              </div>
              <div className="text-sm text-gray-400">ملفات جديدة</div>
            </div>
            <div className="glass-button rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {
                  timelineData.filter((item) => item.action === "modified")
                    .length
                }
              </div>
              <div className="text-sm text-gray-400">ملفات معدلة</div>
            </div>
            <div className="glass-button rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {Object.keys(groupedData).length}
              </div>
              <div className="text-sm text-gray-400">فترات نشطة</div>
            </div>
          </div>
        </div>

        {/* الخط الزمني */}
        <div className="glass-card rounded-2xl p-6" ref={timelineRef}>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto mb-4"></div>
              <div className="text-gray-400">جاري تحميل الخط الزمني...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedData).map(([period, items]) => (
                <div key={period} className="relative">
                  {/* رأس الفترة */}
                  <div className="sticky top-0 glass-button rounded-lg p-4 mb-4 z-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        📅 {period}
                      </h3>
                      <div className="text-sm text-gray-400">
                        {items.length} حدث
                      </div>
                    </div>
                  </div>

                  {/* أحداث الفترة */}
                  <div className="space-y-3 pr-6 border-r-2 border-blue-500/30">
                    {items.map((item, index) => (
                      <div key={item.id} className="relative">
                        {/* نقطة الخط الزمني */}
                        <div className="absolute -right-[9px] top-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>

                        {/* بطاقة الحدث */}
                        <div className="glass-button rounded-lg p-4 mr-4 hover:bg-white/10 transition-all duration-300 group">
                          <div className="flex items-start gap-4">
                            {/* أيقونة الملف */}
                            <div className="text-2xl group-hover:scale-110 transition-transform">
                              {getFileIcon(item.type)}
                            </div>

                            {/* معلومات الملف */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                  {item.name}
                                </h4>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${getActionColor(item.action)} bg-current/20`}
                                >
                                  {getActionText(item.action)}
                                </span>
                              </div>

                              <div className="text-sm text-gray-400 mb-2">
                                📁 {item.path}
                              </div>

                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>🕒 {formatTime(item.timestamp)}</span>
                                <span>💾 {formatFileSize(item.size)}</span>
                                <span>🏷️ {item.category}</span>
                              </div>
                            </div>

                            {/* أزرار العمليات */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/40 rounded text-xs transition-colors">
                                فتح
                              </button>
                              <button className="px-3 py-1 bg-green-500/20 hover:bg-green-500/40 rounded text-xs transition-colors">
                                عرض
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(groupedData).length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <div className="text-xl text-gray-400 mb-2">
                    لا توجد أحداث في هذه الفترة
                  </div>
                  <div className="text-sm text-gray-500">
                    جرب اختيار فترة زمنية مختلفة
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ملاحظات الخط الزمني */}
        <div className="glass-card rounded-xl p-4 mt-6">
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>ملفات جديدة</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>ملفات معدلة</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>ملفات مفتوحة</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>ملفات منقولة</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
