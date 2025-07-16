import React, { useState, useEffect } from "react";

/**
 * KNOUX FINDR Professional Authentication Screen
 * Addresses all identified issues and improvements:
 * - Clean header-less design during auth
 * - Comprehensive validation and feedback
 * - Responsive design
 * - Loading states and professional UX
 * - Prof. Sadek Elgazar attribution
 */

const ProfessionalAuthScreen = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState("signin"); // signin | signup
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [notification, setNotification] = useState(null);

  // Enhanced validation rules
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and numbers";
    }

    // Name validation for signup
    if (authMode === "signup") {
      if (!formData.name) {
        newErrors.name = "Full name is required";
      } else if (formData.name.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }

      // Confirm password
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      // Terms agreement
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms =
          "You must agree to the terms and privacy policy";
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
      showNotification("Please fix the errors below", "error");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate successful auth
      setShowSuccess(true);
      showNotification(
        authMode === "signup"
          ? "Account created successfully! Welcome to KNOUX FINDR"
          : "Welcome back! Redirecting to your dashboard...",
        "success",
      );

      setTimeout(() => {
        onAuthSuccess({
          name: formData.name || "Professional User",
          email: formData.email,
          authMethod: "email",
        });
      }, 1500);
    } catch (error) {
      showNotification("Authentication failed. Please try again.", "error");
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
    <div className="min-h-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-orb absolute top-20 left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div
          className="floating-orb absolute top-40 right-32 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="floating-orb absolute bottom-32 left-1/3 w-32 h-32 bg-green-500/5 rounded-full blur-xl"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="floating-orb absolute bottom-20 right-20 w-40 h-40 bg-pink-500/5 rounded-full blur-xl"
          style={{ animationDelay: "6s" }}
        ></div>

        {/* Animated Particles */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0)",
              backgroundSize: "50px 50px",
              animation: "float 20s ease-in-out infinite",
            }}
          ></div>
        </div>
      </div>

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

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Main Auth Card */}
        <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Official Logo */}
            <div className="text-6xl mb-4 animate-pulse-glow">🚀</div>

            {/* Brand Title */}
            <h1 className="text-3xl font-bold gradient-text mb-2 tracking-wider">
              KNOUX FINDR
            </h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-sm mb-4">
              Instant local file search. Organized by KNOUX AI.
            </p>

            {/* Professor Attribution */}
            <div className="glass-card rounded-lg p-3 mb-6 border border-amber-500/30 bg-amber-500/5">
              <div
                className="text-amber-400 font-bold tracking-wider"
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontStyle: "italic",
                  fontSize: "14px",
                }}
              >
                Powered by Prof. Sadek Elgazar
              </div>
              <div className="text-xs text-amber-300/80 mt-1">
                AI Research Director & Project Supervisor
              </div>
            </div>

            {/* Auth Mode Title */}
            <h2 className="text-xl font-semibold text-white mb-2">
              {authMode === "signup" ? "Create Your Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-400 text-sm">
              {authMode === "signup"
                ? "Join thousands of professionals using KNOUX FINDR"
                : "Sign in to access your intelligent file search"}
            </p>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Signup Only) */}
            {authMode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
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
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <span>❌</span> {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
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
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <span>❌</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
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
                    ? "Create a strong password"
                    : "Enter your password"
                }
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <span>❌</span> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password (Signup Only) */}
            {authMode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
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
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <span>❌</span> {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Terms Agreement (Signup Only) */}
            {authMode === "signup" && (
              <div>
                <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      handleInputChange("agreeToTerms", e.target.checked)
                    }
                    className={`mt-1 rounded ${errors.agreeToTerms ? "border-red-500" : ""}`}
                  />
                  <span>
                    I agree to the{" "}
                    <button
                      type="button"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
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
                      ? "Creating Account..."
                      : "Signing In..."}
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-xl mr-2">
                    {authMode === "signup" ? "🚀" : "🔐"}
                  </span>
                  {authMode === "signup" ? "Create Account" : "Sign In"}
                </>
              )}
            </button>
          </form>

          {/* Mode Toggle */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              {authMode === "signup"
                ? "Already have an account?"
                : "Don't have an account?"}
            </p>
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-blue-400 hover:text-blue-300 font-semibold mt-1 transition-colors"
            >
              {authMode === "signup" ? "Sign In" : "Sign Up"}
            </button>
          </div>

          {/* Help Section */}
          <div className="text-center mt-6 pt-6 border-t border-white/10">
            <button
              type="button"
              className="text-gray-400 hover:text-white text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <span>💬</span>
              Need help? Contact Support
            </button>
          </div>

          {/* Version Info */}
          <div className="text-center mt-4 text-xs text-gray-500">
            KNOUX FINDR Professional v1.0 • Powered by AI • Made with ❤️
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 glass-card rounded-lg border border-green-500/20 bg-green-500/5">
          <div className="flex items-start gap-3 text-sm">
            <span className="text-green-400 text-lg">🔒</span>
            <div className="text-green-300">
              <div className="font-semibold mb-1">
                Enterprise-Grade Security
              </div>
              <div className="text-green-400/80 text-xs">
                Your data is encrypted and stored locally. No files are uploaded
                to our servers.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAuthScreen;
