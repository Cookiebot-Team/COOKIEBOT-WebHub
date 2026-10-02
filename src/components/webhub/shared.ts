'use client';

import { useLocale } from 'next-intl';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Locale } from '@/config';
import { useSetLocale } from '@/providers/LocaleProvider';

// Behaviour shared by both designs; each design draws its own UI on top.

export function usePopover<T extends HTMLElement = HTMLDivElement>() {
    const [open, setOpen] = useState(false);
    const ref = useRef<T>(null);
    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent | KeyboardEvent) => {
            if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', close);
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('keydown', close);
        };
    }, [open]);
    return { open, setOpen, ref };
}

export const LANGUAGES: { value: Locale; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
    { value: 'es', label: 'Español' },
];

export function useLocaleSwitch() {
    const locale = useLocale();
    const setLocale = useSetLocale();
    const [pending, startTransition] = useTransition();
    const change = (next: Locale, after?: () => void) => startTransition(() => {
        setLocale(next);
        after?.();
    });
    return { locale, pending, change };
}
