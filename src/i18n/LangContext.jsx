import React, { createContext, useContext, useState } from 'react';
import translations from './translations';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mp_lang') || 'pt';
    }
    return 'pt';
  });

  const changeLang = (newLang) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mp_lang', newLang);
    }
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations.pt[key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
