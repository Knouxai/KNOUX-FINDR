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
    }
  }, []);

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setCurrentPage(isElectron ? "desktop" : "dashboard");
  };

  const handleSignIn = () => {
    // Simulate sign in
    setUser({ name: "Demo User", email: "demo@knoux.com" });
    setCurrentPage(isElectron ? "desktop" : "dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("login");
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // If running in Electron, show desktop app directly
  if (isElectron && currentPage === "desktop") {
    return <DesktopApp user={user} onLogout={handleLogout} />;
  }

  // Authentication protection for secured routes
  const protectedRoutes = ["dashboard", "timeline", "search"];

  if (!user && protectedRoutes.includes(currentPage)) {
    setCurrentPage("login");
  }

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
      </div>
    </div>
  );
}

export default App;
