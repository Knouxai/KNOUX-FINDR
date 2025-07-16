import React, { useState, useEffect } from "react";
import OriginalLoginForm from "./components/OriginalLoginForm";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import DesktopApp from "./components/DesktopApp";
import InstantSearch from "./components/InstantSearch";
import Timeline from "./components/Timeline";
import Stats from "./components/Stats";
import NaturalQueryProcessor from "./components/NaturalQueryProcessor";
import PowerOps from "./components/PowerOps";
import FileEncryption from "./components/FileEncryption";
import CloudSync from "./components/CloudSync";
import "./components/Header.css";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState(null);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if running in Electron environment
    if (window.electronAPI) {
      setIsElectron(true);
      // Auto-login for desktop app
      setUser({ name: "Desktop User", email: "desktop@knoux.com" });
      setCurrentPage("desktop");
    } else {
      // Check for OAuth redirect with user data
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get("user");

      if (userParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          setUser(userData);
          setCurrentPage("dashboard");
          // Clean up URL
          window.history.replaceState({}, document.title, "/dashboard");
          return;
        } catch (error) {
          console.error("Failed to parse user data from URL:", error);
        }
      }

      // Check authentication status for web app
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/user", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        setCurrentPage("dashboard");
      }
    } catch (error) {
      console.log("No existing authentication found");
    }
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setCurrentPage(isElectron ? "desktop" : "dashboard");
  };

  const handleSignIn = () => {
    // Redirect to login page
    setCurrentPage("login");
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3001/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setCurrentPage("login");
    }
  };

  const handleNavigate = (page) => {
    // BUILDER.IO REQUIREMENT: Check authentication before navigating to protected routes
    const protectedRoutes = ["dashboard", "timeline", "search"];

    if (protectedRoutes.includes(page) && !user && !isElectron) {
      console.log(`Access denied to ${page} - redirecting to login`);
      setCurrentPage("login");
      return;
    }

    setCurrentPage(page);
  };

  // If running in Electron, show desktop app directly
  if (isElectron && currentPage === "desktop") {
    return <DesktopApp user={user} onLogout={handleLogout} />;
  }

  // BUILDER.IO REQUIREMENT: Authentication protection for secured routes
  // Redirect unauthenticated users to /login when trying to access protected pages
  const protectedRoutes = [
    "dashboard",
    "timeline",
    "search",
    "stats",
    "powerops",
    "encryption",
    "cloudsync",
  ];

  useEffect(() => {
    // If user is not logged in and trying to access protected route, redirect to login
    if (!user && protectedRoutes.includes(currentPage) && !isElectron) {
      console.log(
        `Redirecting to login - attempted to access protected route: ${currentPage}`,
      );
      setCurrentPage("login");
    }
  }, [user, currentPage, isElectron]);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta">
      <Header
        currentPage={currentPage}
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      <div
        className={`app-content ${currentPage === "login" || currentPage === "signup" ? "no-header" : "with-header"}`}
      >
        {(currentPage === "login" || currentPage === "signup") && (
          <OriginalLoginForm
            onSignupSuccess={handleSignupSuccess}
            onSignIn={handleSignIn}
          />
        )}
        {currentPage === "dashboard" && user && (
          <Dashboard user={user} onLogout={handleLogout} />
        )}
        {currentPage === "timeline" && user && (
          <Timeline user={user} onLogout={handleLogout} />
        )}
        {currentPage === "search" && user && (
          <InstantSearch user={user} onLogout={handleLogout} />
        )}
        {currentPage === "stats" && user && (
          <Stats user={user} onLogout={handleLogout} />
        )}
        {currentPage === "powerops" && user && (
          <PowerOps user={user} onLogout={handleLogout} />
        )}
        {currentPage === "encryption" && user && (
          <FileEncryption user={user} onLogout={handleLogout} />
        )}
        {currentPage === "cloudsync" && user && (
          <CloudSync user={user} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}

export default App;
