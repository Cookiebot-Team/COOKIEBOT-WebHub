'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useGroupConfig } from '../../useGroupConfig';
import { Icon } from '../icons';
import { Shell } from '../Shell';
import Link from 'next/link';
import { Card, ErrorBanner, SliderCard, Soon, SwitchRow } from '../ui';
import { PageIntro, SaveBars, Skeleton } from './common';

export default function ModerationV2() {
    const t = useTranslations('WebHub');
    const { config, update, save, discard, dirtyCount, saving, error } = useGroupConfig([], { stayOnSave: true });

    return (
        <Shell section="moderation" title={t('v2.nav.moderation')}>
            {({ openGroups, wide }) => (
                <>
                    <PageIntro title={t('v2.nav.moderation')} lead={t('v2.lead.moderation')} wide={wide} openGroups={openGroups} />
                    <ErrorBanner error={error} />
                    {!config ? (error ? null : <Skeleton />) : (
                        <>
                            <div className={clsx('grid gap-4', wide && 'lg:grid-cols-3')}>
                                <SliderCard label={t('v2.sliders.captcha')} hint={t('v2.hints.captcha')} unit="s"
                                    min={30} max={300} value={config.captcha_timeout_seconds}
                                    onChange={(v) => update('captcha_timeout_seconds', v)} />
                                <SliderCard delay={1} label={t('v2.sliders.stickers')} hint={t('v2.hints.stickers')}
                                    min={1} max={100} value={config.sticker_spam_limit}
                                    onChange={(v) => update('sticker_spam_limit', v)} />
                                <SliderCard delay={2} label={t('v2.sliders.media')} hint={t('v2.hints.media')} unit="min"
                                    min={0} max={999} value={Math.round(config.media_restrict_seconds / 60)}
                                    onChange={(v) => update('media_restrict_seconds', v * 60)} />
                            </div>
                            <Card delay={1} className="overflow-hidden">
                                <SwitchRow first disabled checked label={t('v2.toggles.externalMedia')} hint={t('v2.hints.externalMedia')} badge={<Soon />} />
                                <Link href="/dashboard/audit"
                                    className="flex items-center gap-3.5 border-t border-cb-brown-700/10 px-4 py-3.5 text-cb-brown-900 no-underline transition-colors hover:bg-cb-cream-100/60 lg:px-[22px]">
                                    <Icon name="log" className="size-[22px] shrink-0 text-cb-brown-500" />
                                    <div className="flex min-w-0 grow flex-col gap-0.5">
                                        <span className="text-base font-medium">{t('v2.audit.title')}</span>
                                        <span className="text-[13px] text-cb-muted">{t('v2.hints.auditLog')}</span>
                                    </div>
                                    <Icon name="chevronRight" className="size-[18px] text-cb-sand" />
                                </Link>
                                <div className="flex items-center gap-3.5 border-t border-cb-brown-700/10 px-4 py-3.5 lg:px-[22px]">
                                    <Icon name="cancel" className="size-[22px] shrink-0 text-cb-brown-500" />
                                    <div className="flex grow flex-col gap-0.5">
                                        <span className="text-base font-medium">{t('v2.banLog')}</span>
                                        <span className="text-[13px] text-cb-muted">{t('v2.hints.banLog')}</span>
                                    </div>
                                    <Soon />
                                </div>
                            </Card>
                        </>
                    )}
                    <SaveBars dirtyCount={dirtyCount} save={save} discard={discard} saving={saving} />
                </>
            )}
        </Shell>
    );
}
