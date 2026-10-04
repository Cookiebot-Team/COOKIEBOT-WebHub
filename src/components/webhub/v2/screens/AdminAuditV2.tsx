'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAdminAuditPage } from '@/lib/hooks/useAuditPage';
import type { AuditFilters as Filters } from '@/lib/cb/types';
import { useWebHub } from '../../WebHubProvider';
import { Shell } from '../Shell';
import { Card } from '../ui';
import { AuditFilters } from '../audit/AuditFilters';
import { AuditList } from '../audit/AuditList';
import { AuditPager } from '../audit/AuditPager';
import { useCursorPager } from '../audit/useCursorPager';
import { PageIntro, Skeleton, StatsError } from './common';

function NotAvailable() {
    const t = useTranslations('WebHub.v2.admin');
    return (
        <Card className="p-6 text-center">
            <p className="m-0 text-[17px] font-semibold">{t('notAvailable.title')}</p>
            <p className="m-0 mt-1 text-sm text-cb-muted">{t('notAvailable.body')}</p>
        </Card>
    );
}

function Body() {
    const t = useTranslations('WebHub.v2.audit');
    const [filters, setFilters] = useState<Filters>({});
    const pager = useCursorPager(JSON.stringify(filters));
    const { data, error, isPending, isPlaceholderData, refetch } = useAdminAuditPage(filters, pager.before);
    const filtered = Object.keys(filters).length > 0;
    return (
        <>
            <AuditFilters onApply={setFilters} showGroup />
            {error ? <StatsError error={error} onRetry={() => void refetch()} title={t('error')} />
                : isPending ? <Skeleton rows={4} />
                : data && (
                    <>
                        {data.events.length === 0 ? (
                            <Card className="p-6 text-center">
                                <p className="m-0 text-[17px] font-semibold">{t(filtered ? 'empty.filteredTitle' : 'empty.title')}</p>
                                <p className="m-0 mt-1 text-sm text-cb-muted">{t(filtered ? 'empty.filteredBody' : 'empty.body')}</p>
                            </Card>
                        ) : (
                            <div aria-busy={isPlaceholderData} className={clsx(isPlaceholderData && 'opacity-60 transition-opacity')}>
                                <AuditList events={data.events} showGroup />
                            </div>
                        )}
                        {(data.events.length > 0 || pager.hasNewer) && (
                            <AuditPager page={pager.page} hasNewer={pager.hasNewer} hasOlder={data.next_before !== null}
                                busy={isPlaceholderData} onNewer={pager.newer} onOlder={() => pager.older(data.next_before)} />
                        )}
                    </>
                )}
        </>
    );
}

export default function AdminAuditV2() {
    const t = useTranslations('WebHub.v2.admin.audit');
    const { me } = useWebHub();
    return (
        <Shell section="admin" title={t('title')} groupScoped={false}>
            {({ openGroups, wide }) => (
                <>
                    <PageIntro title={t('title')} lead={t('lead')} wide={wide} openGroups={openGroups} groupScoped={false} />
                    {me?.is_bot_admin ? <Body /> : <NotAvailable />}
                </>
            )}
        </Shell>
    );
}
