const fs = require("fs-extra");
const path = require("path");
const mammoth = require("mammoth");
const pdf = require("pdf-parse");
const crypto = require("crypto");

class ContentExtractor {
  constructor() {
    this.supportedTypes = new Set([
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      ".md",
      ".rtf",
      ".odt",
      ".html",
      ".htm",
      ".xml",
      ".json",
      ".csv",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".php",
      ".css",
      ".scss",
      ".less",
      ".sql",
      ".log",
    ]);

    this.maxFileSize = 50 * 1024 * 1024; // 50MB حد أقصى
    this.maxContentLength = 1000000; // 1M حرف حد أقصى للمحتوى
  }

  // تحديد ما إذا كان يمكن استخراج المحتوى من هذا الملف
  canExtract(filePath, fileSize = null) {
    const ext = path.extname(filePath).toLowerCase();

    // تحقق من نوع الملف
    if (!this.supportedTypes.has(ext)) {
      return false;
    }

    // تحقق من حجم الملف
    if (fileSize && fileSize > this.maxFileSize) {
      console.log(`⚠️ ملف كبير جداً (${fileSize} bytes): ${filePath}`);
      return false;
    }

    return true;
  }

  // استخراج المحتوى الرئيسي
  async extractContent(filePath) {
    try {
      const stats = await fs.stat(filePath);

      if (!this.canExtract(filePath, stats.size)) {
        return {
          success: false,
          content: "",
          error: "نوع الملف غير مدعوم أو الملف كبير جداً",
        };
      }

      const ext = path.extname(filePath).toLowerCase();
      let content = "";
      let metadata = {};

      console.log(`📄 استخراج محتوى: ${filePath}`);

      switch (ext) {
        case ".pdf":
          const pdfResult = await this.extractFromPDF(filePath);
          content = pdfResult.content;
          metadata = pdfResult.metadata;
          break;

        case ".doc":
        case ".docx":
          const docResult = await this.extractFromWord(filePath);
          content = docResult.content;
          metadata = docResult.metadata;
          break;

        case ".txt":
        case ".md":
        case ".log":
        case ".csv":
          content = await this.extractFromText(filePath);
          break;

        case ".html":
        case ".htm":
          content = await this.extractFromHTML(filePath);
          break;

        case ".xml":
          content = await this.extractFromXML(filePath);
          break;

        case ".json":
          content = await this.extractFromJSON(filePath);
          break;

        case ".js":
        case ".jsx":
        case ".ts":
        case ".tsx":
        case ".py":
        case ".java":
        case ".cpp":
        case ".c":
        case ".php":
        case ".css":
        case ".scss":
        case ".less":
        case ".sql":
          content = await this.extractFromCode(filePath);
          break;

        default:
          // محاولة قراءة كنص عادي
          try {
            content = await this.extractFromText(filePath);
          } catch (error) {
            return {
              success: false,
              content: "",
              error: `لا يمكن قراءة الملف: ${error.message}`,
            };
          }
      }

      // تنظيف وتحسين المحتوى
      content = this.cleanContent(content);

      // قطع المحتوى إذا كان طويلاً جداً
      if (content.length > this.maxContentLength) {
        content =
          content.substring(0, this.maxContentLength) + "... [محتوى مقطوع]";
      }

      // استخراج كلمات مفتاحية أساسية
      const keywords = this.extractKeywords(content);

      // كشف اللغة
      const language = this.detectLanguage(content);

      // إنشاء ملخص قصير
      const summary = this.generateSummary(content);

      // حساب hash للمحتوى
      const contentHash = this.generateContentHash(content);

      return {
        success: true,
        content: content,
        metadata: {
          ...metadata,
          wordCount: this.countWords(content),
          charCount: content.length,
          language: language,
          contentHash: contentHash,
        },
        keywords: keywords,
        summary: summary,
        language: language,
      };
    } catch (error) {
      console.error(`❌ خطأ في استخراج المحتوى من ${filePath}:`, error);
      return {
        success: false,
        content: "",
        error: error.message,
      };
    }
  }

