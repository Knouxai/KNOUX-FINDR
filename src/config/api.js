/**
 * API Configuration for KNOUX FINDR
 * Handles different environments (development, production, etc.)
 */

// Safe way to access environment variables
const getEnvVar = (varName, defaultValue = "") => {
  if (typeof process !== "undefined" && process.env) {
    return process.env[varName] || defaultValue;
  }
  return defaultValue;
};

// Default configuration
const DEFAULT_CONFIG = {
  development: {
    AUTH_SERVER_URL: "http://localhost:3001",
    API_BASE_URL: "http://localhost:3001/api",
  },
  production: {
    AUTH_SERVER_URL:
      getEnvVar("REACT_APP_AUTH_SERVER_URL") ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "https://localhost:3001"),
    API_BASE_URL:
      getEnvVar("REACT_APP_API_BASE_URL") ||
      (typeof window !== "undefined"
        ? window.location.origin + "/api"
        : "https://localhost:3001/api"),
  },
};

// Detect environment
const getEnvironment = () => {
  // Check if we're in development
  if (process.env.NODE_ENV === "development") {
    return "development";
  }

  // Check if localhost is accessible (for local development)
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "development";
  }

  return "production";
};

// Get current configuration
const getCurrentConfig = () => {
  const env = getEnvironment();
  return DEFAULT_CONFIG[env];
};

// Export configuration
const config = getCurrentConfig();

export const API_CONFIG = {
  AUTH_SERVER_URL: config.AUTH_SERVER_URL,
  API_BASE_URL: config.API_BASE_URL,
  ENVIRONMENT: getEnvironment(),
};

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  VERIFY_TOKEN: `${config.API_BASE_URL}/verify-token`,
  GET_USER: `${config.API_BASE_URL}/user`,
  LOGOUT: `${config.API_BASE_URL}/logout`,
  LOGOUT_ALL: `${config.API_BASE_URL}/logout-all`,
  REGISTER: `${config.API_BASE_URL}/register`,
  LOGIN: `${config.API_BASE_URL}/login`,

  // OAuth
  OAUTH_GOOGLE: `${config.AUTH_SERVER_URL}/auth/google`,
  OAUTH_GITHUB: `${config.AUTH_SERVER_URL}/auth/github`,
  OAUTH_FACEBOOK: `${config.AUTH_SERVER_URL}/auth/facebook`,
  OAUTH_APPLE: `${config.AUTH_SERVER_URL}/auth/apple`,
  OAUTH_MICROSOFT: `${config.AUTH_SERVER_URL}/auth/microsoft`,
};

// Helper function to make API calls with error handling
export const apiCall = async (url, options = {}) => {
  try {
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);

    // Add user-friendly error messages
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("فشل في الاتصال بالخادم. تحقق من اتصال الإنترنت.");
    }

    throw error;
  }
};

// Check if auth server is available
export const checkAuthServerHealth = async () => {
  try {
    const response = await fetch(`${config.AUTH_SERVER_URL}/health`, {
      method: "GET",
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.warn("Auth server health check failed:", error);
    return false;
  }
};

export default API_CONFIG;
