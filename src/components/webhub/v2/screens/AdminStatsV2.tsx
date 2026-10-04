'use client';

import clsx from 'clsx';
import { useLocale, useTranslations } from 'next-intl';
import { ReactNode, useMemo, useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { fillDays } from '@/lib/stats/fillDays';
import { useAdminStats } from '@/lib/hooks/useAdminStats';
import type {
    AdminCommandRow, AdminDailyRow, AdminOverview, LlmUsage, TopGroupRow,
} from '@/lib/cb/types';
import { barOption, lineOption } from '../charts/theme';
import { EChart } from '../charts/EChart';
import { useWebHub } from '../../WebHubProvider';
import Link from 'next/link';
import { Icon } from '../icons';
import { Shell } from '../Shell';
import { Card } from '../ui';
import {
    ChartCard, KPI_GRID, KpiTile, PageIntro, RangeDays, RangePicker, Skeleton, StatsError,
    countFormat, rangeFor, singleSeries, useNarrow, useToday, usdFormat,
} from './common';

const emptyDay = (day: string): AdminDailyRow => ({
    day, messages: 0, commands: 0, joins: 0, leaves: 0, captcha_issued: 0, captcha_solved: 0,
    active_users: 0, errors: 0, p95_latency_ms: null, llm_tokens: 0, llm_cost_usd: 0, groups: 0,
});

// Each panel owns its query: its own skeleton and error, so one failing
// read never blanks the page.
function Panel<T>({ query, title, delay, children }: {
    query: UseQueryResult<T>; title: string; delay?: 0 | 1 | 2; children: (data: T) => ReactNode;
}) {
    return (
        <ChartCard title={title} delay={delay}>
            {query.error ? <StatsError error={query.error} onRetry={() => void query.refetch()} />
                : query.data === undefined ? <div className="h-[200px] animate-pulse rounded-cb-md bg-cb-cream-100/60" aria-busy="true" />
                : children(query.data)}
        </ChartCard>
    );
}

const Empty = ({ text }: { text: string }) => <p className="m-0 py-8 text-center text-sm text-cb-muted">{text}</p>;

function Budget({ overview }: { overview: AdminOverview }) {
    const t = useTranslations('WebHub.v2.admin');
    const locale = useLocale();
    const { monthly_llm_budget_usd: budget, spent_usd: spent, remaining_usd: remaining } = overview.budget;
    const money = (v: number) => usdFormat(locale, v).format(v);
    return (
        <KpiTile label={t('kpi.budget.label')}
            value={money(spent)}
            hint={budget === null || remaining === null ? t('kpi.budget.none')
                : `${t('kpi.budget.of', { budget: money(budget) })} · ${t('kpi.budget.remaining', { remaining: money(Math.max(0, remaining)) })}`} />
    );
}

function Kpis({ overview }: { overview: AdminOverview }) {
    const t = useTranslations('WebHub.v2.admin');
    const locale = useLocale();
    const n = countFormat(locale);
    const { reach, totals } = overview;
    return (
        <div className={KPI_GRID}>
            <KpiTile label={t('kpi.groups.label')} value={n(reach.groups)}
                hint={t('kpi.groups.hint', { left: n(reach.groups_left) })} />
            <KpiTile label={t('kpi.members.label')} value={n(reach.members)} hint={t('kpi.members.hint', { admins: n(reach.admins) })} />
            <KpiTile label={t('kpi.messages.label')} value={n(totals.messages)} hint={t('kpi.messages.hint')} />
            <KpiTile label={t('kpi.commands.label')} value={n(totals.commands)} hint={t('kpi.commands.hint')} />
            <KpiTile label={t('kpi.errors.label')} value={n(totals.errors)} hint={t('kpi.errors.hint')} />
            <Budget overview={overview} />
        </div>
    );
}

function DailyChart({ rows, range, wide }: { rows: AdminDailyRow[]; range: { start: string; end: string }; wide: boolean }) {
    const t = useTranslations('WebHub.v2.admin');
    const locale = useLocale();
    const option = useMemo(() => {
        const filled = fillDays(rows, range.start, range.end, emptyDay);
        const label = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' });
        const days = filled.map((r) => label.format(Date.parse(`${r.day}T00:00:00Z`)));
        return lineOption(days, [
            { name: t('series.messages'), data: filled.map((r) => r.messages) },
            { name: t('series.commands'), data: filled.map((r) => r.commands) },
            { name: t('series.activeUsers'), data: filled.map((r) => r.active_users) },
        ], 'light', true);
    }, [rows, range.start, range.end, locale, t]);
    return <EChart option={option} ariaLabel={t('chart.daily')} height={wide ? 300 : 240} />;
}

function TopGroupsChart({ rows, narrow }: { rows: TopGroupRow[]; narrow: boolean }) {
    const t = useTranslations('WebHub.v2.admin');
    const top = useMemo(() => [...rows].sort((a, b) => b.messages - a.messages).slice(0, narrow ? 5 : 10), [rows, narrow]);
    const option = useMemo(() => singleSeries(barOption(
        top.map((g) => g.title ?? (g.username ? `@${g.username}` : String(g.group_id))),
        [{ name: t('series.messages'), data: top.map((g) => g.messages) }], 'light', true, true,
    ), narrow), [top, narrow, t]);
    if (top.length === 0) return <Empty text={t('empty.groups')} />;
    return <EChart option={option} ariaLabel={t('chart.topGroups')} height={Math.max(160, top.length * 30 + 56)} />;
}

function CommandsChart({ rows, narrow }: { rows: AdminCommandRow[]; narrow: boolean }) {
    const t = useTranslations('WebHub.v2.admin');
    const top = useMemo(() => [...rows].sort((a, b) => b.invocations - a.invocations).slice(0, narrow ? 5 : 10), [rows, narrow]);
    const option = useMemo(() => singleSeries(barOption(
        top.map((c) => `/${c.command}`),
        [{ name: t('series.invocations'), data: top.map((c) => c.invocations) }], 'light', true, true,
    ), narrow), [top, narrow, t]);
    if (top.length === 0) return <Empty text={t('empty.commands')} />;
    return <EChart option={option} ariaLabel={t('chart.topCommands')} height={Math.max(160, top.length * 30 + 56)} />;
}

function LlmChart({ llm, narrow }: { llm: LlmUsage; narrow: boolean }) {
    const t = useTranslations('WebHub.v2.admin');
    const locale = useLocale();
    const top = useMemo(() => [...llm.models].sort((a, b) => b.cost_usd - a.cost_usd).slice(0, narrow ? 5 : 10), [llm.models, narrow]);
    const option = useMemo(() => {
        // Cost is a decimal series: no integer ticks.
        const base = singleSeries(barOption(
            top.map((m) => `${m.provider}/${m.model}`),
            [{ name: t('series.cost'), data: top.map((m) => m.cost_usd) }], 'light', true, false,
        ), narrow) as Record<string, any>;
        const max = top.reduce((m, r) => Math.max(m, r.cost_usd), 0);
        const usd = usdFormat(locale, max);
        return {
            ...base,
            tooltip: { ...base.tooltip, valueFormatter: (v: number) => usd.format(v) },
            xAxis: { ...base.xAxis, axisLabel: { ...base.xAxis.axisLabel, formatter: (v: number) => usd.format(v) } },
        };
    }, [top, narrow, locale, t]);
    if (top.length === 0) return <Empty text={t('empty.llm')} />;
    return <EChart option={option} ariaLabel={t('chart.llm')} height={Math.max(160, top.length * 30 + 56)} />;
}

function NotAvailable() {
    const t = useTranslations('WebHub.v2.admin');
    return (
        <Card className="p-6 text-center">
            <p className="m-0 text-[17px] font-semibold">{t('notAvailable.title')}</p>
            <p className="m-0 mt-1 text-sm text-cb-muted">{t('notAvailable.body')}</p>
        </Card>
    );
}

function Body({ wide }: { wide: boolean }) {
    const t = useTranslations('WebHub.v2.admin');
    const narrow = useNarrow();
    const today = useToday();
    const [days, setDays] = useState<RangeDays>(30);
    const range = useMemo(() => rangeFor(days, today), [days, today]);
    const { overview, daily, topGroups, commands, llm } = useAdminStats(range);
    return (
        <>
            <RangePicker value={days} onChange={setDays} />
            {overview.error ? <StatsError error={overview.error} onRetry={() => void overview.refetch()} />
                : overview.data ? <Kpis overview={overview.data} /> : <Skeleton rows={1} />}
            <Panel query={daily} title={t('chart.daily')}>
                {(rows) => <DailyChart rows={rows} range={range} wide={wide} />}
            </Panel>
            <div className={clsx('grid min-w-0 gap-4', wide && 'lg:grid-cols-2')}>
                <Panel query={topGroups} title={t('chart.topGroups')} delay={1}>
                    {(rows) => <TopGroupsChart rows={rows} narrow={narrow} />}
                </Panel>
                <Panel query={commands} title={t('chart.topCommands')} delay={2}>
                    {(rows) => <CommandsChart rows={rows} narrow={narrow} />}
                </Panel>
            </div>
            <Panel query={llm} title={t('chart.llm')}>
                {(data) => <LlmChart llm={data} narrow={narrow} />}
            </Panel>
        </>
    );
}

export default function AdminStatsV2() {
    const t = useTranslations('WebHub.v2.admin');
    const tn = useTranslations('WebHub.v2.nav');
    const { me } = useWebHub();
    return (
        <Shell section="admin" title={t('title')} groupScoped={false}>
            {({ openGroups, wide }) => (
                <>
                    <PageIntro title={t('title')} lead={t('lead')} wide={wide} openGroups={openGroups} groupScoped={false} />
                    {me?.is_bot_admin && (
                        <Link href="/dashboard/admin/audit"
                            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full bg-cb-brown-900 px-5 text-[15px] font-semibold text-cb-cream-50 no-underline transition-transform active:scale-[0.97]">
                            {tn('adminAudit')}<Icon name="chevronRight" className="size-4" />
                        </Link>
                    )}
                    {me?.is_bot_admin ? <Body wide={wide} /> : <NotAvailable />}
                </>
            )}
        </Shell>
    );
}
