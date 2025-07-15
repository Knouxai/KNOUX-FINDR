import React, { useState } from "react";
import SignupForm from "./components/SignupForm";
import Dashboard from "./components/Dashboard";

function App() {
  const [currentPage, setCurrentPage] = useState("signup");
  const [user, setUser] = useState(null);

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setCurrentPage("dashboard");
  };

  const handleSignIn = () => {
    // Simulate sign in
    setUser({ name: "Demo User", email: "demo@knoux.com" });
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("signup");
  };

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
