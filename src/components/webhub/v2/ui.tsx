'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { createContext, ReactNode, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { groupTone, initials } from '@/lib/design/tokens';
import { Icon } from './icons';

export function Card({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: 0 | 1 | 2 }) {
    return (
        <section className={clsx(
            'animate-cb-rise rounded-cb-xl bg-cb-cream-50 shadow-cb-card',
            delay === 1 && '[animation-delay:60ms]',
            delay === 2 && '[animation-delay:120ms]',
            className,
        )}>
            {children}
        </section>
    );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
    return <h2 className={clsx('m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-cb-brown-500', className)}>{children}</h2>;
}

export function Soon() {
    const t = useTranslations('WebHub.v2');
    return (
        <span className="whitespace-nowrap rounded-full bg-cb-cream-100 px-2 py-0.5 text-[11px] font-semibold text-cb-brown-700">{t('soon')}</span>
    );
}

export function GroupAvatar({ id, name, size = 'md' }: { id: number; name: string; size?: 'sm' | 'md' | 'lg' }) {
    return (
        <span
            style={{ backgroundColor: groupTone(id) }}
            className={clsx(
                'grid shrink-0 place-items-center font-bold text-cb-cream-50 shadow-[inset_0_0_0_1px_rgba(255,233,201,0.35)]',
                { sm: 'size-[22px] rounded-[7px] text-[10px]', md: 'size-10 rounded-cb-md text-sm', lg: 'size-[52px] rounded-[16px] text-lg' }[size],
            )}
        >
            {initials(name)}
        </span>
    );
}

export function Switch({ checked, onChange, label, disabled }: {
    checked: boolean; onChange?: (value: boolean) => void; label: string; disabled?: boolean;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            className={clsx(
                'h-8 w-[52px] shrink-0 rounded-full p-1 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45',
                checked ? 'bg-cb-brown-700' : 'bg-cb-line',
            )}
        >
            <span className={clsx(
                'block size-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform duration-200 ease-[cubic-bezier(.3,1.4,.5,1)]',
                checked && 'translate-x-5',
            )} />
        </button>
    );
}

export function SwitchRow({ label, hint, checked, onChange, disabled, badge, first }: {
    label: string; hint: string; checked: boolean; onChange?: (value: boolean) => void;
    disabled?: boolean; badge?: ReactNode; first?: boolean;
}) {
    return (
        <div className={clsx('flex items-center gap-3.5 px-4 py-3.5 lg:px-[22px]', !first && 'border-t border-cb-brown-700/10')}>
            <div className="flex grow flex-col gap-0.5">
                <span className="flex items-center gap-2 text-base font-medium">{label}{badge}</span>
                <span className="text-[13px] leading-snug text-cb-muted">{hint}</span>
            </div>
            <Switch checked={checked} onChange={onChange} label={label} disabled={disabled} />
        </div>
    );
}

export function SliderCard({ label, hint, value, min, max, unit, onChange, disabled, delay }: {
    label: string; hint: string; value: number; min: number; max: number; unit?: string;
    onChange: (value: number) => void; disabled?: boolean; delay?: 0 | 1 | 2;
}) {
    const id = useId();
    return (
        <Card delay={delay} className="flex flex-col gap-2 p-4 lg:p-5">
            <div className="flex items-center justify-between gap-2">
                <label htmlFor={id} className="text-base font-semibold">{label}</label>
                <span className="rounded-full bg-cb-brown-900 px-2.5 py-1 text-sm font-semibold tabular-nums text-cb-cream-100">
                    {value}{unit ? ` ${unit}` : ''}
                </span>
            </div>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                value={Math.min(Math.max(value, min), max)}
                disabled={disabled}
                onChange={(e) => onChange(Number(e.target.value))}
                className="h-7 w-full cursor-pointer accent-cb-brown-700 disabled:cursor-not-allowed disabled:opacity-45"
            />
            <div className="flex justify-between text-xs tabular-nums text-cb-brown-500"><span>{min}</span><span>{max}</span></div>
            <p className="m-0 text-[13px] leading-snug text-cb-muted lg:text-sm">{hint}</p>
        </Card>
    );
}

