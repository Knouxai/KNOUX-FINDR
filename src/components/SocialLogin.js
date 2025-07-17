import React, { useState, useEffect } from "react";
import { API_CONFIG, API_ENDPOINTS } from "../config/api";

/**
 * Social Login Component for KNOUX FINDR
 * Handles OAuth authentication with Google, GitHub, and Facebook
 */

const SocialLogin = ({ onLoginSuccess, onLoginError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);

  const AUTH_SERVER_URL = API_CONFIG.AUTH_SERVER_URL;

  // Check for authentication status on component mount
  useEffect(() => {
    checkAuthStatus();

    // Listen for messages from OAuth popup windows
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "OAUTH_SUCCESS") {
        handleLoginSuccess(event.data.user);
      } else if (event.data.type === "OAUTH_ERROR") {
        handleLoginError(event.data.error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/api/user`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success && data.user) {
        handleLoginSuccess(data.user);
      }
    } catch (error) {
      console.log("No existing authentication found");
    }
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    setLoadingProvider(provider);

    // Open OAuth in popup window
    const popup = window.open(
      `${AUTH_SERVER_URL}/auth/${provider}`,
      `${provider}-oauth`,
      "width=500,height=600,scrollbars=yes,resizable=yes",
    );

    // Poll for popup closure
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setIsLoading(false);
        setLoadingProvider(null);
        // Check auth status after popup closes
        setTimeout(checkAuthStatus, 1000);
      }
    }, 1000);

    // Fallback: redirect if popup blocked
    setTimeout(() => {
      if (popup.closed || !popup.window) {
        window.location.href = `${AUTH_SERVER_URL}/auth/${provider}`;
      }
    }, 100);
  };

  const handleLoginSuccess = (user) => {
    setIsLoading(false);
    setLoadingProvider(null);
    if (onLoginSuccess) {
      onLoginSuccess(user);
    }
  };

  const handleLoginError = (error) => {
    setIsLoading(false);
    setLoadingProvider(null);
    if (onLoginError) {
      onLoginError(error);
    }
  };

  const providers = [
    {
      id: "google",
      name: "Google",
      icon: "🟢",
      color: "from-red-500 to-orange-500",
      hoverColor: "hover:from-red-600 hover:to-orange-600",
    },
    {
      id: "github",
      name: "GitHub",
      icon: "⚫",
      color: "from-gray-800 to-gray-900",
      hoverColor: "hover:from-gray-700 hover:to-gray-800",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: "🔵",
      color: "from-blue-600 to-blue-700",
      hoverColor: "hover:from-blue-500 hover:to-blue-600",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          اختر طريقة تسجيل الدخول
        </h3>
        <p className="text-gray-400 text-sm">
          سجل دخولك بحسابك المفضل للوصول السريع
        </p>
      </div>

      {providers.map((provider) => (
        <button
          key={provider.id}
          onClick={() => handleSocialLogin(provider.id)}
          disabled={isLoading}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-white
            bg-gradient-to-r ${provider.color} ${provider.hoverColor}
            transition-all duration-200 transform hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            flex items-center justify-center gap-3
            border border-white/10 shadow-lg
            ${loadingProvider === provider.id ? "animate-pulse" : ""}
          `}
        >
          {loadingProvider === provider.id ? (
            <>
              <div className="loading-spinner w-5 h-5"></div>
              <span>جاري تسجيل الدخول...</span>
            </>
          ) : (
            <>
              <span className="text-2xl">{provider.icon}</span>
              <span>تسجيل الدخول بـ {provider.name}</span>
            </>
          )}
        </button>
      ))}

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-white/20"></div>
        <span className="px-4 text-gray-400 text-sm">أو</span>
        <div className="flex-1 border-t border-white/20"></div>
      </div>

      {/* Guest Access */}
      <button
        onClick={() =>
          handleLoginSuccess({
            id: "guest",
            provider: "guest",
            name: "ضيف",
            email: null,
          })
        }
        disabled={isLoading}
        className="w-full py-3 px-6 rounded-lg font-semibold text-gray-300 
                   glass-button border border-white/20 hover:bg-white/10
                   transition-all duration-200 hover:scale-105
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-lg mr-2">👤</span>
        متابعة كضيف
      </button>

      {/* Security Notice */}
      <div className="mt-6 p-4 glass-card rounded-lg border border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <span className="text-blue-400 text-lg">🔒</span>
          <div className="text-xs text-blue-300">
            <div className="font-semibold mb-1">تسجيل دخول آمن</div>
            <div className="text-blue-400/80">
              نحن لا نحفظ كلمات المرور. جميع عمليات المصادقة تتم عبر الخدمات
              الآمنة للمزودين المختارين.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLogin;
