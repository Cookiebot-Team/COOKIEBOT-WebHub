import type { EChartsCoreOption } from 'echarts/core';
import { colors } from '@/lib/design/tokens';

// Type-only imports above: nothing from echarts is evaluated here, so the
// library stays in the lazily loaded EChart chunk.

export type ChartTone = 'light' | 'dark';

export const SERIES = [
    colors['brown-700'], colors['brown-500'], colors.telegram, colors.success,
    colors.warning, colors['slate-900'], colors.sand, colors.danger,
];

const TONES = {
    light: { text: colors.muted, strong: colors.ink, grid: colors['cream-200'], tipBg: colors['cream-50'], tipBorder: colors.line },
    dark: { text: colors['cream-200'], strong: colors['cream-50'], grid: 'rgba(255,233,201,0.16)', tipBg: colors['slate-900'], tipBorder: 'rgba(255,233,201,0.24)' },
} as const;

export function chartBase(tone: ChartTone = 'light'): EChartsCoreOption {
    const c = TONES[tone];
    return {
        color: SERIES,
        backgroundColor: 'transparent',
        textStyle: { fontFamily: 'inherit', color: c.text },
        grid: { left: 8, right: 12, top: 16, bottom: 36, containLabel: true },
        legend: { bottom: 0, type: 'scroll', textStyle: { color: c.text }, pageTextStyle: { color: c.text } },
        tooltip: {
            // confine keeps it inside the chart box, away from the global
            // h*/button rules; the formatter output is plain div/span only.
            confine: true,
            appendToBody: false,
            backgroundColor: c.tipBg,
            borderColor: c.tipBorder,
            textStyle: { color: c.strong, fontSize: 13, fontWeight: 400, lineHeight: 18 },
            extraCssText: 'line-height:18px;box-shadow:0 8px 24px rgba(58,38,1,.18);',
        },
    };
}

const axisLabel = (c: (typeof TONES)[ChartTone]) => ({ color: c.text, hideOverlap: true });
const valueAxis = (c: (typeof TONES)[ChartTone], integer = false) => ({
    type: 'value' as const, ...(integer ? { minInterval: 1 } : {}), axisLabel: axisLabel(c),
    splitLine: { lineStyle: { color: c.grid } },
});

// `integer`: opt in for count series (whole-number ticks); leave off for
// cost/decimal charts.
export interface CartesianSeries { name: string; data: number[] }

export function lineOption(days: string[], series: CartesianSeries[], tone: ChartTone = 'light', integer = false): EChartsCoreOption {
    const c = TONES[tone];
    const base = chartBase(tone) as Record<string, unknown>;
    return {
        ...base,
        tooltip: { ...(base.tooltip as object), trigger: 'axis' },
        xAxis: { type: 'category', data: days, boundaryGap: false, axisLabel: axisLabel(c), axisLine: { lineStyle: { color: c.grid } } },
        yAxis: valueAxis(c, integer),
        series: series.map((s) => ({ ...s, type: 'line', showSymbol: days.length <= 31, smooth: false })),
    };
}

export function barOption(categories: string[], series: CartesianSeries[], tone: ChartTone = 'light', horizontal = false, integer = false): EChartsCoreOption {
    const c = TONES[tone];
    const base = chartBase(tone) as Record<string, unknown>;
    const cat = { type: 'category' as const, data: categories, axisLabel: axisLabel(c), axisLine: { lineStyle: { color: c.grid } } };
    return {
        ...base,
        tooltip: { ...(base.tooltip as object), trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: horizontal ? valueAxis(c, integer) : cat,
        yAxis: horizontal ? { ...cat, inverse: true } : valueAxis(c, integer),
        series: series.map((s) => ({ ...s, type: 'bar', barMaxWidth: 28 })),
    };
}

export function pieOption(items: { name: string; value: number }[], tone: ChartTone = 'light'): EChartsCoreOption {
    const c = TONES[tone];
    const { grid: _g, ...base } = chartBase(tone) as Record<string, unknown>;
    return {
        ...base,
        tooltip: { ...(base.tooltip as object), trigger: 'item' },
        series: [{
            type: 'pie', radius: ['45%', '70%'], center: ['50%', '45%'], data: items,
            label: { color: c.text, hideOverlap: true }, avoidLabelOverlap: true,
            itemStyle: { borderColor: tone === 'dark' ? colors['slate-900'] : colors['cream-50'], borderWidth: 2 },
        }],
    };
}
