'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Inside Telegram (signed initData present) the landing page is skipped. */
export function MiniAppRedirect() {
    const router = useRouter();
    useEffect(() => {
        if (window.Telegram?.WebApp?.initData) router.replace('/dashboard');
    }, [router]);
    return null;
}
