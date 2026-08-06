import { useMemo, useCallback } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import en from './en.json';
import ar from './ar.json';
import eg from './eg.json';
import type { TranslationDict, TranslationKey } from './types';

type Language = 'en' | 'ar' | 'eg';

const dictionaries: Record<Language, TranslationDict> = {
  en: en as TranslationDict,
  ar: ar as TranslationDict,
  eg: eg as TranslationDict,
};

// Legacy "ar" maps to Egyptian colloquial; fusha and regional variants map to ar.
function normalizeLang(lang: string): Language {
  if (lang === 'ar') return 'eg';
  if (lang === 'eg' || lang === 'ar-EG') return 'eg';
  if (lang === 'ar-SA' || lang === 'ar-Fusha') return 'ar';
  if (lang === 'en') return 'en';
  return 'eg';
}

function getNestedValue(obj: TranslationDict, path: string): string | undefined {
  const keys = path.split('.');
  let current: string | TranslationDict | undefined = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = params[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

export function useTranslation() {
  const languageRaw = useSettingsStore((s) => s.language);
  const language = useMemo(() => normalizeLang(languageRaw), [languageRaw]);
  const isAr = language !== 'en';

  const dict = useMemo(() => dictionaries[language] ?? dictionaries.eg, [language]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const value = getNestedValue(dict, key);
      const fallback = value ?? getNestedValue(dictionaries.en, key);
      if (fallback) return interpolate(fallback, params);
      console.warn(`[i18n] Missing key: ${key} for lang: ${language}`);
      return key;
    },
    [dict, language],
  );

  return {
    t,
    language: languageRaw,
    normalizedLanguage: language,
    isAr,
    isRtl: isAr,
    dict,
  };
}

export { dictionaries };
export type { Language, TranslationKey };

export function translateKey(
  key: TranslationKey,
  lang = 'eg',
  params?: Record<string, string | number>,
): string {
  const normalized = normalizeLang(lang);
  const dict = dictionaries[normalized] ?? dictionaries.eg;
  const value = getNestedValue(dict, key) ?? getNestedValue(dictionaries.en, key) ?? key;
  return interpolate(value, params);
}
