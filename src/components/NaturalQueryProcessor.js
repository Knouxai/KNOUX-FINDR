import React, { useState, useEffect } from "react";

// محاكاة مكتبة chrono-node للتعامل مع التواريخ
const parseDate = (text) => {
  const today = new Date();

  // الكلمات المفتاحية للتواريخ باللغة العربية والإنجليزية
  const datePatterns = {
    اليوم: new Date(),
    today: new Date(),
    أمس: new Date(today.getTime() - 24 * 60 * 60 * 1000),
    yesterday: new Date(today.getTime() - 24 * 60 * 60 * 1000),
    "هذا الأسبوع": new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
    "this week": new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
    "الأسبوع الماضي": new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
    "last week": new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
    "هذا الشهر": new Date(today.getFullYear(), today.getMonth(), 1),
    "this month": new Date(today.getFullYear(), today.getMonth(), 1),
    "الشهر الماضي": new Date(today.getFullYear(), today.getMonth() - 1, 1),
    "last month": new Date(today.getFullYear(), today.getMonth() - 1, 1),
    "هذا العام": new Date(today.getFullYear(), 0, 1),
    "this year": new Date(today.getFullYear(), 0, 1),
    "العام الماضي": new Date(today.getFullYear() - 1, 0, 1),
    "last year": new Date(today.getFullYear() - 1, 0, 1),
  };

  for (const [pattern, date] of Object.entries(datePatterns)) {
    if (text.includes(pattern)) {
      return date;
    }
  }

  return null;
};

// محاكاة مكتبة compromise لمعالجة اللغة الطبيعية
const parseNaturalQuery = (query) => {
  const result = {
    searchTerms: [],
    fileTypes: [],
    actions: [],
    timeRange: null,
    size: null,
    category: null,
    location: null,
    author: null,
  };

  const queryLower = query.toLowerCase();

  // استخراج أنواع الملفات
  const fileTypePatterns = {
    pdf: ["pdf", "بي دي إف"],
    doc: ["وورد", "word", "doc", "docx", "مستند"],
    image: ["صورة", "صور", "image", "jpg", "png", "gif"],
    video: ["فيديو", "video", "mp4", "avi", "mov"],
    audio: ["صوت", "audio", "mp3", "wav"],
    excel: ["إكسل", "excel", "xls", "xlsx", "جدول"],
    powerpoint: ["باوربوينت", "powerpoint", "ppt", "pptx", "عرض"],
  };

  for (const [type, patterns] of Object.entries(fileTypePatterns)) {
    for (const pattern of patterns) {
      if (queryLower.includes(pattern)) {
        result.fileTypes.push(type);
        break;
      }
    }
  }

  // استخراج الإجراءات
  const actionPatterns = {
    created: ["أنشأت", "أنشئ", "تم إنشاؤه", "created", "new", "جديد"],
    modified: ["عدلت", "تم تعديله", "modified", "changed", "updated", "محدث"],
    accessed: ["فتحت", "تم فتحه", "accessed", "opened", "viewed", "شاهدت"],
    deleted: ["حذفت", "تم حذفه", "deleted", "removed", "محذوف"],
  };

  for (const [action, patterns] of Object.entries(actionPatterns)) {
    for (const pattern of patterns) {
      if (queryLower.includes(pattern)) {
        result.actions.push(action);
        break;
      }
    }
  }

  // استخراج النطاق الزمني
  result.timeRange = parseDate(queryLower);

  // استخراج الحجم
  if (
    queryLower.includes("كبير") ||
    queryLower.includes("large") ||
    queryLower.includes("big")
  ) {
    result.size = "large";
  } else if (queryLower.includes("صغير") || queryLower.includes("small")) {
    result.size = "small";
  }

  // استخراج التصنيف
  const categoryPatterns = {
    documents: ["مستندات", "documents", "ملفات"],
    projects: ["مشاريع", "projects", "عمل"],
    personal: ["شخصي", "personal"],
    work: ["عمل", "work", "وظيفة"],
  };

  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    for (const pattern of patterns) {
      if (queryLower.includes(pattern)) {
        result.category = category;
        break;
      }
    }
  }

  // استخراج المصطلحات العامة (ما تبقى من الاستعلام)
  let cleanQuery = query;

  // إزالة الكلمات المفتاحية المعروفة
  const stopWords = [
    "في",
    "من",
    "إلى",
    "مع",
    "على",
    "عن",
    "هذا",
    "هذه",
    "التي",
    "اللذي",
    "and",
    "or",
    "the",
    "in",
    "on",
    "at",
    "to",
    "from",
  ];

  const words = cleanQuery
    .split(" ")
    .filter(
      (word) =>
        word.length > 2 &&
        !stopWords.includes(word.toLowerCase()) &&
        !Object.values(fileTypePatterns).flat().includes(word.toLowerCase()) &&
        !Object.values(actionPatterns).flat().includes(word.toLowerCase()),
    );

  result.searchTerms = words;

  return result;
};

