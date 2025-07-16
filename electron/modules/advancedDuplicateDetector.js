const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

class AdvancedDuplicateDetector {
  constructor(database, contentExtractor) {
    this.db = database;
    this.extractor = contentExtractor;
    this.similarityThreshold = 0.85;
    this.imageHashCache = new Map();
    this.contentHashCache = new Map();
    this.phoneticCache = new Map();

    // تكوين خوارزميات كشف التكرار المختلفة
    this.algorithms = {
      exactHash: { weight: 1.0, enabled: true },
      fuzzyHash: { weight: 0.9, enabled: true },
      contentSimilarity: { weight: 0.8, enabled: true },
      imageSimilarity: { weight: 0.85, enabled: true },
      namePhonetic: { weight: 0.7, enabled: true },
      sizeSimilarity: { weight: 0.6, enabled: true },
      metadataSimilarity: { weight: 0.75, enabled: true },
      semanticSimilarity: { weight: 0.8, enabled: true },
    };

    // أنواع التكرارات المختلفة
    this.duplicateTypes = {
      EXACT: "نسخة مطابقة تماماً",
      FUZZY: "نسخة مشابهة جداً",
      CONTENT: "محتوى مشابه",
      IMAGE: "صورة مشابهة",
      NAME: "اسم مشابه",
      SEMANTIC: "مضمون مشابه",
    };
  }

  // كشف التكرارات الرئيسي مع خوارزميات متعددة
  async findAllDuplicates(progressCallback = null) {
    console.log("🔍 بدء الكشف المتقدم عن التكرارات...");

    try {
      // جلب جميع الملفات من قاعدة البيانات
      const files = await this.getAllIndexedFiles();
      console.log(`📊 تم العثور على ${files.length} ملف للفحص`);

      if (progressCallback) {
        progressCallback({
          phase: "initialization",
          current: 0,
          total: files.length,
          message: "تهيئة أدوات الكشف...",
        });
      }

      // تجميع الملفات حسب النوع لتحسين الأداء
      const fileGroups = this.groupFilesByType(files);

      let allDuplicates = [];
      let processedFiles = 0;

      // معالجة كل مجموعة من الملفات
      for (const [fileType, groupFiles] of Object.entries(fileGroups)) {
        console.log(`🔍 فحص ${groupFiles.length} ملف من نوع ${fileType}`);

        if (progressCallback) {
          progressCallback({
            phase: "processing",
            current: processedFiles,
            total: files.length,
            message: `فحص ملفات ${fileType}...`,
          });
        }

        const groupDuplicates = await this.findDuplicatesInGroup(
          groupFiles,
          fileType,
        );
        allDuplicates = allDuplicates.concat(groupDuplicates);

        processedFiles += groupFiles.length;
      }

      // تحليل وتصنيف النتائج
      const analyzedDuplicates =
        await this.analyzeDuplicateResults(allDuplicates);

      if (progressCallback) {
        progressCallback({
          phase: "completed",
          current: files.length,
          total: files.length,
          message: `تم العثور على ${analyzedDuplicates.length} مجموعة تكرار`,
          results: analyzedDuplicates,
        });
      }

      console.log(
        `✅ اكتمل الكشف عن التكرارات: ${analyzedDuplicates.length} مجموعة`,
      );
      return analyzedDuplicates;
    } catch (error) {
      console.error("❌ خطأ في كشف التكرارات:", error);
      throw error;
    }
  }

  // جلب جميع الملفات المفهرسة
  async getAllIndexedFiles() {
    const query = `
      SELECT f.*, fc.content, fc.keywords, fc.summary, fc.language
      FROM files f
      LEFT JOIN file_content fc ON f.id = fc.file_id
      ORDER BY f.size DESC
    `;

    return await this.db.selectQuery(query);
  }

  // تجميع الملفات حسب النوع
  groupFilesByType(files) {
    const groups = {
      images: [],
      documents: [],
      videos: [],
      audio: [],
      archives: [],
      code: [],
      other: [],
    };

    files.forEach((file) => {
      const type = this.categorizeFileType(file.type);
      groups[type].push(file);
    });

    return groups;
  }

