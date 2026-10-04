'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { FormEvent, useId, useState } from 'react';
import { AUDIT_ACTIONS, AUDIT_SURFACES, type AuditAction, type AuditFilters as Filters, type AuditSurface } from '@/lib/cb/types';
import { Card, fieldClass } from '../ui';

type Draft = { action: string; surface: string; actor: string; group: string; from: string; to: string };
const EMPTY: Draft = { action: '', surface: '', actor: '', group: '', from: '', to: '' };

const dayStart = (ymd: string, plusDays = 0) => {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d + plusDays).toISOString();
};
const asId = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : null);

/** Draft -> API filters (since = local start of "from", until = start of the day after "to"), or an error key. */
function build(d: Draft, showGroup: boolean): { filters: Filters } | { error: 'range' | 'actor' | 'group' } {
    if (d.from && d.to && d.from > d.to) return { error: 'range' };
    const f: Filters = {};
    if (d.action) f.action = d.action as AuditAction;
    if (d.surface) f.surface = d.surface as AuditSurface;
    if (d.actor.trim()) {
        const id = asId(d.actor);
        if (id === null) return { error: 'actor' };
        f.actor_user_id = id;
    }
    if (showGroup && d.group.trim()) {
        const id = Number(d.group.trim());
        if (!/^-?\d+$/.test(d.group.trim()) || !Number.isSafeInteger(id)) return { error: 'group' };
        f.group_id = id;
    }
    if (d.from) f.since = dayStart(d.from);
    if (d.to) f.until = dayStart(d.to, 1);
    return { filters: f };
}

// Everything applies on submit (Apply / Reset), so one rule covers selects,
// text and dates. `showGroup` adds the fleet-only group id field.
export function AuditFilters({ onApply, showGroup = false, busy }: {
    onApply: (filters: Filters) => void; showGroup?: boolean; busy?: boolean;
}) {
    const t = useTranslations('WebHub.v2.audit');
    const id = useId();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<Draft>(EMPTY);
    const [error, setError] = useState<'range' | 'actor' | 'group' | null>(null);
    const set = (k: keyof Draft) => (v: string) => setDraft((d) => ({ ...d, [k]: v }));
    const panelId = `${id}-panel`;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const r = build(draft, showGroup);
        if ('error' in r) { setError(r.error); return; }
        setError(null);
        onApply(r.filters);
    };
    const reset = () => { setDraft(EMPTY); setError(null); onApply({}); };

    const fid = (key: keyof Draft) => `${id}-${key}`;
    const cls = clsx(fieldClass, 'h-11');
    const field = (key: keyof Draft, label: string, input: JSX.Element) => (
        <div className="flex min-w-0 flex-col gap-1">
            <label htmlFor={fid(key)} className="text-xs font-semibold text-cb-muted">{label}</label>
            {input}
        </div>
    );
    const select = (key: 'action' | 'surface', values: readonly string[], group: 'actions' | 'surfaces') => (
        <select id={fid(key)} className={cls} value={draft[key]} onChange={(e) => set(key)(e.target.value)}>
            <option value="">{t('any')}</option>
            {values.map((v) => <option key={v} value={v}>{t(`${group}.${v.replace(/\./g, "_")}`)}</option>)}
        </select>
    );
    const text = (key: keyof Draft, type = 'text', mode?: 'numeric') => (
        <input id={fid(key)} className={cls} type={type} inputMode={mode} value={draft[key]} onChange={(e) => set(key)(e.target.value)} />
    );

    return (
        <Card className="p-3.5">
            <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}
                className="flex h-11 w-full items-center justify-between text-left text-[15px] font-semibold sm:hidden">
                {t('filters.toggle')}
                <span aria-hidden>{open ? '−' : '+'}</span>
            </button>
            <form id={panelId} onSubmit={submit} noValidate className={clsx('flex-col gap-3 sm:flex', open ? 'mt-2 flex' : 'hidden')}>
                <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {field('action', t('filters.action'), select('action', AUDIT_ACTIONS, 'actions'))}
                    {field('surface', t('filters.surface'), select('surface', AUDIT_SURFACES, 'surfaces'))}
                    {field('actor', t('filters.actor'), text('actor', 'text', 'numeric'))}
                    {showGroup && field('group', t('filters.group'), text('group', 'text', 'numeric'))}
                    {field('from', t('filters.from'), text('from', 'date'))}
                    {field('to', t('filters.to'), text('to', 'date'))}
                </div>
                {error && <p role="alert" className="m-0 text-sm text-red-700">{t(`filters.error.${error}`)}</p>}
                <div className="flex gap-2">
                    <button type="submit" disabled={busy}
                        className="h-11 rounded-cb-md bg-cb-brown-700 px-5 text-sm font-semibold text-cb-cream-50 disabled:opacity-60">{t('filters.apply')}</button>
                    <button type="button" onClick={reset}
                        className="h-11 rounded-cb-md border border-cb-line bg-white px-5 text-sm font-semibold text-cb-brown-900">{t('filters.reset')}</button>
                </div>
            </form>
        </Card>
    );
}
