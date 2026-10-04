'use client';

import { useQuery } from '@tanstack/react-query';
import { useWebHub } from '@/components/webhub/WebHubProvider';
import { CbError } from '@/lib/cb/client';
import type { DateRange, GroupAnalytics } from '@/lib/cb/types';

export function useGroupStats(range: DateRange) {
    const { repo, env, me, groupId } = useWebHub();
    return useQuery<GroupAnalytics>({
        queryKey: ['groupStats', env, groupId, range.start, range.end],
        queryFn: () => repo.groupAnalytics(groupId as number, range),
        enabled: me !== null && groupId !== null,
        retry: (n: number, e: unknown) => !(e instanceof CbError && e.status >= 400 && e.status < 500) && n < 2,
    });
}
