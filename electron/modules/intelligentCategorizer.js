const path = require("path");
const fs = require("fs-extra");

class IntelligentCategorizer {
  constructor(aiProcessor, contentExtractor) {
    this.aiProcessor = aiProcessor;
    this.contentExtractor = contentExtractor;
    this.isInitialized = false;

    // نظام التصنيف متعدد المستويات
    this.categoryRules = new Map();
    this.contextualPatterns = new Map();
    this.learningData = new Map();

    // مصفوفة الثقة للتصنيفات
    this.confidenceThresholds = {
      high: 0.9,
      medium: 0.7,
      low: 0.5,
    };

    // محرك القواعد الذكية
    this.ruleEngine = {
      fileExtension: { weight: 0.3, enabled: true },
      fileName: { weight: 0.4, enabled: true },
      filePath: { weight: 0.3, enabled: true },
      fileContent: { weight: 0.6, enabled: true },
      fileMetadata: { weight: 0.2, enabled: true },
      temporalPattern: { weight: 0.15, enabled: true },
      sizeBehavior: { weight: 0.1, enabled: true },
      accessPattern: { weight: 0.2, enabled: true },
    };

    // خريطة التصنيفات الذكية
    this.smartCategories = {
      Work: {
        keywords: {
          arabic: [
            "عمل",
            "مشروع",
            "تقرير",
            "اجتماع",
            "مهمة",
            "وظيفة",
            "شركة",
            "مكتب",
            "موظف",
            "راتب",
          ],
          english: [
            "work",
            "project",
            "report",
            "meeting",
            "task",
            "job",
            "company",
            "office",
            "employee",
            "salary",
            "business",
          ],
        },
        patterns: [
          /project[\s_-]*\w+/i,
          /meeting[\s_-]*\d+/i,
          /report[\s_-]*\w+/i,
          /مشروع[\s_-]*\w+/i,
          /اجتماع[\s_-]*\w+/i,
          /تقرير[\s_-]*\w+/i,
        ],
        pathIndicators: [
          "work",
          "projects",
          "office",
          "business",
          "عمل",
          "مشاريع",
          "مكتب",
        ],
        fileTypes: ["docx", "pptx", "xlsx", "pdf"],
        confidence: 0.85,
      },

      Personal: {
        keywords: {
          arabic: [
            "شخصي",
            "عائلة",
            "صور",
            "ذكريات",
            "إجازة",
            "هواية",
            "صديق",
            "منزل",
            "طفل",
            "زواج",
          ],
          english: [
            "personal",
            "family",
            "photos",
            "memories",
            "vacation",
            "hobby",
            "friend",
            "home",
            "child",
            "wedding",
          ],
        },
        patterns: [
          /family[\s_-]*\w+/i,
          /vacation[\s_-]*\d+/i,
          /personal[\s_-]*\w+/i,
          /عائلة[\s_-]*\w+/i,
          /إجازة[\s_-]*\w+/i,
          /شخصي[\s_-]*\w+/i,
        ],
        pathIndicators: [
          "personal",
          "family",
          "photos",
          "pictures",
          "شخصي",
          "عائلة",
          "صور",
        ],
        fileTypes: ["jpg", "jpeg", "png", "mp4", "mov"],
        confidence: 0.8,
      },

      Finance: {
        keywords: {
          arabic: [
            "مالي",
            "فاتورة",
            "راتب",
            "بنك",
            "حساب",
            "ميزانية",
            "استثمار",
            "ضريبة",
            "قرض",
            "تأمين",
          ],
          english: [
            "finance",
            "invoice",
            "salary",
            "bank",
            "account",
            "budget",
            "investment",
            "tax",
            "loan",
            "insurance",
          ],
        },
        patterns: [
          /invoice[\s_-]*\d+/i,
          /bill[\s_-]*\d+/i,
          /salary[\s_-]*\w+/i,
          /فاتورة[\s_-]*\d+/i,
          /راتب[\s_-]*\w+/i,
          /ميزانية[\s_-]*\w+/i,
        ],
        pathIndicators: [
          "finance",
          "bills",
          "invoices",
          "banking",
          "مالي",
          "فواتير",
          "بنك",
        ],
        fileTypes: ["pdf", "xlsx", "csv"],
        confidence: 0.9,
      },

      Education: {
        keywords: {
          arabic: [
            "تعليم",
            "دراسة",
            "جامعة",
            "كلية",
            "مدرسة",
            "أستاذ",
            "طالب",
            "امتحان",
            "واجب",
            "بحث",
          ],
          english: [
            "education",
            "study",
            "university",
            "college",
            "school",
            "professor",
            "student",
            "exam",
            "homework",
            "research",
          ],
        },
        patterns: [
          /course[\s_-]*\w+/i,
          /lecture[\s_-]*\d+/i,
          /assignment[\s_-]*\w+/i,
          /دورة[\s_-]*\w+/i,
          /محاضرة[\s_-]*\d+/i,
          /واجب[\s_-]*\w+/i,
        ],
        pathIndicators: [
          "education",
          "courses",
          "lectures",
          "university",
          "تعليم",
          "دورات",
          "جامعة",
        ],
        fileTypes: ["pdf", "docx", "pptx"],
        confidence: 0.85,
      },

      Development: {
        keywords: {
          arabic: [
            "برمجة",
            "تطوير",
            "كود",
            "موقع",
            "تطبيق",
            "برنامج",
            "قاعدة بيانات",
            "خادم",
            "واجهة",
          ],
          english: [
            "development",
            "programming",
            "code",
            "website",
            "app",
            "software",
            "database",
            "server",
            "api",
            "frontend",
            "backend",
          ],
        },
        patterns: [
          /src[\s_\/]*\w+/i,
          /code[\s_-]*\w+/i,
          /project[\s_-]*\w+/i,
          /كود[\s_-]*\w+/i,
          /تطوير[\s_-]*\w+/i,
          /موقع[\s_-]*\w+/i,
        ],
        pathIndicators: [
          "development",
          "projects",
          "src",
          "code",
          "programming",
          "تطوير",
          "برمجة",
          "كود",
        ],
        fileTypes: [
          "js",
          "jsx",
          "ts",
          "tsx",
          "py",
          "java",
          "cpp",
          "html",
          "css",
          "json",
        ],
        confidence: 0.95,
      },

      Health: {
        keywords: {
          arabic: [
            "صحة",
            "طبي",
            "دكتور",
            "مستشفى",
            "علاج",
            "دواء",
            "تحليل",
            "أشعة",
            "وصفة",
            "تأمين صحي",
          ],
          english: [
            "health",
            "medical",
            "doctor",
            "hospital",
            "treatment",
            "medicine",
            "analysis",
            "prescription",
            "insurance",
          ],
        },
        patterns: [
          /medical[\s_-]*\w+/i,
          /doctor[\s_-]*\w+/i,
          /prescription[\s_-]*\d+/i,
          /طبي[\s_-]*\w+/i,
          /دكتور[\s_-]*\w+/i,
          /وصفة[\s_-]*\w+/i,
        ],
        pathIndicators: [
          "health",
          "medical",
          "doctors",
          "hospital",
          "صحة",
          "طبي",
          "مستشفى",
        ],
        fileTypes: ["pdf", "jpg", "jpeg", "png"],
        confidence: 0.88,
      },

      Legal: {
        keywords: {
          arabic: [
            "قانوني",
            "عقد",
            "اتفاقية",
            "محكمة",
            "محامي",
            "قاضي",
            "دعوى",
            "حكم",
            "وثيقة رسمية",
          ],
          english: [
            "legal",
            "contract",
            "agreement",
            "court",
            "lawyer",
            "judge",
            "lawsuit",
            "judgment",
            "document",
          ],
        },
        patterns: [
          /contract[\s_-]*\w+/i,
          /agreement[\s_-]*\d+/i,
          /legal[\s_-]*\w+/i,
          /عقد[\s_-]*\w+/i,
          /اتفاقية[\s_-]*\w+/i,
          /قانوني[\s_-]*\w+/i,
        ],
        pathIndicators: [
          "legal",
          "contracts",
          "agreements",
          "court",
          "قانوني",
          "عقود",
          "محكمة",
        ],
        fileTypes: ["pdf", "docx"],
        confidence: 0.92,
      },

      Media: {
        keywords: {
          arabic: [
            "صورة",
            "فيديو",
            "موسيقى",
            "فيلم",
            "أغنية",
            "تسجيل",
            "صوت",
            "ميديا",
            "وسائط",
          ],
          english: [
            "image",
            "video",
            "music",
            "movie",
            "song",
            "recording",
            "audio",
            "media",
            "photo",
          ],
        },
        patterns: [
          /img[\s_-]*\d+/i,
          /video[\s_-]*\d+/i,
          /music[\s_-]*\w+/i,
          /صورة[\s_-]*\d+/i,
          /فيديو[\s_-]*\d+/i,
          /موسيقى[\s_-]*\w+/i,
        ],
        pathIndicators: [
          "media",
          "photos",
          "videos",
          "music",
          "images",
          "صور",
          "فيديوهات",
          "موسيقى",
        ],
        fileTypes: ["jpg", "jpeg", "png", "gif", "mp4", "mov", "mp3", "wav"],
        confidence: 0.9,
      },

      System: {
        keywords: {
          arabic: [
            "نظام",
            "تكوين",
            "إعدادات",
            "نسخة احتياطية",
            "سجل",
            "خطأ",
            "تحديث",
            "تثبيت",
          ],
          english: [
            "system",
            "config",
            "settings",
            "backup",
            "log",
            "error",
            "update",
            "install",
            "cache",
          ],
        },
        patterns: [
          /config[\s_-]*\w+/i,
          /system[\s_-]*\w+/i,
          /backup[\s_-]*\d+/i,
          /تكوين[\s_-]*\w+/i,
          /نظام[\s_-]*\w+/i,
          /نسخة[\s_-]*احتياطية/i,
        ],
        pathIndicators: [
          "system",
          "config",
          "backup",
          "logs",
          "temp",
          "نظام",
          "إعدادات",
          "نسخ",
        ],
        fileTypes: ["log", "cfg", "ini", "db", "bak"],
        confidence: 0.85,
      },
    };

    // خوارزميات التعلم التكيفي
    this.adaptiveLearning = {
      userCorrections: new Map(),
      patternEvolution: new Map(),
      contextMemory: new Map(),
      temporalLearning: new Map(),
    };
  }

