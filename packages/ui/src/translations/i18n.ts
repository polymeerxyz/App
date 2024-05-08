import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import base from "@/translations/en/base.json";

export const defaultNS = "base";
export const resources = {
  en: {
    base,
  },
} as const;

i18next
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    lng: "en",
    fallbackLng: "en",
    ns: ["base"],
    resources,
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
  });
