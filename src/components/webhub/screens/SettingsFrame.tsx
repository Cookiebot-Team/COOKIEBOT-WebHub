'use client';

import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ReactNode, useCallback } from 'react';
import { AuthGate } from '../AuthGate';
import { ComingSoon, NavBar, PillButton, Screen, Spinner } from '../ui';

// Shared shell for the settings screens: nav bar, load/error states and the
// "Reset Current Settings to Default" footer (v2 has no reset endpoint yet).
export function SettingsFrame({ title, loading, error, onDone, saving, children, footer, showReset = true }: {
    title: string;
    loading: boolean;
    error: { status: number; detail: string } | null;
    onDone?: () => void;
    saving?: boolean;
    children: ReactNode;
    footer?: ReactNode;
    showReset?: boolean;
}) {
    const t = useTranslations('WebHub');
    const router = useRouter();
    const cancel = useCallback(() => router.push('/dashboard'), [router]);

    const message = error && (
        error.status === 404 ? t('groups.notAdmin') : error.status === 0 ? t('auth.networkError') : error.detail
    );

    return (
        <AuthGate>
            <Screen>
                <NavBar title={title} onCancel={cancel} onDone={onDone} doneDisabled={loading || saving} />
                {error && <div role="alert" className="mx-4 mt-4 rounded-lg bg-cb-danger px-4 py-2 text-center text-sm text-white">{message}</div>}
                {loading && !error ? (
                    <div className="mt-16 flex justify-center"><Spinner /></div>
                ) : loading ? null : (
                    <div className="flex flex-1 flex-col gap-[18px] pb-8 pt-[43px]">{children}</div>
                )}
                <div className="mt-auto flex flex-col items-center gap-2 pb-[max(env(safe-area-inset-bottom),52px)]">
                    {footer}
                    {showReset && (
                        <>
                            <PillButton tone="cream" size="sm" icon={<ArrowPathIcon />} disabled className="w-[289px]">{t('resetDefaults')}</PillButton>
                            <ComingSoon />
                        </>
                    )}
                </div>
            </Screen>
        </AuthGate>
    );
}