  async initialize() {
    try {
      console.log("🧠 تهيئة نظام التصنيف الذكي...");

      // تهيئة قواعد السياق
      await this.initializeContextualRules();

      // تحميل بيانات التعلم السابقة
      await this.loadLearningData();

      // تحسين نماذج التصنيف
      await this.optimizeCategorizationModels();

      this.isInitialized = true;
      console.log("✅ نظام التصنيف الذكي جاهز");
    } catch (error) {
      console.error("❌ خطأ في تهيئة نظام التصنيف:", error);
      throw error;
    }
  }

  // تهيئة قواعد السياق
  async initializeContextualRules() {
    // قواعد السياق الزمني
    this.contextualPatterns.set("temporal", {
      workHours: { start: 8, end: 18, category: "Work", boost: 0.3 },
      eveningPersonal: { start: 18, end: 23, category: "Personal", boost: 0.2 },
      weekendPersonal: { days: [5, 6], category: "Personal", boost: 0.25 },
    });

    // قواعد السياق المكاني
    this.contextualPatterns.set("location", {
      desktopWork: { path: "desktop", category: "Work", boost: 0.2 },
      documentsOfficial: { path: "documents", category: "Work", boost: 0.15 },
      picturesPersonal: { path: "pictures", category: "Personal", boost: 0.3 },
    });

    // قواعد السياق الحجمي
    this.contextualPatterns.set("size", {
      largeMedia: { minSize: 100 * 1024 * 1024, category: "Media", boost: 0.2 },
      smallConfig: { maxSize: 1024 * 1024, category: "System", boost: 0.15 },
    });
  }

