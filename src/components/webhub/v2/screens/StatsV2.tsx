'use client';

import clsx from 'clsx';
import { useLocale, useTranslations } from 'next-intl';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import type { EChartsCoreOption } from 'echarts/core';
import { fillDays } from '@/lib/stats/fillDays';
import { useGroupStats } from '@/lib/hooks/useGroupStats';
import type { DailyRow, DateRange, GroupAnalytics } from '@/lib/cb/types';
import { barOption, lineOption } from '../charts/theme';
import { EChart } from '../charts/EChart';
import { Shell } from '../Shell';
import { Card, SectionLabel } from '../ui';
import { KPI_GRID, KpiTile, PageIntro, RangeDays, RangePicker, Skeleton, StatsError } from './common';

const DAY_MS = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

// The viewer's local calendar date as YYYY-MM-DD.
function localToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function rangeFor(days: RangeDays, today: string): DateRange {
    const end = Date.parse(`${today}T00:00:00Z`);
    return { start: iso(end - (days - 1) * DAY_MS), end: today };
}

// Re-reads the date on window focus / tab visibility, so a screen left open
// overnight moves to the new day.
function useToday(): string {
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

const compactFrom = 100_000;
function countFormat(locale: string) {
    const plain = new Intl.NumberFormat(locale);
    const compact = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
    return (v: number) => (v >= compactFrom ? compact : plain).format(v);
}

const emptyDay = (day: string): DailyRow => ({
    day, messages: 0, commands: 0, joins: 0, leaves: 0, captcha_issued: 0, captcha_solved: 0,
    active_users: 0, errors: 0, p95_latency_ms: null, llm_tokens: 0, llm_cost_usd: 0,
});

// Charts always sit on a cream Card (phone, Mini App and desktop alike), so
// they use the light tone; the page background behind the cards does not matter.
function ChartCard({ title, delay, children }: { title: string; delay?: 0 | 1 | 2; children: ReactNode }) {
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
function singleSeries(option: EChartsCoreOption, narrow: boolean): EChartsCoreOption {
    const o = option as Record<string, any>;
    return {
        ...o,
        legend: { ...o.legend, show: false },
        grid: { ...o.grid, bottom: 12 },
        yAxis: { ...o.yAxis, axisLabel: { ...o.yAxis.axisLabel, width: narrow ? 72 : 120, overflow: 'truncate' } },
    };
}

function Charts({ data, wide, narrow }: { data: GroupAnalytics; wide: boolean; narrow: boolean }) {
    const t = useTranslations('WebHub.v2.stats');
    const locale = useLocale();
    const { range, daily, commands } = data;

    const model = useMemo(() => {
        const rows = fillDays(daily, range.start, range.end, emptyDay);
        const label = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' });
        const days = rows.map((r) => label.format(Date.parse(`${r.day}T00:00:00Z`)));
        const top = [...commands].sort((a, b) => b.invocations - a.invocations).slice(0, narrow ? 5 : 10);
        return {
            line: lineOption(days, [
                { name: t('series.messages'), data: rows.map((r) => r.messages) },
                { name: t('series.commands'), data: rows.map((r) => r.commands) },
                { name: t('series.activeUsers'), data: rows.map((r) => r.active_users) },
            ], 'light', true),
            joins: barOption(days, [
                { name: t('series.joins'), data: rows.map((r) => r.joins) },
                { name: t('series.leaves'), data: rows.map((r) => r.leaves) },
            ], 'light', false, true),
            commands: singleSeries(barOption(top.map((c) => `/${c.command}`), [
                { name: t('series.invocations'), data: top.map((c) => c.invocations) },
            ], 'light', true, true), narrow),
            topCount: top.length,
        };
    }, [daily, commands, range.start, range.end, locale, t, narrow]);

    return (
        <>
            <ChartCard title={t('chart.daily')}>
                <EChart option={model.line} ariaLabel={t('chart.daily')} height={wide ? 300 : 240} />
            </ChartCard>
            <div className={clsx('grid min-w-0 gap-4', wide && 'lg:grid-cols-2')}>
                <ChartCard title={t('chart.joinsLeaves')} delay={1}>
                    <EChart option={model.joins} ariaLabel={t('chart.joinsLeaves')} height={wide ? 280 : 240} />
                </ChartCard>
                <ChartCard title={t('chart.topCommands')} delay={2}>
                    {model.topCount === 0 ? (
                        <p className="m-0 py-8 text-center text-sm text-cb-muted">{t('empty.commands')}</p>
                    ) : (
                        <EChart option={model.commands} ariaLabel={t('chart.topCommands')}
                            height={Math.max(160, model.topCount * 30 + 56)} />
                    )}
                </ChartCard>
            </div>
        </>
    );
}

function Kpis({ data }: { data: GroupAnalytics }) {
    const t = useTranslations('WebHub.v2.stats');
    const locale = useLocale();
    const { summary: s } = data;
    const n = countFormat(locale);
    const pct = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 });
    const cost = s.llm_cost_usd;
    const usd = new Intl.NumberFormat(locale, {
        style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: cost < 1 ? 4 : 2,
    });
    return (
        <div className={KPI_GRID}>
            <KpiTile label={t('kpi.messages.label')} value={n(s.messages)} hint={t('kpi.messages.hint')} />
            <KpiTile label={t('kpi.commands.label')} value={n(s.commands)} hint={t('kpi.commands.hint')} />
            <KpiTile label={t('kpi.peak.label')} value={n(s.peak_active_users)} hint={t('kpi.peak.hint')} />
            <KpiTile label={t('kpi.joinsLeaves.label')} value={`${n(s.joins)} / ${n(s.leaves)}`} hint={t('kpi.joinsLeaves.hint')} />
            <KpiTile label={t('kpi.captcha.label')} value={s.captcha_solve_rate === null ? t('na') : pct.format(s.captcha_solve_rate)}
                hint={t('kpi.captcha.hint')} />
            <KpiTile label={t('kpi.llmCost.label')} value={usd.format(cost)} hint={t('kpi.llmCost.hint')} />
        </div>
    );
}

