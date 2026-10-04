'use client';

import clsx from 'clsx';
import { ChevronLeftIcon, ChevronRightIcon, MegaphoneIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { WipNotice } from '../v2/screens/common';
import { ComingSoon, PillButton, TextField } from '../ui';
import { SettingsFrame } from './SettingsFrame';

function Calendar({ value, onChange }: { value: Date | null; onChange: (d: Date) => void }) {
    const locale = useLocale();
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    const weekdays = useMemo(() => {
        const format = new Intl.DateTimeFormat(locale, { weekday: 'short' });
        return Array.from({ length: 7 }, (_, i) => format.format(new Date(2024, 8, 1 + i)).slice(0, 3).toUpperCase());
    }, [locale]);

    const cells = useMemo(() => {
        const start = new Date(month);
        start.setDate(1 - start.getDay());
        return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }, [month]);

    const shift = (delta: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
    const same = (a: Date | null, b: Date) => a?.toDateString() === b.toDateString();

    return (
        <div className="mx-auto w-[282px] max-w-full font-[Roboto,var(--font-inter)] text-sm">
            <div className="flex h-[25px] items-center justify-between">
                <button type="button" aria-label="previous month" onClick={() => shift(-1)}><ChevronLeftIcon className="size-4" /></button>
                <span className="inline-block first-letter:uppercase">{new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(month)}</span>
                <button type="button" aria-label="next month" onClick={() => shift(1)}><ChevronRightIcon className="size-4" /></button>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-y-3 text-center">
                {weekdays.map((d) => <span key={d} className="text-xs text-cb-gray-600">{d}</span>)}
                {cells.map((day) => (
                    <button key={day.toISOString()} type="button" onClick={() => onChange(day)}
                        className={clsx(
                            'mx-auto grid size-[30px] place-items-center rounded-full text-cb-slate-900',
                            day.getMonth() !== month.getMonth() && 'opacity-50',
                            same(value, day) ? 'bg-[#18A0FB] text-white' : 'hover:bg-cb-cream-100',
                        )}>
                        {day.getDate()}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function EventsScreen() {
    const t = useTranslations('WebHub.events');
    // Events are not in v2 yet: the form is local only and nothing is sent.
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState<Date | null>(null);

    return (
        <SettingsFrame title={t('title')} loading={false} error={null} showReset={false}
            footer={(
                <>
                    <ComingSoon />
                    <PillButton tone="cream" size="sm" icon={<MegaphoneIcon />} disabled className="w-full max-w-[289px]">{t('save')}</PillButton>
                    <PillButton tone="white" size="sm" icon={<TrashIcon />} disabled className="w-full max-w-[289px]">{t('delete')}</PillButton>
                </>
            )}>
            <div className="mx-4"><WipNotice /></div>
            <TextField label={t('name')} placeholder={t('namePlaceholder')} value={name} onChange={setName} rows={1} />
            <TextField label={t('description')} placeholder={t('descriptionPlaceholder')} value={description} onChange={setDescription} />
            <div className="relative mx-4 pt-2">
                <span className="absolute left-3 top-0 z-10 rounded-sm bg-cb-cream-100 px-1 font-inter text-xs text-cb-brown-700">{t('date')}</span>
                <div className="rounded-[9px] bg-white px-2 py-3"><Calendar value={date} onChange={setDate} /></div>
            </div>
            <PillButton tone="charcoal" icon={<PhotoIcon />} disabled className="mx-4">{t('cover')}</PillButton>
        </SettingsFrame>
    );
}
