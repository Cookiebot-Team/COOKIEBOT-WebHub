'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { AuthGate } from '../AuthGate';
import { EnvSelector } from '../ui';
import { LANGUAGES, useLocaleSwitch, usePopover } from '../shared';
import { useWebHub } from '../WebHubProvider';
import { GroupPopover, GroupSheet, groupName } from './GroupPicker';
import { Icon, IconName } from './icons';
import { GroupAvatar } from './ui';

export type Section = 'overview' | 'general' | 'moderation' | 'posts' | 'events' | 'stats' | 'audit' | 'admin';

const NAV: { section: Section; href: string; icon: IconName; soon?: boolean }[] = [
    { section: 'overview', href: '/dashboard', icon: 'home' },
    { section: 'general', href: '/dashboard/general', icon: 'settings' },
    { section: 'moderation', href: '/dashboard/moderation', icon: 'shield' },
    { section: 'posts', href: '/dashboard/posts', icon: 'photo' },
    { section: 'events', href: '/dashboard/events', icon: 'calendar', soon: true },
];

export const COMMUNITY: { key: 'publications' | 'testGroup' | 'privacy'; href: string; icon: IconName }[] = [
    { key: 'publications', href: 'https://t.me/CookiebotPostmail', icon: 'star' },
    { key: 'testGroup', href: 'https://t.me/+mX6W3tGXPew2OTIx', icon: 'account' },
    { key: 'privacy', href: '/privacy', icon: 'error' },
];

