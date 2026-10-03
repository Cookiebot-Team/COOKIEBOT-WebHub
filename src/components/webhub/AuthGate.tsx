'use client';

import { LoginButton } from '@telegram-auth/react';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';
import { runtimeConfig } from '@/lib/runtime-config';
import { EnvSelector, PillButton, Screen, Spinner, StatusMessage } from './ui';
import { DesktopAuthBrand } from './DesktopAuthFrame';
import { useWebHub } from './WebHubProvider';

export function AuthGate({ children, requireGroup = true }: { children: ReactNode; requireGroup?: boolean }) {
    const t = useTranslations('WebHub.auth');
    const tg = useTranslations('WebHub.groups');
    const tc = useTranslations('Common');
    const { status, error, isMiniApp, me, groupId, loginWithWidget, retry } = useWebHub();

    if (status === 'authenticated' && (!requireGroup || groupId !== null)) return <>{children}</>;

    const content = (
        <>
            <div className="flex justify-center pt-4"><EnvSelector /></div>
            <div className="flex flex-col items-center gap-2 px-6 pt-10 text-center text-cb-brown-900 lg:pt-0">
                <img src="/cookiebot_avatar.jpeg" alt="" className="size-[68px] rounded-full lg:hidden border border-cb-cream-100 shadow-[0_0_0_1px_#5E410D,0_3px_6px_rgba(0,0,0,0.7)]" />
                <h1 className="mt-3 text-[17px] font-bold lg:mt-0 lg:text-2xl">{t('title')}</h1>
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
        </>
    );

    // Inside the Mini App: the phone layout, unchanged.
    if (isMiniApp) return <Screen variant="pattern">{content}</Screen>;

    // Plain browser: ONE tree (so a single LoginButton mounts). Below lg it is the phone card;
    // at lg: and up CSS turns it into brand panel + centred card.
    return (
        <div className="lg:grid lg:min-h-dvh lg:grid-cols-[minmax(420px,5fr)_7fr]">
            <DesktopAuthBrand />
            <main className="webhub mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[url('/webhub/setup-pattern.jpg')] bg-cover bg-top font-jost text-black lg:mx-0 lg:max-w-none lg:items-center lg:justify-center lg:px-12 lg:py-16">
                <div className="flex w-full flex-col lg:max-w-[460px] lg:[&>div]:mx-0">
                    {content}
                </div>
            </main>
        </div>
    );
}
