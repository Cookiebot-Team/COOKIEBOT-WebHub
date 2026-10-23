// Cookiebot-QA#3: the save bar buttons broke their labels mid-word ("Discar/d", "Sav/e").
import { describe, expect, test } from 'bun:test';
import { SaveBar } from '../ui';
import { classes, find, Locale, MESSAGES, render, text } from './render';

const LONG_GROUP = 'Cookie testing V2.0 with a very long group name that never ends';

const bar = (locale: Locale, saving = false, groupName = LONG_GROUP, floating = true) => render(
    <SaveBar count={1} groupName={groupName} onDiscard={() => {}} onSave={() => {}} saving={saving} floating={floating} />,
    locale,
);

describe('SaveBar buttons keep their label on one line (SAVEBAR-01)', () => {
    for (const locale of Object.keys(MESSAGES) as Locale[]) {
        const v2 = MESSAGES[locale].WebHub.v2;

        test(`${locale}: discard and save are nowrap and do not shrink`, () => {
            const html = bar(locale);
            const discard = find(html, 'savebar-discard');
            const save = find(html, 'savebar-save');
            expect(text(discard)).toBe(v2.discard);
            expect(text(save)).toBe(v2.save);
            for (const button of [discard, save]) {
                expect(classes(button)).toContain('whitespace-nowrap');
                expect(classes(button)).toContain('shrink-0');
            }
        });

        test(`${locale}: saving label stays on one line`, () => {
            const save = find(bar(locale, true), 'savebar-save');
            expect(text(save)).toBe(v2.saving);
            expect(classes(save)).toContain('whitespace-nowrap');
            expect(classes(save)).toContain('shrink-0');
        });
    }

    test('empty group name still renders one-line buttons', () => {
        const html = bar('en', false, '');
        expect(classes(find(html, 'savebar-discard'))).toContain('whitespace-nowrap');
        expect(classes(find(html, 'savebar-save'))).toContain('whitespace-nowrap');
    });
});

describe('SaveBar message wraps and clamps instead of squeezing the buttons (SAVEBAR-02)', () => {
    test('message can shrink and is clamped to 2 lines', () => {
        const message = find(bar('en'), 'savebar-message');
        expect(text(message)).toBe(`1 unsaved change in ${LONG_GROUP}`);
        expect(classes(message)).toContain('min-w-0');
        expect(classes(message)).toContain('line-clamp-2');
    });

    test('container IDs tell the floating bar from the docked one', () => {
        expect(find(bar('en', false, LONG_GROUP, true), 'savebar-floating').tag).toBe('div');
        expect(find(bar('en', false, LONG_GROUP, false), 'savebar-docked').tag).toBe('div');
    });
});
