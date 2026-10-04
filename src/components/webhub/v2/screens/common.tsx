'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { KeyboardEvent, ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { EChartsCoreOption } from 'echarts/core';
import type { DateRange } from '@/lib/cb/types';
import { CbError } from '@/lib/cb/client';
import { useWebHub } from '../../WebHubProvider';
import { groupName } from '../GroupPicker';
import { GroupChip } from '../Shell';
import { Card, SaveBar, SectionLabel, useToast } from '../ui';

export function PageIntro({ title, lead, wide, openGroups, aside, groupScoped = true }: {
    title: string; lead: string; wide: boolean; openGroups: () => void; aside?: ReactNode; groupScoped?: boolean;
}) {
    return (
        <>
            {groupScoped && <div className={clsx(wide && 'lg:hidden')}><GroupChip onOpen={openGroups} /></div>}
            <div className={clsx('hidden items-end justify-between gap-4', wide && 'lg:flex')}>
                <div>
                    <h1 className="m-0 text-[28px] font-bold">{title}</h1>
                    <p className="m-0 mt-1.5 text-[15px] text-cb-muted">{lead}</p>
                </div>
                {aside}
            </div>
        </>
    );
}

// Full width on every layout: the Events screen is a local draft, say so
// where phones and the Mini App can see it too.
export function WipNotice() {
    const t = useTranslations('WebHub.v2');
    const titleId = useId();
    return (
        <div role="note" aria-labelledby={titleId}
            className="flex items-start gap-3 rounded-cb-xl border border-cb-brown-700/15 bg-cb-cream-50 p-3.5 text-black">
            <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 size-5 shrink-0 text-cb-brown-700" fill="none" stroke="currentColor"
                strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" /><path d="M12 11v5 M12 7.8h.01" />
            </svg>
            <div className="min-w-0">
                <p id={titleId} className="m-0 text-[15px] font-semibold">{t('events.wip.title')}</p>
                <p className="m-0 mt-0.5 text-sm text-cb-muted">{t('events.wip.body')}</p>
            </div>
        </div>
    );
}

export function Skeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="flex flex-col gap-4" aria-busy="true">
            {Array.from({ length: rows }, (_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-cb-xl bg-cb-cream-50/60" />
            ))}
        </div>
    );
}

// Save confirms in place (toast) instead of leaving the screen, so several
// edits in a row don't bounce the admin back to the overview.
export function SaveBars({ dirtyCount, save, discard, saving }: {
    dirtyCount: number; save: () => Promise<boolean>; discard: () => void; saving: boolean;
}) {
    const t = useTranslations('WebHub.v2');
    const toast = useToast();
    const { me, groupId } = useWebHub();
    const group = me?.groups.find((g) => g.group_id === groupId);
    const name = group ? groupName(group) : '';
    const onSave = useCallback(async () => {
        if (await save()) toast(t('saved', { group: name }));
    }, [save, toast, t, name]);

    const props = { count: dirtyCount, groupName: name, onDiscard: discard, onSave, saving };
    return (
        <>
            <SaveBar {...props} floating={false} />
            <SaveBar {...props} floating />
        </>
    );
}

export function KpiTile({ label, value, hint, tone = 'light' }: {
    label: string; value: ReactNode; hint?: string; tone?: 'light' | 'dark';
}) {
    return (
        <div className={clsx('min-w-0 rounded-cb-xl p-3.5',
            tone === 'dark' ? 'bg-white/10 text-cb-cream-50' : 'bg-cb-cream-50 text-black')}>
            <p title={label} className={clsx('m-0 line-clamp-2 text-xs font-semibold uppercase tracking-wide',
                tone === 'dark' ? 'text-cb-cream-200' : 'text-cb-muted')}>{label}</p>
            <p className="m-0 mt-1 min-w-0 break-words text-[22px] font-bold leading-tight tabular-nums sm:text-[26px]">{value}</p>
            {hint && <p title={hint} className={clsx('m-0 mt-0.5 line-clamp-2 text-xs', tone === 'dark' ? 'text-cb-cream-200' : 'text-cb-muted')}>{hint}</p>}
        </div>
    );
}

export const KPI_GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6';

export const RANGES = [7, 30, 90] as const;
export type RangeDays = (typeof RANGES)[number];

