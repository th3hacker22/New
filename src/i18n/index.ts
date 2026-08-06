import { useMemo, useCallback } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import en from "./en.json";
import ar from "./ar.json";
import eg from "./eg.json";

type Language = "en" | "ar" | "eg";

const dictionaries: Record<Language, typeof en> = {
  en,
  ar: ar as any,
  eg: eg as any,
};

// Map legacy "ar" to Egyptian colloquial for backward compatibility
// Users currently see "ar" as Egyptian slang, so we keep that behavior
// Future: add separate toggle for ar (fusha) vs eg (3ammeya)
function normalizeLang(lang: string): Language {
  if (lang === "ar") return "eg"; // legacy compatibility: ar = Egyptian
  if (lang === "eg" || lang === "ar-EG") return "eg";
  if (lang === "ar-SA" || lang === "ar-EG" || lang === "ar-Fusha") return "ar";
  if (lang === "en") return "en";
  return "eg"; // default to Egyptian for this app's audience
}

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = params[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

/**
 * Centralized translation hook
 * Solves Shotgun Surgery: all translations in one place
 * Usage: const { t, isAr, language } = useTranslation()
 *        t('home.welcome') or t('home.exercisesCount', {count: 5})
 */
export function useTranslation() {
  const languageRaw = useSettingsStore((s) => s.language);
  const language = useMemo(() => normalizeLang(languageRaw), [languageRaw]);
  const isAr = language !== "en"; // RTL for ar/eg

  const dict = useMemo(() => dictionaries[language] || dictionaries.eg, [language]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const value = getNestedValue(dict, key);
      if (value === undefined) {
        // Fallback to English
        const fallback = getNestedValue(dictionaries.en, key);
        if (fallback) {
          return interpolate(fallback, params);
        }
        // If key not found anywhere, return key itself for debugging
        console.warn(`[i18n] Missing key: ${key} for lang: ${language}`);
        return key;
      }
      return interpolate(value, params);
    },
    [dict, language]
  );

  return {
    t,
    language: languageRaw, // raw value for setLanguage compatibility
    normalizedLanguage: language,
    isAr,
    isRtl: isAr,
    dict,
  };
}

// Re-export for convenience
export { dictionaries };
export type { Language };

// Simple non-hook version for use outside React components
export function translateKey(key: string, lang: string = "eg", params?: Record<string, string | number>): string {
  const normalized = normalizeLang(lang);
  const dict = dictionaries[normalized] || dictionaries.eg;
  const value = getNestedValue(dict, key) || getNestedValue(dictionaries.en, key) || key;
  return interpolate(value, params);
}
