'use client';

import { NextIntlClientProvider } from 'next-intl';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { defaultLocale, Locale } from '@/config';
import { getUserLocale, setUserLocale } from '@/services/locale';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import pt from '../../messages/pt.json';

const MESSAGES = { en, es, pt } as const;

const LocaleContext = createContext<(locale: Locale) => void>(() => undefined);

// Pages are prerendered in the default locale; the visitor's saved locale is
// applied after hydration so server and client markup always match.
export default function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(defaultLocale);

    useEffect(() => { setLocaleState(getUserLocale()); }, []);
    useEffect(() => { document.documentElement.lang = locale; }, [locale]);

    const setLocale = useCallback((next: Locale) => {
        setUserLocale(next);
        setLocaleState(next);
    }, []);

    return (
        <LocaleContext.Provider value={setLocale}>
            <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="America/Sao_Paulo">
                {children}
            </NextIntlClientProvider>
        </LocaleContext.Provider>
    );
}

export function useSetLocale() {
    return useContext(LocaleContext);
}
