import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getAppTranslations, type AppLanguage, type AppTranslations } from "@/lib/appTranslations";

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: AppTranslations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("language");
  return stored === "id" || stored === "en" ? stored : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(getInitialLanguage);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    // Dispatch event so the landing page's useLanguage hook stays in sync
    window.dispatchEvent(new CustomEvent("languageChange", { detail: lang }));
  }, []);

  // Listen for external languageChange events (e.g. from the landing page dialog)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "en" || detail === "id") {
        setLanguageState(detail);
      }
    };
    window.addEventListener("languageChange", handler);
    return () => window.removeEventListener("languageChange", handler);
  }, []);

  const t = getAppTranslations(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useAppLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useAppLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
