import React, { useState, useEffect } from "react";
import "./SplashScreen.css";

const SplashScreen = ({ onComplete, message = "Installing packages..." }) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Animate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onComplete?.(), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-container">
        {/* Logo/Icon Container */}
        <div className="splash-logo-container">
          <div className="splash-logo">
            <div className="logo-icon">
              <svg
                width="80"
                height="80"
                viewBox="0 0 100 100"
                fill="none"
                className="knoux-icon"
              >
                <defs>
                  <linearGradient
                    id="logoGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#00B4FF" />
                    <stop offset="50%" stopColor="#0075FF" />
                    <stop offset="100%" stopColor="#0052D4" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Search Icon Base */}
                <circle
                  cx="35"
                  cy="35"
                  r="20"
                  stroke="url(#logoGradient)"
                  strokeWidth="4"
                  fill="none"
                  filter="url(#glow)"
                />
                <path
                  d="m52 52l15 15"
                  stroke="url(#logoGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />

                {/* AI Neural Network Pattern */}
                <g opacity="0.7">
                  <circle cx="75" cy="25" r="3" fill="url(#logoGradient)" />
                  <circle cx="85" cy="35" r="2" fill="url(#logoGradient)" />
                  <circle cx="80" cy="45" r="2.5" fill="url(#logoGradient)" />
                  <line
                    x1="75"
                    y1="25"
                    x2="85"
                    y2="35"
                    stroke="url(#logoGradient)"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                  <line
                    x1="85"
                    y1="35"
                    x2="80"
                    y2="45"
                    stroke="url(#logoGradient)"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                </g>

                {/* File/Folder Icons */}
                <g opacity="0.6">
                  <rect
                    x="15"
                    y="65"
                    width="12"
                    height="15"
                    rx="2"
                    fill="url(#logoGradient)"
                  />
                  <rect
                    x="30"
                    y="68"
                    width="10"
                    height="12"
                    rx="1.5"
                    fill="url(#logoGradient)"
                    opacity="0.8"
                  />
                  <rect
                    x="43"
                    y="70"
                    width="8"
                    height="10"
                    rx="1"
                    fill="url(#logoGradient)"
                    opacity="0.6"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Brand Text */}
        <div className="splash-brand">
          <h1 className="splash-title">KNOUX FINDR</h1>
          <p className="splash-subtitle">UI</p>
        </div>

        {/* Loading Section */}
        <div className="splash-loading">
          <div className="loading-text">
            {message}
            <span className="loading-dots">{dots}</span>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Spinner */}
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-core"></div>
          </div>
        </div>

        {/* Background Animation */}
        <div className="splash-background-pattern">
          <div className="pattern-dot"></div>
          <div className="pattern-dot"></div>
          <div className="pattern-dot"></div>
          <div className="pattern-dot"></div>
          <div className="pattern-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
