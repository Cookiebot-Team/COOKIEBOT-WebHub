'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { AdministeredGroup } from '@/lib/cb/repository';
import { useWebHub } from '../WebHubProvider';
import { Icon } from './icons';
import { GroupAvatar, fieldClass, useToast } from './ui';

export const groupName = (g: AdministeredGroup) => g.title ?? (g.username ? `@${g.username}` : String(g.group_id));

const roleKey = (role: string) => (role === 'creator' ? 'creator' : 'admin');

// The list both pickers share: search, groups, "add to another group".
function GroupList({ onPicked }: { onPicked: () => void }) {
    const t = useTranslations('WebHub.v2');
    const { me, groupId, setGroupId } = useWebHub();
    const toast = useToast();
    const [query, setQuery] = useState('');
    const input = useRef<HTMLInputElement>(null);
    const groups = me?.groups ?? [];
    const q = query.trim().toLowerCase();
    const shown = groups.filter((g) => !q || groupName(g).toLowerCase().includes(q));

    useEffect(() => { input.current?.focus({ preventScroll: true }); }, []);

    return (
        <>
            {groups.length > 4 && (
                <label className="relative block">
                    <span className="absolute left-3 top-3 text-cb-brown-500"><Icon name="search" className="size-5" /></span>
                    <input ref={input} type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                        aria-label={t('searchGroups')} placeholder={t('searchGroups')}
                        className={clsx(fieldClass, 'h-11 pl-10')} />
                </label>
            )}
            <div role="listbox" aria-label={t('chooseGroup')} className="flex max-h-[min(52vh,320px)] flex-col gap-1.5 overflow-y-auto">
                {shown.map((g) => {
                    const selected = g.group_id === groupId;
                    return (
                        <button key={g.group_id} type="button" role="option" aria-selected={selected}
                            onClick={() => {
                                if (!selected) {
                                    setGroupId(g.group_id);
                                    toast(t('nowManaging', { group: groupName(g) }));
                                }
                                onPicked();
                            }}
                            className={clsx(
                                'flex items-center gap-3 rounded-cb-lg border p-2.5 text-left transition-colors',
                                selected ? 'border-cb-brown-700 bg-cb-cream-100' : 'border-cb-brown-700/15 bg-white hover:bg-cb-cream-50',
                            )}>
                            <GroupAvatar id={g.group_id} name={groupName(g)} />
                            <span className="flex min-w-0 grow flex-col">
                                <span className="truncate text-base font-semibold">{groupName(g)}</span>
                                <span className="text-[13px] text-cb-muted">{t(roleKey(g.role))}</span>
                            </span>
                            {selected && <Icon name="check" className="size-[22px] text-cb-brown-700" />}
                        </button>
                    );
                })}
                {shown.length === 0 && <p className="my-2 text-center text-sm text-cb-muted">{t('noMatch', { query })}</p>}
            </div>
            <a href="https://t.me/CookieMWbot?startgroup=new" target="_blank" rel="noreferrer"
                className="flex min-h-11 items-center justify-center gap-2 rounded-cb-md border border-dashed border-cb-sand text-[15px] font-semibold text-cb-brown-700 no-underline hover:bg-cb-cream-100/60">
                <Icon name="add" className="size-[18px]" />{t('addAnother')}
            </a>
        </>
    );
}

export function GroupSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
    const t = useTranslations('WebHub.v2');
    const { me } = useWebHub();
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    if (!open) return null;

    return (
        <div className="webhub fixed inset-0 z-50 font-jost text-cb-brown-900">
            <button type="button" aria-label={t('close')} onClick={onClose} className="absolute inset-0 animate-cb-fade bg-[rgba(20,12,0,0.48)]" />
            <div role="dialog" aria-modal="true" aria-label={t('chooseGroup')}
                className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[80%] max-w-[480px] animate-cb-sheet flex-col gap-3 rounded-t-cb-2xl bg-cb-cream-50 px-4 pb-6 pt-2.5 shadow-cb-sheet">
                <span className="h-[5px] w-10 self-center rounded-full bg-cb-cream-200" />
                <div className="flex items-baseline justify-between">
                    <h2 className="m-0 text-xl font-bold">{t('chooseGroup')}</h2>
                    <span className="text-[13px] text-cb-brown-500">{t('groupsYouAdmin', { count: me?.groups.length ?? 0 })}</span>
                </div>
                <GroupList onPicked={onClose} />
            </div>
        </div>
    );
}

export function GroupPopover({ onClose }: { onClose: () => void }) {
    return (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 flex w-80 origin-top-left animate-cb-pop flex-col gap-2.5 rounded-cb-lg bg-cb-cream-50 p-3 text-cb-brown-900 shadow-cb-float">
            <GroupList onPicked={onClose} />
        </div>
    );
}
