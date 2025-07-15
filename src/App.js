import React, { useState, useEffect } from "react";
import SignupForm from "./components/SignupForm";
import Dashboard from "./components/Dashboard";
import DesktopApp from "./components/DesktopApp";
import InstantSearch from "./components/InstantSearch";

function App() {
  const [currentPage, setCurrentPage] = useState("signup");
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
    setCurrentPage("signup");
  };

  // If running in Electron, show instant search directly
  if (isElectron && currentPage === "desktop") {
    return <InstantSearch user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#0F123B] via-[#090D2E] to-[#020515] font-jakarta">
      {currentPage === "signup" && (
        <SignupForm
          onSignupSuccess={handleSignupSuccess}
          onSignIn={handleSignIn}
        />
      )}
      {currentPage === "dashboard" && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
