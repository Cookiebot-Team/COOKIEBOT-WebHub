// TESTID-04: stats and audit building blocks (spec AC5, AC9, AC10).
import { beforeAll, describe, expect, mock, test } from 'bun:test';
import type { ComponentProps, ComponentType } from 'react';
import { CbError } from '@/lib/cb/client';
import type { AuditRow } from '../audit/AuditList';
import { attr, find, findAll, render, text } from './render';

mock.module('../../WebHubProvider', () => ({ useWebHub: () => ({ logout: async () => {}, me: null, groupId: null }) }));

let common: typeof import('../screens/common');
let AuditFilters: ComponentType<ComponentProps<typeof import('../audit/AuditFilters').AuditFilters>>;
let AuditList: ComponentType<{ events: AuditRow[]; showGroup?: boolean }>;
let AuditPager: ComponentType<ComponentProps<typeof import('../audit/AuditPager').AuditPager>>;
beforeAll(async () => {
    common = await import('../screens/common');
    ({ AuditFilters } = await import('../audit/AuditFilters'));
    ({ AuditList } = await import('../audit/AuditList'));
    ({ AuditPager } = await import('../audit/AuditPager'));
});
const noop = () => {};

describe('range picker, KPI tiles, chart cards (AC9)', () => {
    test('range-picker with one range-<days> radio per option', () => {
        const html = render(<common.RangePicker value={30} onChange={noop} />);
        expect(attr(find(html, 'range-picker'), 'role')).toBe('radiogroup');
        expect(attr(find(html, 'range-7'), 'aria-checked')).toBe('false');
        expect(attr(find(html, 'range-30'), 'aria-checked')).toBe('true');
        expect(attr(find(html, 'range-90'), 'aria-checked')).toBe('false');
    });

    test('kpi-<name> on the tile, with its value inside', () => {
        const tile = find(render(<common.KpiTile label="Messages" value="1,234" testId="messages" />), 'kpi-messages');
        expect(text(tile)).toContain('1,234');
    });

    test('chart-<name> on the chart card', () => {
        const card = find(render(<common.ChartCard title="Daily" testId="daily"><p>x</p></common.ChartCard>), 'chart-daily');
        expect(card.tag).toBe('section');
    });
});

describe('stats error card (AC5)', () => {
    test('500 offers retry', () => {
        const html = render(<common.StatsError error={new CbError(500, 'x')} onRetry={noop} />);
        expect(attr(find(html, 'stats-error'), 'role')).toBe('alert');
        expect(findAll(html, 'stats-error-retry')).toHaveLength(1);
        expect(findAll(html, 'stats-error-signout')).toHaveLength(0);
    });

    test('403 offers sign out', () => {
        const html = render(<common.StatsError error={new CbError(403, 'x')} onRetry={noop} />);
        expect(findAll(html, 'stats-error-signout')).toHaveLength(1);
        expect(findAll(html, 'stats-error-retry')).toHaveLength(0);
    });
});

describe('audit (AC10)', () => {
    test('filters: container, every field, apply, reset', () => {
        const html = render(<AuditFilters onApply={noop} showGroup />);
        expect(find(html, 'audit-filters').tag).toBe('form');
        expect(find(html, 'audit-filters-toggle').tag).toBe('button');
        expect(find(html, 'audit-filter-action').tag).toBe('select');
        expect(find(html, 'audit-filter-surface').tag).toBe('select');
        for (const f of ['actor', 'group', 'from', 'to']) expect(find(html, `audit-filter-${f}`).tag).toBe('input');
        expect(attr(find(html, 'audit-filter-apply'), 'type')).toBe('submit');
        expect(attr(find(html, 'audit-filter-reset'), 'type')).toBe('button');
    });

    test('group filter only on the fleet log', () => {
        expect(findAll(render(<AuditFilters onApply={noop} />), 'audit-filter-group')).toHaveLength(0);
    });

    test('list, one row per event id, diff toggle only when there is a diff', () => {
        const base = { ts: '2026-10-01T12:00:00Z', action: 'config.update', surface: 'webhub', actor_user_id: 1, actor_kind: 'admin', summary: null, trace_id: null };
        const html = render(<AuditList events={[
            { ...base, id: '0190-a', before: { sfw: true }, after: { sfw: false } },
            { ...base, id: '0190-b', before: null, after: null },
        ]} />);
        expect(find(html, 'audit-list').tag).toBe('ul');
        expect(find(html, 'audit-row-0190-a').tag).toBe('li');
        expect(find(html, 'audit-row-0190-b').tag).toBe('li');
        expect(findAll(html, 'audit-row-diff-toggle')).toHaveLength(1);
    });

    test('pager: newer, page, older with disabled state', () => {
        const html = render(<AuditPager page={2} hasNewer hasOlder={false} onNewer={noop} onOlder={noop} />);
        expect(attr(find(html, 'audit-pager-newer'), 'disabled')).toBeNull();
        expect(attr(find(html, 'audit-pager-older'), 'disabled')).toBe('');
        expect(text(find(html, 'audit-pager-page'))).toContain('2');
    });
});
