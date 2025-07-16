import React, { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import "./LanguageSwitcher.css";

const Header = ({ currentPage, user, onLogout, onNavigate }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    // TODO: Implement actual language switching logic
    console.log(`Language changed to: ${langCode}`);
  };
  // Hide header on login and signup pages
  if (currentPage === "login" || currentPage === "signup") {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-logo">
          <span className="logo-text">KNOUX FINDR</span>
        </div>

        <nav className="header-nav">
          {/* BUILDER.IO REQUIREMENT: Show Dashboard/Profile only when user is logged in */}
          {user && (
            <>
              <button
                className={`nav-button ${currentPage === "dashboard" ? "active" : ""}`}
                onClick={() => onNavigate("dashboard")}
              >
                <svg className="nav-icon" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M10.2225 3.6231C10.2354 3.61554 10.2462 3.6047 10.2537 3.59168C10.2612 3.57865 10.2651 3.56389 10.2651 3.54888C10.2651 3.53386 10.2612 3.5191 10.2537 3.50608C10.2462 3.49305 10.2354 3.48221 10.2225 3.47465L6.94095 1.56812C6.73098 1.44642 6.4926 1.38232 6.24991 1.38232C6.00722 1.38232 5.76883 1.44642 5.55886 1.56812L2.27798 3.47465C2.26501 3.48221 2.25425 3.49305 2.24677 3.50608C2.23929 3.5191 2.23535 3.53386 2.23535 3.54888C2.23535 3.56389 2.23929 3.57865 2.24677 3.59168C2.25425 3.6047 2.26501 3.61554 2.27798 3.6231L6.20704 5.93439C6.22026 5.94218 6.23532 5.94628 6.25066 5.94628C6.266 5.94628 6.28105 5.94218 6.29427 5.93439L10.2225 3.6231Z"
                    fill="currentColor"
                  />
                  <path
                    d="M1.91016 4.20738C1.89705 4.19981 1.88218 4.19584 1.86705 4.19586C1.85192 4.19589 1.83706 4.19991 1.82398 4.20751C1.8109 4.21512 1.80006 4.22605 1.79256 4.23919C1.78505 4.25233 1.78115 4.26722 1.78125 4.28236V8.01827C1.78158 8.19831 1.82903 8.37512 1.91888 8.53112C2.00874 8.68713 2.13787 8.81689 2.29344 8.90751L5.77735 10.9964C5.7904 11.004 5.80521 11.0079 5.82029 11.0079C5.83537 11.008 5.85018 11.004 5.86325 10.9965C5.87631 10.9889 5.88716 10.9781 5.89471 10.965C5.90225 10.952 5.90624 10.9372 5.90625 10.9221V6.58763C5.90624 6.57256 5.90226 6.55776 5.89472 6.54471C5.88717 6.53166 5.87633 6.52083 5.86328 6.51329L1.91016 4.20738Z"
                    fill="currentColor"
                  />
                  <path
                    d="M6.59375 6.60272V10.9211C6.59377 10.9362 6.59775 10.951 6.6053 10.964C6.61285 10.9771 6.6237 10.9879 6.63676 10.9954C6.64982 11.003 6.66463 11.0069 6.67971 11.0069C6.69479 11.0069 6.7096 11.003 6.72266 10.9954L10.2063 8.90649C10.3618 8.81599 10.4909 8.68641 10.5808 8.53061C10.6706 8.37481 10.7182 8.1982 10.7187 8.01833V4.28241C10.7187 4.26735 10.7147 4.25257 10.7071 4.23955C10.6996 4.22653 10.6887 4.21572 10.6756 4.20822C10.6626 4.20071 10.6478 4.19676 10.6327 4.19678C10.6177 4.19679 10.6029 4.20076 10.5898 4.20829L6.63672 6.5286C6.6237 6.53612 6.61288 6.54692 6.60534 6.55993C6.5978 6.57293 6.5938 6.58769 6.59375 6.60272Z"
                    fill="currentColor"
                  />
                </svg>
                Dashboard
              </button>

              <button
                className={`nav-button ${currentPage === "stats" ? "active" : ""}`}
                onClick={() => onNavigate("stats")}
              >
                <span className="nav-icon">📊</span>
                إحصائيات
              </button>

              <button
                className={`nav-button ${currentPage === "encryption" ? "active" : ""}`}
                onClick={() => onNavigate("encryption")}
              >
                <span className="nav-icon">🔒</span>
                تشفير
              </button>

              <button
                className={`nav-button ${currentPage === "cloudsync" ? "active" : ""}`}
                onClick={() => onNavigate("cloudsync")}
              >
                <span className="nav-icon">☁️</span>
                مزامنة
              </button>

              <button
                className={`nav-button ${currentPage === "powerops" ? "active" : ""}`}
                onClick={() => onNavigate("powerops")}
              >
                <span className="nav-icon">⚡</span>
                PowerOps
              </button>
            </>
          )}
        </nav>

        <div className="header-actions">
          <LanguageSwitcher
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />

          {user ? (
            <>
              <span className="user-name">Welcome, {user.name}</span>
              <button className="logout-button" onClick={onLogout}>
                Sign Out
              </button>
            </>
          ) : (
            /* BUILDER.IO REQUIREMENT: Don't show Sign In/Sign Up buttons in header when not logged in */
            /* Navigation to login happens through other means (direct URL, etc.) */
            <div className="auth-placeholder">
              {/* Login access through direct URL navigation */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
