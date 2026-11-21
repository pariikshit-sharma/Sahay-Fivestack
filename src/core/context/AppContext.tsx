"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getTranslations, TranslationStrings } from "@/core/languages/translations";
import { getLanguage, LanguageDescriptor, INDIAN_LANGUAGES_REGISTRY } from "@/core/languages/registry";

type ExperienceMode = "simple" | "detailed";

interface AppContextType {
  language: string;
  setLanguage: (lang: string) => void;
  languageDescriptor: LanguageDescriptor;
  t: TranslationStrings;
  mode: ExperienceMode;
  setMode: (mode: ExperienceMode) => void;
  toggleMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>("hi");
  const [mode, setModeState] = useState<ExperienceMode>("simple");

  useEffect(() => {
    // Check localStorage if available
    try {
      const savedLang = localStorage.getItem("sahay_lang");
      if (savedLang && INDIAN_LANGUAGES_REGISTRY[savedLang]) {
        setLanguageState(savedLang);
      }
      const savedMode = localStorage.getItem("sahay_mode") as ExperienceMode;
      if (savedMode === "simple" || savedMode === "detailed") {
        setModeState(savedMode);
      }
    } catch {
      // Safe fallback
    }
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("sahay_lang", lang);
    } catch {
      // Safe fallback
    }
  };

  const setMode = (newMode: ExperienceMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem("sahay_mode", newMode);
    } catch {
      // Safe fallback
    }
  };

  const toggleMode = () => {
    setMode(mode === "simple" ? "detailed" : "simple");
  };

  const t = getTranslations(language);
  const languageDescriptor = getLanguage(language);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        languageDescriptor,
        t,
        mode,
        setMode,
        toggleMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
