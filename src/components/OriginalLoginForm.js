import React, { useState, useEffect } from "react";
import "./OriginalLoginForm.css";

const OriginalLoginForm = ({ onSignupSuccess, onSignIn }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);

  useEffect(() => {
    // Listen for OAuth popup messages
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "OAUTH_SUCCESS") {
        handleOAuthSuccess(event.data.user);
      } else if (event.data.type === "OAUTH_ERROR") {
        handleOAuthError(event.data.error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSignupSuccess(formData);
    }, 2000);
  };

  const handleOAuthLogin = (provider) => {
    setLoadingProvider(provider);

    // BUILDER.IO REQUIREMENT: OAuth endpoints as specified
    // Google: /auth/google, GitHub: /auth/github, Facebook: /auth/facebook, Apple: /auth/apple (placeholder)
    const authUrl = `/auth/${provider}`;

    // Use window.location.href as requested in requirements
    window.location.href = authUrl;
  };

  const handleOAuthSuccess = (user) => {
    setLoadingProvider(null);
    if (onSignupSuccess) {
      onSignupSuccess(user);
    }
  };

  const handleOAuthError = (error) => {
    setLoadingProvider(null);
    console.error("OAuth error:", error);
    // Could show error notification here
  };

  return (
    <div className="original-login-container">
      <div className="original-login-layout">
        {/* Left Side - Brand Section */}
        <div className="original-left-section">
          <div className="brand-content">
            <div className="brand-subtitle">INSPIRED BY THE FUTURE:</div>
            <div className="brand-title">
              KNOUX FINDR
              <br />
              SEARCH
            </div>
            <div className="brand-description">
              The most powerful local file search engine with AI-powered
              organization
            </div>
          </div>
        </div>

        {/* Right Side - Auth Card */}
        <div className="original-right-section">
          <div className="auth-card">
            <div className="auth-card-content">
              {/* Welcome Header */}
              <div className="welcome-header">
                <h1 className="welcome-title">Welcome!</h1>
                <p className="welcome-subtitle">
                  Use these awesome forms to login or create new account in your
                  project for free.
                </p>
              </div>

              {/* Register With Section */}
              <div className="register-section">
                <h2 className="register-title">Register with</h2>

                {/* Social Buttons */}
                <div className="social-buttons">
                  <button
                    className="social-button facebook-btn"
                    onClick={() => handleOAuthLogin("facebook")}
                    disabled={loadingProvider === "facebook"}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        fill="white"
                      />
                    </svg>
                  </button>

                  <button
                    className="social-button github-btn"
                    onClick={() => handleOAuthLogin("github")}
                    disabled={loadingProvider === "github"}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                        fill="white"
                      />
                    </svg>
                  </button>

                  <button
                    className="social-button google-btn"
                    onClick={() => handleOAuthLogin("google")}
                    disabled={loadingProvider === "google"}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="white"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="white"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="white"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="white"
                      />
                    </svg>
                  </button>
                </div>

                <div className="divider">or</div>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-field">
                  <label className="field-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="field-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email address"
                    className="field-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Password</label>
                  <div className="password-field">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Your password"
                      className="field-input"
                      required
                    />
                    <button type="button" className="password-toggle">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M10 12a2 2 0 100-4 2 2 0 000 4z"
                          fill="currentColor"
                        />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="remember-section">
                  <label className="remember-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="remember-text">Remember me</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="register-button"
                >
                  {isLoading ? "CREATING ACCOUNT..." : "REGISTER"}
                </button>
              </form>
            </div>

            {/* 🔒 Prof Signature Tag - LOCKED - DO NOT MOVE OR MODIFY */}
            {/* Card Footer with Prof Signature - BUILDER.IO REQUIREMENT */}
            <div className="auth-card-footer prof-signature-locked">
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "14px",
                  textAlign: "center",
                  opacity: "0.7",
                }}
                className="prof-signature-text"
              >
                Powered by Prof. Sadek Elgazar
                <br />
                AI Research Director & Project Supervisor
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginalLoginForm;
