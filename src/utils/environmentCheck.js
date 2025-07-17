/**
 * Runtime Environment Check Utility
 * Ensures the application has access to necessary globals
 */

/**
 * Check if process object is available and properly polyfilled
 */
export const checkProcessAvailability = () => {
  try {
    // Check if process exists
    if (typeof process === "undefined") {
      console.warn("⚠️ process global is not available");
      return false;
    }

    // Check if process.env exists
    if (!process.env) {
      console.warn("⚠️ process.env is not available");
      return false;
    }

    // Check if we can access NODE_ENV
    const nodeEnv = process.env.NODE_ENV;
    console.log("✅ Process environment check passed. NODE_ENV:", nodeEnv);
    return true;
  } catch (error) {
    console.error("❌ Process environment check failed:", error);
    return false;
  }
};

/**
 * Check browser compatibility
 */
export const checkBrowserCompatibility = () => {
  const checks = {
    fetch: typeof fetch !== "undefined",
    localStorage: typeof localStorage !== "undefined",
    sessionStorage: typeof sessionStorage !== "undefined",
    window: typeof window !== "undefined",
    document: typeof document !== "undefined",
  };

  const failedChecks = Object.entries(checks)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (failedChecks.length > 0) {
    console.warn("⚠️ Browser compatibility issues:", failedChecks);
    return false;
  }

  console.log("✅ Browser compatibility check passed");
  return true;
};

/**
 * Initialize runtime environment checks
 */
export const initializeEnvironmentChecks = () => {
  console.log("🔍 Running environment checks...");

  const processOk = checkProcessAvailability();
  const browserOk = checkBrowserCompatibility();

  if (processOk && browserOk) {
    console.log("✅ All environment checks passed");
    return true;
  } else {
    console.warn("⚠️ Some environment checks failed - using fallback mode");
    return false;
  }
};

export default {
  checkProcessAvailability,
  checkBrowserCompatibility,
  initializeEnvironmentChecks,
};
