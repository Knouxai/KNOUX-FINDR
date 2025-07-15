const { NlpManager } = require("node-nlp");
const compromise = require("compromise");
const franc = require("franc");
const fs = require("fs-extra");
const path = require("path");
const mammoth = require("mammoth");
const pdf = require("pdf-parse");
const crypto = require("crypto");
const IntelligentCategorizer = require("./intelligentCategorizer");
const AdvancedDuplicateDetector = require("./advancedDuplicateDetector");

class AIProcessor {
  constructor(database, contentExtractor) {
    this.nlpManager = null;
    this.isInitialized = false;
    this.categories = new Map();
    this.keywordPatterns = new Map();
    this.documentClassifier = null;
    this.database = database;
    this.contentExtractor = contentExtractor;

    // محركات الذكاء الاصطناعي المتقدمة
    this.intelligentCategorizer = new IntelligentCategorizer(this, contentExtractor);
    this.duplicateDetector = new AdvancedDuplicateDetector(database, contentExtractor);

    // محرك التحليل الدلالي المتقدم
    this.semanticAnalyzer = {
      vectorCache: new Map(),
      similarityMatrix: new Map(),
      conceptExtractor: new Map(),
      contextAnalyzer: new Map()
    };

    // نظام التعلم العميق المبسط
    this.deepLearning = {
      patterns: new Map(),
      weights: new Map(),
      biases: new Map(),
      activationHistory: new Map()
    };

    // معالج المشاعر والسياق
    this.emotionAnalyzer = {
      emotionPatterns: new Map(),
      contextualClues: new Map(),
      sentimentHistory: new Map()
    };

    // Initialize category patterns
    this.initializeCategoryPatterns();
    this.initializeAdvancedFeatures();
  }

    // تهيئة الميزات المتقدمة
  initializeAdvancedFeatures() {
    // تهيئة أنماط المشاعر
    this.emotionAnalyzer.emotionPatterns.set('positive', [
      /سعيد|فرح|رائع|ممتاز|جميل|نجاح/gi,
      /happy|joy|great|excellent|beautiful|success|amazing|wonderful/gi
    ]);

    this.emotionAnalyzer.emotionPatterns.set('negative', [
      /حزين|زعلان|سيء|فشل|مشكلة|خطأ/gi,
      /sad|angry|bad|fail|problem|error|terrible|awful/gi
    ]);

    this.emotionAnalyzer.emotionPatterns.set('neutral', [
      /عادي|طبيعي|مقبول|متوسط/gi,
      /normal|regular|average|standard|typical/gi
    ]);

    // تهيئة معالج المفاهيم
    this.semanticAnalyzer.conceptExtractor.set('work_concepts', [
      'عمل', 'مشروع', 'شركة', 'موظف', 'راتب', 'اجتماع',
      'work', 'project', 'company', 'employee', 'salary', 'meeting'
    ]);

    this.semanticAnalyzer.conceptExtractor.set('personal_concepts', [
      'شخصي', 'عائلة', 'صديق', 'إجازة', 'هواية', 'منزل',
      'personal', 'family', 'friend', 'vacation', 'hobby', 'home'
    ]);
  }

  async initialize() {
    try {
      console.log("🧠 تهيئة نظام الذكاء الاصطناعي المتقدم...");

      // Initialize NLP Manager with Arabic and English support
      this.nlpManager = new NlpManager({
        languages: ["ar", "en"],
        forceNER: true,
        nluThreshold: 0.7,
        autoSave: false
      });

      // Train the model with predefined patterns
      await this.trainModel();

      // Train and save the model
      await this.nlpManager.train();

      // تهيئة المحركات المتقدمة
      await this.intelligentCategorizer.initialize();

      // تهيئة معالج التحليل الدلالي
      await this.initializeSemanticAnalysis();

      this.isInitialized = true;
      console.log("✅ تم تهيئة نظام الذكاء الاصطناعي بنجاح");
    } catch (error) {
      console.error("❌ خطأ في تهيئة AI:", error);
      throw error;
    }
  }

