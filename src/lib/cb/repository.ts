'use client';

import { CbError, cbFetch } from './client';
import type { CbEnv } from './environments';
import { runtimeConfig } from '../runtime-config';
import { AUDIT_ACTIONS, AUDIT_SURFACES } from './types';
import type {
    AdminAuditEvent, AdminAuditPage, AdminCommandRow, AdminDailyRow, AdminOverview, AuditEvent, AuditFilters,
    AuditPage, DailyRow, DateRange, GroupAnalytics, LlmUsage, TopGroupRow,
} from './types';

export * from './types';

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
    groupAnalytics(groupId: number, range: DateRange): Promise<GroupAnalytics>;
    adminOverview(range: DateRange): Promise<AdminOverview>;
    adminDaily(range: DateRange): Promise<AdminDailyRow[]>;
    adminTopGroups(range: DateRange, limit?: number): Promise<TopGroupRow[]>;
    adminCommands(range: DateRange): Promise<AdminCommandRow[]>;
    adminLlm(range: DateRange): Promise<LlmUsage>;
    groupAudit(groupId: number, filters: AuditFilters, before: string | undefined, limit: number): Promise<AuditPage>;
    adminAudit(filters: AuditFilters, before: string | undefined, limit: number): Promise<AdminAuditPage>;
}

type Query = Record<string, string | number | undefined | null>;

// Empty values are omitted, never sent as `key=`.
function withQuery(path: string, params: Query) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
    }
    const text = search.toString();
    return text ? `${path}?${text}` : path;
}