// Segmented 7/30/90 control. A radiogroup: one choice, arrow keys / Home / End move it.
export function RangePicker({ value, onChange, className }: {
    value: RangeDays; onChange: (days: RangeDays) => void; className?: string;
}) {
    const t = useTranslations('WebHub.v2.stats.range');
    const refs = useRef<(HTMLButtonElement | null)[]>([]);
    const moved = useRef(false);
    // Focus follows the selection only after a keyboard move, never on mount.
    useEffect(() => {
        if (!moved.current) return;
        moved.current = false;
        refs.current[RANGES.indexOf(value)]?.focus();
    }, [value]);
    const move = (e: KeyboardEvent, i: number) => {
        let next = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % RANGES.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + RANGES.length) % RANGES.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = RANGES.length - 1;
        if (next < 0) return;
        e.preventDefault();
        moved.current = true;
        onChange(RANGES[next]);
    };
    return (
        <div role="radiogroup" aria-label={t('label')}
            className={clsx('inline-flex self-start rounded-full bg-cb-cream-50 p-1 shadow-cb-card', className)}>
            {RANGES.map((days, i) => {
                const active = days === value;
                return (
                    <button key={days} ref={(el) => { refs.current[i] = el; }} type="button" role="radio" aria-checked={active}
                        tabIndex={active ? 0 : -1} onClick={() => onChange(days)} onKeyDown={(e) => move(e, i)}
                        className={clsx('min-h-[44px] min-w-[72px] rounded-full px-4 text-sm font-semibold transition-colors',
                            active ? 'bg-cb-brown-700 text-cb-cream-50' : 'text-cb-brown-900 hover:bg-cb-cream-100')}>
                        {t('days', { days })}
                    </button>
                );
            })}
        </div>
    );
}

// Query failure for the stats screens: 404 not an admin, 403 token lacks
// permission (sign in again), anything else is retryable.
export function StatsError({ error, onRetry, title }: { error: unknown; onRetry: () => void; title?: string }) {
    const t = useTranslations('WebHub');
    const { logout } = useWebHub();
    const status = error instanceof CbError ? error.status : -1;
    const message = status === 404 ? t('groups.notAdmin')
        : status === 403 ? t('v2.stats.error.reauth')
        : status === 0 ? t('auth.networkError') : title ?? t('v2.stats.error.generic');
    const action = 'h-10 self-start rounded-cb-md bg-cb-brown-700 px-4 text-sm font-semibold text-cb-cream-50';
    return (
        <div role="alert" className="flex flex-col gap-3 rounded-cb-xl bg-cb-cream-50 p-4 text-black shadow-cb-card">
            <p className="m-0 text-[15px]">{message}</p>
            {status === 403 ? (
                <button type="button" onClick={() => void logout()} className={action}>{t('v2.signOut')}</button>
            ) : status !== 404 && (
                <button type="button" onClick={onRetry} className={action}>{t('retry')}</button>
            )}
        </div>
    );
}

// Shared by the group and fleet stats screens.
const DAY_MS = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

// The viewer's local calendar date as YYYY-MM-DD.
function localToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function rangeFor(days: RangeDays, today: string): DateRange {
    const end = Date.parse(`${today}T00:00:00Z`);
    return { start: iso(end - (days - 1) * DAY_MS), end: today };
}

// Re-reads the date on window focus / tab visibility, so a screen left open
// overnight moves to the new day.
export function useToday(): string {
    const [today, setToday] = useState(localToday);
    useEffect(() => {
        const refresh = () => setToday(localToday());
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            window.removeEventListener('focus', refresh);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, []);
    return today;
}

export const compactFrom = 100_000;
export function countFormat(locale: string) {
    const plain = new Intl.NumberFormat(locale);
    const compact = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
    return (v: number) => (v >= compactFrom ? compact : plain).format(v);
}

// USD with 2 decimals, up to 4 for sub-dollar amounts.
export function usdFormat(locale: string, amount: number) {
    return new Intl.NumberFormat(locale, {
        style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: amount < 1 ? 4 : 2,
    });
}

// Charts always sit on a cream Card (phone, Mini App and desktop alike), so
// they use the light tone; the page background behind the cards does not matter.
export function ChartCard({ title, delay, children }: { title: string; delay?: 0 | 1 | 2; children: ReactNode }) {
    return (
        <Card delay={delay} className="flex min-w-0 flex-col gap-2 p-4 lg:p-[22px]">
            <SectionLabel>{title}</SectionLabel>
            {children}
        </Card>
    );
}

// One series needs no legend. The category (y) axis of the horizontal bars
// gets a fixed label width so long command names truncate instead of
// squeezing the plot on phones.
export function singleSeries(option: EChartsCoreOption, narrow: boolean): EChartsCoreOption {
    const o = option as Record<string, any>;
    return {
        ...o,
        legend: { ...o.legend, show: false },
        grid: { ...o.grid, bottom: 12 },
        yAxis: { ...o.yAxis, axisLabel: { ...o.yAxis.axisLabel, width: narrow ? 72 : 120, overflow: 'truncate' } },
    };
}


// Below Tailwind's `sm` (640px).
export function useNarrow(): boolean {
    const [narrow, setNarrow] = useState(false);
    useEffect(() => {
        const q = window.matchMedia('(max-width: 639px)');
        const update = () => setNarrow(q.matches);
        update();
        q.addEventListener('change', update);
        return () => q.removeEventListener('change', update);
    }, []);
    return narrow;
}

