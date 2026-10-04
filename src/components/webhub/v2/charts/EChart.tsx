'use client';

import clsx from 'clsx';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import { ReactNode, useEffect, useRef, useState } from 'react';

// echarts is imported inside the effect: never evaluated at module load
// (static export / SSR safe) and split into its own chunk, so only screens
// that render a chart pay for it.
async function loadEcharts() {
    const [core, charts, components, renderers] = await Promise.all([
        import('echarts/core'),
        import('echarts/charts'),
        import('echarts/components'),
        import('echarts/renderers'),
    ]);
    core.use([
        charts.LineChart, charts.BarChart, charts.PieChart,
        components.GridComponent, components.TooltipComponent, components.LegendComponent, components.DatasetComponent,
        renderers.CanvasRenderer,
    ]);
    return core;
}

/**
 * Lazy ECharts canvas. Memoize `option` (useMemo): every new identity
 * triggers a setOption. Updates use `replaceMerge: ['series']` rather than
 * `notMerge`, so series are replaced wholesale (no stale series) while the
 * user's legend selection and other component state survive data refreshes.
 */
export function EChart({ option, height = 260, className, ariaLabel, fallback = 'Chart unavailable' }: {
    option: EChartsCoreOption; height?: number; className?: string; ariaLabel: string; fallback?: ReactNode;
}) {
    const box = useRef<HTMLDivElement>(null);
    const chart = useRef<EChartsType | null>(null);
    const latest = useRef(option);
    latest.current = option;
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const el = box.current;
        if (!el) return;
        let dead = false;
        let observer: ResizeObserver | undefined;
        const fail = (e: unknown) => {
            console.error('EChart failed', e);
            if (!dead) setFailed(true);
        };
        loadEcharts().then((echarts) => {
            if (dead) return;
            // Init needs a non-zero box (hidden tabs, collapsed layouts):
            // defer to the first observer callback that has a size.
            const start = () => {
                if (chart.current || el.clientWidth === 0 || el.clientHeight === 0) return;
                try {
                    const instance = echarts.init(el);
                    instance.setOption(latest.current, { replaceMerge: ['series'] });
                    chart.current = instance;
                } catch (e) {
                    fail(e);
                }
            };
            try {
                observer = new ResizeObserver(() => {
                    if (chart.current) chart.current.resize();
                    else start();
                });
                observer.observe(el);
                start();
            } catch (e) {
                fail(e);
            }
        }).catch(fail);
        return () => {
            dead = true;
            observer?.disconnect();
            chart.current?.dispose();
            chart.current = null;
        };
    }, []);

    useEffect(() => {
        try {
            chart.current?.setOption(option, { replaceMerge: ['series'] });
        } catch (e) {
            console.error('EChart setOption failed', e);
        }
    }, [option]);

    if (failed) {
        return <div role="img" aria-label={ariaLabel} style={{ height }}
            className={clsx('flex w-full min-w-0 items-center justify-center text-sm text-cb-muted', className)}>{fallback}</div>;
    }
    return <div ref={box} role="img" aria-label={ariaLabel} style={{ height }} className={clsx('w-full min-w-0', className)} />;
}
