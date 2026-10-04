'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TelegramAuthData } from '@telegram-auth/react';
import { CbEnv, isCbEnv } from '@/lib/cb/environments';
import { runtimeConfig } from '@/lib/runtime-config';
import {
    CbError, exchangeToken, getRefreshToken, LOGIN_GRANT, MINIAPP_GRANT, refreshSession, revokeSession, setMiniAppMode,
} from '@/lib/cb/client';
import {
    HttpSettingsRepository, isMockBackend, Me, MockSettingsRepository, SettingsRepository,
} from '@/lib/cb/repository';

type Status = 'loading' | 'anonymous' | 'authenticated' | 'error';
type ErrorKey = 'loginFailed' | 'miniappFailed' | 'networkError';

type WebHub = {
    env: CbEnv;
    envs: CbEnv[];
    setEnv: (env: CbEnv) => void;
    status: Status;
    error: ErrorKey | null;
    isMiniApp: boolean;
    me: Me | null;
    repo: SettingsRepository;
    groupId: number | null;
    setGroupId: (id: number) => void;
    loginWithWidget: (data: TelegramAuthData) => Promise<void>;
    logout: () => Promise<void>;
    retry: () => void;
};

const WebHubContext = createContext<WebHub | null>(null);

const mockRepo = new MockSettingsRepository();
const ENV_KEY = 'cb.env';
const groupKey = (env: CbEnv) => `cb.group.${env}`;

function readStorage(key: string) {
    try { return window.localStorage.getItem(key); } catch { return null; }
}

function writeStorage(key: string, value: string) {
    try { window.localStorage.setItem(key, value); } catch { /* private mode */ }
}

function loadTelegramSdk(): Promise<TelegramWebApp | undefined> {
    if (window.Telegram?.WebApp) return Promise.resolve(window.Telegram.WebApp);
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-web-app.js';
        script.onload = () => resolve(window.Telegram?.WebApp);
        script.onerror = () => resolve(undefined);
        document.head.appendChild(script);
        setTimeout(() => resolve(window.Telegram?.WebApp), 3000);
    });
}

export function WebHubProvider({ children }: { children: ReactNode }) {
    // The environment list comes from /runtime-config.js, which only exists in
    // the browser: auth waits for it (`ready`) instead of starting on a guess.
    const [envs, setEnvs] = useState<CbEnv[]>([]);
    const [env, setEnvState] = useState<CbEnv>('prd');
    const [ready, setReady] = useState(false);
    const [status, setStatus] = useState<Status>('loading');
    const [error, setError] = useState<ErrorKey | null>(null);
    const [me, setMe] = useState<Me | null>(null);
    const [groupId, setGroupIdState] = useState<number | null>(null);
    const [isMiniApp, setIsMiniApp] = useState(false);
    const [attempt, setAttempt] = useState(0);

    const repo = useMemo<SettingsRepository>(
        () => (isMockBackend() ? mockRepo : new HttpSettingsRepository(env)),
        [env],
    );

    useEffect(() => {
        const config = runtimeConfig();
        const saved = readStorage(ENV_KEY);
        setEnvs(config.envs);
        setEnvState(isCbEnv(saved) && config.envs.includes(saved) ? saved : config.defaultEnv);
        setReady(true);
    }, []);

    const setEnv = useCallback((next: CbEnv) => {
        writeStorage(ENV_KEY, next);
        setEnvState(next);
    }, []);

    const setGroupId = useCallback((id: number) => {
        writeStorage(groupKey(env), String(id));
        setGroupIdState(id);
    }, [env]);

    const loadMe = useCallback(async () => {
        const profile = await repo.me();
        setMe(profile);
        const saved = Number(readStorage(groupKey(env)));
        const known = profile.groups.find((g) => g.group_id === saved) ?? profile.groups[0];
        setGroupIdState(known?.group_id ?? null);
        setStatus('authenticated');
    }, [repo, env]);

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        setStatus('loading');
        setError(null);
        setMe(null);

        (async () => {
            if (isMockBackend()) return loadMe();

            const webApp = await loadTelegramSdk();
            if (cancelled) return;
            const initData = webApp?.initData;
            setIsMiniApp(Boolean(initData));
            setMiniAppMode(Boolean(initData));

            if (initData) {
                webApp.ready();
                webApp.expand();
                const { bg_color, text_color } = webApp.themeParams;
                if (bg_color) document.documentElement.style.setProperty('--tg-bg', bg_color);
                if (text_color) document.documentElement.style.setProperty('--tg-text', text_color);
                try {
                    await exchangeToken(env, { grant_type: MINIAPP_GRANT, init_data: initData });
                } catch (e) {
                    if (cancelled) return;
                    setError(e instanceof CbError && e.status === 0 ? 'networkError' : 'miniappFailed');
                    setStatus('error');
                    return;
                }
            } else if (!getRefreshToken(env) || !(await refreshSession(env))) {
                if (!cancelled) setStatus('anonymous');
                return;
            }
            if (!cancelled) await loadMe();
        })().catch((e) => {
            if (cancelled) return;
            setError(e instanceof CbError && e.status === 0 ? 'networkError' : 'loginFailed');
            setStatus(e instanceof CbError && e.status === 401 ? 'anonymous' : 'error');
        });

        return () => { cancelled = true; };
    }, [ready, env, loadMe, attempt]);

    const loginWithWidget = useCallback(async (data: TelegramAuthData) => {
        setStatus('loading');
        setError(null);
        try {
            await exchangeToken(env, { grant_type: LOGIN_GRANT, auth_data: data });
            await loadMe();
        } catch (e) {
            setError(e instanceof CbError && e.status === 0 ? 'networkError' : 'loginFailed');
            setStatus('anonymous');
        }
    }, [env, loadMe]);

    const logout = useCallback(async () => {
        await revokeSession(env);
        setMe(null);
        setStatus('anonymous');
    }, [env]);

    const retry = useCallback(() => setAttempt((n) => n + 1), []);

    const value: WebHub = {
        env, envs, setEnv, status, error, isMiniApp, me, repo, groupId, setGroupId, loginWithWidget, logout, retry,
    };
    return <WebHubContext.Provider value={value}>{children}</WebHubContext.Provider>;
}

export function useWebHub() {
    const context = useContext(WebHubContext);
    if (!context) throw new Error('useWebHub must be used inside WebHubProvider');
    return context;
}

type TelegramWebApp = {
    initData: string;
    ready: () => void;
    expand: () => void;
    themeParams: { bg_color?: string; text_color?: string };
    BackButton: { show: () => void; hide: () => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void };
};

declare global {
    interface Window {
        Telegram?: { WebApp?: TelegramWebApp };
    }
}
