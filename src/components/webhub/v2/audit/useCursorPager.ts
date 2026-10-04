'use client';

import { useCallback, useState } from 'react';

/**
 * Keyset pager state: a stack of `before` cursors. Page 1 = empty stack
 * (cursor undefined); Older pushes the page's `next_before`; Newer pops.
 * The stack is dropped whenever `resetKey` changes (filters, group).
 */
export function useCursorPager(resetKey: string) {
    const [state, setState] = useState<{ key: string; stack: string[] }>({ key: resetKey, stack: [] });
    // Adjust state during render (no effect, so no flash of a stale cursor).
    const stack = state.key === resetKey ? state.stack : [];
    if (state.key !== resetKey) setState({ key: resetKey, stack: [] });

    const older = useCallback((cursor: string | null) => {
        if (!cursor) return;
        setState((s) => (s.key === resetKey ? { key: resetKey, stack: [...s.stack, cursor] } : s));
    }, [resetKey]);
    const newer = useCallback(() => {
        setState((s) => (s.key === resetKey ? { key: resetKey, stack: s.stack.slice(0, -1) } : s));
    }, [resetKey]);
    const first = useCallback(() => setState({ key: resetKey, stack: [] }), [resetKey]);

    return {
        before: stack.length ? stack[stack.length - 1] : undefined,
        page: stack.length + 1,
        hasNewer: stack.length > 0,
        older, newer, first,
    };
}
