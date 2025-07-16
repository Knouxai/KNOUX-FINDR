import React, { useState, useEffect } from "react";

const LocalAuthForm = ({ onAuthSuccess, mode = "signin" }) => {
  const [authMode, setAuthMode] = useState(mode);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Enhanced validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "الرجاء إدخال بريد إلكتروني صحيح";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 8) {
      newErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام";
    }

    // Name validation for signup
    if (authMode === "signup") {
      if (!formData.name) {
        newErrors.name = "الاسم الكامل مطلوب";
      } else if (formData.name.length < 2) {
        newErrors.name = "الاسم يجب أن يكون حرفين على الأقل";
      }

      // Confirm password
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
      }

      // Terms agreement
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = "يجب الموافقة على الشروط والأحكام";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification("الرجاء تصحيح الأخطاء أدناه", "error");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = authMode === "signup" ? "/auth/register" : "/auth/login";
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        showNotification(
          authMode === "signup"
            ? "تم إنشاء الحساب بنجاح! مرحباً بك في KNOUX FINDR"
            : "مرحباً بك مرة أخرى! جارٍ التوجه إلى لوحة التحكم...",
          "success",
        );

        // Store token in localStorage
        if (result.token) {
          localStorage.setItem("knoux_token", result.token);
        }

        setTimeout(() => {
          onAuthSuccess({
            ...result.user,
            authMethod: "local",
            token: result.token,
          });
        }, 1500);
      } else {
        showNotification(result.error || "فشل في المصادقة", "error");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      showNotification("خطأ في الاتصال بالخادم", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === "signin" ? "signup" : "signin"));
    setErrors({});
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Notifications */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 max-w-md p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500/20 border border-green-500/30 text-green-400"
              : "bg-red-500/20 border border-red-500/30 text-red-400"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {notification.type === "success" ? "✅" : "❌"}
            </span>
            {notification.message}
          </div>
        </div>
      )}

      {/* Local Auth Form */}
      <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {authMode === "signup" ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </h2>
          <p className="text-gray-400 text-sm">
            {authMode === "signup"
              ? "انضم إلى آلاف المحترفين الذين يستخدمون KNOUX FINDR"
              : "الوصول إلى محرك البحث الذكي للملفات"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Signup Only) */}
          {authMode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-3 rounded-lg glass-card text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? "border border-red-500/50 focus:ring-red-500/50"
                    : "focus:ring-blue-500/50"
                }`}
                placeholder="أدخل اسمك الكامل"
                dir="rtl"
              />
              {errors.name && (
                <p
                  className="text-red-400 text-xs mt-1 flex items-center gap-1"
                  dir="rtl"
                >
                  <span>❌</span> {errors.name}
                </p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`w-full px-4 py-3 rounded-lg glass-card text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? "border border-red-500/50 focus:ring-red-500/50"
                  : "focus:ring-blue-500/50"
              }`}
              placeholder="أدخل بريدك الإلكتروني"
              dir="ltr"
            />
            {errors.email && (
              <p
                className="text-red-400 text-xs mt-1 flex items-center gap-1"
                dir="rtl"
              >
                <span>❌</span> {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`w-full px-4 py-3 rounded-lg glass-card text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                errors.password
                  ? "border border-red-500/50 focus:ring-red-500/50"
                  : "focus:ring-blue-500/50"
              }`}
              placeholder={
                authMode === "signup"
                  ? "أنشئ كلمة مرور قوية"
                  : "أدخل كلمة المرور"
              }
              dir="ltr"
            />
            {errors.password && (
              <p
                className="text-red-400 text-xs mt-1 flex items-center gap-1"
                dir="rtl"
              >
                <span>❌</span> {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password (Signup Only) */}
          {authMode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`w-full px-4 py-3 rounded-lg glass-card text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword
                    ? "border border-red-500/50 focus:ring-red-500/50"
                    : "focus:ring-blue-500/50"
                }`}
                placeholder="أكد كلمة المرور"
                dir="ltr"
              />
              {errors.confirmPassword && (
                <p
                  className="text-red-400 text-xs mt-1 flex items-center gap-1"
                  dir="rtl"
                >
                  <span>❌</span> {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Terms Agreement (Signup Only) */}
          {authMode === "signup" && (
            <div>
              <label
                className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer"
                dir="rtl"
              >
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) =>
                    handleInputChange("agreeToTerms", e.target.checked)
                  }
                  className={`mt-1 rounded ${errors.agreeToTerms ? "border-red-500" : ""}`}
                />
                <span>
                  أوافق على{" "}
                  <button
                    type="button"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    شروط الخدمة
                  </button>{" "}
                  و{" "}
                  <button
                    type="button"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    سياسة الخصوصية
                  </button>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p
                  className="text-red-400 text-xs mt-1 flex items-center gap-1"
                  dir="rtl"
                >
                  <span>❌</span> {errors.agreeToTerms}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
              isLoading
                ? "bg-gray-600 cursor-not-allowed"
                : "primary-button hover:scale-105 shadow-lg"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="loading-spinner w-5 h-5"></div>
                <span>
                  {authMode === "signup"
                    ? "جارٍ إنشاء الحساب..."
                    : "جارٍ تسجيل الدخول..."}
                </span>
              </div>
            ) : (
              <>
                <span className="text-xl mr-2">
                  {authMode === "signup" ? "🚀" : "🔐"}
                </span>
                {authMode === "signup" ? "إنشاء حساب" : "تسجيل الدخول"}
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="text-center mt-6" dir="rtl">
          <p className="text-gray-400 text-sm">
            {authMode === "signup" ? "لديك حساب بالفعل؟" : "لا تملك حساباً؟"}
          </p>
          <button
            type="button"
            onClick={toggleAuthMode}
            className="text-blue-400 hover:text-blue-300 font-semibold mt-1 transition-colors"
          >
            {authMode === "signup" ? "تسجيل الدخول" : "إنشاء حساب"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalAuthForm;
