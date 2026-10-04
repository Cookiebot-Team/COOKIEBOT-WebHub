'use client';

import { useTranslations } from 'next-intl';
import { Checkbox, SettingRow, Switch, TextField } from '../ui';
import { useGroupConfig } from '../useGroupConfig';
import { SettingsFrame } from './SettingsFrame';

const TELEGRAM_MESSAGE_LIMIT = 4096;

export default function GeneralScreen() {
    const t = useTranslations('WebHub.general');
    const { config, texts, update, updateText, save, saving, error } = useGroupConfig(['welcome', 'rules']);

    return (
        <SettingsFrame title={t('title')} loading={!config} error={error} onDone={save} saving={saving}>
            {config && (
                <>
                    <TextField label={t('welcome')} placeholder={t('welcomePlaceholder')} value={texts.welcome ?? ''}
                        onChange={(v) => updateText('welcome', v)} maxLength={TELEGRAM_MESSAGE_LIMIT} />
                    <hr className="mx-2 border-white/35" />
                    <TextField label={t('rules')} placeholder={t('rulesPlaceholder')} value={texts.rules ?? ''}
                        onChange={(v) => updateText('rules', v)} maxLength={TELEGRAM_MESSAGE_LIMIT} />
                    <hr className="mx-2 border-white/35" />
                    <SettingRow label={t('allowFurbots')}>
                        <Checkbox checked={config.allow_furbots} onChange={(v) => update('allow_furbots', v)} />
                    </SettingRow>
                    <SettingRow label={t('sfw')}>
                        <Checkbox checked={config.sfw} onChange={(v) => update('sfw', v)} />
                    </SettingRow>
                    <SettingRow label={t('fun')}>
                        <Switch checked={config.functions_fun} onChange={(v) => update('functions_fun', v)} />
                    </SettingRow>
                    <SettingRow label={t('utility')}>
                        <Switch checked={config.functions_utility} onChange={(v) => update('functions_utility', v)} />
                    </SettingRow>
                </>
            )}
        </SettingsFrame>
    );
}
