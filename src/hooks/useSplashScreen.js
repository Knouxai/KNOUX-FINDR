import { useState, useEffect } from "react";

/**
 * هوك مخصص لإدارة شاشة التحميل (Splash Screen)
 * @param {number} duration - مدة عرض الشاشة بالميللي ثانية (افتراضي: 2500)
 * @param {boolean} showOnMount - عرض الشاشة عند التحميل الأولي (افتراضي: true)
 * @returns {object} حالة وطرق التحكم في شاشة التحميل
 */
export const useSplashScreen = (duration = 2500, showOnMount = true) => {
  const [isVisible, setIsVisible] = useState(showOnMount);
  const [isLoading, setIsLoading] = useState(showOnMount);

  useEffect(() => {
    if (!showOnMount) return;

    const timer = setTimeout(() => {
      setIsLoading(false);
      // إضافة تأخير قصير للسماح بتأثير الخروج
      setTimeout(() => {
        setIsVisible(false);
      }, 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, showOnMount]);

  // دالة لإظهار شاشة التحميل يدوياً
  const showSplash = (customDuration = duration) => {
    setIsVisible(true);
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        setIsVisible(false);
      }, 500);
    }, customDuration);

    return () => clearTimeout(timer);
  };

  // دالة لإخفاء شاشة التحميل فوراً
  const hideSplash = () => {
    setIsLoading(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  return {
    isVisible,
    isLoading,
    showSplash,
    hideSplash,
  };
};

/**
 * هوك لإدارة شاشة التحميل أثناء التنقل بين الصفحات
 * @param {string} currentPage - الصفحة الحالية
 * @param {number} transitionDuration - مدة الانتقال (افتراضي: 1500)
 * @returns {object} حالة شاشة التحميل للتنقل
 */
export const useNavigationSplash = (currentPage, transitionDuration = 1500) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousPage, setPreviousPage] = useState(currentPage);

  useEffect(() => {
    // إذا تغيرت الصفحة وكانت صفحة محمية
    const protectedPages = [
      "dashboard",
      "search",
      "timeline",
      "stats",
      "powerops",
      "encryption",
      "cloudsync",
    ];

    if (currentPage !== previousPage && protectedPages.includes(currentPage)) {
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPreviousPage(currentPage);
      }, transitionDuration);

      return () => clearTimeout(timer);
    } else {
      setPreviousPage(currentPage);
    }
  }, [currentPage, previousPage, transitionDuration]);

  return {
    isTransitioning,
  };
};

export default useSplashScreen;
