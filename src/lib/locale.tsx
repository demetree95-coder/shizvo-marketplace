"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ge, GeKey } from "./ge";
import { en } from "./en";
import { ru } from "./ru";

export type Locale = "ka" | "en" | "ru";

const locales: Record<Locale, typeof ge> = { ka: ge, en: en as any, ru: ru as any };

interface LocaleContextType {
  t: typeof ge;
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  t: ge,
  locale: "ka",
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ka");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && locales[saved]) setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  };

  return (
    <LocaleContext.Provider value={{ t: locales[locale], locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
export const useT = () => useContext(LocaleContext).t;
