'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { ComponentType, createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { runtimeConfig } from '@/lib/runtime-config';
import { ToastProvider } from '../v2/ui';

export type Design = 'v1' | 'v2';

const DESIGNS: Design[] = ['v1', 'v2'];
const STORAGE_KEY = 'cb.design';

// Lets people try both WebHub designs side by side before one is retired.
// DESIGN_SWITCHER=false hides the switcher and DESIGN_DEFAULT picks the design
// shown first (runtime settings, see src/lib/cb/server-config.ts).
const defaultDesign: Design = 'v2';

const isDesign = (value: unknown): value is Design => DESIGNS.includes(value as Design);

const DesignContext = createContext<{ design: Design; setDesign: (design: Design) => void }>({
    design: defaultDesign,
    setDesign: () => undefined,
});

export function DesignProvider({ children }: { children: ReactNode }) {
    const [design, setDesignState] = useState<Design>(defaultDesign);
    const [switcher, setSwitcher] = useState(false);

    useEffect(() => {
        const config = runtimeConfig();
        setSwitcher(config.designSwitcher);
        setDesignState(config.designDefault);
        if (!config.designSwitcher) return;
        const fromQuery = new URLSearchParams(window.location.search).get('design');
        let saved: string | null = null;
        try { saved = window.localStorage.getItem(STORAGE_KEY); } catch { /* private mode */ }
        const chosen = isDesign(fromQuery) ? fromQuery : saved;
        if (isDesign(chosen)) setDesignState(chosen);
    }, []);

    const setDesign = useCallback((next: Design) => {
        try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* private mode */ }
        setDesignState(next);
    }, []);

    return (
        <DesignContext.Provider value={{ design, setDesign }}>
            <ToastProvider>{children}</ToastProvider>
            {switcher && <DesignSwitcher />}
        </DesignContext.Provider>
    );
}

export function useDesign() {
    return useContext(DesignContext);
}

// One route, two screens: renders whichever design is active.
export function Designed({ v1: V1, v2: V2 }: { v1: ComponentType; v2: ComponentType }) {
    const { design } = useDesign();
    return design === 'v2' ? <V2 /> : <V1 />;
}

function DesignSwitcher() {
    const t = useTranslations('WebHub.design');
    const { design, setDesign } = useDesign();

    return (
        <div
            role="radiogroup"
            aria-label={t('label')}
            className="fixed bottom-[84px] right-3 z-40 flex lg:bottom-4 lg:right-4 items-center gap-1 rounded-full bg-cb-ink/90 p-1 font-jost text-xs font-semibold text-cb-cream-100 shadow-cb-float backdrop-blur"
        >
            <span className="px-2 uppercase tracking-wider text-cb-cream-100/60">{t('label')}</span>
            {DESIGNS.map((option) => (
                <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={design === option}
                    onClick={() => setDesign(option)}
                    className={clsx(
                        'h-8 min-w-11 rounded-full px-3 transition-colors',
                        design === option ? 'bg-cb-cream-100 text-cb-brown-900' : 'hover:bg-white/10',
                    )}
                >
                    {option.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