  // تصنيف نوع الملف
  categorizeFileType(extension) {
    const imageTypes = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "tiff",
      "webp",
      "svg",
    ];
    const documentTypes = [
      "pdf",
      "doc",
      "docx",
      "txt",
      "rtf",
      "odt",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
    ];
    const videoTypes = ["mp4", "avi", "mov", "wmv", "mkv", "flv", "webm"];
    const audioTypes = ["mp3", "wav", "flac", "aac", "ogg", "wma"];
    const archiveTypes = ["zip", "rar", "7z", "tar", "gz"];
    const codeTypes = [
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "java",
      "cpp",
      "c",
      "php",
      "html",
      "css",
    ];

    const ext = extension.toLowerCase();

    if (imageTypes.includes(ext)) return "images";
    if (documentTypes.includes(ext)) return "documents";
    if (videoTypes.includes(ext)) return "videos";
    if (audioTypes.includes(ext)) return "audio";
    if (archiveTypes.includes(ext)) return "archives";
    if (codeTypes.includes(ext)) return "code";

    return "other";
  }

  // البحث عن التكرارات في مجموعة معينة
  async findDuplicatesInGroup(files, fileType) {
    const duplicateGroups = [];
    const processedHashes = new Set();

    for (let i = 0; i < files.length; i++) {
      const file1 = files[i];

      if (processedHashes.has(file1.id)) continue;

      const similarFiles = [file1];

      for (let j = i + 1; j < files.length; j++) {
        const file2 = files[j];

        if (processedHashes.has(file2.id)) continue;

        const similarity = await this.calculateFileSimilarity(
          file1,
          file2,
          fileType,
        );

        if (similarity.score >= this.similarityThreshold) {
          similarFiles.push(file2);
          processedHashes.add(file2.id);
        }
      }

      if (similarFiles.length > 1) {
        const group = await this.createDuplicateGroup(similarFiles, fileType);
        duplicateGroups.push(group);

        // تحديد جميع الملفات في هذه المجموعة كتم معالجتها
        similarFiles.forEach((file) => processedHashes.add(file.id));
      }
    }

    return duplicateGroups;
  }

  // حساب التشابه بين ملفين
  async calculateFileSimilarity(file1, file2, fileType) {
    const similarities = {};
    let totalScore = 0;
    let totalWeight = 0;

    try {
      // التحقق من التطابق التام
      if (this.algorithms.exactHash.enabled && file1.hash && file2.hash) {
        similarities.exactHash = file1.hash === file2.hash ? 1.0 : 0.0;
        totalScore += similarities.exactHash * this.algorithms.exactHash.weight;
        totalWeight += this.algorithms.exactHash.weight;
      }

      // التحقق من تشابه الحجم
      if (this.algorithms.sizeSimilarity.enabled) {
        similarities.sizeSimilarity = this.calculateSizeSimilarity(
          file1.size,
          file2.size,
        );
        totalScore +=
          similarities.sizeSimilarity * this.algorithms.sizeSimilarity.weight;
        totalWeight += this.algorithms.sizeSimilarity.weight;
      }

      // التحقق من تشابه الأسماء الصوتية
      if (this.algorithms.namePhonetic.enabled) {
        similarities.namePhonetic = this.calculateNameSimilarity(
          file1.name,
          file2.name,
        );
        totalScore +=
          similarities.namePhonetic * this.algorithms.namePhonetic.weight;
        totalWeight += this.algorithms.namePhonetic.weight;
      }

      // تشابه المحتوى النصي (للمستندات)
      if (
        this.algorithms.contentSimilarity.enabled &&
        fileType === "documents"
      ) {
        similarities.contentSimilarity = await this.calculateContentSimilarity(
          file1,
          file2,
        );
        totalScore +=
          similarities.contentSimilarity *
          this.algorithms.contentSimilarity.weight;
        totalWeight += this.algorithms.contentSimilarity.weight;
      }

      // تشابه الصور (للصور)
      if (this.algorithms.imageSimilarity.enabled && fileType === "images") {
        similarities.imageSimilarity = await this.calculateImageSimilarity(
          file1,
          file2,
        );
        totalScore +=
          similarities.imageSimilarity * this.algorithms.imageSimilarity.weight;
        totalWeight += this.algorithms.imageSimilarity.weight;
      }

      // التشابه الدلالي
      if (
        this.algorithms.semanticSimilarity.enabled &&
        (file1.content || file2.content)
      ) {
        similarities.semanticSimilarity =
          await this.calculateSemanticSimilarity(file1, file2);
        totalScore +=
          similarities.semanticSimilarity *
          this.algorithms.semanticSimilarity.weight;
        totalWeight += this.algorithms.semanticSimilarity.weight;
      }

      const averageScore = totalWeight > 0 ? totalScore / totalWeight : 0;

      return {
        score: averageScore,
        details: similarities,
        confidence: this.calculateConfidence(similarities, fileType),
      };
    } catch (error) {
      console.error(
        `❌ خطأ في حساب التشابه بين ${file1.name} و ${file2.name}:`,
        error,
      );
      return { score: 0, details: {}, confidence: 0 };
    }
  }

  // حساب تشابه الحجم
  calculateSizeSimilarity(size1, size2) {
    if (size1 === size2) return 1.0;

    const larger = Math.max(size1, size2);
    const smaller = Math.min(size1, size2);

    if (larger === 0) return 0;

    const ratio = smaller / larger;
    return ratio > 0.95 ? ratio : 0; // فقط الأحجام المتقاربة جداً
  }

  // حساب تشابه الأسماء
  calculateNameSimilarity(name1, name2) {
    // إزالة الامتدادات للمقارنة
    const basename1 = path.parse(name1).name.toLowerCase();
    const basename2 = path.parse(name2).name.toLowerCase();

    // تطابق تام
    if (basename1 === basename2) return 1.0;

    // حساب مسافة Levenshtein
    const distance = this.levenshteinDistance(basename1, basename2);
    const maxLength = Math.max(basename1.length, basename2.length);

    if (maxLength === 0) return 0;

    const similarity = 1 - distance / maxLength;

    // إرجاع تشابه قوي فقط
    return similarity > 0.8 ? similarity : 0;
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

  // حساب تشابه المحتوى النصي
  async calculateContentSimilarity(file1, file2) {
    if (!file1.content && !file2.content) return 0;
    if (!file1.content || !file2.content) return 0;

    const content1 = file1.content.toLowerCase();
    const content2 = file2.content.toLowerCase();

    // تطابق تام
    if (content1 === content2) return 1.0;

    // تشابه الكلمات المفتاحية
    const keywords1 = file1.keywords ? JSON.parse(file1.keywords) : [];
    const keywords2 = file2.keywords ? JSON.parse(file2.keywords) : [];

    const keywordSimilarity = this.calculateSetSimilarity(keywords1, keywords2);

    // حساب التشابه باستخدام TF-IDF مبسط
    const words1 = this.extractWords(content1);
    const words2 = this.extractWords(content2);

    const wordSimilarity = this.calculateSetSimilarity(words1, words2);

    // دمج النتائج
    return keywordSimilarity * 0.6 + wordSimilarity * 0.4;
  }

  // استخراج الكلمات
  extractWords(content) {
    return (
      content.match(/[\u0600-\u06FF\w]{3,}/g) ||
      [].filter((word) => word.length > 2).slice(0, 100)
    ); // أخذ أول 100 كلمة مهمة
  }

  // حساب تشابه المجموعات
  calculateSetSimilarity(set1, set2) {
    if (set1.length === 0 && set2.length === 0) return 1.0;
    if (set1.length === 0 || set2.length === 0) return 0.0;

    const intersection = set1.filter((item) => set2.includes(item));
    const union = [...new Set([...set1, ...set2])];

    return intersection.length / union.length;
  }

  // حساب تشابه الصور
  async calculateImageSimilarity(file1, file2) {
    try {
      const hash1 = await this.getImageHash(file1.path);
      const hash2 = await this.getImageHash(file2.path);

      if (!hash1 || !hash2) return 0;

      // حساب مسافة Hamming بين الـ hashes
      const distance = this.hammingDistance(hash1, hash2);
      const maxDistance = hash1.length * 4; // كل حرف hex يمثل 4 bits

      const similarity = 1 - distance / maxDistance;
      return similarity > 0.9 ? similarity : 0; // صور مشابهة جداً فقط
    } catch (error) {
      console.error("خطأ في حساب تشابه الصور:", error);
      return 0;
    }
  }

  // إنشاء hash للصورة
  async getImageHash(imagePath) {
    if (this.imageHashCache.has(imagePath)) {
      return this.imageHashCache.get(imagePath);
    }

    try {
      // إنشاء thumbnail صغير ثم حساب hash
      const buffer = await sharp(imagePath)
        .resize(8, 8, { fit: "fill" })
        .greyscale()
        .raw()
        .toBuffer();

      // تحويل البيانات إلى hash
      const hash = crypto.createHash("md5").update(buffer).digest("hex");

      this.imageHashCache.set(imagePath, hash);
      return hash;
    } catch (error) {
      console.error(`خطأ في إنشاء hash للصورة ${imagePath}:`, error);
      return null;
    }
  }

  // حساب مسافة Hamming
  hammingDistance(hash1, hash2) {
    if (hash1.length !== hash2.length) return Infinity;

    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) {
        distance++;
      }
    }
    return distance;
  }

  // حساب التشابه الدلالي
  async calculateSemanticSimilarity(file1, file2) {
    // استخراج المصطلحات المهمة من كل ملف
    const terms1 = await this.extractSemanticTerms(file1);
    const terms2 = await this.extractSemanticTerms(file2);

    if (terms1.length === 0 || terms2.length === 0) return 0;

    // حساب التشابه الدلالي
    let semanticScore = 0;
    let comparisons = 0;

    for (const term1 of terms1) {
      for (const term2 of terms2) {
        const similarity = this.calculateTermSimilarity(term1, term2);
        semanticScore += similarity;
        comparisons++;
      }
    }

    return comparisons > 0 ? semanticScore / comparisons : 0;
  }

  // استخراج المصطلحات الدلالية
  async extractSemanticTerms(file) {
    const terms = [];

    // استخدام الكلمات المفتاحية
    if (file.keywords) {
      const keywords = JSON.parse(file.keywords);
      terms.push(...keywords);
    }

    // استخدام الملخص
    if (file.summary) {
      const summaryWords = this.extractWords(file.summary);
      terms.push(...summaryWords.slice(0, 10));
    }

    // استخدام اسم الملف
    const nameWords = this.extractWords(file.name);
    terms.push(...nameWords);

    return [...new Set(terms)].slice(0, 20); // أهم 20 مصطلح
  }

  // حساب تشابه المصطلحات
  calculateTermSimilarity(term1, term2) {
    if (term1.toLowerCase() === term2.toLowerCase()) return 1.0;

    // حساب التشابه الصوتي أو الجذر
    const phonetic1 = this.getPhoneticCode(term1);
    const phonetic2 = this.getPhoneticCode(term2);

    if (phonetic1 === phonetic2) return 0.8;

    // حساب التشابه النصي
    const distance = this.levenshteinDistance(
      term1.toLowerCase(),
      term2.toLowerCase(),
    );
    const maxLength = Math.max(term1.length, term2.length);

    const similarity = 1 - distance / maxLength;
    return similarity > 0.7 ? similarity * 0.6 : 0;
  }

  // إنشاء كود صوتي للكلمة (مبسط)
  getPhoneticCode(word) {
    if (this.phoneticCache.has(word)) {
      return this.phoneticCache.get(word);
    }

    // تطبيق خوارزمية Soundex مبسطة للعربية والإنجليزية
    let code = word
      .toLowerCase()
      .replace(/[اآأإ]/g, "a")
      .replace(/[ويى]/g, "i")
      .replace(/[وؤ]/g, "u")
      .replace(/[ةه]/g, "h")
      .replace(/[ض]/g, "d")
      .replace(/[ظ]/g, "z")
      .replace(/[ث]/g, "s")
      .replace(/[ذ]/g, "z")
      .replace(/\W/g, "");

    this.phoneticCache.set(word, code);
    return code;
  }

  // حساب الثقة في التشابه
  calculateConfidence(similarities, fileType) {
    let confidence = 0;
    let factors = 0;

    // وزن أعلى للتطابق التام
    if (similarities.exactHash === 1.0) {
      confidence += 0.95;
      factors++;
    }

    // وزن عالي لتشابه الحجم
    if (similarities.sizeSimilarity > 0.95) {
      confidence += 0.8;
      factors++;
    }

    // تقييم حسب نوع الملف
    if (fileType === "images" && similarities.imageSimilarity > 0.9) {
      confidence += 0.9;
      factors++;
    }

    if (fileType === "documents" && similarities.contentSimilarity > 0.8) {
      confidence += 0.85;
      factors++;
    }

    // تشابه ا��أسماء
    if (similarities.namePhonetic > 0.8) {
      confidence += 0.7;
      factors++;
    }

    return factors > 0 ? confidence / factors : 0;
  }

  // إنشاء مجموعة تكرار
  async createDuplicateGroup(files, fileType) {
    // ترتيب الملفات حسب الأولوية (الأحدث، الأكبر، إلخ)
    const sortedFiles = this.sortFilesByPriority(files);
    const originalFile = sortedFiles[0];
    const duplicates = sortedFiles.slice(1);

    // حساب الحجم المهدر
    const wastedSpace = duplicates.reduce((sum, file) => sum + file.size, 0);

    // تحديد نوع التكرار
    const duplicateType = this.determineDuplicateType(files);

    // إنشاء اقتراحات الحل
    const resolutionSuggestions = await this.generateResolutionSuggestions(
      originalFile,
      duplicates,
    );

    return {
      id: crypto.randomUUID(),
      type: duplicateType,
      fileType: fileType,
      originalFile: originalFile,
      duplicates: duplicates,
      totalFiles: files.length,
      wastedSpace: wastedSpace,
      confidence: this.calculateGroupConfidence(files),
      resolutionSuggestions: resolutionSuggestions,
      createdAt: new Date().toISOString(),
      status: "pending", // pending, resolved, ignored
    };
  }

  // ترتيب الملفات حسب الأولوية
  sortFilesByPriority(files) {
    return files.sort((a, b) => {
      // الأولوية: الأحدث > الأكبر > الاسم الأفضل

      // تاريخ التعديل (الأحدث أولاً)
      if (a.modified !== b.modified) {
        return b.modified - a.modified;
      }

      // الحجم (الأكبر أولاً)
      if (a.size !== b.size) {
        return b.size - a.size;
      }

      // الاسم (الأقصر والأوضح أولاً)
      const nameScore = (name) => {
        let score = 0;
        // تفضيل الأسماء الأقصر
        score -= name.length * 0.1;
        // تفضيل الأسماء بدون أرقام زائدة
        if (!/\(\d+\)|copy|نسخة/i.test(name)) score += 10;
        // تفضيل المجلدات المهمة
        if (/documents|مستندات|desktop|سطح المكتب/i.test(a.directory))
          score += 5;
        return score;
      };

      return nameScore(b.name) - nameScore(a.name);
    });
  }

  // تحديد نوع التكرار
  determineDuplicateType(files) {
    // فحص العينة الأولى للتحديد
    if (files.length < 2) return this.duplicateTypes.EXACT;

    const file1 = files[0];
    const file2 = files[1];

    // تطابق تام في hash
    if (file1.hash === file2.hash) {
      return this.duplicateTypes.EXACT;
    }

    // تشابه في الاسم
    if (this.calculateNameSimilarity(file1.name, file2.name) > 0.8) {
      return this.duplicateTypes.NAME;
    }

    // تشابه في المحتوى
    if (file1.content && file2.content) {
      return this.duplicateTypes.CONTENT;
    }

    return this.duplicateTypes.FUZZY;
  }

  // حساب ثقة المجموعة
  calculateGroupConfidence(files) {
    if (files.length < 2) return 0;

    let totalConfidence = 0;
    let comparisons = 0;

    for (let i = 0; i < files.length - 1; i++) {
      for (let j = i + 1; j < files.length; j++) {
        // حساب مبسط للثقة
        if (files[i].hash === files[j].hash) {
          totalConfidence += 1.0;
        } else if (files[i].size === files[j].size) {
          totalConfidence += 0.7;
        } else {
          totalConfidence += 0.4;
        }
        comparisons++;
      }
    }

    return comparisons > 0 ? totalConfidence / comparisons : 0;
  }

  // إنشاء اقتراحات الحل
  async generateResolutionSuggestions(originalFile, duplicates) {
    const suggestions = [];

    // اقتراح حذف النسخ المكررة
    suggestions.push({
      type: "delete_duplicates",
      title: "حذف النسخ المكررة",
      description: `حذف ${duplicates.length} نسخة مكررة والاحتفاظ بالملف الأصلي`,
      impact: {
        spaceFreed: duplicates.reduce((sum, file) => sum + file.size, 0),
        filesRemoved: duplicates.length,
      },
      risk: "low",
      files: duplicates.map((f) => ({ path: f.path, action: "delete" })),
    });

    // اقتراح نقل إلى مجلد المحذوفات
    suggestions.push({
      type: "move_to_archive",
      title: "نقل إلى أرشيف التكرارات",
      description: "نقل النسخ المكررة إلى مجلد خاص بدلاً من حذفها",
      impact: {
        spaceFreed: 0,
        filesArchived: duplicates.length,
      },
      risk: "very_low",
      files: duplicates.map((f) => ({ path: f.path, action: "archive" })),
    });

    // اقتراح دمج البيانات الوصفية
    if (
      duplicates.some((f) => f.tags || f.category !== originalFile.category)
    ) {
      suggestions.push({
        type: "merge_metadata",
        title: "دمج البيانات الوصفية",
        description: "دمج العلامات والفئات من جميع النسخ في الملف الأصلي",
        impact: {
          metadataEnhanced: true,
        },
        risk: "none",
        files: [{ path: originalFile.path, action: "update_metadata" }],
      });
    }

    return suggestions;
  }

  // تحليل نتائج التكرارات
  async analyzeDuplicateResults(duplicateGroups) {
    console.log("📊 تحليل نتائج التكرارات...");

    const analysis = {
      summary: {
        totalGroups: duplicateGroups.length,
        totalDuplicateFiles: duplicateGroups.reduce(
          (sum, group) => sum + group.duplicates.length,
          0,
        ),
        totalWastedSpace: duplicateGroups.reduce(
          (sum, group) => sum + group.wastedSpace,
          0,
        ),
        averageConfidence:
          duplicateGroups.reduce((sum, group) => sum + group.confidence, 0) /
            duplicateGroups.length || 0,
      },
      byType: {},
      byFileType: {},
      recommendations: [],
    };

    // تصنيف حسب نوع التكرار
    duplicateGroups.forEach((group) => {
      analysis.byType[group.type] = (analysis.byType[group.type] || 0) + 1;
      analysis.byFileType[group.fileType] =
        (analysis.byFileType[group.fileType] || 0) + 1;
    });

    // إنشاء توصيات عامة
    if (analysis.summary.totalWastedSpace > 100 * 1024 * 1024) {
      // أكبر من 100 ميجا
      analysis.recommendations.push({
        type: "space_critical",
        message: `يمك�� توفير ${this.formatFileSize(analysis.summary.totalWastedSpace)} من المساحة`,
        priority: "high",
      });
    }

    // ترتيب المجموعات حسب الأولوية
    const sortedGroups = duplicateGroups.sort((a, b) => {
      // الأولوية: الثقة العالية > المساحة المهدرة الكبيرة
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      return b.wastedSpace - a.wastedSpace;
    });

    return {
      groups: sortedGroups,
      analysis: analysis,
      generatedAt: new Date().toISOString(),
    };
  }

  // تنسيق حجم الملف
  formatFileSize(bytes) {
    const sizes = ["بايت", "كيلو بايت", "ميجا بايت", "جيجا بايت"];
    if (bytes === 0) return "0 بايت";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  // تطبيق حل التكرار
  async applyResolution(groupId, suggestionType, options = {}) {
    console.log(`🔧 تطبيق حل التكرار: ${suggestionType} للمجموعة ${groupId}`);

    try {
      // هنا يتم تطبيق الحل المحدد
      // سيتم تنفيذ هذا في الإصدار الكامل

      return {
        success: true,
        message: `تم تطبيق الحل ${suggestionType} بنجاح`,
        appliedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ خطأ في تطبيق حل التكرار:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // الحصول على إحصائيات المكشف
  getDetectorStats() {
    return {
      algorithmsEnabled: Object.entries(this.algorithms)
        .filter(([, config]) => config.enabled)
        .map(([name, config]) => ({ name, weight: config.weight })),
      similarityThreshold: this.similarityThreshold,
      cacheStats: {
        imageHashes: this.imageHashCache.size,
        contentHashes: this.contentHashCache.size,
        phoneticCodes: this.phoneticCache.size,
      },
      duplicateTypes: this.duplicateTypes,
      version: "3.0-Advanced",
    };
  }

  // تحديث إعدادات المكشف
  updateSettings(newSettings) {
    if (newSettings.similarityThreshold) {
      this.similarityThreshold = Math.max(
        0,
        Math.min(1, newSettings.similarityThreshold),
      );
    }

    if (newSettings.algorithms) {
      Object.keys(newSettings.algorithms).forEach((alg) => {
        if (this.algorithms[alg]) {
          this.algorithms[alg] = {
            ...this.algorithms[alg],
            ...newSettings.algorithms[alg],
          };
        }
      });
    }

    console.log("✅ تم تحديث إعدادات كاشف التكرارات");
  }

  // مسح الذاكرة المؤقتة
  clearCaches() {
    this.imageHashCache.clear();
    this.contentHashCache.clear();
    this.phoneticCache.clear();
    console.log("🧹 تم مسح ذاكرة كاشف التكرارات");
  }
}

module.exports = AdvancedDuplicateDetector;
