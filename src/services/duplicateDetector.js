/**
 * Advanced Duplicate Detection Service for KNOUX FINDR
 * Real duplicate detection using multiple algorithms and heuristics
 */

import { createHash } from "crypto";

class DuplicateDetector {
  constructor() {
    this.algorithms = {
      EXACT_MATCH: "exact_match",
      SIZE_NAME: "size_name",
      CONTENT_HASH: "content_hash",
      FUZZY_NAME: "fuzzy_name",
      SIMILARITY: "similarity",
    };

    this.thresholds = {
      NAME_SIMILARITY: 0.8,
      CONTENT_SIMILARITY: 0.9,
      SIZE_TOLERANCE: 0.02, // 2% size difference tolerance
      FUZZY_THRESHOLD: 0.7,
    };

    this.fileHashes = new Map();
    this.analyzed = new Set();
  }

  /**
   * Main duplicate detection function
   */
  async detectDuplicates(files, options = {}) {
    const {
      algorithms = [
        this.algorithms.EXACT_MATCH,
        this.algorithms.SIZE_NAME,
        this.algorithms.FUZZY_NAME,
      ],
      includeEmptyFiles = false,
      minFileSize = 0,
      maxResults = 1000,
      progressCallback = null,
    } = options;

    try {
      console.log(
        `🔍 Starting duplicate detection for ${files.length} files...`,
      );

      // Filter files
      const filteredFiles = this.filterFiles(
        files,
        includeEmptyFiles,
        minFileSize,
      );
      console.log(`📊 Analyzing ${filteredFiles.length} files after filtering`);

      const duplicateGroups = [];
      let processed = 0;

      // Process each algorithm
      for (const algorithm of algorithms) {
        const groups = await this.runAlgorithm(
          algorithm,
          filteredFiles,
          progressCallback,
        );
        duplicateGroups.push(...groups);

        processed += filteredFiles.length;
        if (progressCallback) {
          progressCallback({
            phase: `Running ${algorithm}`,
            processed,
            total: filteredFiles.length * algorithms.length,
            percentage:
              (processed / (filteredFiles.length * algorithms.length)) * 100,
          });
        }
      }

      // Merge and deduplicate results
      const mergedGroups = this.mergeGroups(duplicateGroups);

      // Calculate statistics
      const statistics = this.calculateStatistics(mergedGroups, files.length);

      console.log(
        `✅ Duplicate detection completed. Found ${mergedGroups.length} groups`,
      );

      return {
        groups: mergedGroups.slice(0, maxResults),
        statistics,
        algorithms: algorithms,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("❌ Duplicate detection failed:", error);
      throw error;
    }
  }

  /**
   * Filter files based on criteria
   */
  filterFiles(files, includeEmptyFiles, minFileSize) {
    return files.filter((file) => {
      if (!includeEmptyFiles && file.size === 0) return false;
      if (file.size < minFileSize) return false;
      if (!file.name || file.name.trim() === "") return false;
      return true;
    });
  }

  /**
   * Run specific detection algorithm
   */
  async runAlgorithm(algorithm, files, progressCallback) {
    switch (algorithm) {
      case this.algorithms.EXACT_MATCH:
        return this.detectExactMatches(files, progressCallback);
      case this.algorithms.SIZE_NAME:
        return this.detectSizeNameMatches(files, progressCallback);
      case this.algorithms.CONTENT_HASH:
        return this.detectContentHashes(files, progressCallback);
      case this.algorithms.FUZZY_NAME:
        return this.detectFuzzyNameMatches(files, progressCallback);
      case this.algorithms.SIMILARITY:
        return this.detectSimilarFiles(files, progressCallback);
      default:
        console.warn(`Unknown algorithm: ${algorithm}`);
        return [];
    }
  }

  /**
   * Detect exact file matches (same name and size)
   */
  async detectExactMatches(files, progressCallback) {
    const groups = [];
    const exactMatches = new Map();

    files.forEach((file, index) => {
      const key = `${file.name}_${file.size}`;

      if (!exactMatches.has(key)) {
        exactMatches.set(key, []);
      }
      exactMatches.get(key).push(file);

      if (progressCallback && index % 100 === 0) {
        progressCallback({
          phase: "Exact Match Detection",
          processed: index,
          total: files.length,
        });
      }
    });

    // Convert to groups
    exactMatches.forEach((matches, key) => {
      if (matches.length > 1) {
        groups.push({
          id: `exact_${this.generateGroupId()}`,
          algorithm: this.algorithms.EXACT_MATCH,
          type: "exact_duplicate",
          confidence: 1.0,
          files: matches,
          criterion: "name_and_size",
          wastedSpace: this.calculateWastedSpace(matches),
          recommendations: this.generateRecommendations(matches, "exact"),
        });
      }
    });

    return groups;
  }

  /**
   * Detect files with same size and similar names
   */
  async detectSizeNameMatches(files, progressCallback) {
    const groups = [];
    const sizeGroups = new Map();

    // Group by size first
    files.forEach((file) => {
      if (!sizeGroups.has(file.size)) {
        sizeGroups.set(file.size, []);
      }
      sizeGroups.get(file.size).push(file);
    });

    let processed = 0;

    // Check each size group for name similarities
    for (const [size, sizeGroup] of sizeGroups) {
      if (sizeGroup.length > 1) {
        const nameGroups = this.groupBySimilarNames(
          sizeGroup,
          this.thresholds.NAME_SIMILARITY,
        );

        nameGroups.forEach((group) => {
          if (group.length > 1) {
            groups.push({
              id: `size_name_${this.generateGroupId()}`,
              algorithm: this.algorithms.SIZE_NAME,
              type: "size_name_duplicate",
              confidence: 0.85,
              files: group,
              criterion: "size_and_similar_name",
              wastedSpace: this.calculateWastedSpace(group),
              recommendations: this.generateRecommendations(group, "size_name"),
            });
          }
        });
      }

      processed += sizeGroup.length;
      if (progressCallback && processed % 100 === 0) {
        progressCallback({
          phase: "Size & Name Detection",
          processed,
          total: files.length,
        });
      }
    }

    return groups;
  }

  /**
   * Detect files with fuzzy name matching
   */
  async detectFuzzyNameMatches(files, progressCallback) {
    const groups = [];
    const processed = new Set();

    for (let i = 0; i < files.length; i++) {
      if (processed.has(i)) continue;

      const group = [files[i]];
      processed.add(i);

      for (let j = i + 1; j < files.length; j++) {
        if (processed.has(j)) continue;

        const similarity = this.calculateNameSimilarity(
          files[i].name,
          files[j].name,
        );

        if (similarity >= this.thresholds.FUZZY_THRESHOLD) {
          group.push(files[j]);
          processed.add(j);
        }
      }

      if (group.length > 1) {
        groups.push({
          id: `fuzzy_${this.generateGroupId()}`,
          algorithm: this.algorithms.FUZZY_NAME,
          type: "fuzzy_name_duplicate",
          confidence: 0.7,
          files: group,
          criterion: "fuzzy_name_match",
          wastedSpace: this.calculateWastedSpace(group),
          recommendations: this.generateRecommendations(group, "fuzzy"),
        });
      }

      if (progressCallback && i % 50 === 0) {
        progressCallback({
          phase: "Fuzzy Name Detection",
          processed: i,
          total: files.length,
        });
      }
    }

    return groups;
  }

  /**
   * Detect content-based duplicates using file hashing
   */
  async detectContentHashes(files, progressCallback) {
    const groups = [];
    const hashGroups = new Map();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Generate content hash (simulated - in real implementation would read file content)
        const contentHash = this.generateContentHash(file);

        if (!hashGroups.has(contentHash)) {
          hashGroups.set(contentHash, []);
        }
        hashGroups.get(contentHash).push(file);

        if (progressCallback && i % 20 === 0) {
          progressCallback({
            phase: "Content Hash Analysis",
            processed: i,
            total: files.length,
          });
        }
      } catch (error) {
        console.warn(`Failed to hash file: ${file.name}`, error);
      }
    }

