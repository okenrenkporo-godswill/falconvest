'use server';

import { cookies } from 'next/headers';
import { Locale, defaultLocale } from '@/i18n/routing';

const COOKIE_NAME = 'locale';

export async function getUserLocale() {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, locale);
}
