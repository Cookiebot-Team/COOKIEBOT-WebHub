'use client';

import { useQuery } from '@tanstack/react-query';
import { useWebHub } from '@/components/webhub/WebHubProvider';
import { CbError } from '@/lib/cb/client';
import { keepIfSameKey, liveOptions } from './keepSameKey';
import type { DateRange, GroupAnalytics } from '@/lib/cb/types';

export function useGroupStats(range: DateRange) {
    const { repo, env, me, groupId } = useWebHub();
    const queryKey = ['groupStats', env, groupId, range.start, range.end] as const;
    return useQuery<GroupAnalytics>({
        queryKey,
        queryFn: () => repo.groupAnalytics(groupId as number, range),
        enabled: me !== null && groupId !== null,
        ...liveOptions,
        placeholderData: (previous, previousQuery) => keepIfSameKey(previous, previousQuery, queryKey),
        retry: (n: number, e: unknown) => !(e instanceof CbError && e.status >= 400 && e.status < 500) && n < 2,
    });
}
