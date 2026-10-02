'use client';

import { cbFetch } from './client';
import type { CbEnv } from './environments';
import { runtimeConfig } from '../runtime-config';

export type AdministeredGroup = {
    group_id: number;
    title: string | null;
    username: string | null;
    chat_type: string | null;
    role: string;
};

export type Me = {
    user_id: number;
    scopes: string[];
    is_bot_admin: boolean;
    groups: AdministeredGroup[];
};

export type GroupConfig = {
    allow_furbots: boolean;
    sticker_spam_limit: number;
    sticker_spam_window_s: number;
    media_restrict_seconds: number;
    captcha_timeout_seconds: number;
    functions_fun: boolean;
    functions_utility: boolean;
    sfw: boolean;
    language: string;
    publisher_post: boolean;
    publisher_ask: boolean;
    publisher_members_only: boolean;
    thread_posts: string | null;
    max_posts: number;
    doomlist_enabled: boolean;
};

export type GroupText = 'rules' | 'welcome';

export interface SettingsRepository {
    me(): Promise<Me>;
    getConfig(groupId: number): Promise<GroupConfig>;
    patchConfig(groupId: number, patch: Partial<GroupConfig>): Promise<GroupConfig>;
    getText(groupId: number, kind: GroupText): Promise<string | null>;
    putText(groupId: number, kind: GroupText, body: string): Promise<void>;
}

export class HttpSettingsRepository implements SettingsRepository {
    constructor(private env: CbEnv) {}

    me() {
        return cbFetch<Me>(this.env, '/me');
    }

    async getConfig(groupId: number) {
        return (await cbFetch<{ config: GroupConfig }>(this.env, `/groups/${groupId}/config`)).config;
    }

    async patchConfig(groupId: number, patch: Partial<GroupConfig>) {
        const response = await cbFetch<{ config: GroupConfig }>(this.env, `/groups/${groupId}/config`, {
            method: 'PATCH',
            body: JSON.stringify(patch),
        });
        return response.config;
    }

    async getText(groupId: number, kind: GroupText) {
        return (await cbFetch<{ body: string | null }>(this.env, `/groups/${groupId}/${kind}`)).body;
    }

    async putText(groupId: number, kind: GroupText, body: string) {
        await cbFetch(this.env, `/groups/${groupId}/${kind}`, { method: 'PUT', body: JSON.stringify({ body }) });
    }
}

const MOCK_CONFIG: GroupConfig = {
    allow_furbots: true,
    sticker_spam_limit: 5,
    sticker_spam_window_s: 60,
    media_restrict_seconds: 3600,
    captcha_timeout_seconds: 300,
    functions_fun: true,
    functions_utility: true,
    sfw: true,
    language: 'pt',
    publisher_post: false,
    publisher_ask: true,
    publisher_members_only: false,
    thread_posts: null,
    max_posts: 5,
    doomlist_enabled: false,
};

export class MockSettingsRepository implements SettingsRepository {
    private configs = new Map<number, GroupConfig>();
    private texts = new Map<string, string>();

    async me(): Promise<Me> {
        return {
            user_id: 1,
            scopes: ['groups:read', 'groups:write'],
            is_bot_admin: false,
            groups: ['GROUP A', 'GROUP B', 'GROUP C'].map((title, i) => ({
                group_id: -1000 - i, title, username: null, chat_type: 'supergroup', role: 'creator',
            })),
        };
    }

    async getConfig(groupId: number) {
        return { ...(this.configs.get(groupId) ?? MOCK_CONFIG) };
    }

    async patchConfig(groupId: number, patch: Partial<GroupConfig>) {
        const next = { ...(await this.getConfig(groupId)), ...patch };
        this.configs.set(groupId, next);
        return { ...next };
    }

    async getText(groupId: number, kind: GroupText) {
        return this.texts.get(`${groupId}:${kind}`) ?? null;
    }

    async putText(groupId: number, kind: GroupText, body: string) {
        this.texts.set(`${groupId}:${kind}`, body);
    }
}

export const isMockBackend = () => runtimeConfig().settingsBackend === 'mock';

export function changedFields<T extends object>(original: T, edited: T): Partial<T> {
    const patch: Partial<T> = {};
    for (const key of Object.keys(edited) as (keyof T)[]) {
        if (edited[key] !== original[key]) patch[key] = edited[key];
    }
    return patch;
}
