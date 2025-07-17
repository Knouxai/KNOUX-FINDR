import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SessionProvider } from "./context/SessionContext";
import SignupForm from "./components/SignupForm";
import Dashboard from "./components/Dashboard";
import DesktopApp from "./components/DesktopApp";
import ProfessionalAuthScreen from "./components/ProfessionalAuthScreen";
import SplashScreen from "./components/SplashScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import InstantSearch from "./components/InstantSearch";
import Timeline from "./components/Timeline";
import Stats from "./components/Stats";
import NaturalQueryProcessor from "./components/NaturalQueryProcessor";
import PowerOps from "./components/PowerOps";
import {
  isAuthServerAvailable,
  handleFallbackAuth,
} from "./utils/authFallback";
import { initializeEnvironmentChecks } from "./utils/environmentCheck";
import connectionMonitor from "./utils/connectionMonitor";

// Main App Component that handles routing and authentication state
const AppContent = () => {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState("splash");
  const [isElectron, setIsElectron] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [offlineNotification, setOfflineNotification] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      // Run environment checks first
      const environmentOk = initializeEnvironmentChecks();
      if (!environmentOk) {
        console.warn(
          "⚠️ Environment checks failed - some features may not work correctly",
        );
      }

      // Check if running in Electron environment
      if (window.electronAPI) {
        setIsElectron(true);
        // Auto-login for desktop app
        if (!isAuthenticated) {
          login({
            name: "Desktop User",
            email: "desktop@knoux.com",
            provider: "desktop",
            authMethod: "desktop",
          });
        }
        setCurrentPage("desktop");
      } else {
        // Web environment routing
        try {
          // Check server availability
          const serverAvailable = await isAuthServerAvailable();
          if (!serverAvailable) {
            console.warn(
              "⚠️ Auth server is not available - fallback mode will be used",
            );
          }
        } catch (error) {
          console.warn("Unable to check server availability:", error);
        }

        if (isAuthenticated) {
          setCurrentPage("dashboard");
        } else {
          setCurrentPage("auth");
        }
      }
    };

    initializeApp();

    // Start connection monitoring
    connectionMonitor.startMonitoring();

    return () => {
      // Clean up connection monitoring
      connectionMonitor.stopMonitoring();
    };
  }, [isAuthenticated, isElectron, login]);

  // Listen for offline mode events
  useEffect(() => {
    const handleOfflineMode = (event) => {
      setOfflineMode(true);
      setOfflineNotification({
        type: "warning",
        message: `⚠️ ${event.detail.message || "تم التبديل للوضع التجريبي"}`,
      });

      // Auto-hide notification after 5 seconds
      setTimeout(() => setOfflineNotification(null), 5000);
    };

    const handleAuthFallback = (event) => {
      setOfflineNotification({
        type: "info",
        message: `ℹ️ ${event.detail.message || "استخدام الوضع التجريبي"}`,
      });

      setTimeout(() => setOfflineNotification(null), 5000);
    };

    window.addEventListener("app:offline-mode", handleOfflineMode);
    window.addEventListener("app:auth-fallback", handleAuthFallback);

    return () => {
      window.removeEventListener("app:offline-mode", handleOfflineMode);
      window.removeEventListener("app:auth-fallback", handleAuthFallback);
    };
  }, []);

  const handleAuthSuccess = (userData) => {
    login(userData);
    setCurrentPage(isElectron ? "desktop" : "dashboard");
  };

  const handleSignIn = () => {
    setCurrentPage("signin");
  };

  const handleLogout = async () => {
    await logout();
    setCurrentPage("auth");
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    if (isElectron) {
      setCurrentPage("desktop");
    } else {
      setCurrentPage("auth");
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <div className="text-white text-lg">جارٍ التحقق من المصادقة...</div>
        </div>
      </div>
    );
  }

  // If running in Electron, show desktop app directly
  if (isElectron && currentPage === "desktop") {
    return <DesktopApp user={user} onLogout={handleLogout} />;
  }

  // Show splash screen initially
  if (showSplash && currentPage === "splash") {
    return (
      <SplashScreen onComplete={handleSplashComplete} isElectron={isElectron} />
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta">
      {/* Offline Mode Notification */}
      {offlineNotification && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg transition-all duration-300 ${
            offlineNotification.type === "warning"
              ? "bg-orange-500/20 border border-orange-500/30 text-orange-400"
              : offlineNotification.type === "info"
                ? "bg-blue-500/20 border border-blue-500/30 text-blue-400"
                : "bg-gray-500/20 border border-gray-500/30 text-gray-400"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {offlineNotification.message}
            </span>
            <button
              onClick={() => setOfflineNotification(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Offline Mode Indicator */}
      {offlineMode && (
        <div className="fixed bottom-4 left-4 z-40 px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-xs">
          📱 وضع تجريبي
        </div>
      )}

      {/* Authentication Pages */}
      {(currentPage === "auth" || currentPage === "signin") &&
        !isAuthenticated && (
          <ProfessionalAuthScreen onAuthSuccess={handleAuthSuccess} />
        )}

      {/* Legacy Signup Form (keep for compatibility) */}
      {currentPage === "signup" && !isAuthenticated && (
        <SignupForm
          onSignupSuccess={handleAuthSuccess}
          onSignIn={handleSignIn}
        />
      )}

      {/* Dashboard for authenticated users */}
      {currentPage === "dashboard" && isAuthenticated && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

// Wrapper App component with AuthProvider and ErrorBoundary
function App() {
  const handleOfflineMode = async () => {
    try {
      // Force fallback authentication
      const result = await handleFallbackAuth("demo");
      if (result.success) {
        localStorage.setItem("knoux_token", result.token);
        localStorage.setItem("knoux_user", JSON.stringify(result.user));
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to enter offline mode:", error);
    }
  };

  return (
    <ErrorBoundary onOfflineMode={handleOfflineMode}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
