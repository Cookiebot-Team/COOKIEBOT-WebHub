// TESTID-01: shared primitives carry the IDs from spec AC2-AC5.
import { describe, expect, test } from 'bun:test';
import { ErrorBanner, SliderCard, Switch, SwitchRow, TextArea } from '../ui';
import { attr, find, findAll, render, text } from './render';

const noop = () => {};

describe('settings switch (AC2)', () => {
    test('SwitchRow puts setting-<key> on the switch button', () => {
        const html = render(<SwitchRow label="Block NSFW" hint="h" checked onChange={noop} testId="sfw" />);
        const sw = find(html, 'setting-sfw');
        expect(sw.tag).toBe('button');
        expect(attr(sw, 'role')).toBe('switch');
        expect(attr(sw, 'aria-checked')).toBe('true');
    });

    test('Switch alone accepts the same key', () => {
        const sw = find(render(<Switch checked={false} label="x" testId="functions_fun" />), 'setting-functions_fun');
        expect(attr(sw, 'aria-checked')).toBe('false');
    });

    test('no testId, no data-testid', () => {
        expect(render(<SwitchRow label="l" hint="h" checked={false} />)).not.toContain('data-testid');
    });
});

describe('slider (AC3)', () => {
    test('range input and value badge', () => {
        const html = render(<SliderCard label="Captcha" hint="h" value={120} min={30} max={300} unit="s" onChange={noop} testId="captcha_timeout_seconds" />);
        const input = find(html, 'slider-captcha_timeout_seconds');
        expect(input.tag).toBe('input');
        expect(attr(input, 'type')).toBe('range');
        expect(attr(input, 'value')).toBe('120');
        expect(text(find(html, 'slider-captcha_timeout_seconds-value'))).toBe('120 s');
    });
});

describe('text area (AC4)', () => {
    test('textarea and counter', () => {
        const html = render(<TextArea label="Rules" placeholder="p" value="abc" onChange={noop} maxLength={4096} testId="rules" />);
        const area = find(html, 'textarea-rules');
        expect(area.tag).toBe('textarea');
        expect(text(find(html, 'textarea-rules-count'))).toBe('3 / 4096');
    });
});

describe('error banner (AC5)', () => {
    test('carries error-banner with the message', () => {
        const banner = find(render(<ErrorBanner error={{ status: 500, detail: 'boom' }} />), 'error-banner');
        expect(attr(banner, 'role')).toBe('alert');
        expect(text(banner)).toBe('boom');
    });

    test('absent when there is no error', () => {
        expect(findAll(render(<ErrorBanner error={null} />), 'error-banner')).toHaveLength(0);
    });
});
