'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useGroupConfig } from '../../useGroupConfig';
import { Shell } from '../Shell';
import { Card, ErrorBanner, SectionLabel, SwitchRow, TextArea } from '../ui';
import { PageIntro, SaveBars, Skeleton } from './common';

const TELEGRAM_MESSAGE_LIMIT = 4096;

export default function GeneralV2() {
    const t = useTranslations('WebHub');
    const { config, texts, update, updateText, save, discard, dirtyCount, saving, error } =
        useGroupConfig(['welcome', 'rules'], { stayOnSave: true });

    return (
        <Shell section="general" title={t('v2.nav.general')}>
            {({ openGroups, wide }) => (
                <>
                    <PageIntro title={t('v2.nav.general')} lead={t('v2.lead.general')} wide={wide} openGroups={openGroups} />
                    <ErrorBanner error={error} />
                    {!config ? (error ? null : <Skeleton rows={2} />) : (
                        <div className={clsx('grid items-start gap-4', wide && 'lg:grid-cols-2 lg:gap-5')}>
                            <Card className="flex flex-col gap-4 p-4 lg:p-[22px]">
                                <SectionLabel>{t('v2.messages')}</SectionLabel>
                                <TextArea label={t('general.welcome')} placeholder={t('v2.placeholder.welcome')}
                                    value={texts.welcome ?? ''} onChange={(v) => updateText('welcome', v)} maxLength={TELEGRAM_MESSAGE_LIMIT} />
                                <TextArea label={t('general.rules')} placeholder={t('v2.placeholder.rules')}
                                    value={texts.rules ?? ''} onChange={(v) => updateText('rules', v)} maxLength={TELEGRAM_MESSAGE_LIMIT} />
                            </Card>
                            <Card delay={1} className="overflow-hidden">
                                <SectionLabel className="px-4 pb-2 pt-4 lg:px-[22px] lg:pt-[22px]">{t('v2.behaviour')}</SectionLabel>
                                <SwitchRow first label={t('v2.toggles.furbots')} hint={t('v2.hints.furbots')}
                                    checked={config.allow_furbots} onChange={(v) => update('allow_furbots', v)} />
                                <SwitchRow label={t('v2.toggles.sfw')} hint={t('v2.hints.sfw')}
                                    checked={config.sfw} onChange={(v) => update('sfw', v)} />
                                <SwitchRow label={t('v2.toggles.fun')} hint={t('v2.hints.fun')}
                                    checked={config.functions_fun} onChange={(v) => update('functions_fun', v)} />
                                <SwitchRow label={t('v2.toggles.utility')} hint={t('v2.hints.utility')}
                                    checked={config.functions_utility} onChange={(v) => update('functions_utility', v)} />
                            </Card>
                        </div>
                    )}
                    <SaveBars dirtyCount={dirtyCount} save={save} discard={discard} saving={saving} />
                </>
            )}
        </Shell>
    );
}
