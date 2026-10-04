'use client';

import { useTranslations } from 'next-intl';
import { Checkbox, Panel, SettingRow, SliderField } from '../ui';
import { useGroupConfig } from '../useGroupConfig';
import { SettingsFrame } from './SettingsFrame';

export default function PostsScreen() {
    const t = useTranslations('WebHub.posts');
    const { config, update, save, saving, error } = useGroupConfig();

    return (
        <SettingsFrame title={t('title')} loading={!config} error={error} onDone={save} saving={saving}>
            {config && (
                <>
                    <SettingRow label={t('send')}>
                        <Checkbox checked={config.publisher_ask} onChange={(v) => update('publisher_ask', v)} />
                    </SettingRow>
                    <SettingRow label={t('receive')}>
                        <Checkbox checked={config.publisher_post} onChange={(v) => update('publisher_post', v)} />
                    </SettingRow>
                    {/* The limiter only matters while the group receives posts. */}
                    <Panel>
                        <SliderField label={t('limit')} description={t('limitDescription')}
                            min={0} max={500} value={Math.min(config.max_posts, 500)} disabled={!config.publisher_post}
                            onChange={(v) => update('max_posts', v)} />
                    </Panel>
                </>
            )}
        </SettingsFrame>
    );
}