export const fieldClass = 'w-full rounded-cb-md border border-cb-line bg-white px-3 font-[inherit] text-[15px] text-cb-brown-900 transition-[border-color,box-shadow] duration-150 placeholder:text-cb-muted/70 focus:border-cb-brown-700 focus:outline-none focus:ring-[3px] focus:ring-cb-brown-700/20 disabled:opacity-60';

export function TextArea({ label, placeholder, value, onChange, maxLength, rows = 3 }: {
    label: string; placeholder: string; value: string; onChange: (value: string) => void; maxLength?: number; rows?: number;
}) {
    const id = useId();
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-[15px] font-semibold">{label}</label>
            <textarea id={id} rows={rows} value={value} maxLength={maxLength} placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)} className={clsx(fieldClass, 'resize-y py-3')} />
            {maxLength && <span className="self-end text-xs tabular-nums text-cb-brown-500">{value.length} / {maxLength}</span>}
        </div>
    );
}

export function SaveBar({ count, groupName, onDiscard, onSave, saving, floating }: {
    count: number; groupName: string; onDiscard: () => void; onSave: () => void; saving: boolean; floating: boolean;
}) {
    const t = useTranslations('WebHub.v2');
    if (count === 0) return null;
    return (
        <div className={clsx(
            'z-20 flex animate-cb-bar items-center gap-2 rounded-cb-lg bg-cb-brown-900 py-2.5 pl-4 pr-2.5 text-cb-cream-50 shadow-cb-float',
            floating ? 'fixed inset-x-3 bottom-4 lg:hidden' : 'sticky bottom-6 mx-auto hidden w-full max-w-[640px] lg:flex',
        )}>
            <span className="size-2 shrink-0 rounded-full bg-cb-warning" />
            <span className="grow text-sm lg:text-[15px]">{t('unsaved', { count, group: groupName })}</span>
            <button type="button" onClick={onDiscard} disabled={saving}
                className="h-10 rounded-cb-md px-3.5 text-[15px] text-cb-cream-100 hover:bg-white/10">
                {t('discard')}
            </button>
            <button type="button" onClick={onSave} disabled={saving}
                className="h-10 rounded-cb-md bg-cb-cream-100 px-5 text-[15px] font-semibold text-cb-brown-900 transition-transform active:scale-[0.97] disabled:opacity-60">
                {saving ? t('saving') : t('save')}
            </button>
        </div>
    );
}

export function ErrorBanner({ error }: { error: { status: number; detail: string } | null }) {
    const t = useTranslations('WebHub');
    if (!error) return null;
    const message = error.status === 404 ? t('groups.notAdmin') : error.status === 0 ? t('auth.networkError') : error.detail;
    return (
        <div role="alert" className="flex animate-cb-fade items-center gap-2 rounded-cb-md bg-cb-danger px-4 py-2.5 text-sm text-white">
            <Icon name="error" className="size-[18px] shrink-0" />{message}
        </div>
    );
}

// ---------------------------------------------------------------- toasts

const ToastContext = createContext<(message: string) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [message, setMessage] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout>>();
    const show = useCallback((next: string) => {
        setMessage(next);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setMessage(null), 2400);
    }, []);
    useEffect(() => () => clearTimeout(timer.current), []);

    return (
        <ToastContext.Provider value={show}>
            {children}
            <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-16 z-[70] flex justify-center font-jost lg:justify-end lg:px-10">
                {message && (
                    <div key={message} role="status"
                        className="flex animate-cb-pop items-center gap-2 rounded-full bg-cb-brown-900 px-4 py-2.5 text-sm text-cb-cream-50 shadow-cb-float lg:rounded-cb-md">
                        <Icon name="check" className="size-[18px] text-cb-cream-100" />{message}
                    </div>
                )}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