  // استخر��ج من PDF
  async extractFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);

      return {
        content: data.text,
        metadata: {
          pages: data.numpages,
          info: data.info || {},
          version: data.version,
        },
      };
    } catch (error) {
      console.error(`❌ خطأ PDF: ${error.message}`);
      return { content: "", metadata: {} };
    }
  }

  // استخراج من Word
  async extractFromWord(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });

      return {
        content: result.value,
        metadata: {
          warnings: result.messages || [],
        },
      };
    } catch (error) {
      console.error(`❌ خطأ Word: ${error.message}`);
      return { content: "", metadata: {} };
    }
  }

  // استخراج من النصوص العادية
  async extractFromText(filePath) {
    try {
      // محاولة قراءة بترميزات مختلفة
      const encodings = ["utf8", "latin1", "ascii"];

      for (const encoding of encodings) {
        try {
          const content = await fs.readFile(filePath, encoding);
          // تحقق من أن المحتوى قابل للقرا��ة
          if (this.isReadableText(content)) {
            return content;
          }
        } catch (error) {
          continue;
        }
      }

      throw new Error("لا يمكن قراءة الملف بأي ترميز");
    } catch (error) {
      console.error(`❌ خطأ Text: ${error.message}`);
      return "";
    }
  }

  // استخراج من HTML
  async extractFromHTML(filePath) {
    try {
      const htmlContent = await fs.readFile(filePath, "utf8");

      // إزالة tags وإبقاء النص فقط
      const textContent = htmlContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&\w+;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return textContent;
    } catch (error) {
      console.error(`❌ خطأ HTML: ${error.message}`);
      return "";
    }
  }

  // استخراج من XML
  async extractFromXML(filePath) {
    try {
      const xmlContent = await fs.readFile(filePath, "utf8");

      // استخراج النصوص من XML
      const textContent = xmlContent
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return textContent;
    } catch (error) {
      console.error(`❌ خطأ XML: ${error.message}`);
      return "";
    }
  }

  // استخراج من JSON
  async extractFromJSON(filePath) {
    try {
      const jsonContent = await fs.readFile(filePath, "utf8");
      const data = JSON.parse(jsonContent);

      // استخراج جميع القيم النصية من JSON
      const extractedTexts = [];

      const extractFromValue = (value) => {
        if (typeof value === "string") {
          extractedTexts.push(value);
        } else if (typeof value === "object" && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(extractFromValue);
          } else {
            Object.values(value).forEach(extractFromValue);
          }
        }
      };

      extractFromValue(data);
      return extractedTexts.join(" ");
    } catch (error) {
      console.error(`❌ خطأ JSON: ${error.message}`);
      return "";
    }
  }

  // استخراج من ملفات الكود
  async extractFromCode(filePath) {
    try {
      const codeContent = await fs.readFile(filePath, "utf8");

      // استخراج التعليقات والstrings من الكود
      const comments = [];
      const strings = [];

      // ا��تخراج تعليقات single-line
      const singleLineComments = codeContent.match(/\/\/.*$/gm);
      if (singleLineComments) {
        comments.push(
          ...singleLineComments.map((c) => c.replace("//", "").trim()),
        );
      }

      // استخراج تعليقات multi-line
      const multiLineComments = codeContent.match(/\/\*[\s\S]*?\*\//g);
      if (multiLineComments) {
        comments.push(
          ...multiLineComments.map((c) => c.replace(/\/\*|\*\//g, "").trim()),
        );
      }

      // استخراج النصوص المقتبسة
      const quotedStrings = codeContent.match(/["'`][^"'`]*["'`]/g);
      if (quotedStrings) {
        strings.push(...quotedStrings.map((s) => s.slice(1, -1)));
      }

      // دمج المحتوى المستخرج
      return [...comments, ...strings].join(" ");
    } catch (error) {
      console.error(`❌ خطأ Code: ${error.message}`);
      return "";
    }
  }

  // تنظيف المحتوى
  cleanContent(content) {
    if (!content) return "";

    return content
      .replace(/\r\n/g, "\n") // توحيد line endings
      .replace(/\r/g, "\n") // توحيد line endings
      .replace(/\n{3,}/g, "\n\n") // تقليل الأسطر الفارغة المتتالية
      .replace(/[ \t]{2,}/g, " ") // تقليل المسافات المتتالية
      .replace(/^\s+|\s+$/g, "") // إزالة المسافات من البداية والنهاية
      .trim();
  }

  // استخراج كلمات مفتاحية أساسية
  extractKeywords(content) {
    if (!content) return [];

    // كلمات شائعة يجب تجاهلها
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "this",
      "that",
      "these",
      "those",
      "في",
      "من",
      "إلى",
      "على",
      "عن",
      "مع",
      "كان",
      "كانت",
      "يكون",
      "تكون",
      "هذا",
      "هذه",
      "ذلك",
      "تلك",
      "التي",
      "الذي",
      "التي",
      "اللذان",
      "اللتان",
      "الذين",
      "اللواتي",
      "أن",
      "إن",
      "لكن",
      "لكن",
      "أو",
      "أم",
      "لا",
      "ما",
      "قد",
      "لقد",
    ]);

    // استخراج الكلمات (3 أحرف أو أكثر)
    const words = content.toLowerCase().match(/[\u0600-\u06FF\w]{3,}/g) || [];

    // إحصاء تكرار الكلمات
    const wordCount = {};
    words.forEach((word) => {
      if (!stopWords.has(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    // ترتيب الكلمات حسب التكرار وأخذ أفضل 20
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  // كشف اللغة الأساسي
  detectLanguage(content) {
    if (!content) return "unknown";

    const arabicChars = (content.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = content.replace(/\s/g, "").length;

    if (totalChars === 0) return "unknown";

    const arabicRatio = arabicChars / totalChars;

    if (arabicRatio > 0.3) return "ar";
    if (arabicRatio < 0.1) return "en";
    return "mixed";
  }

  // إنشاء ملخص بسيط
  generateSummary(content, maxLength = 200) {
    if (!content) return "";

    // أخذ أول فقرات مفيدة
    const sentences = content
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20)
      .slice(0, 3);

    const summary = sentences.join(". ");

    if (summary.length > maxLength) {
      return summary.substring(0, maxLength) + "...";
    }

    return summary;
  }

  // عد الكلمات
  countWords(content) {
    if (!content) return 0;
    return (content.match(/[\u0600-\u06FF\w]+/g) || []).length;
  }

  // إنشاء hash للمحتوى
  generateContentHash(content) {
    return crypto
      .createHash("md5")
      .update(content || "")
      .digest("hex");
  }

  // تحديد ما إذا كان النص قابلاً للقراءة
  isReadableText(content) {
    if (!content) return false;

    // تحقق من وجود نسبة معقولة من الأحرف القابلة للقراءة
    const readableChars = (
      content.match(/[\u0600-\u06FF\w\s.,!?;:()\-'"]/g) || []
    ).length;
    const totalChars = content.length;

    return totalChars > 0 && readableChars / totalChars > 0.7;
  }

  // الحصول على معلومات الملف
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const name = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const dir = path.dirname(filePath);

      return {
        path: filePath,
        name: name,
        type: ext.slice(1) || "unknown",
        size: stats.size,
        modified: Math.floor(stats.mtimeMs / 1000),
        created: Math.floor(stats.birthtimeMs / 1000),
        accessed: Math.floor(stats.atimeMs / 1000),
        directory: dir,
        canExtract: this.canExtract(filePath, stats.size),
      };
    } catch (error) {
      console.error(`❌ خطأ في جلب معلومات الملف ${filePath}:`, error);
      return null;
    }
  }

  // إحصائيات الاستخراج
  getExtractionStats() {
    return {
      supportedTypes: Array.from(this.supportedTypes),
      maxFileSize: this.maxFileSize,
      maxContentLength: this.maxContentLength,
      version: "2.0",
    };
  }
}

module.exports = ContentExtractor;
