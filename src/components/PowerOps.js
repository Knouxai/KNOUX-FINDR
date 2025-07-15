import React, { useState, useEffect, useCallback, useMemo } from "react";
import DuplicateManager from "./DuplicateManager";

const PowerOps = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [securityMode, setSecurityMode] = useState(false);
  const [activeTab, setActiveTab] = useState("organize"); // organize, duplicates, analytics
  const [duplicateResults, setDuplicateResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [organizeMode, setOrganizeMode] = useState("smart"); // smart, manual, rules
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({
    type: "all",
    size: "all",
    date: "all",
    category: "all",
  });
  const [sortBy, setSortBy] = useState("modified");
  const [sortOrder, setSortOrder] = useState("desc");
  const [bulkOperations, setBulkOperations] = useState({
    move: false,
    copy: false,
    delete: false,
    encrypt: false,
    compress: false,
    categorize: false,
    duplicate_scan: false,
  });

  // قائمة الملفات المحسنة مع بيانات إضافية
  const [fileList, setFileList] = useState([
    {
      id: 1,
      name: "مشروع_العمل.docx",
      path: "/Documents/Work/",
      size: 2500000,
      type: "docx",
      category: "Work",
      encrypted: false,
      hidden: false,
      modified: Date.now() - 86400000, // يوم واحد
      created: Date.now() - 604800000, // أسبوع
      accessed: Date.now() - 3600000, // ساعة
      hash: "a1b2c3d4e5f6",
      tags: ["عمل", "مشروع", "مستند"],
      duplicateGroup: null,
      autoCategory: true,
      confidence: 0.95,
    },
    {
      id: 2,
      name: "صور_العطلة.zip",
      path: "/Pictures/Vacation/",
      size: 125000000,
      type: "zip",
      category: "Personal",
      encrypted: false,
      hidden: false,
      modified: Date.now() - 2592000000, // شهر
      created: Date.now() - 2592000000,
      accessed: Date.now() - 86400000,
      hash: "f6e5d4c3b2a1",
      tags: ["صور", "عطلة", "أرشيف"],
      duplicateGroup: null,
      autoCategory: true,
      confidence: 0.88,
    },
    {
      id: 3,
      name: "تقرير_سري.pdf",
      path: "/Documents/Confidential/",
      size: 8500000,
      type: "pdf",
      category: "Finance",
      encrypted: true,
      hidden: false,
      modified: Date.now() - 172800000, // يومين
      created: Date.now() - 259200000, // ثلاثة أيام
      accessed: Date.now() - 7200000, // ساعتين
      hash: "x1y2z3w4v5u6",
      tags: ["تقرير", "سري", "مالي"],
      duplicateGroup: null,
      autoCategory: false,
      confidence: 0.75,
    },
    {
      id: 4,
      name: "نسخة_احتياطية.db",
      path: "/Backup/System/",
      size: 450000000,
      type: "db",
      category: "System",
      encrypted: false,
      hidden: true,
      modified: Date.now() - 7200000,
      created: Date.now() - 1209600000, // أسبوعين
      accessed: Date.now() - 3600000,
      hash: "b1a2c3k4u5p6",
      tags: ["نسخة احتياطية", "قاعدة بيانات", "نظام"],
      duplicateGroup: null,
      autoCategory: true,
      confidence: 0.92,
    },
    {
      id: 5,
      name: "كود_المشروع.zip",
      path: "/Development/Projects/",
      size: 15000000,
      type: "zip",
      category: "Development",
      encrypted: false,
      hidden: false,
      modified: Date.now() - 43200000, // 12 ساعة
      created: Date.now() - 518400000, // 6 أيام
      accessed: Date.now() - 1800000, // 30 دقيقة
      hash: "c0d3p4r5o6j7",
      tags: ["كود", "مشروع", "تطوير"],
      duplicateGroup: null,
      autoCategory: true,
      confidence: 0.97,
    },
    {
      id: 6,
      name: "مشروع_العمل_نسخة.docx",
      path: "/Downloads/",
      size: 2500000,
      type: "docx",
      category: "Work",
      encrypted: false,
      hidden: false,
      modified: Date.now() - 86400000,
      created: Date.now() - 604800000,
      accessed: Date.now() - 7200000,
      hash: "a1b2c3d4e5f6", // نفس hash الملف الأول
      tags: ["عمل", "مشروع", "نسخة"],
      duplicateGroup: "dup_1",
      autoCategory: true,
      confidence: 0.95,
    },
    {
      id: 7,
      name: "صور_العطلة_backup.zip",
      path: "/Backup/Personal/",
      size: 125000000,
      type: "zip",
      category: "Personal",
      encrypted: false,
      hidden: false,
      modified: Date.now() - 2592000000,
      created: Date.now() - 2592000000,
      accessed: Date.now() - 172800000,
      hash: "f6e5d4c3b2a1", // نفس hash الملف الثاني
      tags: ["صور", "عطلة", "نسخة احتياطية"],
      duplicateGroup: "dup_2",
      autoCategory: true,
      confidence: 0.88,
    },
  ]);

  // العمليات المتاحة المحسنة
  const operations = [
    {
      id: "smart_organize",
      name: "تنظيم ذكي",
      description: "تنظيم تلقائي للملفات حسب النوع والمحتوى",
      icon: "🧠",
      color: "blue",
      dangerous: false,
      category: "organize",
    },
    {
      id: "auto_categorize",
      name: "تصنيف تلقائي",
      description: "تصنيف الملفات بالذكاء الاصطناعي",
      icon: "🏷️",
      color: "purple",
      dangerous: false,
      category: "organize",
    },
    {
      id: "advanced_duplicate_scan",
      name: "فحص متقدم للتكرارات",
      description: "كشف ذكي للملفات المكررة والمشابهة",
      icon: "🔍",
      color: "orange",
      dangerous: false,
      category: "duplicates",
    },
    {
      id: "similarity_clustering",
      name: "تجميع متشابه",
      description: "تجميع الملفات المتشابهة في المحتوى",
      icon: "🔗",
      color: "teal",
      dangerous: false,
      category: "organize",
    },
    {
      id: "bulk_move",
      name: "نقل جماعي",
      description: "نقل الملفات إلى مجلد آخر بذكاء",
      icon: "📂",
      color: "blue",
      dangerous: false,
      category: "manage",
    },
    {
      id: "bulk_rename",
      name: "إعادة تسمية ذكية",
      description: "إعادة تسمية الملفات حسب قواعد ذكية",
      icon: "✏️",
      color: "green",
      dangerous: false,
      category: "manage",
    },
    {
      id: "bulk_encrypt",
      name: "تشفير محسن",
      description: "تشفير متقدم للملفات الحساسة",
      icon: "🔒",
      color: "red",
      dangerous: false,
      category: "security",
    },
    {
      id: "bulk_compress",
      name: "ضغط ذك��",
      description: "ضغط الملفات بأفضل خوارزمية",
      icon: "📦",
      color: "purple",
      dangerous: false,
      category: "optimize",
    },
    {
      id: "space_analyzer",
      name: "محلل المساحة",
      description: "تحليل استخدام المساحة واقتراح التحسينات",
      icon: "💾",
      color: "yellow",
      dangerous: false,
      category: "analytics",
    },
    {
      id: "bulk_delete",
      name: "حذف آمن",
      description: "حذف آمن مع إمكانية الاستعادة الكاملة",
      icon: "🗑️",
      color: "red",
      dangerous: true,
      category: "manage",
    },
  ];

  // التصنيفات الذكية المتاحة
  const smartCategories = [
    { id: "Work", name: "عمل", icon: "💼", color: "blue" },
    { id: "Personal", name: "شخصي", icon: "👤", color: "green" },
    { id: "Finance", name: "مالي", icon: "💰", color: "yellow" },
    { id: "Education", name: "تعليمي", icon: "📚", color: "purple" },
    { id: "Health", name: "صحي", icon: "🏥", color: "red" },
    { id: "Legal", name: "قانوني", icon: "⚖️", color: "gray" },
    { id: "Development", name: "تطوير", icon: "💻", color: "teal" },
    { id: "Media", name: "وسائط", icon: "🎬", color: "pink" },
    { id: "Archive", name: "أرشيف", icon: "📦", color: "brown" },
    { id: "System", name: "نظام", icon: "⚙️", color: "gray" },
  ];

  // قوائم مفلترة ومرتبة
  const filteredAndSortedFiles = useMemo(() => {
    let filtered = fileList.filter((file) => {
      // فلتر حسب النوع
      if (filterCriteria.type !== "all" && file.type !== filterCriteria.type) {
        return false;
      }

      // فلتر حسب الفئة
      if (
        filterCriteria.category !== "all" &&
        file.category !== filterCriteria.category
      ) {
        return false;
      }

      // فلتر حسب الحجم
      if (filterCriteria.size !== "all") {
        const sizeInMB = file.size / (1024 * 1024);
        switch (filterCriteria.size) {
          case "small":
            if (sizeInMB >= 10) return false;
            break;
          case "medium":
            if (sizeInMB < 10 || sizeInMB >= 100) return false;
            break;
          case "large":
            if (sizeInMB < 100) return false;
            break;
        }
      }

      // فلتر حسب التاريخ
      if (filterCriteria.date !== "all") {
        const daysDiff = (Date.now() - file.modified) / (1000 * 60 * 60 * 24);
        switch (filterCriteria.date) {
          case "today":
            if (daysDiff >= 1) return false;
            break;
          case "week":
            if (daysDiff >= 7) return false;
            break;
          case "month":
            if (daysDiff >= 30) return false;
            break;
          case "older":
            if (daysDiff < 30) return false;
            break;
        }
      }

      return true;
    });

    // ترتيب النتائج
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        case "modified":
          comparison = a.modified - b.modified;
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = a.modified - b.modified;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [fileList, filterCriteria, sortBy, sortOrder]);

  // الملفات المكررة
  const duplicateFiles = useMemo(() => {
    const duplicates = {};
    fileList.forEach((file) => {
      if (file.duplicateGroup) {
        if (!duplicates[file.duplicateGroup]) {
          duplicates[file.duplicateGroup] = [];
        }
        duplicates[file.duplicateGroup].push(file);
      }
    });
    return duplicates;
  }, [fileList]);

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
    if (selectedFiles.length === filteredAndSortedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredAndSortedFiles.map((file) => file.id));
    }
  };

  // تنفيذ عملية فحص التكرارات المتقدم
  const startAdvancedDuplicateScan = useCallback(async () => {
    setIsScanning(true);
    setScanProgress(0);

    try {
      // محاكاة عملية الفحص
      const totalSteps = 5;

      for (let step = 1; step <= totalSteps; step++) {
        setScanProgress((step / totalSteps) * 100);

        switch (step) {
          case 1:
            console.log("🔍 تحليل الملفات...");
            break;
          case 2:
            console.log("🧠 حساب التشابه...");
            break;
          case 3:
            console.log("📊 تحليل المحتوى...");
            break;
          case 4:
            console.log("🏷️ تجميع النتائج...");
            break;
          case 5:
            console.log("✅ اكتمال الفحص");
            break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // إنشاء نتائج وهمية
      const mockResults = {
        groups: [
          {
            id: "dup_1",
            type: "نسخة مطابقة تماماً",
            files: fileList.filter((f) => f.duplicateGroup === "dup_1"),
            confidence: 1.0,
            wastedSpace: 2500000,
            recommendations: [
              {
                type: "delete_oldest",
                title: "حذف النسخة الأقدم",
                description: "حذف النسخة من مجلد Downloads",
                spaceFreed: 2500000,
              },
            ],
          },
          {
            id: "dup_2",
            type: "نسخة مطابقة تماماً",
            files: fileList.filter((f) => f.duplicateGroup === "dup_2"),
            confidence: 1.0,
            wastedSpace: 125000000,
            recommendations: [
              {
                type: "move_to_archive",
                title: "نقل إلى الأرشيف",
                description: "نقل النسخة الاحتياطية إلى مجلد منفصل",
                spaceFreed: 0,
              },
            ],
          },
        ],
        summary: {
          totalGroups: 2,
          totalDuplicates: 2,
          totalWastedSpace: 127500000,
          potentialSavings: 127500000,
        },
      };

      setDuplicateResults(mockResults);
      setActiveTab("duplicates");
    } catch (error) {
      console.error("❌ خطأ ف�� فحص التكرارات:", error);
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  }, [fileList]);

  // تصنيف ذكي للملفات
  const performSmartCategorization = useCallback(async () => {
    setCurrentOperation("auto_categorize");
    setOperationProgress(0);

    const totalFiles = selectedFiles.length || fileList.length;
    const filesToProcess =
      selectedFiles.length > 0
        ? fileList.filter((f) => selectedFiles.includes(f.id))
        : fileList;

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];

      // محاكاة تصنيف ذكي
      let newCategory = file.category;
      let confidence = file.confidence;

      // تحسين التصنيف حسب الاس�� والمسار
      if (file.name.includes("مشروع") || file.path.includes("Work")) {
        newCategory = "Work";
        confidence = 0.95;
      } else if (file.name.includes("صور") || file.path.includes("Picture")) {
        newCategory = "Personal";
        confidence = 0.88;
      } else if (file.type === "pdf" && file.name.includes("تقرير")) {
        newCategory = "Finance";
        confidence = 0.85;
      } else if (file.type === "zip" && file.path.includes("Development")) {
        newCategory = "Development";
        confidence = 0.97;
      }

      // تحديث الملف
      setFileList((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? { ...f, category: newCategory, confidence, autoCategory: true }
            : f,
        ),
      );

      setOperationProgress(((i + 1) / totalFiles) * 100);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setCurrentOperation(null);
    setOperationProgress(0);
    setSelectedFiles([]);
  }, [selectedFiles, fileList]);

  // تنظيم ذكي للملفات
  const performSmartOrganization = useCallback(async () => {
    setCurrentOperation("smart_organize");
    setOperationProgress(0);

    // محاكاة عملية التنظيم
    const organizationSteps = [
      "📊 تحليل بنية الملفات...",
      "🏷️ تصنيف بالذكاء الاصطناعي...",
      "📂 إنشاء هيكل مجلدات محسن...",
      "➡️ نقل الملفات إلى المواقع المناسبة...",
      "✅ اكتمال التنظيم",
    ];

    for (let i = 0; i < organizationSteps.length; i++) {
      console.log(organizationSteps[i]);
      setOperationProgress(((i + 1) / organizationSteps.length) * 100);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    // تحديث مسارات الملفات حسب التصنيف
    setFileList((prev) =>
      prev.map((file) => ({
        ...file,
        path: `/Organized/${file.category}/${file.name.split(".")[0]}/`,
      })),
    );

    setCurrentOperation(null);
    setOperationProgress(0);
  }, []);

  // معالجة حل التكرارات
  const handleDuplicateResolution = useCallback((resolutionData) => {
    console.log("✅ تم حل التكرارات:", resolutionData);

    // تحديث قائمة الملفات بناءً على الحل المطبق
    if (resolutionData.strategy === "smart") {
      // إزالة الملفات المحذوفة من القائمة
      setFileList((prev) =>
        prev.filter(
          (file) =>
            !file.duplicateGroup ||
            prev.find(
              (f) =>
                f.duplicateGroup === file.duplicateGroup && f.id !== file.id,
            ),
        ),
      );
    }

    // إعادة تعيين نتائج التكرار
    setDuplicateResults(null);
  }, []);

  // تنفيذ العملية
  const executeOperation = async (operationId) => {
    switch (operationId) {
      case "advanced_duplicate_scan":
        await startAdvancedDuplicateScan();
        break;
      case "auto_categorize":
        await performSmartCategorization();
        break;
      case "smart_organize":
        await performSmartOrganization();
        break;
      case "bulk_delete":
        setCurrentOperation(operationId);
        setOperationProgress(0);
        for (let i = 0; i <= 100; i += 10) {
          setOperationProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        setFileList((prev) =>
          prev.filter((file) => !selectedFiles.includes(file.id)),
        );
        setSelectedFiles([]);
        setCurrentOperation(null);
        setOperationProgress(0);
        break;
      case "bulk_encrypt":
        setCurrentOperation(operationId);
        setOperationProgress(0);
        for (let i = 0; i <= 100; i += 10) {
          setOperationProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
        setFileList((prev) =>
          prev.map((file) =>
            selectedFiles.includes(file.id)
              ? { ...file, encrypted: true }
              : file,
          ),
        );
        setSelectedFiles([]);
        setCurrentOperation(null);
        setOperationProgress(0);
        break;
      default:
        setCurrentOperation(operationId);
        setOperationProgress(0);
        for (let i = 0; i <= 100; i += 10) {
          setOperationProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        setSelectedFiles([]);
        setCurrentOperation(null);
        setOperationProgress(0);
        break;
    }
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

  // رندر تبويب التنظيم
  const renderOrganizeTab = () => (
    <div className="space-y-6">
      {/* أدوات التنظيم */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العمليات المتاحة */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🛠️ أدوات التنظيم الذكي
            </h3>

            <div className="space-y-3">
              {operations
                .filter((op) => op.category === "organize")
                .map((operation) => (
                  <button
                    key={operation.id}
                    onClick={() =>
                      operation.dangerous
                        ? confirmDangerousOperation(operation)
                        : executeOperation(operation.id)
                    }
                    disabled={
                      (operation.id !== "smart_organize" &&
                        operation.id !== "advanced_duplicate_scan" &&
                        selectedFiles.length === 0) ||
                      currentOperation
                    }
                    className={`w-full glass-button p-4 rounded-lg transition-all duration-300 group ${
                      (operation.id !== "smart_organize" &&
                        operation.id !== "advanced_duplicate_scan" &&
                        selectedFiles.length === 0) ||
                      currentOperation
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-500/10 hover:border-blue-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {operation.icon}
                      </span>
                      <div className="text-right flex-1">
                        <div className="font-medium text-white mb-1">
                          {operation.name}
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

          {/* فلاتر سريعة */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">🎛️ فلاتر ذكية</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">الفئة</label>
                <select
                  value={filterCriteria.category}
                  onChange={(e) =>
                    setFilterCriteria((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full glass-button p-2 rounded-lg text-sm"
                >
                  <option value="all">جميع الفئات</option>
                  {smartCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">النوع</label>
                <select
                  value={filterCriteria.type}
                  onChange={(e) =>
                    setFilterCriteria((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="w-full glass-button p-2 rounded-lg text-sm"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="docx">مستندات Word</option>
                  <option value="pdf">ملفات PDF</option>
                  <option value="zip">أرشيف مضغوط</option>
                  <option value="db">قواعد بيانات</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الحجم</label>
                <select
                  value={filterCriteria.size}
                  onChange={(e) =>
                    setFilterCriteria((prev) => ({
                      ...prev,
                      size: e.target.value,
                    }))
                  }
                  className="w-full glass-button p-2 rounded-lg text-sm"
                >
                  <option value="all">جميع الأحجام</option>
                  <option value="small">صغير (&lt; 10 ميجا)</option>
                  <option value="medium">متوسط (10-100 ميجا)</option>
                  <option value="large">كبير (&gt; 100 ميجا)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* قائمة الملفات */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                📁 إدارة الملفات ({filteredAndSortedFiles.length})
              </h3>

              <div className="flex gap-3">
                <button
                  onClick={handleSelectAll}
                  className="glass-button px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
                >
                  {selectedFiles.length === filteredAndSortedFiles.length &&
                  filteredAndSortedFiles.length > 0
                    ? "إلغاء الكل"
                    : "تحديد الكل"}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="glass-button px-3 py-2 rounded-lg text-sm"
                >
                  <option value="modified">ترتيب حسب التاريخ</option>
                  <option value="name">ترتيب حسب الاسم</option>
                  <option value="size">ترتيب حسب الحجم</option>
                  <option value="category">ترتيب حسب الفئة</option>
                </select>
              </div>
            </div>

            {/* جدول الملفات */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredAndSortedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 cursor-pointer group ${
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
                    <div className="font-medium text-white mb-1 flex items-center gap-2">
                      {file.name}
                      {file.duplicateGroup && (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                          🔗 مكرر
                        </span>
                      )}
                      {file.autoCategory && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          🧠 ذكي
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      📁 {file.path} • 💾 {formatFileSize(file.size)} • 🏷️{" "}
                      {
                        smartCategories.find((c) => c.id === file.category)
                          ?.name
                      }
                    </div>
                  </div>

                  {/* مؤشر الثقة */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          file.confidence > 0.9
                            ? "bg-green-500"
                            : file.confidence > 0.7
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${file.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {Math.round(file.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredAndSortedFiles.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📁</div>
                <div className="text-xl text-gray-400 mb-2">
                  لا توجد ملفات تطابق الفلاتر المحددة
                </div>
                <div className="text-sm text-gray-500">
                  جرب تغيير معايير البحث
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // رندر تبويب التكرارات
  const renderDuplicatesTab = () => (
    <div className="space-y-6">
      {/* أدوات فحص التكرارات */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              🔍 كاشف التكرارات المتقدم
            </h3>
            <p className="text-gray-400">
              فحص ذكي للملفات المكررة والمشابهة باستخدام خوارزميات متقدمة
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={startAdvancedDuplicateScan}
              disabled={isScanning}
              className="primary-button px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
              {isScanning ? "🔍 جارٍ الفحص..." : "🚀 بدء الفحص المتقدم"}
            </button>
          </div>
        </div>

        {/* شريط التقدم للفحص */}
        {isScanning && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-400">
                جاري فحص التكرارات...
              </span>
              <span className="text-sm text-gray-400">
                {Math.round(scanProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 relative"
                style={{ width: `${scanProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* مدير التكرارات المتقدم */}
      {duplicateResults && (
        <DuplicateManager
          duplicateResults={duplicateResults}
          onResolve={handleDuplicateResolution}
          onCancel={() => setDuplicateResults(null)}
        />
      )}

      {/* التكرارات الموجودة */}
      {Object.keys(duplicateFiles).length > 0 && !duplicateResults && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔗 تكرارات موجودة
          </h3>

          {Object.entries(duplicateFiles).map(([groupId, files]) => (
            <div key={groupId} className="mb-4 p-4 glass-button rounded-lg">
              <div className="font-medium text-white mb-2">
                مجموعة {groupId}: {files.length} ملفات
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="text-sm text-gray-400 flex items-center gap-2"
                  >
                    <span>
                      {getFileIcon(file.type, file.encrypted, file.hidden)}
                    </span>
                    <span className="truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // رندر تبويب التحليلات
  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          📊 تحليلات الملفات
        </h3>
        <p className="text-gray-400 mb-6">
          تحليل شامل لاستخدام المساحة وتوزيع الملفات
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 glass-button rounded-lg">
            <div className="text-3xl mb-2">📁</div>
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {fileList.length}
            </div>
            <div className="text-sm text-gray-400">إجمالي الملفات</div>
          </div>

          <div className="text-center p-6 glass-button rounded-lg">
            <div className="text-3xl mb-2">💾</div>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {formatFileSize(
                fileList.reduce((sum, file) => sum + file.size, 0),
              )}
            </div>
            <div className="text-sm text-gray-400">إجمالي الحجم</div>
          </div>

          <div className="text-center p-6 glass-button rounded-lg">
            <div className="text-3xl mb-2">🏷️</div>
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {smartCategories.length}
            </div>
            <div className="text-sm text-gray-400">فئات مت��حة</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta text-white p-6"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* العنوان والتحكم المحسن */}
        <div className="glass-card rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-teal-500/5"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-3 flex items-center gap-3">
                  ⚡ PowerOps
                  <span className="text-lg font-normal text-blue-400">
                    إدارة ذكية متقدمة
                  </span>
                </h1>
                <p className="text-gray-300 text-lg mb-4">
                  أدوات متقدمة لتنظيم وإدارة ملفاتك بذكاء وكفاءة عالية
                </p>

                {/* إحصائيات سريعة */}
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-gray-400">ملفات مفهرسة:</span>
                    <span className="text-white font-semibold">
                      {fileList.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    <span className="text-gray-400">مكررات:</span>
                    <span className="text-white font-semibold">
                      {Object.keys(duplicateFiles).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    <span className="text-gray-400">محدد:</span>
                    <span className="text-white font-semibold">
                      {selectedFiles.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                {/* وضع ال��مان */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="security-mode"
                      checked={securityMode}
                      onChange={(e) => setSecurityMode(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="security-mode"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      🛡️ الوضع الآمن
                    </label>
                  </div>

                  {securityMode && (
                    <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                      نشط
                    </div>
                  )}
                </div>

                {/* أزرار سريعة */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setSelectedFiles(filteredAndSortedFiles.map((f) => f.id))
                    }
                    className="glass-button px-4 py-2 rounded-lg text-sm hover:bg-blue-500/20 transition-all"
                  >
                    ✅ تحديد الكل
                  </button>
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="glass-button px-4 py-2 rounded-lg text-sm hover:bg-red-500/20 transition-all"
                  >
                    ❌ إلغاء التحديد
                  </button>
                </div>
              </div>
            </div>

            {/* علامات التبويب */}
            <div className="flex gap-2 mb-4">
              {[
                { id: "organize", name: "🗂️ تنظيم ذكي", color: "blue" },
                { id: "duplicates", name: "🔍 التكرارات", color: "orange" },
                { id: "analytics", name: "📊 التحليلات", color: "purple" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-500/20 text-${tab.color}-300 border border-${tab.color}-500/40 shadow-lg shadow-${tab.color}-500/20`
                      : "glass-button text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative z-10">{tab.name}</span>
                </button>
              ))}
            </div>

            {/* شريط التقدم للعمليات */}
            {currentOperation && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-400">
                    جاري تنفيذ العملية...
                  </span>
                  <span className="text-sm text-gray-400">
                    {Math.round(operationProgress)}%
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
        </div>

        {/* محتوى التبويب */}
        <div className="min-h-[600px]">
          {activeTab === "organize" && renderOrganizeTab()}
          {activeTab === "duplicates" && renderDuplicatesTab()}
          {activeTab === "analytics" && renderAnalyticsTab()}
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
