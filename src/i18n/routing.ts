export const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'ar', 'ko', 'ru', 'hi', 'tr'] as const;
export const defaultLocale = 'en';
export type Locale = (typeof locales)[number];