  // تهيئة التحليل الدلالي
  async initializeSemanticAnalysis() {
    console.log("📊 تهيئة محرك التحليل الدلالي...");

    // بناء مصفوفة التشابه الأولية
    const concepts = [
      { word: 'عمل', vector: [0.8, 0.2, 0.1, 0.9, 0.3] },
      { word: 'شخصي', vector: [0.2, 0.9, 0.8, 0.1, 0.7] },
      { word: 'مالي', vector: [0.9, 0.1, 0.2, 0.8, 0.4] },
      { word: 'تعليمي', vector: [0.4, 0.7, 0.9, 0.3, 0.8] },
      { word: 'work', vector: [0.8, 0.2, 0.1, 0.9, 0.3] },
      { word: 'personal', vector: [0.2, 0.9, 0.8, 0.1, 0.7] },
      { word: 'finance', vector: [0.9, 0.1, 0.2, 0.8, 0.4] },
      { word: 'education', vector: [0.4, 0.7, 0.9, 0.3, 0.8] }
    ];

    concepts.forEach(concept => {
      this.semanticAnalyzer.vectorCache.set(concept.word, concept.vector);
    });

    console.log("✅ تم تهيئة محرك التحليل الدلالي");
  }

  initializeCategoryPatterns() {
    // Define category patterns for automatic classification
    this.categories.set("Finance", {
      keywords: [
        "invoice",
        "bill",
        "payment",
        "salary",
        "budget",
        "expense",
        "فاتورة",
        "راتب",
        "مصروف",
        "ميزانية",
      ],
      patterns: [/invoice[\s_-]*\d+/i, /bill[\s_-]*\d+/i, /فاتورة[\s_-]*\d+/i],
      confidence: 0.8,
    });

    this.categories.set("Work", {
      keywords: [
        "meeting",
        "project",
        "task",
        "deadline",
        "report",
        "presentation",
        "اجتماع",
        "مشروع",
        "مهمة",
        "تقرير",
        "عرض",
      ],
      patterns: [
        /project[\s_-]*\w+/i,
        /meeting[\s_-]*\d+/i,
        /مشروع[\s_-]*\w+/i,
      ],
      confidence: 0.7,
    });

    this.categories.set("Personal", {
      keywords: [
        "personal",
        "family",
        "vacation",
        "photo",
        "diary",
        "شخصي",
        "عائلة",
        "إجازة",
        "صورة",
        "مذكرات",
      ],
      patterns: [
        /family[\s_-]*\w+/i,
        /vacation[\s_-]*\d+/i,
        /عائلة[\s_-]*\w+/i,
      ],
      confidence: 0.6,
    });

    this.categories.set("Education", {
      keywords: [
        "course",
        "tutorial",
        "lesson",
        "study",
        "homework",
        "exam",
        "دورة",
        "درس",
        "دراسة",
        "واجب",
        "امتحان",
      ],
      patterns: [/course[\s_-]*\w+/i, /lesson[\s_-]*\d+/i, /دورة[\s_-]*\w+/i],
      confidence: 0.7,
    });

    this.categories.set("Health", {
      keywords: [
        "medical",
        "doctor",
        "prescription",
        "health",
        "medicine",
        "طبي",
        "دكتور",
        "وصفة",
        "صحة",
        "دواء",
      ],
      patterns: [
        /medical[\s_-]*\w+/i,
        /prescription[\s_-]*\d+/i,
        /طبي[\s_-]*\w+/i,
      ],
      confidence: 0.8,
    });

    this.categories.set("Legal", {
      keywords: [
        "contract",
        "agreement",
        "legal",
        "law",
        "court",
        "عقد",
        "اتفاقية",
        "قانوني",
        "محكمة",
      ],
      patterns: [
        /contract[\s_-]*\w+/i,
        /agreement[\s_-]*\d+/i,
        /عقد[\s_-]*\w+/i,
      ],
      confidence: 0.9,
    });
  }