  // تحميل بيانات التعلم
  async loadLearningData() {
    try {
      // محاولة تحميل بيانات التعلم المحفوظة
      const learningDataPath = path.join(
        process.cwd(),
        "data",
        "learning.json",
      );

      if (await fs.pathExists(learningDataPath)) {
        const data = await fs.readJson(learningDataPath);

        // استعادة تصحيحات المستخدم
        if (data.userCorrections) {
          this.adaptiveLearning.userCorrections = new Map(data.userCorrections);
        }

        // استعادة تطور الأنماط
        if (data.patternEvolution) {
          this.adaptiveLearning.patternEvolution = new Map(
            data.patternEvolution,
          );
        }

        console.log("📚 تم تحميل بيانات التعلم السابقة");
      }
    } catch (error) {
      console.log("⚠️ لم يتم العثور على بيانات تعلم سابقة، بدء بنموذج جديد");
    }
  }

  // حفظ بيانات التعلم
  async saveLearningData() {
    try {
      const learningDataPath = path.join(
        process.cwd(),
        "data",
        "learning.json",
      );
      await fs.ensureDir(path.dirname(learningDataPath));

      const data = {
        userCorrections: Array.from(
          this.adaptiveLearning.userCorrections.entries(),
        ),
        patternEvolution: Array.from(
          this.adaptiveLearning.patternEvolution.entries(),
        ),
        savedAt: new Date().toISOString(),
      };

      await fs.writeJson(learningDataPath, data, { spaces: 2 });
      console.log("💾 تم حفظ بيانات التعلم");
    } catch (error) {
      console.error("❌ خطأ في حفظ بيانات التعلم:", error);
    }
  }

