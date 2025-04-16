import React, { createContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem('language') || 'fr');

  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
    // Set document direction for RTL/LTR
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage, i18n]);

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      isRTL: currentLanguage === 'ar'
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => React.useContext(LanguageContext);