function LanguageButton({ compact }: { compact?: boolean }) {
    const t = useTranslations('WebHub.language');
    const { locale, pending, change } = useLocaleSwitch();
    const { open, setOpen, ref } = usePopover();
    const current = LANGUAGES.find((l) => l.value === locale);

    return (
        <div ref={ref} className="relative">
            <button type="button" aria-label={t('title')} aria-expanded={open} onClick={() => setOpen(!open)}
                className={clsx(
                    'flex h-10 items-center gap-2 rounded-cb-md border border-cb-brown-700/25 bg-cb-cream-100 text-sm text-cb-brown-900 transition-transform active:scale-[0.97]',
                    compact ? 'w-10 justify-center' : 'px-3',
                )}>
                <Icon name="language" className="size-[18px]" />
                {!compact && current?.label}
            </button>
            {open && (
                <div role="radiogroup" aria-label={t('title')}
                    className="absolute right-0 top-12 z-40 w-56 origin-top-right animate-cb-pop overflow-hidden rounded-cb-lg border border-cb-brown-700/10 bg-cb-cream-50 shadow-cb-float">
                    <p className="m-0 px-4 pb-1.5 pt-3 text-xs font-semibold uppercase tracking-[0.06em] text-cb-brown-500">{t('title')}</p>
                    {LANGUAGES.map((option) => {
                        const active = option.value === locale;
                        return (
                            <button key={option.value} type="button" role="radio" aria-checked={active} disabled={pending}
                                onClick={() => change(option.value, () => setOpen(false))}
                                className="flex h-11 w-full items-center justify-between px-4 text-left text-base hover:bg-cb-cream-100/60">
                                {option.label}
                                <span className={clsx('rounded-full', active
                                    ? 'size-2.5 bg-cb-brown-700 shadow-[0_0_0_3px_#FFE9C9,0_0_0_5px_#5E410D]'
                                    : 'size-3.5 shadow-[inset_0_0_0_2px_#B49A6A]')} />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function Sidebar({ section }: { section: Section }) {
    const t = useTranslations('WebHub');
    const { me, groupId, logout } = useWebHub();
    const { open, setOpen, ref } = usePopover();
    const group = me?.groups.find((g) => g.group_id === groupId);

    return (
        <aside className="flex flex-col gap-5 bg-[linear-gradient(rgba(42,27,1,.93),rgba(42,27,1,.93)),url('/bg1.jpg')] bg-cover bg-center px-4 py-[22px] text-cb-cream-100 lg:sticky lg:top-0 lg:h-dvh">
            <div className="flex items-center gap-3 px-1.5">
                <img src="/cookiebot_avatar.jpeg" alt="" className="size-10 rounded-full object-cover shadow-[0_0_0_2px_#FFE9C9]" />
                <div className="flex flex-col leading-tight">
                    <span className="text-[19px] font-bold text-cb-cream-50">Cookiebot</span>
                    <span className="text-[13px] text-cb-cream-100/70">WebHub</span>
                </div>
            </div>

            {group && (
                <div ref={ref} className="relative">
                    <button type="button" onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open}
                        className="flex w-full items-center gap-3 rounded-cb-lg border border-cb-cream-100/20 bg-cb-cream-100/10 px-3 py-2.5 text-left text-cb-cream-50 transition-[filter] hover:brightness-110">
                        <GroupAvatar id={group.group_id} name={groupName(group)} />
                        <span className="flex min-w-0 grow flex-col">
                            <span className="text-[11px] uppercase tracking-[0.08em] text-cb-cream-100/65">{t('v2.managing')}</span>
                            <span className="truncate text-base font-semibold">{groupName(group)}</span>
                        </span>
                        <Icon name="chevronUpDown" className="size-[18px]" />
                    </button>
                    {open && <GroupPopover onClose={() => setOpen(false)} />}
                </div>
            )}

            <nav aria-label={t('v2.sections')} className="flex flex-col gap-1">
                {NAV.map((item) => {
                    const active = item.section === section;
                    return (
                        <Link key={item.section} href={item.href} aria-current={active ? 'page' : undefined}
                            className={clsx(
                                'flex h-11 items-center gap-3 rounded-cb-md px-3 text-[15px] font-medium no-underline transition-colors',
                                active ? 'bg-cb-cream-100 text-cb-brown-900' : 'text-cb-cream-100/90 hover:bg-cb-cream-100/10',
                            )}>
                            <Icon name={item.icon} className="size-5" />
                            <span className="grow">{t(`v2.nav.${item.section}`)}</span>
                            {item.soon && (
                                <span className={clsx('rounded-full px-[7px] py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]',
                                    active ? 'bg-cb-brown-900/10' : 'bg-cb-cream-100/15')}>{t('v2.soon')}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="grow" />

            <div className="flex flex-col gap-0.5">
                <p className="m-0 mb-1.5 px-3 text-[11px] uppercase tracking-[0.08em] text-cb-cream-100/55">{t('v2.community')}</p>
                {COMMUNITY.map((link) => (
                    <a key={link.key} href={link.href} {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="flex h-9 items-center rounded-cb-sm px-3 text-sm text-cb-cream-100/85 no-underline hover:bg-cb-cream-100/10">
                        {t(`v2.links.${link.key}`)}
                    </a>
                ))}
            </div>

            <div className="flex items-center gap-2.5 rounded-cb-lg bg-cb-cream-100/10 p-3">
                <Icon name="account" className="size-[30px] text-cb-cream-100" />
                <span className="flex grow flex-col leading-tight">
                    <span className="text-sm font-semibold text-cb-cream-50">ID {me?.user_id}</span>
                    <span className="text-xs text-cb-cream-100/65">{t('v2.signedIn')}</span>
                </span>
                <button type="button" onClick={logout} aria-label={t('v2.signOut')}
                    className="grid size-9 place-items-center rounded-cb-sm text-cb-cream-100 hover:bg-cb-cream-100/10">
                    <Icon name="logout" className="size-[18px]" />
                </button>
            </div>
        </aside>
    );
}

export function GroupChip({ onOpen }: { onOpen: () => void }) {
    const { me, groupId } = useWebHub();
    const group = me?.groups.find((g) => g.group_id === groupId);
    if (!group) return null;
    return (
        <button type="button" onClick={onOpen}
            className="flex h-8 items-center gap-2 self-start rounded-full bg-cb-cream-100/95 pl-1.5 pr-3 text-sm font-medium text-cb-brown-900 transition-transform active:scale-[0.97]">
            <GroupAvatar id={group.group_id} name={groupName(group)} size="sm" />
            {groupName(group)}
            <Icon name="chevronDown" className="size-4" />
        </button>
    );
}

// The frame every v2 screen sits in. `wide` is the desktop layout; the Mini
// App always gets the phone layout, whatever the viewport says.
export function Shell({ section, title, groupScoped = true, children }: {
    section: Section;
    title: string;
    /** false for fleet screens: they work with no group selected. */
    groupScoped?: boolean;
    children: (helpers: { openGroups: () => void; wide: boolean }) => ReactNode;
}) {
    const t = useTranslations('WebHub.v2');
    const router = useRouter();
    const { isMiniApp, me, groupId } = useWebHub();
    const [sheet, setSheet] = useState(false);
    const wide = !isMiniApp;
    const isHome = section === 'overview';
    const group = me?.groups.find((g) => g.group_id === groupId);
    const back = useCallback(() => router.push('/dashboard'), [router]);
    const openGroups = useCallback(() => setSheet(true), []);

    // Inside Telegram the native BackButton replaces the header's Back.
    useEffect(() => {
        const button = window.Telegram?.WebApp?.BackButton;
        if (!isMiniApp || !button || isHome) return;
        button.show();
        button.onClick(back);
        return () => { button.offClick(back); button.hide(); };
    }, [isMiniApp, isHome, back]);

    return (
        <AuthGate requireGroup={!isHome && groupScoped}>
                <div className={clsx(
                    'webhub min-h-dvh bg-cb-peach bg-[url(/webhub/setup-pattern.jpg)] bg-cover bg-fixed bg-top font-jost text-cb-brown-900',
                    wide && 'lg:grid lg:grid-cols-[284px_minmax(0,1fr)]',
                )}>
                    <div className={wide ? 'hidden lg:block' : 'hidden'}><Sidebar section={section} /></div>

                    <main className={clsx(
                        'relative flex min-h-dvh min-w-0 flex-col',
                        !isHome && (wide
                            ? "max-lg:bg-[#3B3E40] max-lg:bg-[url('/bg1.jpg')] max-lg:bg-cover max-lg:bg-fixed"
                            : "bg-[#3B3E40] bg-[url('/bg1.jpg')] bg-cover bg-fixed"),
                    )}>
                        {/* Phone / Mini App header */}
                        <header className={clsx(
                            'sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2.5 bg-cb-cream-50/80 px-3 shadow-[0_1px_0_rgba(58,38,1,0.12)] backdrop-blur-xl',
                            wide && 'lg:hidden',
                        )}>
                            {isHome ? (
                                <>
                                    <img src="/cookiebot_avatar.jpeg" alt="" className="ml-1 size-8 rounded-full object-cover shadow-[0_0_0_2px_#FFE9C9,0_0_0_3px_#5E410D]" />
                                    <div className="flex min-w-0 grow flex-col leading-tight">
                                        <span className="text-[17px] font-bold">Cookiebot</span>
                                        <span className="truncate text-xs text-cb-muted">{t('panel')}</span>
                                    </div>
                                    <EnvSelector />
                                    <LanguageButton compact />
                                </>
                            ) : (
                                <>
                                    <span className="w-12 shrink-0 sm:w-[84px]">
                                        {!isMiniApp && (
                                            <button type="button" onClick={back}
                                                className="flex h-10 items-center gap-0.5 rounded-cb-md px-2 text-base text-cb-telegram hover:bg-cb-cream-100/60">
                                                <Icon name="chevronLeft" className="size-5" /><span className="sr-only sm:not-sr-only">{t('back')}</span>
                                            </button>
                                        )}
                                    </span>
                                    <h1 className="m-0 min-w-0 grow truncate text-center text-[17px] font-bold">{title}</h1>
                                    <span className="w-12 shrink-0 sm:w-[84px]" />
                                </>
                            )}
                        </header>

                        {/* Desktop top bar */}
                        <header className={clsx(
                            'sticky top-0 z-30 h-[68px] shrink-0 items-center gap-3 border-b border-cb-brown-700/10 bg-cb-cream-50/80 px-10 backdrop-blur-xl',
                            wide ? 'hidden lg:flex' : 'hidden',
                        )}>
                            <nav aria-label={t('breadcrumb')} className="flex min-w-0 grow items-center gap-2 text-[15px]">
                                <span className="truncate text-cb-brown-500">{group ? groupName(group) : ''}</span>
                                <Icon name="chevronRight" className="size-4 text-cb-sand" />
                                <span className="truncate font-semibold">{title}</span>
                            </nav>
                            <EnvSelector />
                            <LanguageButton />
                        </header>

                        <div key={section} className="mx-auto flex w-full max-w-[1080px] grow animate-cb-in flex-col gap-4 px-3.5 pb-28 pt-4 lg:animate-cb-rise lg:gap-6 lg:px-10 lg:pb-32 lg:pt-8">
                            {children({ openGroups, wide })}
                        </div>
                    </main>
                </div>
                <GroupSheet open={sheet} onClose={() => setSheet(false)} />
        </AuthGate>
    );
}
