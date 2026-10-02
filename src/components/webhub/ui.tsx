'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ReactNode, useCallback, useEffect, useId } from 'react';
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

export function NavBar({ title, onCancel, onDone, doneDisabled }: {
    title: string;
    onCancel?: () => void;
    onDone?: () => void;
    doneDisabled?: boolean;
}) {
    const t = useTranslations('WebHub.nav');
    const router = useRouter();
    const { isMiniApp } = useWebHub();
    const cancel = useCallback(() => (onCancel ? onCancel() : router.push('/dashboard')), [onCancel, router]);

    // Inside Telegram the native BackButton replaces Cancel.
    useEffect(() => {
        const back = window.Telegram?.WebApp?.BackButton;
        if (!isMiniApp || !back || !onCancel) return;
        back.show();
        back.onClick(cancel);
        return () => { back.offClick(cancel); back.hide(); };
    }, [isMiniApp, onCancel, cancel]);

    return (
        <header className="sticky top-0 z-20 grid h-11 grid-cols-[1fr_auto_1fr] items-center bg-cb-nav px-4 text-[17px] shadow-[0_0.5px_0_#A6A6AA]">
            <span>
                {onCancel && !isMiniApp && (
                    <button type="button" onClick={cancel} className="text-cb-telegram">{t('cancel')}</button>
                )}
            </span>
            <h1 className="truncate text-center font-bold">{title}</h1>
            <span className="text-right">
                {onDone && (
                    <button type="button" onClick={onDone} disabled={doneDisabled} className="font-bold text-cb-telegram disabled:opacity-40">
                        {t('done')}
                    </button>
                )}
            </span>
        </header>
    );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
    return <section className={clsx('mx-[11px] rounded-[5px] border border-cb-cream-100 bg-white', className)}>{children}</section>;
}

export function SettingRow({ label, children, disabled }: { label: ReactNode; children: ReactNode; disabled?: boolean }) {
    return (
        <label className={clsx('flex min-h-11 items-center justify-between gap-3 rounded-[5px] bg-white py-2.5 pl-4 pr-3 text-[17px] leading-snug', disabled && 'opacity-60')}>
            <span>{label}</span>
            {children}
        </label>
    );
}

export function Checkbox({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <span className="relative grid size-10 shrink-0 place-items-center rounded-full has-[:focus-visible]:bg-cb-cream-100">
            <input type="checkbox" className="peer absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
            <span className={clsx('grid size-[18px] place-items-center rounded-[2px]', checked ? 'bg-cb-brown-700' : 'shadow-[inset_0_0_0_2px_#49454F]')}>
                {checked && (
                    <svg viewBox="0 0 12 10" className="h-2.5 w-3 fill-white" aria-hidden><path d="M4 9.4 0 5.4 1.4 4 4 6.6 10.6 0 12 1.4z" /></svg>
                )}
            </span>
        </span>
    );
}

export function Switch({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <span className="relative shrink-0">
            <input type="checkbox" role="switch" className="peer absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
            <span className={clsx(
                'flex h-8 w-[52px] items-center rounded-full px-1 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-cb-brown-900',
                checked ? 'justify-end bg-cb-brown-700' : 'bg-[#E6E0E9] shadow-[inset_0_0_0_2px_#79747E]',
            )}>
                <span className={clsx('rounded-full', checked ? 'size-6 bg-white' : 'ml-1 size-4 bg-[#79747E]')} />
            </span>
        </span>
    );
}

export function SliderField({ label, description, value, min, max, unit, onChange, disabled }: {
    label: string;
    description: string;
    value: number;
    min: number;
    max: number;
    unit?: string;
    onChange: (v: number) => void;
    disabled?: boolean;
}) {
    const id = useId();
    return (
        <div className={clsx('flex flex-col gap-2 px-3 py-2.5', disabled && 'opacity-40')}>
            <div className="flex items-baseline justify-between gap-2 font-inter text-base">
                <label htmlFor={id}>{label}</label>
                <span className="text-sm tabular-nums">{value}{unit ? ` ${unit}` : ''}</span>
            </div>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(Number(e.target.value))}
                className="h-1 w-full cursor-pointer accent-cb-brown-700 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between gap-3 font-inter text-sm leading-snug text-[#757575]">
                <span>{description}</span>
                <span className="shrink-0 tabular-nums">{min}-{max}</span>
            </div>
        </div>
    );
}

export function TextField({ label, placeholder, value, onChange, rows = 3, maxLength, disabled }: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    rows?: number;
    maxLength?: number;
    disabled?: boolean;
}) {
    const id = useId();
    return (
        <div className="relative mx-3 pt-2">
            <label htmlFor={id} className="absolute left-3 top-0 z-10 rounded-sm bg-cb-cream-100 px-1 font-inter text-xs text-cb-brown-700">
                {label}
            </label>
            <textarea
                id={id}
                rows={rows}
                value={value}
                maxLength={maxLength}
                disabled={disabled}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full resize-none rounded border border-[#79747E] bg-white px-4 py-3 text-center font-inter text-base text-black placeholder:text-[#49454F] focus:border-2 focus:border-cb-brown-700 focus:outline-none disabled:opacity-60"
            />
        </div>
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

export function ComingSoon() {
    const t = useTranslations('Common');
    return <span className="rounded-full bg-cb-cream-100 px-2 py-0.5 font-inter text-[11px] font-semibold uppercase tracking-wide text-cb-brown-700">{t('comingSoon')}</span>;
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