  // تحسين نماذج التصنيف
  async optimizeCategorizationModels() {
    // تحليل الأنماط المكتشفة وتحسين الأوزان
    for (const [category, data] of Object.entries(this.smartCategories)) {
      const corrections =
        this.adaptiveLearning.userCorrections.get(category) || [];

      if (corrections.length > 10) {
        // تحسين الكلمات المفتاحية بناءً على التصحيحات
        const positiveKeywords = corrections
          .filter((c) => c.correct)
          .map((c) => c.keywords)
          .flat();

        const negativeKeywords = corrections
          .filter((c) => !c.correct)
          .map((c) => c.keywords)
          .flat();

        // تعزيز الكلمات الإيجابية
        positiveKeywords.forEach((keyword) => {
          if (
            !data.keywords.arabic.includes(keyword) &&
            !data.keywords.english.includes(keyword)
          ) {
            // إضافة كلمة مفتاحية جديدة
            const isArabic = /[\u0600-\u06FF]/.test(keyword);
            if (isArabic) {
              data.keywords.arabic.push(keyword);
            } else {
              data.keywords.english.push(keyword);
            }
          }
        });

        // تحسين مستوى الثقة
        const accuracy =
          corrections.filter((c) => c.correct).length / corrections.length;
        data.confidence = Math.max(
          0.5,
          Math.min(0.99, data.confidence * accuracy + 0.1),
        );
      }
    }
  }

