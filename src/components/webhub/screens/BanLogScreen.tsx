'use client';

import { TrashIcon } from '@heroicons/react/24/solid';
import { useTranslations } from 'next-intl';
import { ComingSoon, Panel, PillButton } from '../ui';
import { SettingsFrame } from './SettingsFrame';

export default function BanLogScreen() {
    const t = useTranslations('WebHub.bans');

    // v2 does not expose bans yet; the log renders the design's empty rows.
    return (
        <SettingsFrame title={t('title')} loading={false} error={null} showReset={false}
            footer={(
                <>
                    <ComingSoon />
                    <PillButton tone="cream" size="sm" icon={<TrashIcon />} disabled className="w-[289px]">{t('clear')}</PillButton>
                </>
            )}>
            <Panel className="min-h-[509px] px-4 pt-1">
                {[0, 1, 2].map((row) => (
                    <div key={row} className="grid h-11 grid-cols-[100px_1fr] items-center border-b-[0.33px] border-[#545456]/35 text-[17px] font-light">
                        <span className="uppercase">{t('username')}</span>
                        <span className="truncate text-[#3C3C43]/30">{t('reasonPlaceholder')}</span>
                    </div>
                ))}
            </Panel>
        </SettingsFrame>
    );
}
