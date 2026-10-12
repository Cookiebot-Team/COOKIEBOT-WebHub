'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';
import { CB_ENV_LABELS, envSelectable } from '@/lib/cb/environments';
import { useWebHub } from './WebHubProvider';

export function Screen({ variant = 'paws', children }: { variant?: 'pattern' | 'paws'; children: ReactNode }) {
    return (
        <main
            className={clsx(
                'webhub mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-cover bg-top font-jost text-black',
                variant === 'pattern' ? "bg-[url('/webhub/setup-pattern.jpg')]" : "bg-[#3B3E40] bg-[url('/bg1.jpg')]",
            )}
        >
            {children}
        </main>
    );
}

export function PillButton({ children, icon, onClick, href, tone = 'cream', size = 'md', disabled, className }: {
    children: ReactNode;
    icon?: ReactNode;
    onClick?: () => void;
    href?: string;
    tone?: 'cream' | 'dark' | 'olive' | 'white' | 'charcoal';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
}) {
    const classes = clsx(
        'inline-flex items-center justify-center gap-2 rounded-full text-center font-medium transition-[filter,transform] active:scale-[0.98] enabled:hover:brightness-110 [&_svg]:size-[18px] [&_svg]:shrink-0',
        {
            cream: 'bg-cb-cream-100 text-cb-brown-900',
            dark: 'bg-cb-brown-900 text-white',
            olive: 'bg-cb-olive text-white',
            white: 'bg-white text-cb-brown-900',
            charcoal: 'rounded-lg border border-[#434343] bg-[#2C2C2C] font-inter font-normal text-[#F5F5F5]',
        }[tone],
        { sm: 'min-h-[31px] px-4 text-[15px]', md: 'min-h-[37px] px-5 text-[17px]', lg: 'min-h-[55px] px-8 text-[20px] font-bold' }[size],
        disabled && 'pointer-events-none opacity-40',
        className,
    );
    if (href) {
        const external = href.startsWith('http');
        return (
            <a href={href} className={classes} aria-disabled={disabled} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                {icon}{children}
            </a>
        );
    }
    return <button type="button" onClick={onClick} disabled={disabled} className={classes}>{icon}{children}</button>;
}

export function EnvSelector({ className }: { className?: string }) {
    const t = useTranslations('WebHub.env');
    const { env, envs, setEnv } = useWebHub();
    if (!envSelectable()) return null;
    return (
        <div role="radiogroup" aria-label={t('label')} className={clsx('inline-flex rounded-full bg-cb-brown-900/80 p-0.5 font-inter text-xs font-semibold backdrop-blur', className)}>
            {(['local', 'dev', 'prd'] as const).map((option) => {
                const available = envs.includes(option);
                return (
                    <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={env === option}
                        disabled={!available}
                        title={available ? undefined : t('notConfigured')}
                        onClick={() => setEnv(option)}
                        className={clsx(
                            'whitespace-nowrap rounded-full px-2.5 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-35',
                            env === option ? 'bg-cb-cream-100 text-cb-brown-900' : 'text-cb-cream-100 enabled:hover:bg-white/10',
                        )}
                    >
                        {CB_ENV_LABELS[option]}
                    </button>
                );
            })}
        </div>
    );
}

export function StatusMessage({ children, action }: { children: ReactNode; action?: ReactNode }) {
    return (
        <div className="mx-4 mt-6 flex flex-col items-center gap-3 rounded-[20px] bg-white/85 p-5 text-center text-[17px] shadow-[0_0_32px_rgba(0,0,0,0.2)]">
            {children}
            {action}
        </div>
    );
}

export function Spinner() {
    return <span className="size-8 animate-spin rounded-full border-[3px] border-cb-cream-100 border-t-cb-brown-700" aria-label="loading" />;
}
