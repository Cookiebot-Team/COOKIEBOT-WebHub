'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import {
    AcademicCapIcon, ArrowRightStartOnRectangleIcon, CalendarDaysIcon, ChevronDownIcon, Cog6ToothIcon, LanguageIcon,
    NewspaperIcon, PlusIcon, ShieldCheckIcon, ShieldExclamationIcon, SparklesIcon,
} from '@heroicons/react/24/solid';
import { useGetChatCount } from '@/lib/hooks/useGetChatCount';
import { AuthGate } from '../AuthGate';
import { EnvSelector, NavBar, PillButton, Screen } from '../ui';
import { LANGUAGES, useLocaleSwitch, usePopover } from '../shared';
import { useWebHub } from '../WebHubProvider';

function LanguageMenu() {
    const t = useTranslations('WebHub.language');
    const { locale, pending, change } = useLocaleSwitch();
    const { open, setOpen, ref } = usePopover();

    return (
        <div ref={ref} className="relative">
            <button type="button" aria-label={t('title')} aria-expanded={open} onClick={() => setOpen(!open)}
                className="grid size-[31px] place-items-center rounded-full border border-cb-brown-900 bg-cb-cream-100 text-cb-brown-900">
                <LanguageIcon className="size-5" />
            </button>
            {open && (
                <div role="radiogroup" aria-label={t('title')}
                    className="absolute right-0 top-10 z-30 w-[250px] overflow-hidden rounded-xl bg-cb-cream-100 font-inter text-[17px] shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                    <p className="px-4 py-2.5 text-sm font-semibold text-cb-brown-700">{t('title')}</p>
                    {LANGUAGES.map((option) => (
                        <button key={option.value} type="button" role="radio" aria-checked={locale === option.value} disabled={pending}
                            onClick={() => change(option.value, () => setOpen(false))}
                            className="flex h-11 w-full items-center justify-between border-t border-black/10 px-4 text-left">
                            {option.label}
                            <span className={clsx('grid size-5 place-items-center rounded-full', locale === option.value ? 'shadow-[inset_0_0_0_2px_#5E410D]' : 'shadow-[inset_0_0_0_2px_#49454F]')}>
                                {locale === option.value && <span className="size-2.5 rounded-full bg-cb-brown-700" />}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function GroupPicker() {
    const t = useTranslations('WebHub.groups');
    const { me, groupId, setGroupId } = useWebHub();
    const { open, setOpen, ref } = usePopover();
    const groups = me?.groups ?? [];
    const active = groups.find((g) => g.group_id === groupId);
    const name = (g: (typeof groups)[number]) => g.title ?? g.username ?? String(g.group_id);

    return (
        <div ref={ref} className="relative mx-auto w-[338px] max-w-full">
            <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}
                className="flex min-h-11 w-full items-center justify-between rounded-[20px] bg-cb-brown-700/60 px-4 text-[17px] font-medium text-white backdrop-blur-sm">
                <span className="flex flex-col items-start leading-tight">
                    <span className="text-xs font-normal opacity-80">{t('active')}</span>
                    <span className="truncate">{active ? name(active) : '—'}</span>
                </span>
                <ChevronDownIcon className={clsx('size-5 transition-transform', open && 'rotate-180')} />
            </button>
            {open && (
                <ul role="listbox" aria-label={t('active')}
                    className="absolute inset-x-0 top-[52px] z-30 max-h-72 overflow-auto rounded-lg bg-white p-2 shadow-[0_4px_4px_rgba(12,12,13,0.1)]">
                    {groups.map((group) => (
                        <li key={group.group_id}>
                            <button type="button" role="option" aria-selected={group.group_id === groupId}
                                onClick={() => { setGroupId(group.group_id); setOpen(false); }}
                                className={clsx('flex w-full items-start gap-3 rounded-md px-3 py-2 text-left', group.group_id === groupId ? 'bg-cb-cream-100/60' : 'hover:bg-cb-cream-50')}>
                                <Cog6ToothIcon className="mt-0.5 size-5 shrink-0 text-cb-brown-700" />
                                <span className="flex flex-col">
                                    <span className="font-medium uppercase">{name(group)}</span>
                                    <span className="text-sm text-cb-gray-600">{t('configure')}</span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function SetUpScreen() {
    const t = useTranslations('WebHub.setup');
    const tc = useTranslations('Common');
    const { data: chatCount, isLoading, isError } = useGetChatCount();
    const { logout, isMiniApp } = useWebHub();
    const count = isLoading ? '…' : isError ? 'N/A' : chatCount?.number_chats.toLocaleString() ?? '0';

    return (
        <AuthGate requireGroup={false}>
            <Screen variant="pattern">
                <NavBar title={t('title')} />
                <div className="flex items-center justify-between px-4 pt-2">
                    <EnvSelector />
                    <LanguageMenu />
                </div>

                <div className="flex flex-col items-center px-6 text-center text-[17px] text-cb-brown-900">
                    <img src="/cookiebot_avatar.jpeg" alt="" className="size-[68px] rounded-full border border-cb-cream-100 shadow-[0_0_0_1px_#5E410D,0_3px_6px_rgba(0,0,0,0.7)]" />
                    <h2 className="mt-3 font-bold">{t('welcome')}</h2>
                    <p className="mt-2 font-medium [text-shadow:0_4px_4px_rgba(0,0,0,0.25)]">{t('groupCount', { count })}</p>
                    <p className="mt-2 font-medium">{t('intro')}</p>
                </div>

                <div className="mt-5 flex justify-center">
                    <PillButton tone="dark" size="lg" icon={<PlusIcon />} href="https://t.me/CookieMWbot?startgroup=new">{t('addMe')}</PillButton>
                </div>

                <div className="mt-5 flex flex-col gap-[5px] px-4">
                    <GroupPicker />
                    <div className="mx-auto mt-2 flex w-[338px] max-w-full flex-col gap-[5px]">
                        <PillButton tone="olive" icon={<Cog6ToothIcon />} href="/dashboard/general">{t('general')}</PillButton>
                        <PillButton tone="olive" icon={<ShieldCheckIcon />} href="/dashboard/moderation">{t('moderation')}</PillButton>
                        <PillButton tone="olive" icon={<NewspaperIcon />} href="/dashboard/posts">{t('posts')}</PillButton>
                        <PillButton tone="olive" icon={<CalendarDaysIcon />} href="/dashboard/events">{t('events')}</PillButton>
                    </div>
                </div>

                <div className="mx-auto mb-6 mt-9 flex w-[289px] max-w-full flex-col gap-[5px]">
                    <PillButton tone="dark" size="sm" icon={<SparklesIcon />} href="https://t.me/CookiebotPostmail">{t('publicationsBoard')}</PillButton>
                    {/* No events channel exists yet; the design's button stays inert until one does. */}
                    <PillButton tone="dark" size="sm" icon={<CalendarDaysIcon />} disabled>{t('eventsBoard')}</PillButton>
                    <PillButton tone="dark" size="sm" icon={<AcademicCapIcon />} href="https://t.me/+mX6W3tGXPew2OTIx">{t('testGroup')}</PillButton>
                    <PillButton tone="dark" size="sm" icon={<ShieldExclamationIcon />} href="/privacy">{t('privacy')}</PillButton>
                    {!isMiniApp && (
                        <button type="button" onClick={logout} className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-cb-brown-700 underline-offset-4 hover:underline">
                            <ArrowRightStartOnRectangleIcon className="size-4" />{tc('auth.signout')}
                        </button>
                    )}
                </div>
            </Screen>
        </AuthGate>
    );
}
