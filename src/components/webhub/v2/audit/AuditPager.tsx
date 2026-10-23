'use client';

import { useTranslations } from 'next-intl';
import { TID } from '../testids';

const btn = 'h-11 min-w-[44px] rounded-cb-md border border-cb-line bg-white px-4 text-sm font-semibold text-cb-brown-900 disabled:cursor-not-allowed disabled:opacity-50';

export function AuditPager({ page, hasNewer, hasOlder, busy, onNewer, onOlder }: {
    page: number; hasNewer: boolean; hasOlder: boolean; busy?: boolean; onNewer: () => void; onOlder: () => void;
}) {
    const t = useTranslations('WebHub.v2.audit.pager');
    return (
        <nav aria-label={t('label')} className="flex items-center justify-between gap-3">
            <button type="button" data-testid={TID.auditPagerNewer} className={btn} disabled={!hasNewer || busy} onClick={onNewer}>{t('newer')}</button>
            <span data-testid={TID.auditPagerPage} aria-live="polite" className="text-sm font-semibold tabular-nums text-cb-muted">{t('page', { page })}</span>
            <button type="button" data-testid={TID.auditPagerOlder} className={btn} disabled={!hasOlder || busy} onClick={onOlder}>{t('older')}</button>
        </nav>
    );
}