  // التصنيف الذكي الرئيسي
  async categorizeFile(fileInfo, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🔍 تصنيف الملف: ${fileInfo.name}`);

      // تجميع نقاط التصنيف من مصادر متعددة
      const categoryScores = new Map();

      // 1. تحليل امتداد الملف
      const extensionScore = this.analyzeFileExtension(fileInfo);
      this.mergeScores(
        categoryScores,
        extensionScore,
        this.ruleEngine.fileExtension.weight,
      );

      // 2. تحليل اسم الملف
      const nameScore = this.analyzeFileName(fileInfo.name);
      this.mergeScores(
        categoryScores,
        nameScore,
        this.ruleEngine.fileName.weight,
      );

      // 3. تحليل مسار الملف
      const pathScore = this.analyzeFilePath(fileInfo.path);
      this.mergeScores(
        categoryScores,
        pathScore,
        this.ruleEngine.filePath.weight,
      );

      // 4. تحليل المحتوى (إذا كان متاحاً)
      if (fileInfo.content) {
        const contentScore = await this.analyzeFileContent(fileInfo.content);
        this.mergeScores(
          categoryScores,
          contentScore,
          this.ruleEngine.fileContent.weight,
        );
      }

      // 5. تحليل السياق الزمني
      const temporalScore = this.analyzeTemporalContext(fileInfo);
      this.mergeScores(
        categoryScores,
        temporalScore,
        this.ruleEngine.temporalPattern.weight,
      );

      // 6. تحليل سلوك الحجم
      const sizeScore = this.analyzeSizeBehavior(fileInfo);
      this.mergeScores(
        categoryScores,
        sizeScore,
        this.ruleEngine.sizeBehavior.weight,
      );

      // 7. تحليل نمط الوصول
      const accessScore = this.analyzeAccessPattern(fileInfo);
      this.mergeScores(
        categoryScores,
        accessScore,
        this.ruleEngine.accessPattern.weight,
      );

      // 8. تطبيق التعلم التكيفي
      this.applyAdaptiveLearning(categoryScores, fileInfo);

      // تحديد أفضل تصنيف
      const bestCategory = this.selectBestCategory(categoryScores);

      // حساب مستوى الثقة
      const confidence = this.calculateConfidence(bestCategory, categoryScores);

      // إنشاء نتيجة التصنيف
      const result = {
        category: bestCategory.category,
        confidence: confidence,
        reasoning: bestCategory.reasoning,
        alternativeCategories: this.getAlternativeCategories(
          categoryScores,
          bestCategory.category,
        ),
        metadata: {
          analysisTime: Date.now(),
          rulesApplied: this.getAppliedRules(categoryScores),
          adaptiveLearningUsed: this.adaptiveLearning.userCorrections.has(
            bestCategory.category,
          ),
        },
      };

      // حفظ للتعلم المستقبلي
      this.recordCategorizationAttempt(fileInfo, result);

      console.log(
        `✅ تم تصنيف ${fileInfo.name} كـ ${result.category} (ثقة: ${Math.round(result.confidence * 100)}%)`,
      );

      return result;
    } catch (error) {
      console.error(`❌ خطأ في تصنيف الملف ${fileInfo.name}:`, error);
      return {
        category: "Other",
        confidence: 0,
        reasoning: "خطأ في التحليل",
        error: error.message,
      };
    }
  }

  // تحليل امتداد الملف
  analyzeFileExtension(fileInfo) {
    const scores = new Map();
    const extension = path.extname(fileInfo.name).toLowerCase().slice(1);

    for (const [category, data] of Object.entries(this.smartCategories)) {
      if (data.fileTypes.includes(extension)) {
        const score = 0.8; // نقاط عالية للتطابق المباشر
        scores.set(category, {
          score,
          reasoning: `امتداد الملف ${extension} يطابق فئة ${category}`,
        });
      }
    }

    return scores;
  }

  // تحليل اسم الملف
  analyzeFileName(fileName) {
    const scores = new Map();
    const cleanName = fileName.toLowerCase();

    for (const [category, data] of Object.entries(this.smartCategories)) {
      let score = 0;
      const matchedKeywords = [];

      // فحص الكلمات المفتاحية العربية
      data.keywords.arabic.forEach((keyword) => {
        if (cleanName.includes(keyword.toLowerCase())) {
          score += 0.3;
          matchedKeywords.push(keyword);
        }
      });

      // فحص الكلمات المفتاحية الإنجليزية
      data.keywords.english.forEach((keyword) => {
        if (cleanName.includes(keyword.toLowerCase())) {
          score += 0.3;
          matchedKeywords.push(keyword);
        }
      });

      // فحص الأنماط النصية
      data.patterns.forEach((pattern) => {
        if (pattern.test(cleanName)) {
          score += 0.4;
          matchedKeywords.push(`نمط: ${pattern.source}`);
        }
      });

      if (score > 0) {
        scores.set(category, {
          score: Math.min(score, 1.0),
          reasoning: `اسم الملف يحتوي على: ${matchedKeywords.join(", ")}`,
        });
      }
    }

    return scores;
  }

  // تحليل مسار الملف
  analyzeFilePath(filePath) {
    const scores = new Map();
    const cleanPath = filePath.toLowerCase();

    for (const [category, data] of Object.entries(this.smartCategories)) {
      let score = 0;
      const matchedIndicators = [];

      data.pathIndicators.forEach((indicator) => {
        if (cleanPath.includes(indicator.toLowerCase())) {
          score += 0.5;
          matchedIndicators.push(indicator);
        }
      });

      if (score > 0) {
        scores.set(category, {
          score: Math.min(score, 1.0),
          reasoning: `مسار الملف يحتوي على: ${matchedIndicators.join(", ")}`,
        });
      }
    }

    return scores;
  }

  // تحليل محتوى الملف
  async analyzeFileContent(content) {
    const scores = new Map();

    if (!content || content.trim().length === 0) {
      return scores;
    }

    const cleanContent = content.toLowerCase();

    for (const [category, data] of Object.entries(this.smartCategories)) {
      let score = 0;
      const matchedElements = [];

      // تحليل الكلمات المفتاحية في المحتوى
      const arabicMatches = data.keywords.arabic.filter((keyword) =>
        cleanContent.includes(keyword.toLowerCase()),
      );

      const englishMatches = data.keywords.english.filter((keyword) =>
        cleanContent.includes(keyword.toLowerCase()),
      );

      score += arabicMatches.length * 0.1;
      score += englishMatches.length * 0.1;

      if (arabicMatches.length > 0) {
        matchedElements.push(
          `كلمات عربية: ${arabicMatches.slice(0, 3).join(", ")}`,
        );
      }

      if (englishMatches.length > 0) {
        matchedElements.push(
          `كلمات إنجليزية: ${englishMatches.slice(0, 3).join(", ")}`,
        );
      }

      // تحليل كثافة الكلمات المفتاحية
      const totalWords = cleanContent.split(/\s+/).length;
      const relevantWords = arabicMatches.length + englishMatches.length;
      const density = totalWords > 0 ? relevantWords / totalWords : 0;

      score += density * 0.5;

      if (score > 0) {
        scores.set(category, {
          score: Math.min(score, 1.0),
          reasoning: `محتوى الملف يحتوي على: ${matchedElements.join(", ")}`,
        });
      }
    }

    return scores;
  }

  // تحليل السياق الزمني
  analyzeTemporalContext(fileInfo) {
    const scores = new Map();

    if (!fileInfo.created && !fileInfo.modified) {
      return scores;
    }

    const creationDate = new Date(fileInfo.created || fileInfo.modified);
    const hour = creationDate.getHours();
    const dayOfWeek = creationDate.getDay();

    const temporalRules = this.contextualPatterns.get("temporal");

    // فحص ساعات العمل
    if (
      hour >= temporalRules.workHours.start &&
      hour <= temporalRules.workHours.end
    ) {
      scores.set(temporalRules.workHours.category, {
        score: temporalRules.workHours.boost,
        reasoning: "تم إنشاؤه خلال ساعات العمل",
      });
    }

    // فحص الأمسيات الشخصية
    if (
      hour >= temporalRules.eveningPersonal.start &&
      hour <= temporalRules.eveningPersonal.end
    ) {
      scores.set(temporalRules.eveningPersonal.category, {
        score: temporalRules.eveningPersonal.boost,
        reasoning: "تم إنشاؤه في المساء",
      });
    }

    // فحص نهايات الأسبوع
    if (temporalRules.weekendPersonal.days.includes(dayOfWeek)) {
      scores.set(temporalRules.weekendPersonal.category, {
        score: temporalRules.weekendPersonal.boost,
        reasoning: "تم إنشاؤه في نهاية الأسبوع",
      });
    }

    return scores;
  }

  // تحليل سلوك الحجم
  analyzeSizeBehavior(fileInfo) {
    const scores = new Map();

    if (!fileInfo.size) {
      return scores;
    }

    const sizeRules = this.contextualPatterns.get("size");

    // ملفات وسائط كبيرة
    if (fileInfo.size >= sizeRules.largeMedia.minSize) {
      scores.set(sizeRules.largeMedia.category, {
        score: sizeRules.largeMedia.boost,
        reasoning: "حجم كبير يشير إلى ملف وسائط",
      });
    }

    // ملفات نظام صغيرة
    if (fileInfo.size <= sizeRules.smallConfig.maxSize) {
      scores.set(sizeRules.smallConfig.category, {
        score: sizeRules.smallConfig.boost,
        reasoning: "حجم صغير يشير إلى ملف نظام",
      });
    }

    return scores;
  }

  // تحليل نمط الوصول
  analyzeAccessPattern(fileInfo) {
    const scores = new Map();

    if (!fileInfo.accessed || !fileInfo.modified) {
      return scores;
    }

    const accessTime = new Date(fileInfo.accessed);
    const modifyTime = new Date(fileInfo.modified);
    const timeDiff = accessTime.getTime() - modifyTime.getTime();

    // ملفات تم الوصول إليها مؤخراً
    if (timeDiff < 24 * 60 * 60 * 1000) {
      // أقل من يوم
      scores.set("Work", {
        score: 0.1,
        reasoning: "تم الوصول إليه مؤخراً",
      });
    }

    return scores;
  }

  // دمج النقاط
  mergeScores(targetScores, sourceScores, weight) {
    for (const [category, data] of sourceScores) {
      const weightedScore = data.score * weight;

      if (targetScores.has(category)) {
        const existing = targetScores.get(category);
        targetScores.set(category, {
          score: existing.score + weightedScore,
          reasoning: `${existing.reasoning}; ${data.reasoning}`,
        });
      } else {
        targetScores.set(category, {
          score: weightedScore,
          reasoning: data.reasoning,
        });
      }
    }
  }

  // تطبيق التعلم التكيفي
  applyAdaptiveLearning(categoryScores, fileInfo) {
    // تطبيق تصحيحات المستخدم السابقة
    for (const [category, corrections] of this.adaptiveLearning
      .userCorrections) {
      const relevantCorrections = corrections.filter((c) =>
        this.isFileRelevantToCorrection(fileInfo, c),
      );

      if (relevantCorrections.length > 0) {
        const positiveCorrections = relevantCorrections.filter(
          (c) => c.correct,
        ).length;
        const totalCorrections = relevantCorrections.length;
        const adjustmentFactor =
          (positiveCorrections / totalCorrections - 0.5) * 0.3;

        if (categoryScores.has(category)) {
          const existing = categoryScores.get(category);
          categoryScores.set(category, {
            score: Math.max(0, existing.score + adjustmentFactor),
            reasoning: `${existing.reasoning}; تعديل تكيفي بناءً على التعلم السابق`,
          });
        }
      }
    }
  }

  // فحص صلة الملف بالتصحيح
  isFileRelevantToCorrection(fileInfo, correction) {
    // فحص تشابه الاسم
    const nameSimilarity = this.calculateStringSimilarity(
      fileInfo.name.toLowerCase(),
      correction.fileName.toLowerCase(),
    );

    // فحص تشابه النوع
    const typeSimilarity = fileInfo.type === correction.fileType ? 1 : 0;

    // فحص تشابه المسار
    const pathSimilarity = this.calculateStringSimilarity(
      fileInfo.path.toLowerCase(),
      correction.filePath.toLowerCase(),
    );

    const overallSimilarity =
      (nameSimilarity + typeSimilarity + pathSimilarity) / 3;

    return overallSimilarity > 0.6;
  }

  // حساب تشابه النصوص
  calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // حساب مسافة Levenshtein
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // اختيار أفضل تصنيف
  selectBestCategory(categoryScores) {
    let bestCategory = {
      category: "Other",
      score: 0,
      reasoning: "لم يتم العثور على تطابق قوي",
    };

    for (const [category, data] of categoryScores) {
      if (data.score > bestCategory.score) {
        bestCategory = {
          category,
          score: data.score,
          reasoning: data.reasoning,
        };
      }
    }

    return bestCategory;
  }

  // حساب مستوى الثقة
  calculateConfidence(bestCategory, categoryScores) {
    const maxPossibleScore = Object.values(this.ruleEngine)
      .filter((rule) => rule.enabled)
      .reduce((sum, rule) => sum + rule.weight, 0);

    const normalizedScore = bestCategory.score / maxPossibleScore;

    // تطبيق منحنى الثقة
    const confidence = Math.min(
      0.99,
      Math.max(
        0.1,
        Math.pow(normalizedScore, 0.7) *
          this.smartCategories[bestCategory.category]?.confidence || 0.5,
      ),
    );

    return confidence;
  }

  // الحصول على تصنيفات بديلة
  getAlternativeCategories(categoryScores, selectedCategory) {
    return Array.from(categoryScores.entries())
      .filter(([category, _]) => category !== selectedCategory)
      .sort(([, a], [, b]) => b.score - a.score)
      .slice(0, 3)
      .map(([category, data]) => ({
        category,
        score: data.score,
        reasoning: data.reasoning,
      }));
  }

  // الحصول على القواعد المطبقة
  getAppliedRules(categoryScores) {
    const rules = [];

    for (const [ruleName, config] of Object.entries(this.ruleEngine)) {
      if (config.enabled) {
        rules.push({
          name: ruleName,
          weight: config.weight,
          applied: true,
        });
      }
    }

    return rules;
  }

  // تسجيل محاولة التصنيف
  recordCategorizationAttempt(fileInfo, result) {
    const attempt = {
      fileName: fileInfo.name,
      fileType: fileInfo.type,
      filePath: fileInfo.path,
      predictedCategory: result.category,
      confidence: result.confidence,
      timestamp: Date.now(),
    };

    // حفظ في ذاكرة السياق للتعلم المستقبلي
    if (!this.adaptiveLearning.contextMemory.has(result.category)) {
      this.adaptiveLearning.contextMemory.set(result.category, []);
    }

    this.adaptiveLearning.contextMemory.get(result.category).push(attempt);

    // الاحتفاظ بآخر 100 محاولة لكل فئة
    const attempts = this.adaptiveLearning.contextMemory.get(result.category);
    if (attempts.length > 100) {
      attempts.splice(0, attempts.length - 100);
    }
  }

  // تعلم من تصحيح المستخدم
  async learnFromUserCorrection(
    fileInfo,
    predictedCategory,
    correctCategory,
    confidence,
  ) {
    console.log(
      `📚 تعلم من تصحيح المستخدم: ${fileInfo.name} من ${predictedCategory} إلى ${correctCategory}`,
    );

    const correction = {
      fileName: fileInfo.name,
      fileType: fileInfo.type,
      filePath: fileInfo.path,
      predictedCategory,
      correctCategory,
      originalConfidence: confidence,
      correct: predictedCategory === correctCategory,
      timestamp: Date.now(),
      keywords: this.extractRelevantKeywords(fileInfo),
    };

    // حفظ التصحيح
    if (!this.adaptiveLearning.userCorrections.has(correctCategory)) {
      this.adaptiveLearning.userCorrections.set(correctCategory, []);
    }

    this.adaptiveLearning.userCorrections.get(correctCategory).push(correction);

    // تحديث أنماط التطور
    this.updatePatternEvolution(correction);

    // إعادة تحسين النماذج
    await this.optimizeCategorizationModels();

    // حفظ بيانات التعلم
    await this.saveLearningData();

    console.log("✅ تم حفظ التصحيح وتحديث النموذج");
  }

  // استخراج الكلمات المفتاحية ذات الصلة
  extractRelevantKeywords(fileInfo) {
    const keywords = [];

    // من اسم الملف
    const nameWords = fileInfo.name
      .toLowerCase()
      .split(/[\s_.-]+/)
      .filter((word) => word.length > 2);
    keywords.push(...nameWords);

    // من مسار الملف
    const pathWords = fileInfo.path
      .toLowerCase()
      .split(/[\/\\]/)
      .filter((word) => word.length > 2);
    keywords.push(...pathWords);

    // من المحتوى (إذا كان متاحاً)
    if (fileInfo.content) {
      const contentWords =
        fileInfo.content.toLowerCase().match(/[\u0600-\u06FF\w]{3,}/g) || [];
      keywords.push(...contentWords.slice(0, 10)); // أهم 10 كلمات
    }

    return [...new Set(keywords)]; // إزالة التكرارات
  }

  // تحديث تطور الأنماط
  updatePatternEvolution(correction) {
    const patternKey = `${correction.fileType}_${correction.correctCategory}`;

    if (!this.adaptiveLearning.patternEvolution.has(patternKey)) {
      this.adaptiveLearning.patternEvolution.set(patternKey, {
        totalCorrections: 0,
        accuracyTrend: [],
        commonKeywords: new Map(),
        pathPatterns: new Map(),
      });
    }

    const pattern = this.adaptiveLearning.patternEvolution.get(patternKey);
    pattern.totalCorrections++;

    // تتبع اتجاه الدقة
    pattern.accuracyTrend.push({
      correct: correction.correct,
      confidence: correction.originalConfidence,
      timestamp: correction.timestamp,
    });

    // تتبع الكلمات المفتاحية الشائعة
    correction.keywords.forEach((keyword) => {
      const count = pattern.commonKeywords.get(keyword) || 0;
      pattern.commonKeywords.set(keyword, count + 1);
    });

    // تتبع أنماط المسار
    const pathPattern = this.extractPathPattern(correction.filePath);
    const pathCount = pattern.pathPatterns.get(pathPattern) || 0;
    pattern.pathPatterns.set(pathPattern, pathCount + 1);

    // الاحتفاظ بآخر 50 تصحيح
    if (pattern.accuracyTrend.length > 50) {
      pattern.accuracyTrend.splice(0, pattern.accuracyTrend.length - 50);
    }
  }

  // استخراج نمط المسار
  extractPathPattern(filePath) {
    return filePath
      .toLowerCase()
      .split(/[\/\\]/)
      .filter((part) => part.length > 0)
      .slice(0, 3) // أول 3 مستويات
      .join("/");
  }

  // تصنيف دفعي للملفات
  async categorizeBatch(files, progressCallback = null) {
    console.log(`🔄 بدء التصنيف الدفعي لـ ${files.length} ملف`);

    const results = [];
    const batchSize = 10;

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);

      const batchPromises = batch.map(async (file) => {
        try {
          const result = await this.categorizeFile(file);
          return { file, result, success: true };
        } catch (error) {
          return { file, error: error.message, success: false };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      if (progressCallback) {
        progressCallback({
          completed: Math.min(i + batchSize, files.length),
          total: files.length,
          progress:
            (Math.min(i + batchSize, files.length) / files.length) * 100,
        });
      }

      // استراحة قصيرة لمنع إرهاق النظام
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `✅ اكتمل التصنيف الدفعي: ${results.filter((r) => r.success).length} نجح، ${results.filter((r) => !r.success).length} فشل`,
    );

    return results;
  }

  // الحصول على إحصائيات النظام
  getSystemStats() {
    const stats = {
      isInitialized: this.isInitialized,
      categoriesAvailable: Object.keys(this.smartCategories).length,
      rulesEnabled: Object.values(this.ruleEngine).filter((r) => r.enabled)
        .length,
      totalRules: Object.keys(this.ruleEngine).length,
      learningData: {
        userCorrections: this.adaptiveLearning.userCorrections.size,
        patternEvolution: this.adaptiveLearning.patternEvolution.size,
        contextMemory: this.adaptiveLearning.contextMemory.size,
        totalCorrections: Array.from(
          this.adaptiveLearning.userCorrections.values(),
        ).reduce((sum, corrections) => sum + corrections.length, 0),
      },
      confidenceThresholds: this.confidenceThresholds,
      version: "3.0-Advanced-ML",
    };

    return stats;
  }

  // تحديث إعدادات النظام
  updateSettings(newSettings) {
    if (newSettings.confidenceThresholds) {
      this.confidenceThresholds = {
        ...this.confidenceThresholds,
        ...newSettings.confidenceThresholds,
      };
    }

    if (newSettings.ruleEngine) {
      Object.keys(newSettings.ruleEngine).forEach((rule) => {
        if (this.ruleEngine[rule]) {
          this.ruleEngine[rule] = {
            ...this.ruleEngine[rule],
            ...newSettings.ruleEngine[rule],
          };
        }
      });
    }

    console.log("⚙️ تم تحديث إعدادات نظام التصنيف");
  }
}

module.exports = IntelligentCategorizer;
