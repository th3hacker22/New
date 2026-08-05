/**
 * i18n Type Safety
 * Generates type-safe keys from translation dictionaries
 */

import type en from "./en.json";

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<typeof en>;

export type TranslationParams = Record<string, string | number>;

// Example: type-safe t function signature
// t('home.welcome') ✅
// t('home.nonexistent') ❌ Type error
