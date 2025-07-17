/**
 * Global Fetch Interceptor
 * Intercepts all fetch requests and adds fallback handling
 */

import {
  isAuthServerAvailable,
  handleFallbackAuth,
  isFallbackMode,
  getFallbackUser,
} from "./authFallback";

// Store original fetch
const originalFetch = window.fetch;

// Track if we're in offline mode
let isOfflineMode = false;
let offlineModeInitialized = false;

/**
 * Enhanced fetch with automatic fallback handling
 */
const enhancedFetch = async (url, options = {}) => {
  try {
    // If this is a health check or server availability check, allow it through
    if (url.includes("/health") || url.includes("health")) {
      return await originalFetch(url, {
        ...options,
        signal: AbortSignal.timeout(3000), // 3 second timeout for health checks
      });
    }

    // Check if we're already in offline mode
    if (isOfflineMode || isFallbackMode()) {
      return handleOfflineRequest(url, options);
    }

    // Try the original request with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await originalFetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    console.warn(`Fetch failed for ${url}:`, error.message);

    // If it's a network error, switch to offline mode
    if (
      error.name === "TypeError" ||
      error.name === "AbortError" ||
      error.message.includes("fetch") ||
      error.message.includes("Network")
    ) {
      console.log("🔄 Switching to offline mode due to network error");
      await initializeOfflineMode();
      return handleOfflineRequest(url, options);
    }

    // Re-throw other errors
    throw error;
  }
};

/**
 * Initialize offline mode
 */
const initializeOfflineMode = async () => {
  if (offlineModeInitialized) {
    return;
  }

  try {
    isOfflineMode = true;
    offlineModeInitialized = true;

    console.log("🔄 Initializing offline mode...");

    // Try to set up fallback authentication
    const fallbackResult = await handleFallbackAuth(
      window.electronAPI ? "electron" : "demo",
    );

    if (fallbackResult.success) {
      console.log("✅ Offline mode initialized successfully");

      // Dispatch custom event to notify the app
      window.dispatchEvent(
        new CustomEvent("app:offline-mode", {
          detail: {
            user: fallbackResult.user,
            message: fallbackResult.message,
          },
        }),
      );
    }
  } catch (error) {
    console.error("Failed to initialize offline mode:", error);
  }
};

/**
 * Handle requests in offline mode
 */
const handleOfflineRequest = (url, options) => {
  // Mock responses for common API endpoints
  if (url.includes("/api/verify-token")) {
    const fallbackUser = getFallbackUser();
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        user: fallbackUser || { name: "Demo User", email: "demo@knoux.com" },
        message: "Token verified in offline mode",
      }),
    });
  }

  if (url.includes("/api/user")) {
    const fallbackUser = getFallbackUser();
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () =>
        fallbackUser || {
          name: "Demo User",
          email: "demo@knoux.com",
          provider: "offline",
          authMethod: "fallback",
        },
    });
  }

  if (url.includes("/api/logout")) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "Logged out (offline mode)",
      }),
    });
  }

  if (url.includes("/auth/") || url.includes("oauth")) {
    // For OAuth requests in offline mode, redirect to demo mode
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("app:auth-fallback", {
          detail: {
            message: "OAuth not available in offline mode - using demo account",
          },
        }),
      );
    }, 100);

    return Promise.resolve({
      ok: false,
      status: 503,
      json: async () => ({
        error: "OAuth not available in offline mode",
        fallback: true,
      }),
    });
  }

  // For any other request, return a generic offline response
  console.log(`🔄 Offline mode: Cannot fetch ${url}`);
  return Promise.resolve({
    ok: false,
    status: 503,
    statusText: "Service Unavailable (Offline Mode)",
    json: async () => ({
      error: "Service unavailable in offline mode",
      offline: true,
      fallback: true,
    }),
  });
};

/**
 * Install the fetch interceptor
 */
export const installFetchInterceptor = () => {
  if (window.fetch === enhancedFetch) {
    return; // Already installed
  }

  console.log("🔧 Installing fetch interceptor...");
  window.fetch = enhancedFetch;

  // Listen for online/offline events
  window.addEventListener("online", () => {
    console.log("🌐 Network connection restored");
    isOfflineMode = false;
    // Don't reset offlineModeInitialized to avoid auth loops
  });

  window.addEventListener("offline", () => {
    console.log("📱 Network connection lost");
    initializeOfflineMode();
  });

  console.log("✅ Fetch interceptor installed");
};

/**
 * Remove the fetch interceptor (for cleanup)
 */
export const uninstallFetchInterceptor = () => {
  window.fetch = originalFetch;
  console.log("🔧 Fetch interceptor removed");
};

/**
 * Get offline mode status
 */
export const getOfflineStatus = () => ({
  isOfflineMode,
  isInitialized: offlineModeInitialized,
  hasFallbackUser: !!getFallbackUser(),
});

export default {
  installFetchInterceptor,
  uninstallFetchInterceptor,
  getOfflineStatus,
  initializeOfflineMode,
};
