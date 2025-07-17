/**
 * Authentication Fallback Utilities
 * Handles cases where the auth server is not available
 */

import { checkAuthServerHealth, API_CONFIG } from "../config/api";

// Mock user for development/demo purposes
const DEMO_USER = {
  id: "demo_user_001",
  name: "مستخدم تجريبي",
  email: "demo@knouxfindr.com",
  avatar: null,
  provider: "demo",
  authMethod: "fallback",
  features: {
    hasElectronAccess: !!window.electronAPI,
    canUseLocalFiles: !!window.electronAPI,
    isDemoMode: true,
  },
};

/**
 * Check if we can connect to the auth server
 */
export const isAuthServerAvailable = async () => {
  try {
    const isHealthy = await checkAuthServerHealth();
    return isHealthy;
  } catch (error) {
    console.warn("Auth server health check failed:", error);
    return false;
  }
};

/**
 * Handle authentication when server is not available
 */
export const handleFallbackAuth = async (mode = "demo") => {
  console.log("🔄 Using fallback authentication mode:", mode);

  if (mode === "demo") {
    // Store demo user in localStorage
    const demoToken = `demo_token_${Date.now()}`;
    localStorage.setItem("knoux_token", demoToken);
    localStorage.setItem("knoux_user", JSON.stringify(DEMO_USER));

    return {
      success: true,
      user: DEMO_USER,
      token: demoToken,
      message: "تم تسجيل الدخول في الوضع التجريبي",
      fallbackMode: true,
    };
  }

  // For Electron apps, allow direct access
  if (window.electronAPI) {
    const electronUser = {
      ...DEMO_USER,
      name: "مستخدم سطح المكتب",
      email: "desktop@knouxfindr.local",
      provider: "electron",
      authMethod: "desktop",
    };

    const electronToken = `electron_token_${Date.now()}`;
    localStorage.setItem("knoux_token", electronToken);
    localStorage.setItem("knoux_user", JSON.stringify(electronUser));

    return {
      success: true,
      user: electronUser,
      token: electronToken,
      message: "تم تسجيل الدخول لتطبيق سطح المكتب",
      fallbackMode: true,
    };
  }

  throw new Error("لا يمكن تسجيل الدخول في هذا الوضع");
};

/**
 * Check if we're in fallback mode
 */
export const isFallbackMode = () => {
  const token = localStorage.getItem("knoux_token");
  return (
    token &&
    (token.startsWith("demo_token_") || token.startsWith("electron_token_"))
  );
};

/**
 * Get user from fallback storage
 */
export const getFallbackUser = () => {
  try {
    const userStr = localStorage.getItem("knoux_user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error getting fallback user:", error);
    return null;
  }
};

/**
 * Enhanced API call with fallback handling
 */
export const apiCallWithFallback = async (url, options = {}) => {
  // Check if server is available first
  const serverAvailable = await isAuthServerAvailable();

  if (!serverAvailable) {
    console.log("🔄 Auth server not available, using fallback mode");

    // Handle common API endpoints in fallback mode
    if (url.includes("/verify-token")) {
      const fallbackUser = getFallbackUser();
      if (fallbackUser && isFallbackMode()) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            user: fallbackUser,
            message: "Token verified in fallback mode",
          }),
        };
      }
    }

    if (url.includes("/api/user")) {
      const fallbackUser = getFallbackUser();
      if (fallbackUser) {
        return {
          ok: true,
          json: async () => fallbackUser,
        };
      }
    }

    // For logout endpoints, just clear local storage
    if (url.includes("/logout")) {
      localStorage.removeItem("knoux_token");
      localStorage.removeItem("knoux_user");
      return {
        ok: true,
        json: async () => ({
          success: true,
          message: "Logged out successfully",
        }),
      };
    }

    // Throw error for unhandled endpoints
    throw new Error(
      "خادم المصادقة غير متاح حالياً. يرجى المحاولة مرة أخرى لاحقاً.",
    );
  }

  // Server is available, proceed with normal API call
  const { apiCall } = await import("../config/api");
  return apiCall(url, options);
};

/**
 * Show offline mode notification
 */
export const showOfflineNotification = () => {
  return {
    type: "warning",
    message: "⚠️ الخادم غير متاح - تم التبديل للوضع التجريبي",
    duration: 5000,
  };
};

export default {
  isAuthServerAvailable,
  handleFallbackAuth,
  isFallbackMode,
  getFallbackUser,
  apiCallWithFallback,
  showOfflineNotification,
};
