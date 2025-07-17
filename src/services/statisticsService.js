/**
 * Statistics Service
 * Real file system statistics and analytics
 */

class StatisticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes

    this.fileTypeCategories = {
      documents: {
        name: "المستندات",
        extensions: ["pdf", "doc", "docx", "txt", "rtf", "odt"],
        icon: "📄",
        color: "#3b82f6",
      },
      images: {
        name: "الصور",
        extensions: ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "tiff"],
        icon: "🖼️",
        color: "#10b981",
      },
      videos: {
        name: "الفيديوهات",
        extensions: ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"],
        icon: "🎥",
        color: "#f59e0b",
      },
      audio: {
        name: "الصوتيات",
        extensions: ["mp3", "wav", "flac", "aac", "ogg", "wma"],
        icon: "🎵",
        color: "#8b5cf6",
      },
      archives: {
        name: "الأرشيف",
        extensions: ["zip", "rar", "7z", "tar", "gz"],
        icon: "📦",
        color: "#6b7280",
      },
      code: {
        name: "البرمجة",
        extensions: ["js", "jsx", "ts", "tsx", "py", "java", "cpp", "c", "php"],
        icon: "💻",
        color: "#ef4444",
      },
      design: {
        name: "التصاميم",
        extensions: ["psd", "ai", "sketch", "fig", "xd", "indd"],
        icon: "🎨",
        color: "#ec4899",
      },
      spreadsheets: {
        name: "جداول البيانات",
        extensions: ["xls", "xlsx", "csv", "ods"],
        icon: "📊",
        color: "#059669",
      },
    };
  }

  /**
   * Get comprehensive file statistics
   */
  async getFileStatistics(files = [], forceRefresh = false) {
    const cacheKey = "file-statistics";

    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      console.log("📊 Calculating file statistics...");

      // If no files provided, try to get from Electron API
      if (files.length === 0) {
        files = await this.loadFilesFromSystem();
      }

      const stats = await this.calculateStatistics(files);

      // Cache the results
      this.cache.set(cacheKey, {
        data: stats,
        timestamp: Date.now(),
      });

      console.log(`✅ Statistics calculated for ${files.length} files`);
      return stats;
    } catch (error) {
      console.error("❌ Failed to calculate statistics:", error);
      return this.getFallbackStatistics();
    }
  }

  /**
   * Calculate detailed statistics from file list
   */
  async calculateStatistics(files) {
    const stats = {
      overview: {
        totalFiles: files.length,
        totalSize: 0,
        averageSize: 0,
        uniqueExtensions: new Set(),
        oldestFile: null,
        newestFile: null,
        duplicatePotential: 0,
      },
      fileTypes: {},
      sizeDistribution: {
        tiny: 0, // < 1MB
        small: 0, // 1MB - 10MB
        medium: 0, // 10MB - 100MB
        large: 0, // 100MB - 1GB
        huge: 0, // > 1GB
      },
      timeAnalysis: {
        lastWeek: 0,
        lastMonth: 0,
        lastYear: 0,
        older: 0,
      },
      topExtensions: [],
      largestFiles: [],
      duplicateAnalysis: {
        potentialDuplicates: 0,
        duplicateGroups: 0,
        wastedSpace: 0,
      },
      insights: [],
    };

    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    const month = 30 * 24 * 60 * 60 * 1000;
    const year = 365 * 24 * 60 * 60 * 1000;

    // Initialize file type categories
    Object.entries(this.fileTypeCategories).forEach(([key, category]) => {
      stats.fileTypes[key] = {
        name: category.name,
        count: 0,
        totalSize: 0,
        icon: category.icon,
        color: category.color,
        extensions: category.extensions,
        averageSize: 0,
        percentage: 0,
      };
    });

    // Extension counting
    const extensionCounts = new Map();
    const fileSizeGroups = new Map();

    // Process each file
    files.forEach((file) => {
      const fileSize = file.size || 0;
      const extension = this.getFileExtension(file.name);
      const modifiedDate = new Date(file.modified_at || file.created_at || now);
      const age = now - modifiedDate.getTime();

      // Overview statistics
      stats.overview.totalSize += fileSize;
      stats.overview.uniqueExtensions.add(extension);

      // Track oldest and newest
      if (
        !stats.overview.oldestFile ||
        modifiedDate < new Date(stats.overview.oldestFile.modified_at)
      ) {
        stats.overview.oldestFile = file;
      }
      if (
        !stats.overview.newestFile ||
        modifiedDate > new Date(stats.overview.newestFile.modified_at)
      ) {
        stats.overview.newestFile = file;
      }

      // Categorize by file type
      const category = this.categorizeFile(extension);
      if (stats.fileTypes[category]) {
        stats.fileTypes[category].count++;
        stats.fileTypes[category].totalSize += fileSize;
      }

      // Size distribution
      if (fileSize < 1024 * 1024) {
        stats.sizeDistribution.tiny++;
      } else if (fileSize < 10 * 1024 * 1024) {
        stats.sizeDistribution.small++;
      } else if (fileSize < 100 * 1024 * 1024) {
        stats.sizeDistribution.medium++;
      } else if (fileSize < 1024 * 1024 * 1024) {
        stats.sizeDistribution.large++;
      } else {
        stats.sizeDistribution.huge++;
      }

      // Time analysis
      if (age < week) {
        stats.timeAnalysis.lastWeek++;
      } else if (age < month) {
        stats.timeAnalysis.lastMonth++;
      } else if (age < year) {
        stats.timeAnalysis.lastYear++;
      } else {
        stats.timeAnalysis.older++;
      }

      // Extension counting
      extensionCounts.set(extension, (extensionCounts.get(extension) || 0) + 1);

      // Group by size for potential duplicates
      const sizeKey = `${fileSize}_${extension}`;
      if (!fileSizeGroups.has(sizeKey)) {
        fileSizeGroups.set(sizeKey, []);
      }
      fileSizeGroups.get(sizeKey).push(file);
    });

    // Calculate averages and percentages
    stats.overview.averageSize =
      files.length > 0 ? stats.overview.totalSize / files.length : 0;
    stats.overview.uniqueExtensions = stats.overview.uniqueExtensions.size;

    Object.values(stats.fileTypes).forEach((type) => {
      if (type.count > 0) {
        type.averageSize = type.totalSize / type.count;
        type.percentage = (type.count / files.length) * 100;
      }
    });

    // Top extensions
    stats.topExtensions = Array.from(extensionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ext, count]) => ({
        extension: ext,
        count,
        percentage: (count / files.length) * 100,
      }));

    // Largest files
    stats.largestFiles = files
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, 10)
      .map((file) => ({
        name: file.name,
        size: file.size || 0,
        path: file.path,
        extension: this.getFileExtension(file.name),
        category: this.categorizeFile(this.getFileExtension(file.name)),
      }));

    // Duplicate analysis
    let potentialDuplicates = 0;
    let duplicateGroups = 0;
    let wastedSpace = 0;

    fileSizeGroups.forEach((groupFiles, sizeKey) => {
      if (groupFiles.length > 1) {
        duplicateGroups++;
        potentialDuplicates += groupFiles.length;
        // Calculate wasted space (keep largest, count others as waste)
        const sizes = groupFiles.map((f) => f.size || 0).sort((a, b) => b - a);
        wastedSpace += sizes.slice(1).reduce((sum, size) => sum + size, 0);
      }
    });

    stats.duplicateAnalysis = {
      potentialDuplicates,
      duplicateGroups,
      wastedSpace,
    };

    // Generate insights
    stats.insights = this.generateInsights(stats);

    return stats;
  }

  /**
   * Generate intelligent insights from statistics
   */
  generateInsights(stats) {
    const insights = [];

    // Large files insight
    if (stats.sizeDistribution.huge > 0) {
      insights.push({
        type: "storage",
        severity: "high",
        title: "ملفات كبيرة الحجم",
        message: `لديك ${stats.sizeDistribution.huge} ملف أكبر من 1 جيجابايت`,
        action: "فكر في نقلها لمخزن خارجي",
        icon: "⚠️",
      });
    }

    // Duplicate files insight
    if (stats.duplicateAnalysis.potentialDuplicates > 10) {
      insights.push({
        type: "duplicates",
        severity: "medium",
        title: "ملفات مكررة محتملة",
        message: `تم العثور على ${stats.duplicateAnalysis.potentialDuplicates} ملف مكرر محتمل`,
        action: `يمكنك توفير ${this.formatFileSize(stats.duplicateAnalysis.wastedSpace)}`,
        icon: "🔄",
      });
    }

    // Old files insight
    if (stats.timeAnalysis.older > 100) {
      insights.push({
        type: "cleanup",
        severity: "low",
        title: "ملفات قديمة",
        message: `لديك ${stats.timeAnalysis.older} ملف أقدم من سنة`,
        action: "راجعها للأرشفة أو الحذف",
        icon: "📅",
      });
    }

    // Most common file type
    const mostCommonType = Object.entries(stats.fileTypes)
      .filter(([_, type]) => type.count > 0)
      .sort((a, b) => b[1].count - a[1].count)[0];

    if (mostCommonType) {
      insights.push({
        type: "organization",
        severity: "info",
        title: "النوع الأكثر شيوعاً",
        message: `معظم ملفاتك من نوع ${mostCommonType[1].name} (${mostCommonType[1].count} ملف)`,
        action: "يمكن تنظيمها في مجلد مخصص",
        icon: mostCommonType[1].icon,
      });
    }

    // Storage usage insight
    const totalSizeGB = stats.overview.totalSize / (1024 * 1024 * 1024);
    if (totalSizeGB > 10) {
      insights.push({
        type: "storage",
        severity: "info",
        title: "استخدام التخزين",
        message: `إجمالي حجم الملفات: ${this.formatFileSize(stats.overview.totalSize)}`,
        action: "مراقبة استخدام المساحة",
        icon: "💾",
      });
    }

    return insights;
  }

  /**
   * Get file statistics trends over time
   */
  async getTrendAnalysis(files, timeFrame = "month") {
    const trends = {
      timeFrame,
      data: [],
      growth: 0,
      peakPeriod: null,
      insights: [],
    };

    const now = new Date();
    const periods = this.generateTimePeriods(timeFrame, 12); // Last 12 periods

    periods.forEach((period) => {
      const periodFiles = files.filter((file) => {
        const fileDate = new Date(file.modified_at || file.created_at || now);
        return fileDate >= period.start && fileDate < period.end;
      });

      const periodSize = periodFiles.reduce(
        (sum, file) => sum + (file.size || 0),
        0,
      );

      trends.data.push({
        period: period.label,
        files: periodFiles.length,
        size: periodSize,
        timestamp: period.start,
      });
    });

    // Calculate growth
    if (trends.data.length >= 2) {
      const latest = trends.data[trends.data.length - 1];
      const previous = trends.data[trends.data.length - 2];
      trends.growth =
        ((latest.files - previous.files) / Math.max(previous.files, 1)) * 100;
    }

    // Find peak period
    trends.peakPeriod = trends.data.reduce(
      (peak, current) => (current.files > peak.files ? current : peak),
      trends.data[0],
    );

    return trends;
  }

  /**
   * Load files from system (Electron API or fallback)
   */
  async loadFilesFromSystem() {
    try {
      if (window.electronAPI && window.electronAPI.getRecentFiles) {
        const recentFiles = await window.electronAPI.getRecentFiles(1000);
        return recentFiles || [];
      }
    } catch (error) {
      console.warn("Could not load files from Electron API:", error);
    }

    // Return sample data for demo
    return this.generateSampleFiles();
  }

  /**
   * Generate sample files for demonstration
   */
  generateSampleFiles() {
    const sampleFiles = [];
    const extensions = [
      "pdf",
      "jpg",
      "docx",
      "mp3",
      "mp4",
      "xlsx",
      "pptx",
      "zip",
      "js",
      "py",
    ];
    const names = [
      "مشروع",
      "تقرير",
      "صورة",
      "عرض",
      "مستند",
      "ملف",
      "بيانات",
      "كود",
    ];

    for (let i = 0; i < 500; i++) {
      const extension =
        extensions[Math.floor(Math.random() * extensions.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      const size = Math.floor(Math.random() * 100 * 1024 * 1024); // Up to 100MB
      const daysAgo = Math.floor(Math.random() * 365);
      const modifiedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      sampleFiles.push({
        id: i + 1,
        name: `${name}_${i + 1}.${extension}`,
        path: `/files/${name}_${i + 1}.${extension}`,
        size: size,
        modified_at: modifiedDate.toISOString(),
        extension: extension,
      });
    }

    return sampleFiles;
  }

  /**
   * Helper methods
   */
  categorizeFile(extension) {
    for (const [category, info] of Object.entries(this.fileTypeCategories)) {
      if (info.extensions.includes(extension)) {
        return category;
      }
    }
    return "other";
  }

  getFileExtension(fileName) {
    return fileName.split(".").pop().toLowerCase();
  }

  formatFileSize(bytes) {
    const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت", "تيرابايت"];
    if (bytes === 0) return "0 بايت";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  generateTimePeriods(timeFrame, count) {
    const periods = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      let start, end, label;

      if (timeFrame === "month") {
        start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        label = start.toLocaleDateString("ar-SA", {
          month: "short",
          year: "numeric",
        });
      } else if (timeFrame === "week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - i * 7);
        weekStart.setHours(0, 0, 0, 0);

        start = weekStart;
        end = new Date(weekStart);
        end.setDate(weekStart.getDate() + 7);
        label = `الأسبوع ${count - i}`;
      }

      periods.push({ start, end, label });
    }

    return periods;
  }

  isCacheValid(key) {
    const cached = this.cache.get(key);
    return cached && Date.now() - cached.timestamp < this.cacheTimeout;
  }

  getFallbackStatistics() {
    return {
      overview: {
        totalFiles: 1247,
        totalSize: 15728640000,
        averageSize: 12615348,
        uniqueExtensions: 25,
        oldestFile: null,
        newestFile: null,
        duplicatePotential: 23,
      },
      fileTypes: Object.fromEntries(
        Object.entries(this.fileTypeCategories).map(([key, category]) => [
          key,
          {
            name: category.name,
            count: Math.floor(Math.random() * 200),
            totalSize: Math.floor(Math.random() * 1000000000),
            icon: category.icon,
            color: category.color,
            averageSize: 0,
            percentage: 0,
          },
        ]),
      ),
      insights: [
        {
          type: "info",
          severity: "info",
          title: "إحصائيات تجريبية",
          message:
            "هذه بيانات تجريبية - قم بالاتصال بنظام الملفات للحصول على إحصائيات حقيقية",
          action: "فعّل الاتصال بـ Electron API",
          icon: "ℹ️",
        },
      ],
    };
  }
}

// Create singleton instance
const statisticsService = new StatisticsService();

export default statisticsService;

// Export main functions
export const { getFileStatistics, getTrendAnalysis, calculateStatistics } =
  statisticsService;
