import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import baseEN from "@/translations/en/base.json";
import baseVI from "@/translations/vi/base.json";
import baseZH from "@/translations/zh/base.json";

export const defaultNS = "base";
export const resources = {
  en: { base: baseEN },
  vi: { base: baseVI },
  zh: { base: baseZH },
} as const;
export const supportedLanguages = ["en", "vi", "zh"] as const;

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: supportedLanguages,
    fallbackLng: "en",
    ns: ["base"],
    resources,
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
  });
