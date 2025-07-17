import React, { useState, useEffect } from "react";

const SplashScreen = ({ onComplete, isElectron }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("initializing");
  const [indexingStats, setIndexingStats] = useState({});
  const [animationPhase, setAnimationPhase] = useState("loading"); // loading, ready, complete

  const loadingSteps = [
    { key: "initializing", label: "تهيئة التطبيق...", duration: 800 },
    { key: "checking-system", label: "فحص النظام...", duration: 600 },
    {
      key: "loading-database",
      label: "تحميل قاعدة البيانات...",
      duration: 1000,
    },
    { key: "preparing-indexer", label: "تحضير محرك الفهرسة...", duration: 700 },
    { key: "loading-ai", label: "تحميل الذكاء الاصطناعي...", duration: 900 },
    { key: "finalizing", label: "اللمسات الأخيرة...", duration: 500 },
  ];

  useEffect(() => {
    let currentStepIndex = 0;
    let progressTimer;
    let stepTimer;

    const processStep = () => {
      if (currentStepIndex >= loadingSteps.length) {
        setAnimationPhase("ready");
        setTimeout(() => {
          setAnimationPhase("complete");
          setTimeout(onComplete, 500);
        }, 1000);
        return;
      }

      const step = loadingSteps[currentStepIndex];
      setCurrentStep(step.key);

      // تحديث التقدم تدريجياً
      const startProgress = (currentStepIndex / loadingSteps.length) * 100;
      const endProgress = ((currentStepIndex + 1) / loadingSteps.length) * 100;
      let currentProgress = startProgress;

      progressTimer = setInterval(() => {
        currentProgress += (endProgress - startProgress) / (step.duration / 50);
        if (currentProgress >= endProgress) {
          currentProgress = endProgress;
          clearInterval(progressTimer);
        }
        setLoadingProgress(Math.min(currentProgress, 100));
      }, 50);

      // الانتقال للخطوة التالية
      stepTimer = setTimeout(() => {
        currentStepIndex++;
        processStep();
      }, step.duration);
    };

    // بدء عملية التحميل
    setTimeout(processStep, 300);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(stepTimer);
    };
  }, [onComplete]);

  // تحميل إحصائيات الفهرسة إذا كان متاحاً
  useEffect(() => {
    if (isElectron && window.electronAPI) {
      window.electronAPI
        .getFileStats()
        .then((stats) => {
          setIndexingStats(stats);
        })
        .catch(console.error);
    }
  }, [isElectron]);

  const getStepLabel = (stepKey) => {
    const step = loadingSteps.find((s) => s.key === stepKey);
    return step ? step.label : "تحميل...";
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("ar-SA").format(num);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 بايت";
    const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت", "تيرابايت"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ${
        animationPhase === "complete"
          ? "opacity-0 scale-110"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1b54] via-[#0d0e38] to-[#020515]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-orb absolute top-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="floating-orb absolute top-40 right-32 w-64 h-64 bg-purple-500/8 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="floating-orb absolute bottom-32 left-1/3 w-48 h-48 bg-cyan-500/6 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
          <div
            className="floating-orb absolute bottom-20 right-20 w-56 h-56 bg-indigo-500/8 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "6s" }}
          ></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(100, 200, 255, 0.4) 1px, transparent 0)",
              backgroundSize: "80px 80px",
              animation: "float 30s ease-in-out infinite",
            }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-lg mx-auto px-8">
        {/* Logo & Brand */}
        <div className="mb-12">
          <div
            className={`text-8xl mb-6 transition-all duration-1000 ${
              animationPhase === "ready" ? "animate-bounce" : ""
            }`}
          >
            🚀
          </div>
          <h1
            className={`text-5xl font-bold mb-4 tracking-wider transition-all duration-1000 ${
              animationPhase === "loading" ? "login-brand-title" : "text-white"
            }`}
          >
            KNOUX FINDR
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            محرك البحث الذكي للملفات المحلية
          </p>
          <p className="text-sm text-gray-400 mb-8">
            مدعوم بالذكاء الاصطناعي المتقدم
          </p>
        </div>

        {/* Loading Progress */}
        <div className="mb-8">
          <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg text-white mb-2">
              {getStepLabel(currentStep)}
            </p>
            <p className="text-sm text-gray-400">
              {Math.round(loadingProgress)}% مكتمل
            </p>
          </div>
        </div>

        {/* Stats Preview */}
        {indexingStats.totalFiles && (
          <div className="glass-card rounded-2xl p-6 mb-8 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              إحصائيات سريعة
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {formatNumber(indexingStats.totalFiles)}
                </div>
                <div className="text-xs text-gray-400">ملف مفهرس</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {formatFileSize(indexingStats.totalSize)}
                </div>
                <div className="text-xs text-gray-400">إجمالي الحجم</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {indexingStats.totalTypes || 0}
                </div>
                <div className="text-xs text-gray-400">نوع ملف</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {indexingStats.analyzedFiles || 0}
                </div>
                <div className="text-xs text-gray-400">ملف محلل</div>
              </div>
            </div>
          </div>
        )}

        {/* Features Preview */}
        <div className="text-center text-sm text-gray-400 mb-8">
          <p className="mb-2">مميزات متقدمة:</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="px-2 py-1 bg-blue-500/20 rounded border border-blue-500/30">
              بحث فوري
            </span>
            <span className="px-2 py-1 bg-purple-500/20 rounded border border-purple-500/30">
              ذكاء اصطناعي
            </span>
            <span className="px-2 py-1 bg-green-500/20 rounded border border-green-500/30">
              كشف المكررات
            </span>
            <span className="px-2 py-1 bg-yellow-500/20 rounded border border-yellow-500/30">
              تنظيم تلقائي
            </span>
          </div>
        </div>

        {/* Professor Attribution */}
        <div className="text-center">
          <div className="inline-block glass-card rounded-lg p-3 border border-amber-500/30 bg-amber-500/5">
            <div
              className="text-amber-400 font-bold text-sm"
              style={{
                fontFamily: '"Playfair Display", serif',
                fontStyle: "italic",
              }}
            >
              Powered by Prof. Sadek Elgazar
            </div>
            <div className="text-xs text-amber-300/70 mt-1">
              AI Research Director
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
