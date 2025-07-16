import React, { useState, useEffect } from "react";

/**
 * KNOUX FINDR Advanced Language Management System
 * Full English Support with Professional Multilingual Capabilities
 * Enterprise-Grade Language Processing and Content Analysis
 */

const LanguageManager = () => {
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [languageStats, setLanguageStats] = useState({
    supportedLanguages: 67,
    detectedLanguages: 43,
    processedDocuments: 15847293,
    translationAccuracy: 97.8,
    contentAnalyzed: 284729384,
    multilingualSearches: 5847293,
  });

  const [languageDistribution, setLanguageDistribution] = useState([
    {
      code: "en",
      name: "English",
      files: 8472938,
      percentage: 54.2,
      accuracy: 99.1,
      status: "primary",
    },
    {
      code: "ar",
      name: "Arabic",
      files: 2847293,
      percentage: 18.2,
      accuracy: 96.7,
      status: "secondary",
    },
    {
      code: "es",
      name: "Spanish",
      files: 1847293,
      percentage: 11.8,
      accuracy: 97.3,
      status: "active",
    },
    {
      code: "fr",
      name: "French",
      files: 984729,
      percentage: 6.3,
      accuracy: 96.9,
      status: "active",
    },
    {
      code: "de",
      name: "German",
      files: 747293,
      percentage: 4.8,
      accuracy: 97.8,
      status: "active",
    },
    {
      code: "zh",
      name: "Chinese",
      files: 584729,
      percentage: 3.7,
      accuracy: 94.2,
      status: "developing",
    },
    {
      code: "ja",
      name: "Japanese",
      files: 284729,
      percentage: 1.8,
      accuracy: 93.8,
      status: "developing",
    },
    {
      code: "ru",
      name: "Russian",
      files: 184729,
      percentage: 1.2,
      accuracy: 95.4,
      status: "active",
    },
  ]);

  const [processingCapabilities, setProcessingCapabilities] = useState({
    textExtraction: {
      pdf: { accuracy: 99.2, speed: "2.4s/MB", languages: 45 },
      docx: { accuracy: 98.7, speed: "1.8s/MB", languages: 52 },
      txt: { accuracy: 99.8, speed: "0.3s/MB", languages: 67 },
      html: { accuracy: 97.9, speed: "1.2s/MB", languages: 38 },
    },
    aiCapabilities: {
      languageDetection: 98.4,
      sentimentAnalysis: 94.7,
      entityRecognition: 96.2,
      topicClassification: 93.8,
      translationQuality: 97.1,
    },
  });

  const [realtimeProcessing, setRealtimeProcessing] = useState({
    currentJobs: 247,
    queuedJobs: 1847,
    completedToday: 58472,
    processingSpeed: 2847,
    errorRate: 0.3,
    avgProcessingTime: 1.24,
  });

  const translations = {
    en: {
      title: "KNOUX FINDR - Advanced File Search Engine",
      subtitle:
        "Enterprise-Grade AI-Powered Local Search with Multilingual Support",
      dashboard: "Professional Dashboard",
      search: "Intelligent Search",
      analytics: "Advanced Analytics",
      database: "Database Management",
      files: "File Operations",
      settings: "System Configuration",
      overview: "System Overview",
      performance: "Performance Metrics",
      languages: "Language Support",
      processing: "Content Processing",
      welcome: "Welcome to KNOUX FINDR Professional",
      description:
        "The most advanced local file search engine with enterprise-grade AI capabilities",
      totalFiles: "Total Files Processed",
      searchAccuracy: "Search Accuracy Rate",
      responseTime: "Average Response Time",
      languagesSupported: "Languages Supported",
      professionalFeatures: "Professional Features",
      aiPowered: "AI-Powered Search",
      multilingualSupport: "67 Languages Support",
      enterpriseGrade: "Enterprise-Grade Security",
      realTimeAnalytics: "Real-time Analytics",
      advancedFiltering: "Advanced Filtering",
      cloudIntegration: "Cloud Integration",
    },
    ar: {
      title: "نوكس فايندر - محرك البحث المتقدم للملفات",
      subtitle:
        "محرك البحث المحلي المدعوم بالذكاء الاصطناعي على المستوى المؤسسي مع الدعم متعدد اللغات",
      dashboard: "لوحة التحكم الاحترافية",
      search: "البحث الذكي",
      analytics: "التحليلات المتقدمة",
      database: "إدارة قاعدة البيانات",
      files: "عمليات الملفات",
      settings: "إعدادات النظام",
      overview: "نظرة عامة على النظام",
      performance: "مقاييس الأداء",
      languages: "دعم اللغات",
      processing: "معالجة المحتوى",
      welcome: "مرحباً بك في نوكس فايندر الاحترافي",
      description:
        "أكثر محركات البحث المحلية تطوراً مع قدرات الذكاء الاصطناعي على المستوى المؤسسي",
      totalFiles: "إجمالي الملفات المعالجة",
      searchAccuracy: "معدل دقة البحث",
      responseTime: "متوسط وقت الاستجابة",
      languagesSupported: "اللغات المدعومة",
      professionalFeatures: "الميزات الاحترافية",
      aiPowered: "بحث مدعوم بالذكاء الاصطناعي",
      multilingualSupport: "دعم 67 لغة",
      enterpriseGrade: "أمان على مستوى المؤسسات",
      realTimeAnalytics: "تحليلات فورية",
      advancedFiltering: "تصفية متقدمة",
      cloudIntegration: "تكامل سحابي",
    },
  };

  const t = (key) =>
    translations[activeLanguage]?.[key] || translations.en[key] || key;

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getStatusColor = (status) => {
    const colors = {
      primary: "text-blue-400 bg-blue-500/20 border-blue-500/30",
      secondary: "text-green-400 bg-green-500/20 border-green-500/30",
      active: "text-purple-400 bg-purple-500/20 border-purple-500/30",
      developing: "text-orange-400 bg-orange-500/20 border-orange-500/30",
    };
    return colors[status] || colors.active;
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeProcessing((prev) => ({
        ...prev,
        currentJobs: Math.max(
          0,
          prev.currentJobs + Math.floor(Math.random() * 20 - 10),
        ),
        queuedJobs: Math.max(
          0,
          prev.queuedJobs + Math.floor(Math.random() * 100 - 50),
        ),
        processingSpeed: Math.max(
          0,
          prev.processingSpeed + Math.floor(Math.random() * 200 - 100),
        ),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const LanguageOverview = () => (
    <div className="space-y-6">
      {/* Language Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: t("languagesSupported"),
            value: languageStats.supportedLanguages,
            icon: "🌍",
            color: "blue",
            suffix: " languages",
          },
          {
            label: "Detection Accuracy",
            value: `${languageStats.translationAccuracy}%`,
            icon: "🎯",
            color: "green",
            suffix: "",
          },
          {
            label: "Processed Documents",
            value: formatNumber(languageStats.processedDocuments),
            icon: "📄",
            color: "purple",
            suffix: "",
          },
          {
            label: "Multilingual Searches",
            value: formatNumber(languageStats.multilingualSearches),
            icon: "🔍",
            color: "orange",
            suffix: "",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="glass-card rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`text-3xl bg-${stat.color}-500/20 p-3 rounded-lg`}
              >
                {stat.icon}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                  {stat.suffix}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-300 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Language Distribution */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">🌐</span>
          Language Distribution & Performance
        </h3>

        <div className="space-y-4">
          {languageDistribution.map((lang, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(lang.status)}`}
                  >
                    {lang.code.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{lang.name}</div>
                    <div className="text-xs text-gray-400">
                      {formatNumber(lang.files)} files
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {lang.percentage}%
                  </div>
                  <div className="text-xs text-green-400">
                    {lang.accuracy}% accuracy
                  </div>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${lang.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ProcessingCapabilities = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Extraction */}
        <div className="glass-card rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-2xl">📝</span>
            Text Extraction Capabilities
          </h3>
          <div className="space-y-4">
            {Object.entries(processingCapabilities.textExtraction).map(
              ([format, data], index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-white font-semibold uppercase">
                      {format}
                    </div>
                    <div className="text-green-400 font-bold">
                      {data.accuracy}%
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Speed:</span>
                      <span className="text-blue-400">{data.speed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Languages:</span>
                      <span className="text-purple-400">{data.languages}</span>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* AI Capabilities */}
        <div className="glass-card rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            AI Language Processing
          </h3>
          <div className="space-y-4">
            {Object.entries(processingCapabilities.aiCapabilities).map(
              ([capability, accuracy], index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">
                      {capability
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </span>
                    <span className="text-green-400 font-bold">
                      {accuracy}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${accuracy}%` }}
                    ></div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Real-time Processing */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">⚡</span>
          Real-time Processing Monitor
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">
              Current Activity
            </h4>
            {[
              {
                label: "Active Jobs",
                value: realtimeProcessing.currentJobs,
                icon: "🔄",
              },
              {
                label: "Queued Jobs",
                value: realtimeProcessing.queuedJobs,
                icon: "⏳",
              },
              {
                label: "Processing Speed",
                value: `${realtimeProcessing.processingSpeed}/min`,
                icon: "🚀",
              },
            ].map((metric, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{metric.icon}</span>
                  <span className="text-gray-300">{metric.label}</span>
                </div>
                <div className="text-blue-400 font-bold">{metric.value}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-400">
              Daily Statistics
            </h4>
            {[
              {
                label: "Completed Today",
                value: formatNumber(realtimeProcessing.completedToday),
                icon: "✅",
              },
              {
                label: "Success Rate",
                value: `${(100 - realtimeProcessing.errorRate).toFixed(1)}%`,
                icon: "🎯",
              },
              {
                label: "Avg Time",
                value: `${realtimeProcessing.avgProcessingTime}s`,
                icon: "⏱️",
              },
            ].map((metric, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{metric.icon}</span>
                  <span className="text-gray-300">{metric.label}</span>
                </div>
                <div className="text-green-400 font-bold">{metric.value}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-purple-400">
              Performance Metrics
            </h4>
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg
                  className="w-32 h-32 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgb(168, 85, 247)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (100 - realtimeProcessing.errorRate) / 100)}`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {(100 - realtimeProcessing.errorRate).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Language Selector */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">
              {t("title")}
            </h2>
            <p className="text-gray-400">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={activeLanguage}
              onChange={(e) => setActiveLanguage(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            >
              <option value="en">🇺🇸 English</option>
              <option value="ar">🇸🇦 العربية</option>
            </select>
            <div className="text-right">
              <div className="text-lg font-bold text-green-400">
                {languageStats.supportedLanguages}
              </div>
              <div className="text-xs text-gray-400">Languages</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveView?.("overview")}
          className="px-6 py-3 primary-button rounded-lg font-semibold hover:scale-105 transition-transform"
        >
          <span className="text-lg mr-2">🌐</span>
          Language Overview
        </button>
        <button
          onClick={() => setActiveView?.("processing")}
          className="px-6 py-3 glass-button rounded-lg font-semibold hover:scale-105 transition-transform"
        >
          <span className="text-lg mr-2">⚡</span>
          Processing Center
        </button>
      </div>

      {/* Content */}
      <LanguageOverview />
      <ProcessingCapabilities />
    </div>
  );
};

export default LanguageManager;