  async trainModel() {
    // Add training data for document classification
    const trainingData = [
      // English training data
      { text: "invoice payment due date", category: "Finance" },
      { text: "meeting agenda project timeline", category: "Work" },
      { text: "family vacation photos memories", category: "Personal" },
      { text: "course material tutorial video", category: "Education" },
      { text: "medical prescription doctor appointment", category: "Health" },
      { text: "contract agreement legal document", category: "Legal" },

      // Arabic training data
      { text: "فاتورة دفع تاريخ استحقاق", category: "Finance" },
      { text: "اجتماع جدول أعمال مشروع", category: "Work" },
      { text: "عائلة إجازة صور ذكريات", category: "Personal" },
      { text: "دورة مادة تعليمية فيديو", category: "Education" },
      { text: "طبي وصفة موعد دكتور", category: "Health" },
      { text: "عقد اتفاقية وثيقة قانونية", category: "Legal" },
    ];

    // Train the NLP model
    for (const data of trainingData) {
      this.nlpManager.addDocument("ar", data.text, data.category);
      this.nlpManager.addDocument("en", data.text, data.category);
    }

    // Add named entity recognition
    this.nlpManager.addNamedEntityText("ar", "date", [
      "تاريخ",
      "يوم",
      "شهر",
      "سنة",
    ]);
    this.nlpManager.addNamedEntityText("en", "date", [
      "date",
      "day",
      "month",
      "year",
    ]);

    this.nlpManager.addNamedEntityText("ar", "money", [
      "ريال",
      "دولار",
      "درهم",
      "دينار",
    ]);
    this.nlpManager.addNamedEntityText("en", "money", [
      "dollar",
      "euro",
      "pound",
      "riyal",
    ]);
  }

  async extractTextFromFile(filePath) {
    try {
      const extension = path.extname(filePath).toLowerCase();
      let extractedText = "";

      switch (extension) {
        case ".pdf":
          extractedText = await this.extractFromPDF(filePath);
          break;
        case ".doc":
        case ".docx":
          extractedText = await this.extractFromWord(filePath);
          break;
        case ".txt":
        case ".md":
        case ".json":
        case ".js":
        case ".html":
        case ".css":
        case ".xml":
          extractedText = await this.extractFromText(filePath);
          break;
        default:
          // Try to read as text for unknown file types
          try {
            extractedText = await this.extractFromText(filePath);
          } catch (error) {
            console.log(`Cannot extract text from ${extension} files`);
            return "";
          }
      }

      return extractedText;
    } catch (error) {
      console.error(`خطأ في استخراج النص من ${filePath}:`, error.message);
      return "";
    }
  }