const NaturalQueryProcessor = ({ onQueryProcessed, onExampleClick }) => {
  const [naturalQuery, setNaturalQuery] = useState("");
  const [parsedQuery, setParsedQuery] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // أمثلة على الاستعلامات الطبيعية
  const queryExamples = [
    {
      text: "ابحث عن ملفات PDF التي أنشأتها هذا الأسبوع",
      category: "تاريخ ونوع الملف",
      icon: "📄",
    },
    {
      text: "أرني الصور الكبيرة من الشهر الماضي",
      category: "حجم وتاريخ",
      icon: "🖼️",
    },
    {
      text: "ابحث عن مستندات Word التي تحتوي على كلمة مشروع",
      category: "محتوى ونوع",
      icon: "📝",
    },
    {
      text: "أظهر لي الملفات التي عدلتها أمس",
      category: "إجراء وتاريخ",
      icon: "✏️",
    },
    {
      text: "ابحث عن ملفات العمل الكبيرة",
      category: "تصنيف وحجم",
      icon: "💼",
    },
    {
      text: "أرني جميع الفيديوهات في مجلد المشاريع",
      category: "نوع ومكان",
      icon: "🎥",
    },
    {
      text: "ابحث عن الملفات المحذوفة حديثاً",
      category: "إجراء وتاريخ",
      icon: "🗑️",
    },
    {
      text: "أظهر الملفات الشخصية الصغيرة",
      category: "تصنيف وحجم",
      icon: "👤",
    },
  ];

  // معالجة الاستعلام عند تغييره
  useEffect(() => {
    if (naturalQuery.trim()) {
      setIsProcessing(true);

      // تأخير بسيط لمحاكاة المعالجة
      const timer = setTimeout(() => {
        const parsed = parseNaturalQuery(naturalQuery);
        setParsedQuery(parsed);

        // إرسال الاستعلام المعالج للمكون الوالد
        if (onQueryProcessed) {
          onQueryProcessed(parsed);
        }

        setIsProcessing(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setParsedQuery(null);
    }
  }, [naturalQuery, onQueryProcessed]);

  // تحديث الاقتراحات
  useEffect(() => {
    if (naturalQuery.length > 2) {
      const filteredExamples = queryExamples
        .filter(
          (example) =>
            example.text.toLowerCase().includes(naturalQuery.toLowerCase()) ||
            example.category.includes(naturalQuery),
        )
        .slice(0, 5);

      setSuggestions(filteredExamples);
    } else {
      setSuggestions([]);
    }
  }, [naturalQuery]);

  // معالجة النقر على مثال
  const handleExampleClick = (example) => {
    setNaturalQuery(example.text);
    if (onExampleClick) {
      onExampleClick(example);
    }
  };

  // تنسيق النتائج المعالجة
  const renderParsedResults = () => {
    if (!parsedQuery) return null;

    return (
      <div className="glass-card rounded-xl p-4 mt-4">
        <h4 className="text-lg font-semibold mb-3 text-blue-400">
          🧠 تحليل الاستعلام
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {parsedQuery.searchTerms.length > 0 && (
            <div>
              <div className="text-gray-400 mb-1">المصطلحات:</div>
              <div className="flex flex-wrap gap-1">
                {parsedQuery.searchTerms.map((term, index) => (
                  <span
                    key={index}
                    className="bg-blue-500/20 px-2 py-1 rounded text-xs"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {parsedQuery.fileTypes.length > 0 && (
            <div>
              <div className="text-gray-400 mb-1">أنواع الملفات:</div>
              <div className="flex flex-wrap gap-1">
                {parsedQuery.fileTypes.map((type, index) => (
                  <span
                    key={index}
                    className="bg-green-500/20 px-2 py-1 rounded text-xs"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {parsedQuery.actions.length > 0 && (
            <div>
              <div className="text-gray-400 mb-1">الإجراءات:</div>
              <div className="flex flex-wrap gap-1">
                {parsedQuery.actions.map((action, index) => (
                  <span
                    key={index}
                    className="bg-yellow-500/20 px-2 py-1 rounded text-xs"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
          )}

          {parsedQuery.timeRange && (
            <div>
              <div className="text-gray-400 mb-1">النطاق الزمني:</div>
              <span className="bg-purple-500/20 px-2 py-1 rounded text-xs">
                {parsedQuery.timeRange.toLocaleDateString("ar-SA")}
              </span>
            </div>
          )}

          {parsedQuery.size && (
            <div>
              <div className="text-gray-400 mb-1">الحجم:</div>
              <span className="bg-orange-500/20 px-2 py-1 rounded text-xs">
                {parsedQuery.size}
              </span>
            </div>
          )}

          {parsedQuery.category && (
            <div>
              <div className="text-gray-400 mb-1">التصنيف:</div>
              <span className="bg-pink-500/20 px-2 py-1 rounded text-xs">
                {parsedQuery.category}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* شريط البحث الطبيعي */}
      <div className="glass-card rounded-2xl p-6 relative">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            🗣️ البحث بالكلام الطبيعي
          </h3>
          <p className="text-gray-400 text-sm">
            اكتب استعلامك كما تتكلم طبيعياً، وسنحوله إلى بحث متقدم
          </p>
        </div>

        <div className="relative">
          <textarea
            value={naturalQuery}
            onChange={(e) => setNaturalQuery(e.target.value)}
            placeholder="مثال: ابحث عن ملفات PDF التي أنشأتها هذا الأسبوع..."
            className="w-full h-20 px-4 py-3 rounded-xl glass-card text-white placeholder-gray-400 text-sm resize-none focus:outline-none focus:border-blue-500 transition-all duration-300"
            dir="rtl"
          />

          {isProcessing && (
            <div className="absolute bottom-3 left-3">
              <div className="loading-spinner w-5 h-5"></div>
            </div>
          )}
        </div>

        {/* اقتراحات */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-lg border border-white/20 z-50 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                onClick={() => handleExampleClick(suggestion)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{suggestion.icon}</span>
                  <div>
                    <div className="text-sm text-white">{suggestion.text}</div>
                    <div className="text-xs text-gray-400">
                      {suggestion.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* عرض النتائج المعالجة */}
        {renderParsedResults()}
      </div>

      {/* أمثلة الاستعلامات */}
      <div className="glass-card rounded-xl p-6">
        <h4 className="text-lg font-semibold mb-4 text-white">
          💡 أمثلة للاستعلامات الطبيعية
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {queryExamples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="glass-button p-4 rounded-lg text-right hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {example.icon}
                </span>
                <div className="flex-1">
                  <div className="text-sm text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {example.text}
                  </div>
                  <div className="text-xs text-gray-400">
                    {example.category}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* نصائح الاستخدام */}
      <div className="glass-card rounded-xl p-6">
        <h4 className="text-lg font-semibold mb-4 text-white">
          📚 نصائح لاستخدام البحث الطبيعي
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="glass-button p-4 rounded-lg">
            <div className="text-lg mb-2">⏰</div>
            <div className="font-medium mb-1">التواريخ</div>
            <div className="text-gray-400">
              استخدم: اليوم، أمس، هذا الأسبوع، الشهر الماضي
            </div>
          </div>

          <div className="glass-button p-4 rounded-lg">
            <div className="text-lg mb-2">📁</div>
            <div className="font-medium mb-1">أنواع الملفات</div>
            <div className="text-gray-400">
              مثل: PDF، وورد، صور، فيديوهات، إكسل
            </div>
          </div>

          <div className="glass-button p-4 rounded-lg">
            <div className="text-lg mb-2">⚡</div>
            <div className="font-medium mb-1">الإجراءات</div>
            <div className="text-gray-400">مثل: أنشأت، عدلت، فتحت، حذفت</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NaturalQueryProcessor;
