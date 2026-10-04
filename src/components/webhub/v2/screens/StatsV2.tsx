'use client';

import clsx from 'clsx';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { fillDays } from '@/lib/stats/fillDays';
import { useGroupStats } from '@/lib/hooks/useGroupStats';
import type { DailyRow, DateRange, GroupAnalytics } from '@/lib/cb/types';
import { barOption, lineOption } from '../charts/theme';
import { EChart } from '../charts/EChart';
import { Shell } from '../Shell';
import { Card } from '../ui';
import {
    ChartCard, KPI_GRID, KpiTile, PageIntro, RangeDays, RangePicker, Skeleton, StatsError,
    countFormat, rangeFor, singleSeries, useNarrow, useToday,
} from './common';

const emptyDay = (day: string): DailyRow => ({
    day, messages: 0, commands: 0, joins: 0, leaves: 0, captcha_issued: 0, captcha_solved: 0,
    active_users: 0, errors: 0, p95_latency_ms: null, llm_tokens: 0, llm_cost_usd: 0,
});

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
