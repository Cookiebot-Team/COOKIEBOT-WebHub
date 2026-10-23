import type { CbEnv } from './cb/environments';

// Settings the server injects at runtime through /runtime-config.js (loaded
// before the app). The same static build runs in every environment; only the
// server's environment variables differ. See src/lib/cb/server-config.ts.
export type RuntimeConfig = {
    envs: CbEnv[];
    defaultEnv: CbEnv;
    envSelectable: boolean;
    telegramBotUsername: string;
    settingsBackend: 'http' | 'mock';
};

const FALLBACK: RuntimeConfig = {
    envs: [],
    defaultEnv: 'prd',
    envSelectable: false,
    telegramBotUsername: 'CookieMWbot',
    settingsBackend: 'http',
};

declare global {
    interface Window {
        __CB_CONFIG__?: Partial<RuntimeConfig>;
    }
}

// Read lazily: during prerendering there is no window and the fallback applies.
export function runtimeConfig(): RuntimeConfig {
    if (typeof window === 'undefined' || !window.__CB_CONFIG__) return FALLBACK;
    return { ...FALLBACK, ...window.__CB_CONFIG__ };
}
