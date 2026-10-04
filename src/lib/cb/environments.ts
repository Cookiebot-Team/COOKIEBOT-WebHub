import { runtimeConfig } from '../runtime-config';

export const CB_ENVS = ['local', 'dev', 'prd'] as const;

export type CbEnv = (typeof CB_ENVS)[number];

export const CB_ENV_LABELS: Record<CbEnv, string> = {
    local: 'Local',
    dev: 'Dev',
    prd: 'Prd',
};

export function isCbEnv(value: unknown): value is CbEnv {
    return typeof value === 'string' && (CB_ENVS as readonly string[]).includes(value);
}

// Only `next dev` lets people switch environments. A production server is
// pinned to one and never renders the selector (see server-config.ts, which
// also holds the API URLs: the browser only ever talks to /cb/{env}/...).
export function envSelectable(): boolean {
    return runtimeConfig().envSelectable;
}
