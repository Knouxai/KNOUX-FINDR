import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
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

// Main App Component that handles routing and authentication state
const AppContent = () => {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState("splash");
  const [isElectron, setIsElectron] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
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
  }, [isAuthenticated, isElectron, login]);

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

// Wrapper App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
