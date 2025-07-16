import React, { useState } from "react";

// BUILDER.IO REQUIREMENT: Language switcher (Arabic/English)
// Ready for future i18n implementation with react-i18next
const LanguageSwitcher = ({ currentLanguage = "en", onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Currently placeholder - ready for full i18n integration
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ];

  const currentLang =
    languages.find((lang) => lang.code === currentLanguage) || languages[0];

  const handleLanguageSelect = (langCode) => {
    setIsOpen(false);
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
  };

  return (
    <div className="language-switcher">
      <button className="language-button" onClick={() => setIsOpen(!isOpen)}>
        <span className="flag">{currentLang.flag}</span>
        <span className="language-name">{currentLang.name}</span>
        <svg
          className={`chevron ${isOpen ? "open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${language.code === currentLanguage ? "active" : ""}`}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <span className="flag">{language.flag}</span>
              <span className="language-name">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
