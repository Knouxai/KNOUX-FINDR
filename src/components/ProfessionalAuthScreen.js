import React, { useState, useEffect } from "react";
import LocalAuthForm from "./LocalAuthForm";

/**
 * KNOUX FINDR Professional Authentication Screen
 * Enhanced Features:
 * - Real OAuth integration with Apple, Microsoft
 * - Local email/password authentication
 * - Dynamic UI based on auth state
 * - JWT token management
 * - Enhanced security and validation
 * - Arabic RTL support
 * - Prof. Sadek Elgazar attribution protection
 */

const ProfessionalAuthScreen = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState("signin"); // signin | signup | local
  const [isLoading, setIsLoading] = useState(false);
  const [showLocalAuth, setShowLocalAuth] = useState(false);
  const [notification, setNotification] = useState(null);
  const [user, setUser] = useState(null);

  // Check for existing authentication
  useEffect(() => {
    const token = localStorage.getItem("knoux_token");
    if (token) {
      // Verify token with server
      fetch("http://localhost:3001/api/verify-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setUser(result.user);
            onAuthSuccess({
              ...result.user,
              token,
              authMethod: "token",
            });
          } else {
            localStorage.removeItem("knoux_token");
          }
        })
        .catch((error) => {
          console.error("Token verification failed:", error);
          localStorage.removeItem("knoux_token");
        });
    }
  }, [onAuthSuccess]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle OAuth success callback
  const handleOAuthSuccess = (provider) => {
    setIsLoading(true);
    showNotification(`جارٍ تسجيل الدخول عبر ${provider}...`, "success");

    // OAuth providers will redirect to their respective endpoints
    // The server will handle the authentication and redirect back
  };

  // Handle local auth success
  const handleLocalAuthSuccess = (userData) => {
    setUser(userData);
    onAuthSuccess(userData);
  };

  const toggleLocalAuth = () => {
    setShowLocalAuth(!showLocalAuth);
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

          {/* Local Auth Form or OAuth Options */}
          {showLocalAuth ? (
            <LocalAuthForm
              onAuthSuccess={handleLocalAuthSuccess}
              mode={authMode}
            />
          ) : (
            <div className="space-y-3 mb-6">
              <div className="text-center text-sm text-gray-400 mb-4">
                خيارات تسجيل الدخول السريع
              </div>

              {/* Apple Login */}
              <button
                type="button"
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
                onClick={() => {
                  handleOAuthSuccess("Apple");
                  window.open("http://localhost:3001/auth/apple", "_self");
                }}
              >
                <span className="text-2xl">🍎</span>
                <span>المتابعة مع Apple</span>
              </button>

              {/* Microsoft Login */}
              <button
                type="button"
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
                onClick={() => {
                  handleOAuthSuccess("Microsoft");
                  window.open("http://localhost:3001/auth/microsoft", "_self");
                }}
              >
                <span className="text-2xl">🟦</span>
                <span>المتابعة مع Microsoft</span>
              </button>

              {/* Google Login */}
              <button
                type="button"
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
                onClick={() => {
                  handleOAuthSuccess("Google");
                  window.open("http://localhost:3001/auth/google", "_self");
                }}
              >
                <span className="text-2xl">🟢</span>
                <span>المتابعة مع Google</span>
              </button>

              {/* GitHub Login */}
              <button
                type="button"
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
                onClick={() => {
                  handleOAuthSuccess("GitHub");
                  window.open("http://localhost:3001/auth/github", "_self");
                }}
              >
                <span className="text-2xl">⚫</span>
                <span>المتابعة مع GitHub</span>
              </button>

              {/* Facebook Login */}
              <button
                type="button"
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
                onClick={() => {
                  handleOAuthSuccess("Facebook");
                  window.open("http://localhost:3001/auth/facebook", "_self");
                }}
              >
                <span className="text-2xl">🔵</span>
                <span>المتابعة مع Facebook</span>
              </button>

              {/* Local Auth Toggle */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-white/20"></div>
                <span className="px-4 text-gray-400 text-sm">أو</span>
                <div className="flex-1 border-t border-white/20"></div>
              </div>

              <button
                type="button"
                onClick={toggleLocalAuth}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border border-blue-500/30 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
              >
                <span className="text-2xl">📧</span>
                <span>تسجيل دخول بالبريد الإلكتروني</span>
              </button>
            </div>
          )}

          {/* Back to OAuth Button */}
          {showLocalAuth && (
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={toggleLocalAuth}
                className="text-blue-400 hover:text-blue-300 font-semibold mt-1 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <span>←</span>
                <span>العودة إلى خيارات تسجيل الدخول السريع</span>
              </button>
            </div>
          )}

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

          {/* Professor Attribution - Moved to bottom */}
          <div className="glass-card rounded-lg p-3 mt-4 border border-amber-500/30 bg-amber-500/5">
            <div
              className="text-amber-400 font-bold tracking-wider text-center"
              style={{
                fontFamily: '"Playfair Display", serif',
                fontStyle: "italic",
                fontSize: "14px",
              }}
            >
              Powered by Prof. Sadek Elgazar
            </div>
            <div className="text-xs text-amber-300/80 mt-1 text-center">
              AI Research Director & Project Supervisor
            </div>
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
