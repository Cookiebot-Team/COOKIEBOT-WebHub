'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useGroupConfig } from '../../useGroupConfig';
import { Shell } from '../Shell';
import { Card, ErrorBanner, SliderCard, SwitchRow } from '../ui';
import { PageIntro, SaveBars, Skeleton } from './common';

export default function PostsV2() {
    const t = useTranslations('WebHub');
    const { config, update, save, discard, dirtyCount, saving, error } = useGroupConfig([], { stayOnSave: true });

    return (
        <Shell section="posts" title={t('v2.nav.posts')}>
            {({ openGroups, wide }) => (
                <>
                    <PageIntro title={t('v2.nav.posts')} lead={t('v2.lead.posts')} wide={wide} openGroups={openGroups} />
                    <ErrorBanner error={error} />
                    {!config ? (error ? null : <Skeleton rows={2} />) : (
                        <div className={clsx('grid items-start gap-4', wide && 'lg:grid-cols-2 lg:gap-5')}>
                            <Card className="overflow-hidden">
                                <SwitchRow first label={t('v2.toggles.share')} hint={t('v2.hints.share')}
                                    checked={config.publisher_ask} onChange={(v) => update('publisher_ask', v)} />
                                <SwitchRow label={t('v2.toggles.receive')} hint={t('v2.hints.receive')}
                                    checked={config.publisher_post} onChange={(v) => update('publisher_post', v)} />
                            </Card>
                            {/* The limit only matters while the group receives posts. */}
                            <SliderCard delay={1} label={t('v2.sliders.posts')}
                                hint={config.publisher_post ? t('v2.hints.posts') : t('v2.hints.postsOff')}
                                min={0} max={500} value={Math.min(config.max_posts, 500)} disabled={!config.publisher_post}
                                onChange={(v) => update('max_posts', v)} />
                        </div>
                    )}
                    <SaveBars dirtyCount={dirtyCount} save={save} discard={discard} saving={saving} />
                </>
            )}
        </Shell>
    );
}
