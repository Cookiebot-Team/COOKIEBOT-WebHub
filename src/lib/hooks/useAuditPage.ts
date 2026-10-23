'use client';

import { useQuery } from '@tanstack/react-query';
import { useWebHub } from '@/components/webhub/WebHubProvider';
import { CbError } from '@/lib/cb/client';
import { STATS_REFRESH_MS } from './keepSameKey';
import type { AdminAuditPage, AuditFilters, AuditPage } from '@/lib/cb/types';

export const AUDIT_PAGE_SIZE = 25;

const retry = (n: number, e: unknown) => !(e instanceof CbError && e.status >= 400 && e.status < 500) && n < 2;

// Keep the previous page on screen while paging/filtering, but never across a
// different environment or group (key[2] = env, key[3] = group id / admin).
function keepWithinScope<T>(previous: T | undefined, previousQuery?: { queryKey: readonly unknown[] }, key?: readonly unknown[]) {
    if (!previousQuery || !key) return undefined;
    return previousQuery.queryKey[2] === key[2] && previousQuery.queryKey[3] === key[3] ? previous : undefined;
}

const livePage = (before?: string) => before === undefined
    ? { refetchInterval: STATS_REFRESH_MS, refetchIntervalInBackground: false, refetchOnWindowFocus: true }
    : { refetchInterval: false as const, refetchOnWindowFocus: false };

/** One page of the selected group's trail; `before` is the keyset cursor (undefined = newest page). */
export function useGroupAuditPage(filters: AuditFilters, before?: string, limit = AUDIT_PAGE_SIZE) {
    const { repo, env, me, groupId } = useWebHub();
    // The group comes from the path, never from the filters.
    const { group_id: _ignored, ...scoped } = filters;
    const queryKey = ['audit', 'group', env, groupId, scoped, before ?? null, limit] as const;
    return useQuery<AuditPage>({
        queryKey,
        queryFn: () => repo.groupAudit(groupId as number, scoped, before, limit),
        enabled: me !== null && groupId !== null,
        // Only the newest page is live; older pages are fixed history.
        ...livePage(before),
        placeholderData: (previous, previousQuery) => keepWithinScope(previous, previousQuery, queryKey),
        retry,
    });
}

/** One page of the fleet-wide trail (bot admins only). */
export function useAdminAuditPage(filters: AuditFilters, before?: string, limit = AUDIT_PAGE_SIZE) {
    const { repo, env, me } = useWebHub();
    const queryKey = ['audit', 'admin', env, 'fleet', filters, before ?? null, limit] as const;
    return useQuery<AdminAuditPage>({
        queryKey,
        queryFn: () => repo.adminAudit(filters, before, limit),
        enabled: Boolean(me?.is_bot_admin),
        // Only the newest page is live; older pages are fixed history.
        ...livePage(before),
        placeholderData: (previous, previousQuery) => keepWithinScope(previous, previousQuery, queryKey),
        retry,
    });
}