const windowQuery = (range: DateRange): Query => ({ start: range.start, end: range.end });
const auditQuery = (filters: AuditFilters, before: string | undefined, limit: number): Query => ({
    action: filters.action,
    surface: filters.surface,
    actor_user_id: filters.actor_user_id,
    since: filters.since,
    until: filters.until,
    before,
    limit,
});

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

    async groupAnalytics(groupId: number, range: DateRange): Promise<GroupAnalytics> {
        const base = `/groups/${groupId}/analytics`;
        const query = windowQuery(range);
        const [daily, commands, llm, summary] = await Promise.all([
            cbFetch<{ days: DailyRow[] }>(this.env, withQuery(`${base}/daily`, query)),
            cbFetch<{ commands: GroupAnalytics['commands'] }>(this.env, withQuery(`${base}/commands`, query)),
            cbFetch<LlmUsage>(this.env, withQuery(`${base}/llm`, query)),
            cbFetch<GroupAnalytics['summary'] & { group_id: number; start: string; end: string }>(
                this.env, withQuery(`${base}/summary`, query),
            ),
        ]);
        // Promise.all on purpose: the stats view is one unit, so one failure is one error state.
        const { group_id: _group, start: _start, end: _end, ...totals } = summary;
        return { range, daily: daily.days, commands: commands.commands, llm, summary: totals };
    }

    adminOverview(range: DateRange) {
        return cbFetch<AdminOverview>(this.env, withQuery('/admin/overview', windowQuery(range)));
    }

    async adminDaily(range: DateRange) {
        return (await cbFetch<{ days: AdminDailyRow[] }>(
            this.env, withQuery('/admin/analytics/daily', windowQuery(range)),
        )).days;
    }

    async adminTopGroups(range: DateRange, limit = 10) {
        return (await cbFetch<{ groups: TopGroupRow[] }>(
            this.env, withQuery('/admin/analytics/groups', { ...windowQuery(range), limit }),
        )).groups;
    }

    async adminCommands(range: DateRange) {
        return (await cbFetch<{ commands: AdminCommandRow[] }>(
            this.env, withQuery('/admin/analytics/commands', windowQuery(range)),
        )).commands;
    }

    adminLlm(range: DateRange) {
        return cbFetch<LlmUsage>(this.env, withQuery('/admin/analytics/llm', windowQuery(range)));
    }

    groupAudit(groupId: number, filters: AuditFilters, before: string | undefined, limit: number) {
        return cbFetch<AuditPage>(
            this.env, withQuery(`/groups/${groupId}/audit`, auditQuery(filters, before, limit)),
        );
    }

    adminAudit(filters: AuditFilters, before: string | undefined, limit: number) {
        return cbFetch<AdminAuditPage>(
            this.env,
            withQuery('/admin/audit', { ...auditQuery(filters, before, limit), group_id: filters.group_id }),
        );
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


// ---- Deterministic mock data -------------------------------------------------
// Everything below is a pure function of its inputs (day index, event index),
// so reloads and tests see the same numbers.

const MOCK_GROUPS = [
    { group_id: -1000, title: 'GROUP A', username: 'group_a' },
    { group_id: -1001, title: 'GROUP B', username: null },
    { group_id: -1002, title: 'GROUP C', username: 'group_c' },
];

// Small integer hash -> [0, 1); the same inputs always give the same value.
function rand(seed: number, salt = 0) {
    let h = (Math.imul(seed + 1, 2654435761) ^ Math.imul(salt + 7, 1597334677)) >>> 0;
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const DAY_MS = 86_400_000;
const dayIndex = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / DAY_MS);
const isoDay = (index: number) => new Date(index * DAY_MS).toISOString().slice(0, 10);

function mockDailyRows(scope: number, range: DateRange, scale: number): DailyRow[] {
    const rows: DailyRow[] = [];
    for (let d = dayIndex(range.start); d <= dayIndex(range.end); d++) {
        // The API omits days with no activity; reproduce that.
        if (rand(d, scope) < 0.1) continue;
        const r = (salt: number) => rand(d, scope * 31 + salt);
        const messages = Math.round((200 + r(1) * 800) * scale);
        const issued = Math.round((2 + r(2) * 10) * scale);
        const tokens = Math.round((5_000 + r(3) * 40_000) * scale);
        rows.push({
            day: isoDay(d),
            messages,
            commands: Math.round(messages * (0.05 + r(4) * 0.1)),
            joins: Math.round((1 + r(5) * 8) * scale),
            leaves: Math.round((r(6) * 5) * scale),
            captcha_issued: issued,
            captcha_solved: Math.round(issued * (0.6 + r(7) * 0.4)),
            active_users: Math.round((20 + r(8) * 80) * scale),
            errors: Math.round(r(9) * 6 * scale),
            p95_latency_ms: r(10) < 0.05 ? null : Math.round(120 + r(10) * 600),
            llm_tokens: tokens,
            llm_cost_usd: Math.round(tokens * 0.000004 * 10_000) / 10_000,
        });
    }
    return rows;
}

const MOCK_COMMANDS = ['start', 'rules', 'help', 'ask', 'fur', 'meme', 'ban', 'lang', 'cookie', 'info'];
const MOCK_MODELS = [
    { provider: 'anthropic', model: 'claude-haiku' },
    { provider: 'anthropic', model: 'claude-sonnet' },
    { provider: 'openai', model: 'gpt-mini' },
];

function mockCommandRows(scope: number, scale: number) {
    return MOCK_COMMANDS.map((command, i) => {
        const invocations = Math.round((900 / (i + 1) + rand(i, scope) * 60) * scale);
        return {
            command,
            invocations,
            errors: Math.round(invocations * rand(i, scope + 50) * 0.04),
            p95_latency_ms: rand(i, scope + 60) < 0.1 ? null : Math.round(80 + rand(i, scope + 60) * 500),
        };
    });
}

function mockLlm(scope: number, range: DateRange, scale: number): LlmUsage {
    const days = Math.max(1, dayIndex(range.end) - dayIndex(range.start) + 1);
    const models = MOCK_MODELS.map((m, i) => {
        const calls = Math.round(days * (20 + rand(i, scope + 70) * 80) * scale);
        const input = calls * Math.round(300 + rand(i, scope + 71) * 500);
        const output = calls * Math.round(80 + rand(i, scope + 72) * 200);
        return {
            ...m,
            calls,
            input_tokens: input,
            output_tokens: output,
            cost_usd: Math.round((input * 0.000001 + output * 0.000005) * 10_000) / 10_000,
            refusals: Math.round(calls * 0.01),
            errors: Math.round(calls * 0.005),
        };
    }).sort((a, b) => b.cost_usd - a.cost_usd);
    return { total_cost_usd: Math.round(models.reduce((n, m) => n + m.cost_usd, 0) * 10_000) / 10_000, models };
}

function summarise(rows: DailyRow[]) {
    const sum = (pick: (row: DailyRow) => number) => rows.reduce((n, row) => n + pick(row), 0);
    const issued = sum((r) => r.captcha_issued);
    const latencies = rows.map((r) => r.p95_latency_ms).filter((v): v is number => v !== null);
    return {
        days: rows.length,
        messages: sum((r) => r.messages),
        commands: sum((r) => r.commands),
        joins: sum((r) => r.joins),
        leaves: sum((r) => r.leaves),
        errors: sum((r) => r.errors),
        captcha_issued: issued,
        captcha_solved: sum((r) => r.captcha_solved),
        captcha_solve_rate: issued ? sum((r) => r.captcha_solved) / issued : null,
        peak_active_users: Math.max(0, ...rows.map((r) => r.active_users)),
        worst_p95_latency_ms: latencies.length ? Math.max(...latencies) : null,
        llm_tokens: sum((r) => r.llm_tokens),
        llm_cost_usd: Math.round(sum((r) => r.llm_cost_usd) * 10_000) / 10_000,
    };
}

const MOCK_AUDIT_PER_GROUP = 120;
const MOCK_AUDIT_BASE_TS = Date.parse('2026-10-01T12:00:00Z');
const MOCK_AUDIT_FIELDS: Record<string, [string, unknown, unknown][]> = {
    'config.updated': [
        ['sfw', true, false], ['language', 'pt', 'en'], ['max_posts', 5, 8], ['doomlist_enabled', false, true],
    ],
    'rules.updated': [['body', 'Be kind.', 'Be kind. No spam.']],
    'welcome.updated': [['body', 'Welcome!', 'Welcome to the group!']],
    'session.started': [],
};

// Events are indexed oldest (0) to newest; ids are fixed-width hex so that
// lexicographic order is time order, like UUIDv7.
function buildMockAudit(): AdminAuditEvent[] {
    const events: AdminAuditEvent[] = [];
    const total = MOCK_AUDIT_PER_GROUP * MOCK_GROUPS.length;
    let ts = MOCK_AUDIT_BASE_TS; // newest event; the rest step backwards, nothing is future-dated
    for (let i = total - 1; i >= 0; i--) {
        const group = MOCK_GROUPS[i % MOCK_GROUPS.length];
        const action = AUDIT_ACTIONS[Math.floor(rand(i, 91) * (AUDIT_ACTIONS.length - 1 + 0.5)) % AUDIT_ACTIONS.length];
        const surface = AUDIT_SURFACES[Math.floor(rand(i, 92) * AUDIT_SURFACES.length)];
        const fields = MOCK_AUDIT_FIELDS[action];
        const pick = fields.length ? fields[Math.floor(rand(i, 93) * fields.length)] : null;
        const anonymous = surface === 'system' || rand(i, 94) < 0.1;
        const hex = i.toString(16).padStart(12, '0');
        const eventTs = ts;
        ts -= Math.round((1 + rand(i, 90) * 5) * 3_600_000);
        events.push({
            id: `01900000-0000-7000-8000-${hex}`,
            ts: new Date(eventTs).toISOString(),
            action,
            surface,
            actor_user_id: anonymous ? null : 1 + Math.floor(rand(i, 95) * 3),
            actor_kind: surface === 'system' ? 'system' : anonymous ? 'anonymous_admin' : 'user',
            summary: pick ? `${action.split('.')[0]}: ${pick[0]}` : 'session started',
            before: pick ? { [pick[0]]: pick[1] } : null,
            after: pick ? { [pick[0]]: pick[2] } : null,
            trace_id: rand(i, 96) < 0.3 ? null : `trace-${hex}`,
            group_id: group.group_id,
            group_title: group.title,
        });
    }
    return events; // already newest first
}

const MOCK_AUDIT = buildMockAudit();

// Naive datetimes are UTC, as in the API.
function parseMockDatetime(value: string) {
    const ms = Date.parse(/(Z|[+-]\d{2}:?\d{2})$/i.test(value) || !value.includes('T') ? value : `${value}Z`);
    if (Number.isNaN(ms)) throw new CbError(422, 'invalid_datetime');
    return ms;
}

// Mirrors the API: newest first, `before` exclusive, filters ANDed, `limit + 1`
// over-fetch so `next_before` is null on the last page.
function pageMockAudit(filters: AuditFilters, before: string | undefined, limit: number) {
    const since = filters.since ? parseMockDatetime(filters.since) : null;
    const until = filters.until ? parseMockDatetime(filters.until) : null;
    if (since !== null && until !== null && since >= until) throw new CbError(400, 'invalid_window');
    const matching = MOCK_AUDIT.filter((e) => {
        const ts = Date.parse(e.ts);
        return (before === undefined || e.id < before)
            && (filters.group_id === undefined || e.group_id === filters.group_id)
            && (filters.action === undefined || e.action === filters.action)
            && (filters.surface === undefined || e.surface === filters.surface)
            && (filters.actor_user_id === undefined || e.actor_user_id === filters.actor_user_id)
            && (since === null || ts >= since)
            && (until === null || ts < until);
    }).slice(0, limit + 1);
    const events = matching.slice(0, limit);
    return { events, next_before: matching.length > limit ? events[events.length - 1].id : null };
}

const groupScale = (groupId: number) => 0.5 + rand(Math.abs(groupId), 3);
const FLEET_SCALE = MOCK_GROUPS.length;

export class MockSettingsRepository implements SettingsRepository {
    private configs = new Map<number, GroupConfig>();
    private texts = new Map<string, string>();

    async me(): Promise<Me> {
        return {
            user_id: 1,
            scopes: ['groups:read', 'groups:write', 'audit:read', 'admin:read'],
            // Kept true so the owner screens are reachable in mock mode.
            is_bot_admin: true, // intended: mock mode must expose the owner screens
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

    async groupAnalytics(groupId: number, range: DateRange): Promise<GroupAnalytics> {
        const scale = groupScale(groupId);
        const daily = mockDailyRows(Math.abs(groupId), range, scale);
        return {
            range,
            daily,
            commands: mockCommandRows(Math.abs(groupId), scale),
            llm: mockLlm(Math.abs(groupId), range, scale),
            summary: summarise(daily),
        };
    }

    async adminOverview(range: DateRange): Promise<AdminOverview> {
        const daily = await this.adminDaily(range);
        const totals = { ...summarise(daily), peak_groups: Math.max(0, ...daily.map((r) => r.groups)) };
        const budget = 50;
        return {
            ...range,
            tenant_id: 'cookiebot',
            display_name: 'Cookiebot',
            reach: { groups: MOCK_GROUPS.length, groups_left: 1, members: 1234, admins: 9 },
            totals,
            budget: {
                monthly_llm_budget_usd: budget,
                spent_usd: totals.llm_cost_usd,
                remaining_usd: Math.round((budget - totals.llm_cost_usd) * 10_000) / 10_000,
            },
        };
    }

    async adminDaily(range: DateRange): Promise<AdminDailyRow[]> {
        return mockDailyRows(0, range, FLEET_SCALE).map((row, i) => ({
            ...row,
            groups: 1 + Math.floor(rand(i, 80) * MOCK_GROUPS.length),
        }));
    }

    async adminTopGroups(range: DateRange, limit = 10): Promise<TopGroupRow[]> {
        return MOCK_GROUPS.map((g) => {
            const summary = summarise(mockDailyRows(Math.abs(g.group_id), range, groupScale(g.group_id)));
            return {
                ...g,
                messages: summary.messages,
                commands: summary.commands,
                errors: summary.errors,
                peak_active_users: summary.peak_active_users,
                llm_cost_usd: summary.llm_cost_usd,
            };
        }).sort((a, b) => b.messages - a.messages).slice(0, limit);
    }

    async adminCommands(): Promise<AdminCommandRow[]> {
        return mockCommandRows(0, FLEET_SCALE).map((row, i) => ({
            ...row,
            groups: Math.max(1, MOCK_GROUPS.length - Math.floor(i / 4)),
        }));
    }

    async adminLlm(range: DateRange) {
        return mockLlm(0, range, FLEET_SCALE);
    }

    async groupAudit(groupId: number, filters: AuditFilters, before: string | undefined, limit: number): Promise<AuditPage> {
        const page = pageMockAudit({ ...filters, group_id: groupId }, before, limit);
        return {
            group_id: groupId,
            events: page.events.map(({ group_id: _g, group_title: _t, ...event }): AuditEvent => event),
            next_before: page.next_before,
        };
    }

    async adminAudit(filters: AuditFilters, before: string | undefined, limit: number): Promise<AdminAuditPage> {
        return pageMockAudit(filters, before, limit);
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
