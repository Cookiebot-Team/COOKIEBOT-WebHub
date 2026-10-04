'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Fragment } from 'react';
import { useGetChatCount } from '@/lib/hooks/useGetChatCount';
import { useGroupConfig } from '../../useGroupConfig';
import { useWebHub } from '../../WebHubProvider';
import { groupName } from '../GroupPicker';
import { Icon, IconName } from '../icons';
import { ADMIN_NAV, COMMUNITY, Shell } from '../Shell';
import { GroupAvatar, SectionLabel } from '../ui';

export default function HomeV2() {
    const t = useTranslations('WebHub');
    const { me, groupId } = useWebHub();
    const { config } = useGroupConfig();
    const { data: chatCount, isLoading, isError } = useGetChatCount();
    const count = isLoading ? '…' : isError ? '—' : chatCount?.number_chats.toLocaleString() ?? '0';
    const group = me?.groups.find((g) => g.group_id === groupId);

    // Each tile shows the group's live setting, so the overview doubles as a summary.
    const tiles: { href: string; icon: IconName; title: string; value: string; soon?: boolean }[] = [
        {
            href: '/dashboard/general', icon: 'settings', title: t('v2.nav.general'),
            value: config ? t(config.sfw ? 'v2.glance.nsfwBlocked' : 'v2.glance.nsfwAllowed') : '…',
        },
        {
            href: '/dashboard/moderation', icon: 'shield', title: t('v2.nav.moderation'),
            value: config ? t('v2.glance.captcha', { seconds: config.captcha_timeout_seconds }) : '…',
        },
        {
            href: '/dashboard/posts', icon: 'photo', title: t('v2.nav.posts'),
            value: config ? (config.publisher_post ? t('v2.glance.perDay', { count: config.max_posts }) : t('v2.glance.notReceiving')) : '…',
        },
        { href: '/dashboard/events', icon: 'calendar', title: t('v2.nav.events'), value: t('v2.glance.drafts'), soon: true },
        { href: '/dashboard/stats', icon: 'chart', title: t('v2.nav.stats'), value: t('v2.glance.stats') },
        { href: '/dashboard/audit', icon: 'log', title: t('v2.nav.audit'), value: t('v2.glance.audit') },
    ];
    // Bot owners also get the fleet screens, which need no group.
    const adminTiles: typeof tiles = ADMIN_NAV.map((item) => ({
        href: item.href, icon: item.icon, title: t(`v2.nav.${item.section}`),
        value: t(item.section === 'admin' ? 'v2.glance.admin' : 'v2.glance.adminAudit'),
    }));

    return (
        <Shell section="overview" title={t('v2.nav.overview')}>
            {({ openGroups, wide }) => (
                <>
                    <div className={clsx('grid gap-4', wide && 'lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-5')}>
                        <section className="flex animate-cb-rise flex-col gap-3.5 rounded-cb-xl bg-cb-cream-50/90 p-5 shadow-cb-card backdrop-blur-md lg:flex-row lg:items-center lg:gap-6 lg:p-7">
                            <img src="/cookiebot_avatar.jpeg" alt="Cookiebot"
                                className="size-14 shrink-0 rounded-full object-cover shadow-[0_0_0_3px_#FFE9C9,0_0_0_4px_#5E410D,0_6px_14px_rgba(0,0,0,0.25)] lg:size-[88px]" />
                            <div className="flex flex-col gap-2.5">
                                <h1 className="m-0 text-[21px] font-bold leading-tight lg:text-3xl">{t('v2.welcome')}</h1>
                                <p className="m-0 text-[15px] leading-relaxed text-cb-brown-700 lg:text-base">
                                    {t('v2.activeIn', { count })} {t('v2.intro')}
                                </p>
                                <div className="flex flex-wrap gap-2.5">
                                    <a href="https://t.me/CookieMWbot?startgroup=new" target="_blank" rel="noreferrer"
                                        className="inline-flex h-11 grow items-center justify-center gap-2 rounded-full bg-cb-brown-900 px-5 text-[15px] font-semibold text-cb-cream-50 no-underline transition-transform active:scale-[0.97] lg:grow-0">
                                        <Icon name="add" className="size-[18px]" />{t('v2.addMe')}
                                    </a>
                                    <a href="https://t.me/MekhyW" target="_blank" rel="noreferrer"
                                        className="hidden h-11 items-center rounded-full border border-cb-sand px-[18px] text-[15px] text-cb-brown-900 no-underline hover:bg-cb-cream-100/60 lg:inline-flex">
                                        {t('v2.contact')}
                                    </a>
                                </div>
                            </div>
                        </section>

                        {group && (
                            <button type="button" onClick={openGroups}
                                className="flex animate-cb-rise items-center gap-3 rounded-cb-xl bg-cb-brown-900 p-4 text-left text-cb-cream-50 shadow-cb-raised transition-transform [animation-delay:60ms] active:scale-[0.98] lg:flex-col lg:items-stretch lg:gap-3.5 lg:p-6">
                                <span className="flex min-w-0 grow items-center gap-3">
                                    <GroupAvatar id={group.group_id} name={groupName(group)} size={wide ? 'lg' : 'md'} />
                                    <span className="flex min-w-0 flex-col">
                                        <span className="text-[11px] uppercase tracking-[0.08em] text-cb-cream-100/70">{t('v2.managing')}</span>
                                        <span className="truncate text-[17px] font-semibold lg:text-xl">{groupName(group)}</span>
                                    </span>
                                </span>
                                <span className="hidden text-sm leading-relaxed text-cb-cream-100/80 lg:block">{t('v2.groupNote')}</span>
                                <span className="flex items-center gap-2 rounded-full bg-cb-cream-100/15 px-3 py-1 text-xs text-cb-cream-100 lg:mt-auto lg:h-[42px] lg:justify-center lg:rounded-cb-md lg:bg-cb-cream-100 lg:text-[15px] lg:font-semibold lg:text-cb-brown-900">
                                    {t('v2.switchGroup')}
                                    <Icon name="chevronDown" className="size-4 lg:hidden" />
                                </span>
                            </button>
                        )}
                    </div>

                    <SectionLabel className="mx-1 animate-cb-rise text-cb-brown-700 [animation-delay:90ms]">{t('v2.settings')}</SectionLabel>
                    {[{ key: 'settings', list: tiles }, ...(me?.is_bot_admin ? [{ key: 'admin', list: adminTiles }] : [])].map(({ key, list }) => (
                        <Fragment key={key}>
                            {key === 'admin' && <SectionLabel className="mx-1 animate-cb-rise text-cb-brown-700">{t('v2.nav.adminGroup')}</SectionLabel>}
                        <div className={clsx('grid animate-cb-rise grid-cols-2 gap-2.5 [animation-delay:120ms]', wide && 'lg:grid-cols-4 lg:gap-4')}>
                            {list.map((tile) => (
                                <Link key={tile.href} href={tile.href}
                                    className="group flex min-h-[116px] min-w-0 flex-col gap-2.5 rounded-cb-lg bg-white/90 p-3.5 text-cb-brown-900 no-underline shadow-[0_1px_0_rgba(94,65,13,0.08)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-cb-raised active:scale-[0.98] lg:min-h-[150px] lg:p-5">
                                    <span className="flex items-center justify-between">
                                        <span className="grid size-[38px] place-items-center rounded-cb-md bg-cb-cream-100 text-cb-brown-700">
                                            <Icon name={tile.icon} className="size-[22px]" />
                                        </span>
                                        {tile.soon && <span className="rounded-full bg-cb-cream-100 px-2 py-0.5 text-[11px] font-semibold text-cb-brown-700">{t('v2.soon')}</span>}
                                    </span>
                                    <span className="break-words text-base font-semibold leading-tight">{tile.title}</span>
                                    <span className="break-words text-[13px] leading-snug text-cb-muted lg:text-lg lg:font-semibold lg:text-cb-brown-900">{tile.value}</span>
                                    <span className="mt-auto hidden items-center gap-1 text-[13px] font-medium text-cb-brown-700 lg:flex">
                                        {t('v2.open')}<Icon name="chevronRight" className="size-4 transition-transform group-hover:translate-x-0.5" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                        </Fragment>
                    ))}

                    <div className={clsx('flex animate-cb-rise flex-col gap-2.5 [animation-delay:180ms]', wide && 'lg:hidden')}>
                        <SectionLabel className="mx-1 text-cb-brown-700">{t('v2.community')}</SectionLabel>
                        <nav aria-label={t('v2.community')} className="overflow-hidden rounded-cb-lg bg-white/90">
                            {COMMUNITY.map((link, i) => (
                                <a key={link.key} href={link.href} {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                                    className={clsx('flex min-h-[52px] items-center gap-3 px-4 text-cb-brown-900 no-underline transition-colors hover:bg-cb-cream-100/60',
                                        i > 0 && 'border-t border-cb-brown-700/10')}>
                                    <Icon name={link.icon} className="size-5 shrink-0 text-cb-brown-500" />
                                    <span className="grow text-base">{t(`v2.links.${link.key}`)}</span>
                                    <Icon name="chevronRight" className="size-[18px] text-cb-sand" />
                                </a>
                            ))}
                        </nav>
                    </div>
                </>
            )}
        </Shell>
    );
}
