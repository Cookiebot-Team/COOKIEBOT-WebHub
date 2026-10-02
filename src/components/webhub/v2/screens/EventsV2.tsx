'use client';

import clsx from 'clsx';
import { useLocale, useTranslations } from 'next-intl';
import { useId, useMemo, useState } from 'react';
import { Icon } from '../icons';
import { Shell } from '../Shell';
import { Card, fieldClass, SectionLabel, TextArea } from '../ui';
import { PageIntro } from './common';

// Events are not in the v2 API yet: this is a local draft with a live chat
// preview; nothing is sent.
export default function EventsV2() {
    const t = useTranslations('WebHub.v2');
    const locale = useLocale();
    const nameId = useId();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [day, setDay] = useState(3);

    const days = useMemo(() => {
        const today = new Date();
        return Array.from({ length: 14 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
    }, []);
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const full = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <Shell section="events" title={t('nav.events')}>
            {({ openGroups, wide }) => (
                <>
                    <PageIntro title={t('nav.events')} lead={t('lead.events')} wide={wide} openGroups={openGroups}
                        aside={<span className="rounded-full bg-cb-brown-900 px-2.5 py-1 text-xs font-semibold text-cb-cream-100">{t('publishingSoon')}</span>} />
                    <div className={clsx('grid items-start gap-4', wide && 'lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-5')}>
                        <Card className="flex flex-col gap-4 p-4 lg:p-[22px]">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor={nameId} className="text-[15px] font-semibold">{t('eventName')}</label>
                                <input id={nameId} type="text" value={name} onChange={(e) => setName(e.target.value)}
                                    placeholder={t('placeholder.eventName')} className={clsx(fieldClass, 'h-[46px]')} />
                            </div>
                            <TextArea label={t('eventDescription')} placeholder={t('placeholder.eventDescription')}
                                value={description} onChange={setDescription} rows={4} />
                            <div className="flex flex-col gap-2">
                                <span className="text-[15px] font-semibold">{t('date')}</span>
                                <div className={clsx('-mx-1 flex gap-2 overflow-x-auto px-1 pb-1', wide && 'lg:mx-0 lg:grid lg:grid-cols-7 lg:px-0')}>
                                    {days.map((date, i) => (
                                        <button key={date.toISOString()} type="button" aria-pressed={day === i} onClick={() => setDay(i)}
                                            className={clsx(
                                                'flex h-16 w-[52px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-[14px] border transition-[transform,background-color] active:scale-95 lg:w-auto',
                                                day === i ? 'border-cb-brown-900 bg-cb-brown-900 text-cb-cream-50' : 'border-cb-brown-700/20 bg-white text-cb-brown-900 hover:bg-cb-cream-100/60',
                                            )}>
                                            <span className="text-[11px] uppercase tracking-[0.06em] opacity-80">{weekday.format(date).replace('.', '')}</span>
                                            <span className="text-xl font-semibold">{date.getDate()}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="button" disabled
                                className="flex min-h-[92px] cursor-not-allowed flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-cb-sand bg-cb-cream-100/40 text-sm text-cb-brown-700">
                                <Icon name="photo" className="size-6" />{t('cover')}
                            </button>
                        </Card>

                        <section aria-label={t('preview')} className={clsx('flex animate-cb-rise flex-col gap-3 [animation-delay:60ms]', wide && 'lg:sticky lg:top-[92px]')}>
                            <SectionLabel className="text-cb-cream-100 lg:text-cb-brown-700">{t('preview')}</SectionLabel>
                            <div className="flex min-h-[240px] items-end gap-2.5 rounded-cb-xl bg-[linear-gradient(rgba(42,27,1,.93),rgba(42,27,1,.93)),url('/bg1.jpg')] bg-cover bg-center p-[18px]">
                                <img src="/cookiebot_avatar.jpeg" alt="" className="size-[34px] rounded-full object-cover" />
                                <div className="grow overflow-hidden rounded-[16px_16px_16px_4px] bg-cb-cream-50 shadow-[0_6px_16px_rgba(0,0,0,0.25)]">
                                    <div className="grid h-24 place-items-center bg-cb-cream-200 text-cb-brown-500"><Icon name="photo" className="size-7" /></div>
                                    <div className="flex flex-col gap-1.5 px-3.5 py-3">
                                        <span className="text-[13px] font-semibold text-cb-telegram">Cookiebot</span>
                                        <span className="break-words text-base font-bold">{name || t('previewName')}</span>
                                        <span className="whitespace-pre-line break-words text-sm leading-relaxed text-cb-brown-800">{description || t('previewDescription')}</span>
                                        <span className="flex items-center gap-1.5 text-[13px] text-cb-muted">
                                            <Icon name="calendar" className="size-3.5" />{full.format(days[day])}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button type="button" disabled
                                className="h-[46px] cursor-not-allowed rounded-full bg-cb-brown-900 text-[15px] font-semibold text-cb-cream-50 opacity-50">
                                {t('publish')}
                            </button>
                        </section>
                    </div>
                </>
            )}
        </Shell>
    );
}
