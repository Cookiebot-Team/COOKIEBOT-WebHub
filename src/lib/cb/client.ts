'use client';

import type { CbEnv } from './environments';

export const LOGIN_GRANT = 'urn:cookiebot:params:oauth:grant-type:telegram-login';
export const MINIAPP_GRANT = 'urn:cookiebot:params:oauth:grant-type:telegram-miniapp';

export class CbError extends Error {
    constructor(public status: number, public detail: string) {
        super(detail);
    }
}

type TokenResponse = { access_token: string; refresh_token: string; expires_in: number };

// Access tokens live in memory only; refresh tokens are kept per environment
// so switching local/dev/prd never sends one environment's token to another.
const accessTokens = new Map<CbEnv, string>();
const refreshing = new Map<CbEnv, Promise<boolean>>();

let miniApp = false;
export function setMiniAppMode(value: boolean) {
    miniApp = value;
}

function tokenStore(): Storage | null {
    if (typeof window === 'undefined') return null;
    try {
        return miniApp ? window.sessionStorage : window.localStorage;
    } catch {
        return null;
    }
}

const refreshKey = (env: CbEnv) => `cb.refresh.${env}`;

export function getRefreshToken(env: CbEnv) {
    return tokenStore()?.getItem(refreshKey(env)) ?? null;
}

export function clearTokens(env: CbEnv) {
    accessTokens.delete(env);
    tokenStore()?.removeItem(refreshKey(env));
}

async function readError(response: Response): Promise<CbError> {
    let detail = response.statusText;
    try {
        const body = await response.json();
        detail = typeof body.detail === 'string'
            ? body.detail
            : body.error_description ?? body.error ?? JSON.stringify(body.detail ?? body);
    } catch { /* keep statusText */ }
    return new CbError(response.status, detail);
}

async function send(env: CbEnv, path: string, init: RequestInit = {}) {
    try {
        return await fetch(`/cb/${env}${path}`, init);
    } catch {
        throw new CbError(0, 'network');
    }
}

export async function exchangeToken(env: CbEnv, body: Record<string, unknown>) {
    const response = await send(env, '/oauth2/token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!response.ok) throw await readError(response);
    const tokens: TokenResponse = await response.json();
    accessTokens.set(env, tokens.access_token);
    tokenStore()?.setItem(refreshKey(env), tokens.refresh_token);
}

export function refreshSession(env: CbEnv): Promise<boolean> {
    const pending = refreshing.get(env);
    if (pending) return pending;

    const run = (async () => {
        const refreshToken = getRefreshToken(env);
        if (!refreshToken) return false;
        try {
            await exchangeToken(env, { grant_type: 'refresh_token', refresh_token: refreshToken });
            return true;
        } catch (error) {
            if (error instanceof CbError && error.status === 0) throw error;
            clearTokens(env);
            return false;
        }
    })().finally(() => refreshing.delete(env));

    refreshing.set(env, run);
    return run;
}

export async function revokeSession(env: CbEnv) {
    const refreshToken = getRefreshToken(env);
    clearTokens(env);
    if (!refreshToken) return;
    await send(env, '/oauth2/revoke', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: refreshToken }),
    }).catch(() => undefined);
}

export async function cbFetch<T>(env: CbEnv, path: string, init: RequestInit = {}, retried = false): Promise<T> {
    const headers = new Headers(init.headers);
    const token = accessTokens.get(env);
    if (token) headers.set('authorization', `Bearer ${token}`);
    if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');

    const response = await send(env, path, { ...init, headers });
    if (response.status === 401 && !retried && (await refreshSession(env))) {
        return cbFetch<T>(env, path, init, true);
    }
    if (!response.ok) throw await readError(response);
    return response.json();
}
