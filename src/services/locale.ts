import { Locale, defaultLocale, locales } from '@/config';

// The site is a static export, so the locale lives in a cookie the browser
// reads and writes; the name is kept from the server-rendered version so
// existing visitors keep their language.
const COOKIE_NAME = 'NEXT_LOCALE';
const ONE_YEAR = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function getUserLocale(): Locale {
    if (typeof document === 'undefined') return defaultLocale;
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    const value = match ? decodeURIComponent(match[1]) : null;
    return isLocale(value) ? value : defaultLocale;
}

export function setUserLocale(locale: Locale) {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(locale)}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}