  async extractFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error("PDF extraction error:", error);
      return "";
    }
  }

  async extractFromWord(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      console.error("Word extraction error:", error);
      return "";
    }
  }

  async extractFromText(filePath) {
    try {
      const content = await fs.readFile(filePath, "utf8");
      return content;
    } catch (error) {
      console.error("Text extraction error:", error);
      return "";
    }
  }

    // تحليل متقدم لمحتوى الملف
  async analyzeFileContent(filePath) {
    if (!this.isInitialized) {
      throw new Error("AI system not initialized");
    }

    try {
      console.log(`📊 تحليل متقدم للملف: ${path.basename(filePath)}`);

      // Extract text content
      const content = await this.extractTextFromFile(filePath);
      if (!content.trim()) {
        return {
          category: "Unknown",
          confidence: 0,
          keywords: [],
          language: "unknown",
          summary: "",
          entities: [],
          semanticProfile: {},
          emotionalTone: 'neutral',
          complexity: 0,
          topics: []
        };
      }

      // معلومات الملف الأساسية
      const fileInfo = {
        name: path.basename(filePath),
        path: filePath,
        type: path.extname(filePath).slice(1).toLowerCase(),
        content: content
      };

      // Detect language with enhanced accuracy
      const language = this.detectLanguageEnhanced(content);
      const langCode = language === "ara" ? "ar" : "en";

      // تحليل NLP متقدم
      const analysis = await this.nlpManager.process(langCode, content);

      // استخراج الكلمات المفتاحية المحسن
      const keywords = await this.extractAdvancedKeywords(content, langCode);

      // تحليل المواضيع
      const topics = await this.extractTopics(content, langCode);

      // تحليل المشاعر
      const emotionalTone = this.analyzeEmotionalTone(content);

      // حساب تعقيد المحتوى
      const complexity = this.calculateContentComplexity(content);

      // Generate enhanced summary
      const summary = await this.generateEnhancedSummary(content, langCode);

      // إنشاء الملف الدلالي
      const semanticProfile = await this.createSemanticProfile(content, keywords, topics);

      // تصنيف ذكي محسن
      const categoryResult = await this.intelligentCategorizer.categorizeFile(fileInfo);

      return {
        category: categoryResult.category,
        confidence: categoryResult.confidence,
        keywords: keywords,
        language: langCode,
        summary: summary,
        entities: analysis.entities || [],
        sentiment: analysis.sentiment || { score: 0, label: "neutral" },
        wordCount: content.split(/\s+/).length,
        readingTime: Math.ceil(content.split(/\s+/).length / 200),
        semanticProfile: semanticProfile,
        emotionalTone: emotionalTone,
        complexity: complexity,
        topics: topics,
        reasoning: categoryResult.reasoning,
        alternativeCategories: categoryResult.alternativeCategories || []
      };
    } catch (error) {
      console.error("❌ خطأ في تحليل المحتوى:", error);
      return {
        category: "Unknown",
        confidence: 0,
        keywords: [],
        language: "unknown",
        summary: "",
        entities: [],
        error: error.message
      };
    }
  }

  // كشف اللغة المحسن
  detectLanguageEnhanced(content) {
    const arabicChars = (content.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = content.replace(/\s/g, '').length;

    if (totalChars === 0) return "unknown";

    const arabicRatio = arabicChars / totalChars;

    // استخدام معايير متعددة للكشف
    if (arabicRatio > 0.3) {
      return "ara";
    } else if (arabicRatio < 0.05) {
      // استخدام franc كنسخة احتياطية
      const francResult = franc(content, { only: ["ara", "eng"] });
      return francResult === "ara" ? "ara" : "eng";
    } else {
      return "mixed";
    }
  }

  // استخراج كلمات مفتاحية متقدم
  async extractAdvancedKeywords(content, language) {
    const keywords = [];

    // استخدام compromise للإنجليزية
    if (language === 'en') {
      const doc = compromise(content);
      const nouns = doc.nouns().out("array");
      const adjectives = doc.adjectives().out("array");
      const verbs = doc.verbs().out("array");

      keywords.push(...nouns.slice(0, 10));
      keywords.push(...adjectives.slice(0, 5));
      keywords.push(...verbs.slice(0, 5));
    }

    // استخراج يدوي للعربية
    const arabicWords = content.match(/[\u0600-\u06FF]{3,}/g) || [];
    const englishWords = content.match(/[a-zA-Z]{3,}/g) || [];

    // حساب تكرار الكلمات
    const wordFreq = new Map();

    [...arabicWords, ...englishWords].forEach(word => {
      const cleanWord = word.toLowerCase();
      if (cleanWord.length > 2) {
        wordFreq.set(cleanWord, (wordFreq.get(cleanWord) || 0) + 1);
      }
    });

    // ترتيب حسب التكرار
    const sortedWords = Array.from(wordFreq.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);

    keywords.push(...sortedWords);

    // إزالة التكرارات وإرجاع أفضل 20
    return [...new Set(keywords)].slice(0, 20);
  }

  // استخراج المواضيع
  async extractTopics(content, language) {
    const topics = [];

    // مواضيع محددة مسبقاً
    const topicPatterns = {
      'technology': /تقنية|تكنولوجيا|برمجة|كمبيوتر|technology|programming|computer|software/gi,
      'business': /عمل|بيزنس|شركة|مال|اقتصاد|business|company|finance|economy|money/gi,
      'education': /تعليم|دراسة|جامعة|مدرسة|طالب|education|study|university|school|student/gi,
      'health': /صحة|طب|مرض|علاج|دواء|health|medical|doctor|medicine|treatment/gi,
      'personal': /شخصي|عائلة|صديق|إجازة|personal|family|friend|vacation|hobby/gi
    };

    for (const [topic, pattern] of Object.entries(topicPatterns)) {
      const matches = content.match(pattern);
      if (matches && matches.length > 2) {
        topics.push({
          name: topic,
          confidence: Math.min(matches.length / 10, 1),
          keywords: [...new Set(matches.slice(0, 5))]
        });
      }
    }

    return topics.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  // تحليل المشاعر
  analyzeEmotionalTone(content) {
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    // فحص المشاعر الإيجابية
    this.emotionAnalyzer.emotionPatterns.get('positive').forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) positiveScore += matches.length;
    });

    // فحص المشاعر السلبية
    this.emotionAnalyzer.emotionPatterns.get('negative').forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) negativeScore += matches.length;
    });

    // فحص المشاعر المحايدة
    this.emotionAnalyzer.emotionPatterns.get('neutral').forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) neutralScore += matches.length;
    });

    const totalScore = positiveScore + negativeScore + neutralScore;

    if (totalScore === 0) return 'neutral';

    if (positiveScore > negativeScore && positiveScore > neutralScore) {
      return 'positive';
    } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  // حساب تعقيد المحتوى
  calculateContentComplexity(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const words = content.split(/\s+/);
    const avgWordsPerSentence = words.length / sentences.length;

    // حساب نسبة الكلمات الطويلة
    const longWords = words.filter(w => w.length > 6).length;
    const longWordRatio = longWords / words.length;

    // حساب تعقيد الجمل
    let complexityScore = 0;

    if (avgWordsPerSentence > 20) complexityScore += 0.3;
    if (longWordRatio > 0.3) complexityScore += 0.3;
    if (sentences.length > 50) complexityScore += 0.2;
    if (content.length > 5000) complexityScore += 0.2;

    return Math.min(complexityScore, 1.0);
  }

  // إنشاء ملخص محسن
  async generateEnhancedSummary(content, language) {
    const sentences = content.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);

    if (sentences.length === 0) return "";

    // اختيار أهم الجمل بناءً على الكلمات المفتاحية
    const keywords = await this.extractAdvancedKeywords(content, language);

    const sentenceScores = sentences.map(sentence => {
      let score = 0;
      keywords.forEach(keyword => {
        if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
          score += 1;
        }
      });
      return { sentence, score };
    });

    // ترتيب حسب النقاط واختيار أفضل 3
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.sentence);

    return topSentences.join(". ");
  }

  // إنشاء الملف الدلالي
  async createSemanticProfile(content, keywords, topics) {
    const profile = {
      conceptVector: [],
      semanticDensity: 0,
      topicalCoherence: 0,
      abstractionLevel: 0
    };

    // حساب المتجه المفاهيمي
    const conceptCounts = new Map();

    this.semanticAnalyzer.conceptExtractor.forEach((concepts, category) => {
      let count = 0;
      concepts.forEach(concept => {
        if (content.toLowerCase().includes(concept.toLowerCase())) {
          count++;
        }
      });
      conceptCounts.set(category, count);
    });

    // تحويل إلى متجه
    profile.conceptVector = Array.from(conceptCounts.values());

    // حساب الكثافة الدلالية
    const totalWords = content.split(/\s+/).length;
    const conceptWords = keywords.length;
    profile.semanticDensity = conceptWords / totalWords;

    // حساب ترابط المواضيع
    if (topics.length > 0) {
      const avgConfidence = topics.reduce((sum, topic) => sum + topic.confidence, 0) / topics.length;
      profile.topicalCoherence = avgConfidence;
    }

    // حساب مستوى التجريد
    const abstractWords = keywords.filter(word =>
      word.length > 6 && !\/[\u0600-\u06FF0-9]/g.test(word)
    ).length;
    profile.abstractionLevel = abstractWords / keywords.length;

    return profile;
  }

  classifyContent(content, fileName) {
    const text = (content + " " + fileName).toLowerCase();
    let bestMatch = { name: "Other", confidence: 0 };

    for (const [categoryName, categoryData] of this.categories) {
      let score = 0;
      let matches = 0;

      // Check keywords
      for (const keyword of categoryData.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += 1;
          matches++;
        }
      }

      // Check patterns
      for (const pattern of categoryData.patterns) {
        if (pattern.test(text)) {
          score += 2;
          matches++;
        }
      }

      // Calculate confidence
      const confidence = Math.min(
        (score / categoryData.keywords.length) * categoryData.confidence,
        1,
      );

      if (confidence > bestMatch.confidence) {
        bestMatch = { name: categoryName, confidence };
      }
    }

    return bestMatch;
  }

  async categorizeFiles(files) {
    const categorizedFiles = [];

    for (const file of files) {
      try {
        const analysis = await this.analyzeFileContent(file.path);

        categorizedFiles.push({
          id: file.id,
          path: file.path,
          category: analysis.category,
          confidence: analysis.confidence,
          tags: analysis.keywords.slice(0, 10), // Top 10 keywords as tags
          analysis: analysis,
        });

        // Add small delay to prevent overwhelming the system
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error categorizing file ${file.path}:`, error);
        categorizedFiles.push({
          id: file.id,
          path: file.path,
          category: "Unknown",
          confidence: 0,
          tags: [],
          analysis: null,
        });
      }
    }

    return categorizedFiles;
  }

  async enhanceSearchResults(query, results) {
    if (!this.isInitialized || results.length === 0) {
      return results;
    }

    try {
      // Analyze search query
      const queryAnalysis = await this.nlpManager.process("ar", query);
      const queryKeywords = compromise(query).nouns().out("array");

      // Score and re-rank results
      const enhancedResults = await Promise.all(
        results.map(async (result) => {
          let relevanceScore = 0;

          // Content similarity scoring
          if (result.extracted_text) {
            const contentKeywords = compromise(result.extracted_text)
              .nouns()
              .out("array");
            const commonKeywords = queryKeywords.filter((keyword) =>
              contentKeywords.some((ck) =>
                ck.toLowerCase().includes(keyword.toLowerCase()),
              ),
            );
            relevanceScore += commonKeywords.length * 0.3;
          }

          // Filename similarity
          if (result.name) {
            const nameKeywords = compromise(result.name).nouns().out("array");
            const nameMatches = queryKeywords.filter((keyword) =>
              nameKeywords.some((nk) =>
                nk.toLowerCase().includes(keyword.toLowerCase()),
              ),
            );
            relevanceScore += nameMatches.length * 0.5;
          }

          // Category relevance
          if (
            result.category &&
            queryKeywords.some((k) =>
              result.category.toLowerCase().includes(k.toLowerCase()),
            )
          ) {
            relevanceScore += 0.2;
          }

          // File type relevance
          if (result.extension && query.includes(result.extension)) {
            relevanceScore += 0.4;
          }

          return {
            ...result,
            aiRelevanceScore: relevanceScore,
            aiEnhanced: true,
          };
        }),
      );

      // Sort by AI relevance score
      enhancedResults.sort((a, b) => b.aiRelevanceScore - a.aiRelevanceScore);

      return enhancedResults;
    } catch (error) {
      console.error("Search enhancement error:", error);
      return results;
    }
  }

  async getSmartSuggestions(context) {
    if (!this.isInitialized) {
      return [];
    }

    const suggestions = [];

    try {
      // Based on recent activity
      if (context.recentSearches) {
        const recentKeywords = context.recentSearches
          .flatMap((search) => compromise(search).nouns().out("array"))
          .slice(0, 5);

        suggestions.push({
          type: "recent",
          title: "عمليات بحث حديثة",
          items: recentKeywords.map((keyword) => ({
            text: keyword,
            confidence: 0.7,
          })),
        });
      }

      // Based on file categories
      if (context.fileCategories) {
        const categoryKeywords = Object.keys(context.fileCategories)
          .filter((cat) => cat !== "Other")
          .slice(0, 5);

        suggestions.push({
          type: "categories",
          title: "التصنيفات",
          items: categoryKeywords.map((category) => ({
            text: category,
            confidence: 0.8,
          })),
        });
      }

      // Smart completion suggestions
      if (context.currentQuery) {
        const analysis = await this.nlpManager.process(
          "ar",
          context.currentQuery,
        );
        const relatedTerms = this.generateRelatedTerms(context.currentQuery);

        suggestions.push({
          type: "completion",
          title: "اقتراحات مكملة",
          items: relatedTerms.map((term) => ({
            text: term,
            confidence: 0.6,
          })),
        });
      }

      return suggestions;
    } catch (error) {
      console.error("Smart suggestions error:", error);
      return [];
    }
  }

  generateRelatedTerms(query) {
    const terms = [];
    const doc = compromise(query);

    // Extract entities and generate variations
    const nouns = doc.nouns().out("array");
    const verbs = doc.verbs().out("array");

    // Add plural/singular variations
    nouns.forEach((noun) => {
      const plural = compromise(noun).nouns().toPlural().out();
      const singular = compromise(noun).nouns().toSingular().out();
      if (plural !== noun) terms.push(plural);
      if (singular !== noun) terms.push(singular);
    });

    // Add verb variations
    verbs.forEach((verb) => {
      const past = compromise(verb).verbs().toPastTense().out();
      const present = compromise(verb).verbs().toPresentTense().out();
      if (past !== verb) terms.push(past);
      if (present !== verb) terms.push(present);
    });

    return [...new Set(terms)].slice(0, 10);
  }

  async trainFromUserFeedback(filePath, correctCategory, userTags = []) {
    try {
      const content = await this.extractTextFromFile(filePath);
      const fileName = path.basename(filePath);

      // Add this as training data
      this.nlpManager.addDocument(
        "ar",
        content + " " + fileName,
        correctCategory,
      );
      this.nlpManager.addDocument(
        "en",
        content + " " + fileName,
        correctCategory,
      );

      // Update category patterns if needed
      if (this.categories.has(correctCategory)) {
        const categoryData = this.categories.get(correctCategory);
        userTags.forEach((tag) => {
          if (!categoryData.keywords.includes(tag)) {
            categoryData.keywords.push(tag);
          }
        });
      }

      // Retrain the model
      await this.nlpManager.train();

      console.log(
        `تم تحديث النموذج بناءً على ملاحظات المستخدم: ${correctCategory}`,
      );
    } catch (error) {
      console.error("Error training from user feedback:", error);
    }
  }

  getSystemStats() {
    return {
      isInitialized: this.isInitialized,
      categoriesCount: this.categories.size,
      supportedLanguages: ["ar", "en"],
      features: {
        textExtraction: true,
        contentAnalysis: true,
        categoryClassification: true,
        keywordExtraction: true,
        languageDetection: true,
        smartSuggestions: true,
        searchEnhancement: true,
      },
    };
  }
}

module.exports = AIProcessor;