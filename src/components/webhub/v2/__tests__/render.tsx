// Static-render helpers for `bun test`: no DOM, no layout. Tests read the
// markup and assert on the element a test ID sits on.
import { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import en from '../../../../../messages/en.json';
import es from '../../../../../messages/es.json';
import pt from '../../../../../messages/pt.json';

export const MESSAGES = { en, pt, es } as const;
export type Locale = keyof typeof MESSAGES;

export function render(ui: ReactElement, locale: Locale = 'en'): string {
    return renderToStaticMarkup(
        <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="UTC">{ui}</NextIntlClientProvider>,
    );
}

export type Found = { tag: string; attrs: string; inner: string };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Every element carrying `data-testid="<id>"`, with its own attributes and (non-nested) inner HTML. */
export function findAll(html: string, id: string): Found[] {
    const re = new RegExp(`<([a-z][a-z0-9]*)((?:\\s[^>]*)?\\sdata-testid="${esc(id)}"[^>]*)>`, 'g');
    const out: Found[] = [];
    for (const m of html.matchAll(re)) {
        const start = (m.index ?? 0) + m[0].length;
        const close = html.indexOf(`</${m[1]}>`, start);
        out.push({ tag: m[1], attrs: m[2], inner: close < 0 ? '' : html.slice(start, close) });
    }
    return out;
}

export function find(html: string, id: string): Found {
    const all = findAll(html, id);
    if (all.length !== 1) throw new Error(`expected exactly one [data-testid="${id}"], found ${all.length}`);
    return all[0];
}

export const classes = (f: Found): string[] => (f.attrs.match(/\sclass="([^"]*)"/)?.[1] ?? '').split(/\s+/).filter(Boolean);
export const attr = (f: Found, name: string): string | null => f.attrs.match(new RegExp(`\\s${esc(name)}="([^"]*)"`))?.[1] ?? null;
export const text = (f: Found): string => f.inner.replace(/<[^>]+>/g, '');
