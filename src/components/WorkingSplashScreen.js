import React, { useState, useEffect } from "react";

const WorkingSplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("تهيئة النظام...");
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { label: "تهيئة النظام...", duration: 800 },
    { label: "تحميل الخدمات...", duration: 600 },
    { label: "فحص قاعدة البيانات...", duration: 700 },
    { label: "تفعيل الذكاء الاصطناعي...", duration: 900 },
    { label: "إعداد محرك البحث...", duration: 500 },
    { label: "الانتهاء...", duration: 400 },
  ];

  useEffect(() => {
    let currentStepIndex = 0;
    let progressValue = 0;

    const runStep = () => {
      if (currentStepIndex >= steps.length) {
        setIsComplete(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
        return;
      }

      const step = steps[currentStepIndex];
      setCurrentStep(step.label);

      const stepProgress = 100 / steps.length;
      const targetProgress = (currentStepIndex + 1) * stepProgress;

      const interval = setInterval(() => {
        progressValue += 2;
        setProgress(Math.min(progressValue, targetProgress));

        if (progressValue >= targetProgress) {
          clearInterval(interval);
          currentStepIndex++;
          setTimeout(runStep, 200);
        }
      }, step.duration / 50);
    };

    // Start the sequence after a short delay
    setTimeout(runStep, 300);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br from-[#1a1b54] via-[#0d0e38] to-[#020515] font-jakarta flex items-center justify-center transition-opacity duration-1000 ${
        isComplete ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-40 right-32 w-64 h-64 bg-purple-500/6 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/3 w-48 h-48 bg-cyan-500/5 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-8">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-6xl mb-4 animate-bounce">🚀</div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            KNOUX FINDR
          </h1>
          <p className="text-gray-300 text-lg">محرك البحث الذكي</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          <div className="text-white text-lg mb-2">{currentStep}</div>
          <div className="text-gray-400 text-sm">
            {Math.round(progress)}% مكتمل
          </div>
        </div>

        {/* Features Preview */}
        <div className="text-center text-sm text-gray-400">
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
          </div>
        </div>

        {/* Attribution */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
            <div className="text-amber-400 text-xs font-semibold">
              Powered by Prof. Sadek Elgazar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingSplashScreen;
