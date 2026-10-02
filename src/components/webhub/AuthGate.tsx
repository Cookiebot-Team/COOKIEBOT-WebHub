'use client';

import { LoginButton } from '@telegram-auth/react';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';
import { runtimeConfig } from '@/lib/runtime-config';
import { EnvSelector, PillButton, Screen, Spinner, StatusMessage } from './ui';
import { useWebHub } from './WebHubProvider';

export function AuthGate({ children, requireGroup = true }: { children: ReactNode; requireGroup?: boolean }) {
    const t = useTranslations('WebHub.auth');
    const tg = useTranslations('WebHub.groups');
    const tc = useTranslations('Common');
    const { status, error, isMiniApp, me, groupId, loginWithWidget, retry } = useWebHub();

    if (status === 'authenticated' && (!requireGroup || groupId !== null)) return <>{children}</>;

    return (
        <Screen variant="pattern">
            <div className="flex justify-center pt-4"><EnvSelector /></div>
            <div className="flex flex-col items-center gap-2 px-6 pt-10 text-center text-cb-brown-900">
                <img src="/cookiebot_avatar.jpeg" alt="" className="size-[68px] rounded-full border border-cb-cream-100 shadow-[0_0_0_1px_#5E410D,0_3px_6px_rgba(0,0,0,0.7)]" />
                <h1 className="mt-3 text-[17px] font-bold">{t('title')}</h1>
            </div>

            {status === 'loading' && <div className="mt-10 flex justify-center"><Spinner /></div>}

            {status === 'error' && (
                <StatusMessage action={<PillButton tone="dark" size="sm" onClick={retry}>{tc('retry')}</PillButton>}>
                    <p>{t(error ?? 'loginFailed')}</p>
                </StatusMessage>
            )}

            {status === 'anonymous' && (
                <StatusMessage>
                    <p>{t(isMiniApp ? 'openInTelegram' : 'prompt')}</p>
                    {error && <p role="alert" className="text-sm text-cb-danger">{t(error)}</p>}
                    <LoginButton
                        botUsername={runtimeConfig().telegramBotUsername}
                        onAuthCallback={loginWithWidget}
                        cornerRadius={20}
                    />
                </StatusMessage>
            )}

            {status === 'authenticated' && me?.groups.length === 0 && (
                <StatusMessage action={<PillButton tone="dark" size="sm" href="https://t.me/CookieMWbot?startgroup=new">{tg('addMe')}</PillButton>}>
                    <p>{tg('empty')}</p>
                </StatusMessage>
            )}
        </Screen>
    );
}
