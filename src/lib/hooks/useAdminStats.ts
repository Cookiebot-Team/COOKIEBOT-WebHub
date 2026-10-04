'use client';

import { useQuery } from '@tanstack/react-query';
import { useWebHub } from '@/components/webhub/WebHubProvider';
import { CbError } from '@/lib/cb/client';
import type {
    AdminCommandRow, AdminDailyRow, AdminOverview, DateRange, LlmUsage, TopGroupRow,
} from '@/lib/cb/types';

// Each read is its own query so a failing panel does not blank the others.
export function useAdminStats(range: DateRange, topLimit = 10) {
    const { repo, env, me } = useWebHub();
    const enabled = Boolean(me?.is_bot_admin);
    const retry = (n: number, e: unknown) => !(e instanceof CbError && e.status >= 400 && e.status < 500) && n < 2;
    const key = (name: string, ...rest: unknown[]) => ['adminStats', name, env, range.start, range.end, ...rest];

    const overview = useQuery<AdminOverview>({
        queryKey: key('overview'), queryFn: () => repo.adminOverview(range), enabled, retry,
    });
    const daily = useQuery<AdminDailyRow[]>({
        queryKey: key('daily'), queryFn: () => repo.adminDaily(range), enabled, retry,
    });
    const topGroups = useQuery<TopGroupRow[]>({
        queryKey: key('groups', topLimit), queryFn: () => repo.adminTopGroups(range, topLimit), enabled, retry,
    });
    const commands = useQuery<AdminCommandRow[]>({
        queryKey: key('commands'), queryFn: () => repo.adminCommands(range), enabled, retry,
    });
    const llm = useQuery<LlmUsage>({
        queryKey: key('llm'), queryFn: () => repo.adminLlm(range), enabled, retry,
    });

    return { overview, daily, topGroups, commands, llm };
}
