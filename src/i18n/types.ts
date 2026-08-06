/**
 * Type-safe i18n keys generated from the shape of the English dictionary.
 *
 * `en.json` is the source of truth. Other dictionaries must satisfy the same
 * nested shape (same keys), but values stay `string` — this removes the `as any`
 * casts while still allowing translation text to differ.
 */
import en from './en.json';

export type TranslationDict = {
  [key: string]: string | TranslationDict;
};

type LeafPaths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends Record<string, unknown>
      ? LeafPaths<T[K], `${P}${K}.`>
      : never;
}[keyof T & string];

export type TranslationKey = LeafPaths<typeof en>;

export type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

export const enDict = en as TranslationDict;
