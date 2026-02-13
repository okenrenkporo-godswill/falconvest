import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'ar', 'ko', 'ru', 'hi', 'tr'] as const;
type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('locale')?.value;
    const locale: Locale = locales.includes(localeCookie as Locale)
        ? (localeCookie as Locale)
        : 'en';

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
