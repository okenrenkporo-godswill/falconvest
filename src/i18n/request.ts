import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { locales, defaultLocale, Locale } from './routing';

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('locale')?.value;
    const locale: Locale = locales.includes(localeCookie as Locale)
        ? (localeCookie as Locale)
        : defaultLocale;

    let messages;
    try {
        messages = (await import(`../messages/${locale}.json`)).default;
    } catch (error) {
        messages = (await import(`../messages/${defaultLocale}.json`)).default;
    }

    return {
        locale,
        messages
    };
});