// Below Tailwind's `sm` (640px).
function useNarrow(): boolean {
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

const isQuiet = (d: GroupAnalytics) => d.daily.every((r) => !r.messages && !r.commands && !r.joins && !r.leaves);

export default function StatsV2() {
    const t = useTranslations('WebHub.v2.stats');
    const narrow = useNarrow();
    const today = useToday();
    const [days, setDays] = useState<RangeDays>(30);
    const range = useMemo(() => rangeFor(days, today), [days, today]);
    const { data, error, isPending, fetchStatus, refetch } = useGroupStats(range);
    const idle = isPending && fetchStatus === 'idle';

    return (
        <Shell section="stats" title={t('title')}>
            {({ openGroups, wide }) => (
                <>
                    <PageIntro title={t('title')} lead={t('lead')} wide={wide} openGroups={openGroups} />
                    <RangePicker value={days} onChange={setDays} />
                    {error ? <StatsError error={error} onRetry={() => void refetch()} />
                        : idle ? (
                            // No group selected / session not ready (AuthGate normally prevents this).
                            <Card className="flex flex-col items-start gap-3 p-5">
                                <p className="m-0 text-[15px]">{t('selectGroup')}</p>
                                <button type="button" onClick={openGroups}
                                    className="h-11 rounded-cb-md bg-cb-brown-700 px-4 text-sm font-semibold text-cb-cream-50">{t('switchGroup')}</button>
                            </Card>
                        )
                        : isPending ? <Skeleton rows={4} />
                        : data && isQuiet(data) && data.summary.messages === 0 && data.summary.commands === 0 ? (
                            <Card className="p-6 text-center">
                                <p className="m-0 text-[17px] font-semibold">{t('empty.title')}</p>
                                <p className="m-0 mt-1 text-sm text-cb-muted">{t('empty.body')}</p>
                            </Card>
                        ) : data && (
                            <>
                                <Kpis data={data} />
                                <Charts data={data} wide={wide} narrow={narrow} />
                            </>
                        )}
                </>
            )}
        </Shell>
    );
}
