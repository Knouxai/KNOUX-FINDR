import React, { useState, useEffect } from "react";

const PowerOps = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [securityMode, setSecurityMode] = useState(false);
  const [bulkOperations, setBulkOperations] = useState({
    move: false,
    copy: false,
    delete: false,
    encrypt: false,
    compress: false,
  });

  // محاكاة قائمة الملفات
  const [fileList, setFileList] = useState([
    {
      id: 1,
      name: "مشروع_العمل.docx",
      path: "/Documents/",
      size: 2500000,
      type: "docx",
      encrypted: false,
      hidden: false,
    },
    {
      id: 2,
      name: "صور_العطلة.zip",
      path: "/Pictures/",
      size: 125000000,
      type: "zip",
      encrypted: false,
      hidden: false,
    },
    {
      id: 3,
      name: "تقرير_سري.pdf",
      path: "/Documents/",
      size: 8500000,
      type: "pdf",
      encrypted: true,
      hidden: false,
    },
    {
      id: 4,
      name: "نسخة_احتياطية.db",
      path: "/Backup/",
      size: 450000000,
      type: "db",
      encrypted: false,
      hidden: true,
    },
    {
      id: 5,
      name: "كود_المشروع.zip",
      path: "/Development/",
      size: 15000000,
      type: "zip",
      encrypted: false,
      hidden: false,
    },
  ]);

  // العمليات المتاحة
  const operations = [
    {
      id: "bulk_delete",
      name: "حذف جماعي",
      description: "حذف عدة ملفات مع إمكانية الاستعادة",
      icon: "🗑️",
      color: "red",
      dangerous: true,
    },
    {
      id: "bulk_move",
      name: "نقل جماعي",
      description: "نقل الملفات إلى مجلد آخر",
      icon: "📂",
      color: "blue",
      dangerous: false,
    },
    {
      id: "bulk_encrypt",
      name: "تشفير جماعي",
      description: "تشفير الملفات الحساسة",
      icon: "🔒",
      color: "green",
      dangerous: false,
    },
    {
      id: "bulk_compress",
      name: "ضغط جماعي",
      description: "ضغط الملفات لتوفير المساحة",
      icon: "📦",
      color: "purple",
      dangerous: false,
    },
    {
      id: "bulk_hide",
      name: "إخفاء جماعي",
      description: "إخفاء الملفات من النظام",
      icon: "👁️",
      color: "yellow",
      dangerous: false,
    },
    {
      id: "duplicate_finder",
      name: "كاشف التكرار",
      description: "البحث عن الملفات المكررة وحذفها",
      icon: "🔍",
      color: "orange",
      dangerous: false,
    },
  ];

  // معالجة تحديد الملفات
  const handleFileSelect = (fileId) => {
    setSelectedFiles((prev) => {
      if (prev.includes(fileId)) {
        return prev.filter((id) => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  // تحديد جميع الملفات
  const handleSelectAll = () => {
    if (selectedFiles.length === fileList.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(fileList.map((file) => file.id));
    }
  };

  // تنفيذ العملية
  const executeOperation = async (operationId) => {
    setCurrentOperation(operationId);
    setOperationProgress(0);

    // محاكاة تقدم العملية
    for (let i = 0; i <= 100; i += 10) {
      setOperationProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // تطبيق العملية على الملفات
    switch (operationId) {
      case "bulk_delete":
        setFileList((prev) =>
          prev.filter((file) => !selectedFiles.includes(file.id)),
        );
        break;
      case "bulk_encrypt":
        setFileList((prev) =>
          prev.map((file) =>
            selectedFiles.includes(file.id)
              ? { ...file, encrypted: true }
              : file,
          ),
        );
        break;
      case "bulk_hide":
        setFileList((prev) =>
          prev.map((file) =>
            selectedFiles.includes(file.id) ? { ...file, hidden: true } : file,
          ),
        );
        break;
      default:
        break;
    }

    setSelectedFiles([]);
    setCurrentOperation(null);
    setOperationProgress(0);
  };

  // تأكيد العملية الخطيرة
  const confirmDangerousOperation = (operation) => {
    const confirmed = window.confirm(
      `هل أنت متأكد من تنفيذ "${operation.name}" على ${selectedFiles.length} ملف؟\n` +
        `هذه العملية قد تكون غير قابلة للتراجع!`,
    );

    if (confirmed) {
      executeOperation(operation.id);
    }
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes) => {
    const sizes = ["بايت", "كيلو بايت", "ميجا بايت", "جيجا بايت"];
    if (bytes === 0) return "0 بايت";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // الحصول على أيقونة الملف
  const getFileIcon = (type, encrypted, hidden) => {
    let icon = "📄";
    switch (type) {
      case "docx":
        icon = "📝";
        break;
      case "pdf":
        icon = "📄";
        break;
      case "zip":
        icon = "📦";
        break;
      case "db":
        icon = "🗄️";
        break;
      default:
        icon = "📁";
        break;
    }

    if (encrypted) icon += "🔒";
    if (hidden) icon += "👁️‍🗨️";

    return icon;
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
                ⚡ PowerOps - إدارة متقدمة للملفات
              </h1>
              <p className="text-gray-400">
                عمليات متقدمة وآمنة لإدارة ملفاتك بكفاءة
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="security-mode"
                  checked={securityMode}
                  onChange={(e) => setSecurityMode(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="security-mode" className="text-sm">
                  🛡️ الوضع الآمن
                </label>
              </div>

              <div className="text-sm text-gray-400">
                {selectedFiles.length} من {fileList.length} محدد
              </div>
            </div>
          </div>

          {/* شريط التقدم للعمليات */}
          {currentOperation && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-400">
                  جاري تنفيذ العملية...
                </span>
                <span className="text-sm text-gray-400">
                  {operationProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${operationProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* العمليات المتاحة */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">
                🔧 العمليات المتاحة
              </h3>

              <div className="space-y-3">
                {operations.map((operation) => (
                  <button
                    key={operation.id}
                    onClick={() =>
                      operation.dangerous
                        ? confirmDangerousOperation(operation)
                        : executeOperation(operation.id)
                    }
                    disabled={selectedFiles.length === 0 || currentOperation}
                    className={`w-full glass-button p-4 rounded-lg transition-all duration-300 group ${
                      selectedFiles.length === 0 || currentOperation
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-white/10"
                    } ${operation.dangerous ? "border border-red-500/30" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {operation.icon}
                      </span>
                      <div className="text-right flex-1">
                        <div className="font-medium text-white mb-1">
                          {operation.name}
                          {operation.dangerous && (
                            <span className="text-red-400 text-xs mr-2">
                              ⚠️
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {operation.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* إحصائيات سريعة */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                📊 إحصائيا�� العمليات
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>ملفات مشفرة:</span>
                  <span className="text-green-400">
                    {fileList.filter((f) => f.encrypted).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>ملفات مخفية:</span>
                  <span className="text-yellow-400">
                    {fileList.filter((f) => f.hidden).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>إجمالي الحجم:</span>
                  <span className="text-blue-400">
                    {formatFileSize(
                      fileList.reduce((sum, f) => sum + f.size, 0),
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>الملفات المحددة:</span>
                  <span className="text-purple-400">
                    {formatFileSize(
                      fileList
                        .filter((f) => selectedFiles.includes(f.id))
                        .reduce((sum, f) => sum + f.size, 0),
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* قائمة الملفات */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">📁 إدارة الملفات</h3>

                <div className="flex gap-3">
                  <button
                    onClick={handleSelectAll}
                    className="glass-button px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
                  >
                    {selectedFiles.length === fileList.length
                      ? "إلغاء الكل"
                      : "تحديد الكل"}
                  </button>

                  <select className="glass-button px-3 py-2 rounded-lg text-sm">
                    <option>ترتيب حسب الاسم</option>
                    <option>ترتيب حسب الحجم</option>
                    <option>ترتيب حسب التاريخ</option>
                  </select>
                </div>
              </div>

              {/* جدول الملفات */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {fileList.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 cursor-pointer ${
                      selectedFiles.includes(file.id)
                        ? "bg-blue-500/20 border border-blue-500/40"
                        : "glass-button hover:bg-white/5"
                    }`}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileSelect(file.id)}
                      className="rounded"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* أيقونة الملف */}
                    <div className="text-2xl">
                      {getFileIcon(file.type, file.encrypted, file.hidden)}
                    </div>

                    {/* معلومات الملف */}
                    <div className="flex-1">
                      <div className="font-medium text-white mb-1">
                        {file.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        📁 {file.path} • 💾 {formatFileSize(file.size)}
                      </div>
                    </div>

                    {/* حالة الملف */}
                    <div className="flex gap-2">
                      {file.encrypted && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          🔒 مشفر
                        </span>
                      )}
                      {file.hidden && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                          👁️ مخفي
                        </span>
                      )}
                    </div>

                    {/* عمليات سريعة */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 glass-button rounded hover:bg-blue-500/20 transition-colors"
                        title="فتح"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📂
                      </button>
                      <button
                        className="p-2 glass-button rounded hover:bg-green-500/20 transition-colors"
                        title="تشفير/إل��اء تشفير"
                        onClick={(e) => e.stopPropagation()}
                      >
                        🔒
                      </button>
                      <button
                        className="p-2 glass-button rounded hover:bg-red-500/20 transition-colors"
                        title="حذف"
                        onClick={(e) => e.stopPropagation()}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {fileList.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📁</div>
                  <div className="text-xl text-gray-400 mb-2">
                    لا توجد ملفات للإدارة
                  </div>
                  <div className="text-sm text-gray-500">
                    ابدأ بفهرسة ملفاتك أولاً
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* تحذيرات الأمان */}
        {securityMode && (
          <div className="glass-card rounded-xl p-6 mt-6 border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🛡️</span>
              <h3 className="text-lg font-semibold text-yellow-400">
                الوضع الآمن مفعل
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="glass-button p-3 rounded-lg">
                <div className="text-green-400 font-medium mb-1">
                  ✅ النسخ الاحتياطي التلقائي
                </div>
                <div className="text-gray-400">
                  سيتم إنشاء نسخة احتياطية قبل أي عملية
                </div>
              </div>

              <div className="glass-button p-3 rounded-lg">
                <div className="text-blue-400 font-medium mb-1">
                  🔍 المراجعة المزدوجة
                </div>
                <div className="text-gray-400">
                  تأكيد إضافي للعمليات الخطيرة
                </div>
              </div>

              <div className="glass-button p-3 rounded-lg">
                <div className="text-purple-400 font-medium mb-1">
                  📝 تسجيل العمليات
                </div>
                <div className="text-gray-400">
                  حفظ سجل مفصل لجميع الإجراءات
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PowerOps;
