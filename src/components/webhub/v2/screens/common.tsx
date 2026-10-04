'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { ReactNode, useCallback, useId } from 'react';
import { useWebHub } from '../../WebHubProvider';
import { groupName } from '../GroupPicker';
import { GroupChip } from '../Shell';
import { SaveBar, useToast } from '../ui';

export function PageIntro({ title, lead, wide, openGroups, aside }: {
    title: string; lead: string; wide: boolean; openGroups: () => void; aside?: ReactNode;
}) {
    return (
        <>
            <div className={clsx(wide && 'lg:hidden')}><GroupChip onOpen={openGroups} /></div>
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
