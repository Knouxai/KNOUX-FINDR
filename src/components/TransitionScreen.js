import React from "react";
import "./TransitionScreen.css";

const TransitionScreen = ({ message = "Loading...", duration = 1500 }) => {
  return (
    <div className="transition-screen">
      <div className="transition-content">
        {/* شعار مصغر */}
        <div className="transition-logo">
          <svg
            width="40"
            height="40"
            viewBox="0 0 100 100"
            fill="none"
            className="transition-icon"
          >
            <defs>
              <linearGradient
                id="transitionGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#00B4FF" />
                <stop offset="50%" stopColor="#0075FF" />
                <stop offset="100%" stopColor="#0052D4" />
              </linearGradient>
            </defs>

            {/* أيقونة البحث المصغرة */}
            <circle
              cx="35"
              cy="35"
              r="15"
              stroke="url(#transitionGradient)"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="m47 47l10 10"
              stroke="url(#transitionGradient)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* رسالة التحميل */}
        <div className="transition-message">{message}</div>

        {/* عجلة دوارة صغيرة */}
        <div className="transition-spinner">
          <div className="transition-ring"></div>
        </div>
      </div>
    </div>
  );
};

export default TransitionScreen;