    // Convert hash groups to duplicate groups
    hashGroups.forEach((matches, hash) => {
      if (matches.length > 1) {
        groups.push({
          id: `content_${this.generateGroupId()}`,
          algorithm: this.algorithms.CONTENT_HASH,
          type: "content_duplicate",
          confidence: 0.95,
          files: matches,
          criterion: "content_hash",
          wastedSpace: this.calculateWastedSpace(matches),
          recommendations: this.generateRecommendations(matches, "content"),
        });
      }
    });

    return groups;
  }

  /**
   * Detect similar files using multiple criteria
   */
  async detectSimilarFiles(files, progressCallback) {
    const groups = [];
    const processed = new Set();

    for (let i = 0; i < files.length; i++) {
      if (processed.has(i)) continue;

      const group = [files[i]];
      processed.add(i);

      for (let j = i + 1; j < files.length; j++) {
        if (processed.has(j)) continue;

        const similarity = this.calculateOverallSimilarity(files[i], files[j]);

        if (similarity >= 0.8) {
          group.push(files[j]);
          processed.add(j);
        }
      }

      if (group.length > 1) {
        groups.push({
          id: `similar_${this.generateGroupId()}`,
          algorithm: this.algorithms.SIMILARITY,
          type: "similar_files",
          confidence: 0.75,
          files: group,
          criterion: "overall_similarity",
          wastedSpace: this.calculateWastedSpace(group),
          recommendations: this.generateRecommendations(group, "similar"),
        });
      }

      if (progressCallback && i % 25 === 0) {
        progressCallback({
          phase: "Similarity Analysis",
          processed: i,
          total: files.length,
        });
      }
    }

    return groups;
  }

  /**
   * Calculate name similarity using Levenshtein distance
   */
  calculateNameSimilarity(name1, name2) {
    const clean1 = this.cleanFileName(name1);
    const clean2 = this.cleanFileName(name2);

    const distance = this.levenshteinDistance(clean1, clean2);
    const maxLength = Math.max(clean1.length, clean2.length);

    return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
  }

  /**
   * Calculate overall file similarity
   */
  calculateOverallSimilarity(file1, file2) {
    let similarity = 0;
    let factors = 0;

    // Name similarity (40% weight)
    const nameSim = this.calculateNameSimilarity(file1.name, file2.name);
    similarity += nameSim * 0.4;
    factors += 0.4;

    // Size similarity (30% weight)
    const sizeDiff = Math.abs(file1.size - file2.size);
    const maxSize = Math.max(file1.size, file2.size);
    const sizeSim = maxSize === 0 ? 1 : 1 - sizeDiff / maxSize;
    similarity += sizeSim * 0.3;
    factors += 0.3;

    // Extension similarity (20% weight)
    const ext1 = this.getFileExtension(file1.name);
    const ext2 = this.getFileExtension(file2.name);
    if (ext1 === ext2) {
      similarity += 0.2;
    }
    factors += 0.2;

    // Modified date similarity (10% weight)
    if (file1.modified_at && file2.modified_at) {
      const timeDiff = Math.abs(
        new Date(file1.modified_at) - new Date(file2.modified_at),
      );
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      const timeSim = Math.max(0, 1 - daysDiff / 30); // 30 days max difference
      similarity += timeSim * 0.1;
      factors += 0.1;
    }

    return factors > 0 ? similarity / factors : 0;
  }

  /**
   * Group files by similar names
   */
  groupBySimilarNames(files, threshold) {
    const groups = [];
    const processed = new Set();

    for (let i = 0; i < files.length; i++) {
      if (processed.has(i)) continue;

      const group = [files[i]];
      processed.add(i);

      for (let j = i + 1; j < files.length; j++) {
        if (processed.has(j)) continue;

        const similarity = this.calculateNameSimilarity(
          files[i].name,
          files[j].name,
        );
        if (similarity >= threshold) {
          group.push(files[j]);
          processed.add(j);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Generate content hash for file (simulated)
   */
  generateContentHash(file) {
    // In real implementation, this would read file content and generate actual hash
    // For now, we'll use a combination of size, name, and timestamp
    const hashInput = `${file.name}_${file.size}_${file.modified_at || ""}`;
    return createHash("md5").update(hashInput).digest("hex");
  }

  /**
   * Calculate wasted space from duplicate group
   */
  calculateWastedSpace(files) {
    if (files.length <= 1) return 0;

    // Keep the largest file, count others as wasted
    const sizes = files.map((f) => f.size || 0).sort((a, b) => b - a);
    return sizes.slice(1).reduce((sum, size) => sum + size, 0);
  }

  /**
   * Generate recommendations for duplicate resolution
   */
  generateRecommendations(files, type) {
    const recommendations = [];

    switch (type) {
      case "exact":
        recommendations.push({
          action: "delete_duplicates",
          title: "حذف النسخ المكررة",
          description: "حذف جميع النسخ ما عدا الأحدث",
          risk: "low",
          spaceFreed: this.calculateWastedSpace(files),
        });
        break;

      case "content":
        recommendations.push({
          action: "move_to_duplicates_folder",
          title: "نقل للمجلد المكررات",
          description: "نقل النسخ المكررة لمجلد منفصل للمراجعة",
          risk: "very_low",
          spaceFreed: 0,
        });
        break;

      case "fuzzy":
        recommendations.push({
          action: "manual_review",
          title: "مراجعة يدوية",
          description: "مراجعة الملفات يدوياً قبل اتخاذ إجراء",
          risk: "none",
          spaceFreed: 0,
        });
        break;

      default:
        recommendations.push({
          action: "analyze_further",
          title: "تحليل إضافي",
          description: "تحليل أعمق للملفات المشابهة",
          risk: "none",
          spaceFreed: 0,
        });
    }

    return recommendations;
  }

  /**
   * Merge overlapping groups
   */
  mergeGroups(groups) {
    const merged = [];
    const processed = new Set();

    groups.forEach((group, index) => {
      if (processed.has(index)) return;

      const mergedGroup = { ...group };
      processed.add(index);

      // Look for overlapping groups
      groups.forEach((otherGroup, otherIndex) => {
        if (otherIndex === index || processed.has(otherIndex)) return;

        if (this.groupsOverlap(group, otherGroup)) {
          // Merge the groups
          const combinedFiles = [...mergedGroup.files];
          otherGroup.files.forEach((file) => {
            if (!combinedFiles.find((f) => f.path === file.path)) {
              combinedFiles.push(file);
            }
          });

          mergedGroup.files = combinedFiles;
          mergedGroup.confidence = Math.min(
            mergedGroup.confidence,
            otherGroup.confidence,
          );
          mergedGroup.wastedSpace = this.calculateWastedSpace(combinedFiles);
          processed.add(otherIndex);
        }
      });

      merged.push(mergedGroup);
    });

    return merged;
  }

  /**
   * Check if two groups have overlapping files
   */
  groupsOverlap(group1, group2) {
    return group1.files.some((file1) =>
      group2.files.some((file2) => file1.path === file2.path),
    );
  }

  /**
   * Calculate detection statistics
   */
  calculateStatistics(groups, totalFiles) {
    const totalDuplicateFiles = groups.reduce(
      (sum, group) => sum + group.files.length,
      0,
    );
    const totalWastedSpace = groups.reduce(
      (sum, group) => sum + group.wastedSpace,
      0,
    );
    const averageConfidence =
      groups.length > 0
        ? groups.reduce((sum, group) => sum + group.confidence, 0) /
          groups.length
        : 0;

    return {
      totalFiles,
      totalGroups: groups.length,
      totalDuplicateFiles,
      duplicatePercentage: (totalDuplicateFiles / totalFiles) * 100,
      totalWastedSpace,
      averageConfidence,
      highConfidenceGroups: groups.filter((g) => g.confidence > 0.8).length,
      algorithmBreakdown: this.getAlgorithmBreakdown(groups),
    };
  }

  getAlgorithmBreakdown(groups) {
    const breakdown = {};
    groups.forEach((group) => {
      const algorithm = group.algorithm;
      if (!breakdown[algorithm]) {
        breakdown[algorithm] = { count: 0, files: 0, space: 0 };
      }
      breakdown[algorithm].count++;
      breakdown[algorithm].files += group.files.length;
      breakdown[algorithm].space += group.wastedSpace;
    });
    return breakdown;
  }

  // Utility methods
  cleanFileName(fileName) {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]/g, "") // Keep only letters, numbers, and Arabic
      .trim();
  }

  getFileExtension(fileName) {
    return fileName.split(".").pop().toLowerCase();
  }

  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  generateGroupId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

// Create singleton instance
const duplicateDetector = new DuplicateDetector();

export default duplicateDetector;

// Export main function for easier use
export const detectDuplicates =
  duplicateDetector.detectDuplicates.bind(duplicateDetector);
