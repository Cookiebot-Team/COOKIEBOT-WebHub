'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { AUDIT_ACTIONS, AUDIT_SURFACES, type AdminAuditEvent, type AuditEvent } from '@/lib/cb/types';
import { Card } from '../ui';

export type AuditRow = AuditEvent & Partial<Pick<AdminAuditEvent, 'group_id' | 'group_title'>>;

// Unknown values (newer backend) render raw.
const KNOWN = { actions: AUDIT_ACTIONS, surfaces: AUDIT_SURFACES, actorKinds: ['admin', 'user', 'anonymous_admin', 'system'] } as const;

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000], ['month', 2_592_000], ['day', 86_400], ['hour', 3_600], ['minute', 60],
];
function relative(ts: string, locale: string): string {
    const secs = Math.round((Date.parse(ts) - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    for (const [unit, size] of UNITS) if (Math.abs(secs) >= size) return rtf.format(Math.round(secs / size), unit);
    return rtf.format(secs, 'second');
}

const show = (v: unknown, none: string) => (v === undefined ? none : typeof v === 'string' ? v : JSON.stringify(v));

function Diff({ before, after }: { before: AuditEvent['before']; after: AuditEvent['after'] }) {
    const t = useTranslations('WebHub.v2.audit.diff');
    const keys = Object.keys({ ...before, ...after })
        .filter((k) => JSON.stringify(before?.[k]) !== JSON.stringify(after?.[k]));
    if (keys.length === 0) return <p className="m-0 text-sm text-cb-muted">{t('none')}</p>;
    return (
        <dl className="m-0 flex flex-col gap-2">
            {keys.map((k) => (
                <div key={k} className="min-w-0">
                    <dt className="break-all font-mono text-xs font-semibold">{k}</dt>
                    <dd className="m-0 break-all text-sm text-cb-muted">
                        <span>{show(before?.[k], t('empty'))}</span>
                        <span aria-label={t('to')}> → </span>
                        <span className="text-black">{show(after?.[k], t('empty'))}</span>
                    </dd>
                </div>
            ))}
        </dl>
    );
}

function Row({ e, showGroup }: { e: AuditRow; showGroup: boolean }) {
    const t = useTranslations('WebHub.v2.audit');
    const locale = useLocale();
    const [open, setOpen] = useState(false);
    const panel = useId();
    const label = (group: 'actions' | 'surfaces' | 'actorKinds', v: string) =>
        (KNOWN[group] as readonly string[]).includes(v) ? t(`${group}.${v}`) : v;
    const abs = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium' }).format(Date.parse(e.ts));
    const hasDiff = e.before !== null || e.after !== null;
    const actor = e.actor_user_id === null ? t('actor.none') : t('actor.user', { id: e.actor_user_id });

    return (
        <li>
            <Card className="flex min-w-0 flex-col gap-2 p-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="m-0 min-w-0 break-words text-[15px] font-semibold">{label('actions', e.action)}</p>
                    <time dateTime={e.ts} title={abs} className="text-xs text-cb-muted">{relative(e.ts, locale)}</time>
                </div>
                <p className="m-0 text-xs text-cb-muted">{abs}</p>
                {e.summary && <p title={e.summary} className="m-0 line-clamp-3 break-words text-sm">{e.summary}</p>}
                <p className="m-0 flex flex-wrap gap-x-2 text-xs text-cb-muted">
                    <span>{label('surfaces', e.surface)}</span>
                    <span aria-hidden>·</span>
                    <span>{actor} ({label('actorKinds', e.actor_kind)})</span>
                    {showGroup && e.group_id !== undefined && (
                        <>
                            <span aria-hidden>·</span>
                            <span className="min-w-0 break-words">{t('group', { name: e.group_title ?? String(e.group_id) })}</span>
                        </>
                    )}
                </p>
                {hasDiff && (
                    <>
                        <button type="button" aria-expanded={open} aria-controls={panel} onClick={() => setOpen((o) => !o)}
                            className="h-11 self-start rounded-cb-md border border-cb-line bg-white px-4 text-sm font-semibold text-cb-brown-900">
                            {open ? t('diff.hide') : t('diff.show')}
                        </button>
                        <div id={panel} hidden={!open}>{open && <Diff before={e.before} after={e.after} />}</div>
                    </>
                )}
            </Card>
        </li>
    );
}

export function AuditList({ events, showGroup = false }: { events: AuditRow[]; showGroup?: boolean }) {
    return (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {events.map((e) => <Row key={e.id} e={e} showGroup={showGroup} />)}
        </ul>
    );
}
