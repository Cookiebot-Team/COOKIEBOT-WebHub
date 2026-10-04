'use client';

import { NoSymbolIcon } from '@heroicons/react/24/solid';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Checkbox, ComingSoon, Panel, PillButton, SettingRow, SliderField } from '../ui';
import { useGroupConfig } from '../useGroupConfig';
import { SettingsFrame } from './SettingsFrame';

export default function ModerationScreen() {
    const t = useTranslations('WebHub.moderation');
    const { config, update, save, saving, error } = useGroupConfig();
    // Not backed by v2 yet: kept local so the design renders, never sent.
    const [externalMedia, setExternalMedia] = useState(true);

    return (
        <SettingsFrame title={t('title')} loading={!config} error={error} onDone={save} saving={saving}>
            {config && (
                <>
                    <Panel>
                        <SliderField label={t('captcha')} description={t('captchaDescription')} unit="s"
                            min={30} max={300} value={config.captcha_timeout_seconds}
                            onChange={(v) => update('captcha_timeout_seconds', v)} />
                    </Panel>
                    <Panel>
                        <SliderField label={t('stickers')} description={t('stickersDescription')}
                            min={1} max={100} value={config.sticker_spam_limit}
                            onChange={(v) => update('sticker_spam_limit', v)} />
                    </Panel>
                    <Panel>
                        <SliderField label={t('images')} description={t('imagesDescription')} unit="min"
                            min={0} max={999} value={Math.round(config.media_restrict_seconds / 60)}
                            onChange={(v) => update('media_restrict_seconds', v * 60)} />
                    </Panel>
                    <SettingRow disabled label={<span className="flex flex-wrap items-center gap-2">{t('externalMedia')} <ComingSoon /></span>}>
                        <Checkbox checked={externalMedia} onChange={setExternalMedia} disabled />
                    </SettingRow>
                    <PillButton tone="charcoal" icon={<NoSymbolIcon />} href="/dashboard/moderation/bans" className="mx-3">
                        {t('banLog')}
                    </PillButton>
                </>
            )}
        </SettingsFrame>
    );
}
