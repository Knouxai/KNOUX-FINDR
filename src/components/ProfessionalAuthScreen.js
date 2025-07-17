import React, { useState, useEffect } from "react";
import LocalAuthForm from "./LocalAuthForm";
import { API_ENDPOINTS, apiCall } from "../config/api";

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

  // Check for existing authentication or OAuth success
  useEffect(() => {
    // Check for OAuth success in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const token = urlParams.get("token");
    const provider = urlParams.get("provider");

    if (success === "true" && token) {
      // OAuth success detected
      setIsLoading(true);
      showNotification(`تم تسجيل الدخول بنجاح عبر ${provider}!`, "success");

      // Store token and fetch user data
      localStorage.setItem("knoux_token", token);

      // Fetch user data from /api/user
      apiCall(API_ENDPOINTS.GET_USER, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((userData) => {
          setUser(userData);
          onAuthSuccess({
            ...userData,
            token,
            provider,
            authMethod: "oauth",
          });
        })
        .catch((error) => {
          console.error("Failed to fetch user data:", error);
          showNotification("فشل في جلب بيانات المستخدم", "error");
          setIsLoading(false);
        });

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Check for existing token
    const existingToken = localStorage.getItem("knoux_token");
    if (existingToken) {
      // Verify token with server
      fetch("http://localhost:3001/api/verify-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${existingToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: existingToken }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setUser(result.user);
            onAuthSuccess({
              ...result.user,
              token: existingToken,
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
    // After successful OAuth, the server should redirect to /dashboard with session data
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a1b54] via-[#0d0e38] to-[#020515] font-jakarta flex overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-orb absolute top-20 left-20 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl"></div>
        <div
          className="floating-orb absolute top-40 right-32 w-64 h-64 bg-purple-500/6 rounded-full blur-2xl"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="floating-orb absolute bottom-32 left-1/3 w-48 h-48 bg-cyan-500/5 rounded-full blur-xl"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="floating-orb absolute bottom-20 right-20 w-56 h-56 bg-indigo-500/6 rounded-full blur-xl"
          style={{ animationDelay: "6s" }}
        ></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(100, 200, 255, 0.3) 1px, transparent 0)",
              backgroundSize: "80px 80px",
              animation: "float 30s ease-in-out infinite",
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

      {/* Left Side - Brand Section */}
      <div className="flex-1 flex items-center justify-center px-12">
        <div className="text-left max-w-lg">
          <div className="mb-8">
            <div className="text-sm font-medium text-gray-400 mb-4 tracking-widest">
              INSPIRED BY THE FUTURE
            </div>
            <h1 className="text-6xl font-bold login-brand-title mb-6 tracking-wider leading-tight">
              KNOUX FINDR
              <br />
              <span className="text-5xl">SEARCH</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              The most powerful local file search engine with AI-powered
              organization.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Card */}
      <div className="w-[480px] flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {/* Main Auth Card */}
          <div className="auth-glass-card rounded-3xl p-8 border border-white/15 shadow-2xl backdrop-blur-3xl">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
              <p className="text-gray-400 text-sm mb-6">
                Use these awesome forms to login or create new account in your
                project for free.
              </p>

              <div className="text-center mb-6">
                <span className="text-sm font-medium text-white">
                  Register with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            {showLocalAuth ? (
              <LocalAuthForm
                onAuthSuccess={handleLocalAuthSuccess}
                mode={authMode}
              />
            ) : (
              <div className="space-y-4 mb-6">
                {/* Social Login Buttons Row */}
                <div className="flex justify-center gap-4 mb-6">
                  {/* Facebook */}
                  <button
                    type="button"
                    className="social-icon-btn bg-white/10 hover:bg-blue-600/20 border border-white/20 hover:border-blue-500/40 group"
                    onClick={() => {
                      handleOAuthSuccess("Facebook");
                      window.open(
                        "http://localhost:3001/auth/facebook",
                        "_self",
                      );
                    }}
                  >
                    <svg
                      className="w-6 h-6 text-blue-500 group-hover:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>

                  {/* Apple */}
                  <button
                    type="button"
                    className="social-icon-btn bg-white/10 hover:bg-gray-600/20 border border-white/20 hover:border-gray-400/40 group"
                    onClick={() => {
                      handleOAuthSuccess("Apple");
                      window.open("http://localhost:3001/auth/apple", "_self");
                    }}
                  >
                    <svg
                      className="w-6 h-6 text-white group-hover:text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  </button>

                  {/* Google */}
                  <button
                    type="button"
                    className="social-icon-btn bg-white/10 hover:bg-red-600/20 border border-white/20 hover:border-red-500/40 group"
                    onClick={() => {
                      handleOAuthSuccess("Google");
                      window.open("http://localhost:3001/auth/google", "_self");
                    }}
                  >
                    <svg
                      className="w-6 h-6 text-red-500 group-hover:text-red-400"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-white/20"></div>
                  <span className="px-4 text-gray-400 text-sm">or</span>
                  <div className="flex-1 border-t border-white/20"></div>
                </div>

                {/* Email/Password Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      className="auth-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="auth-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Your password"
                        className="auth-input pr-12"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/20"
                    />
                    <label htmlFor="remember" className="text-sm text-gray-300">
                      Remember me
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={toggleLocalAuth}
                    className="auth-primary-btn"
                  >
                    SIGN UP
                  </button>
                </div>
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
                  <span>Back to quick login options</span>
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-8 pt-6">
              <p className="text-xs text-gray-500 mb-4">
                Already have an account?
                <button className="text-blue-400 hover:text-blue-300 ml-1 font-medium">
                  Sign in
                </button>
              </p>

              {/* Professor Attribution */}
              <div className="glass-card rounded-lg p-3 border border-amber-500/30 bg-amber-500/5 mb-4">
                <div
                  className="text-amber-400 font-bold tracking-wider text-center"
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontStyle: "italic",
                    fontSize: "12px",
                  }}
                >
                  Powered by Prof. Sadek Elgazar
                </div>
                <div className="text-xs text-amber-300/70 mt-1 text-center">
                  AI Research Director
                </div>
              </div>

              <div className="text-xs text-gray-500">
                KNOUX FINDR Professional v1.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAuthScreen;
