'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useGroupAuditPage } from '@/lib/hooks/useAuditPage';
import type { AuditFilters as Filters } from '@/lib/cb/types';
import { useWebHub } from '../../WebHubProvider';
import { Shell } from '../Shell';
import { Card } from '../ui';
import { AuditFilters } from '../audit/AuditFilters';
import { AuditList } from '../audit/AuditList';
import { AuditPager } from '../audit/AuditPager';
import { useCursorPager } from '../audit/useCursorPager';
import { PageIntro, Skeleton, StatsError } from './common';

export default function AuditV2() {
    const t = useTranslations('WebHub.v2.audit');
    const { groupId } = useWebHub();
    const [filters, setFilters] = useState<Filters>({});
    const pager = useCursorPager(`${groupId}|${JSON.stringify(filters)}`);
    const { data, error, isPending, isPlaceholderData, fetchStatus, refetch } = useGroupAuditPage(filters, pager.before);
    const idle = isPending && fetchStatus === 'idle';
    const filtered = Object.keys(filters).length > 0;

    return (
        <Shell section="audit" title={t('title')}>
            {({ openGroups, wide }) => (
                <>
                    <PageIntro title={t('title')} lead={t('lead')} wide={wide} openGroups={openGroups} />
                    <AuditFilters onApply={setFilters} />
                    {error ? <StatsError error={error} onRetry={() => void refetch()} title={t('error')} />
                        : idle ? (
                            <Card className="flex flex-col items-start gap-3 p-5">
                                <p className="m-0 text-[15px]">{t('selectGroup')}</p>
                                <button type="button" onClick={openGroups}
                                    className="h-11 rounded-cb-md bg-cb-brown-700 px-4 text-sm font-semibold text-cb-cream-50">{t('switchGroup')}</button>
                            </Card>
                        )
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
                                        <AuditList events={data.events} />
                                    </div>
                                )}
                                {(data.events.length > 0 || pager.hasNewer) && (
                                    <AuditPager page={pager.page} hasNewer={pager.hasNewer} hasOlder={data.next_before !== null}
                                        busy={isPlaceholderData} onNewer={pager.newer} onOlder={() => pager.older(data.next_before)} />
                                )}
                            </>
                        )}
                </>
            )}
        </Shell>
    );
}
