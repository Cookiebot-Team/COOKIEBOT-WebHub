import type { Query } from '@tanstack/react-query';

export const STATS_REFRESH_MS = 30_000;

// Keep the previous data on screen while a refetch of the SAME key runs; a
// different key (other range/group/env) starts clean so stale numbers never
// show under a new range.
export function keepIfSameKey<T>(previous: T | undefined, previousQuery: Query<T, Error, T> | undefined, key: readonly unknown[]) {
    if (!previousQuery) return undefined;
    const prev = previousQuery.queryKey;
    return prev.length === key.length && prev.every((v, i) => v === key[i]) ? previous : undefined;
}

export const liveOptions = {
    refetchInterval: STATS_REFRESH_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
} as const;
