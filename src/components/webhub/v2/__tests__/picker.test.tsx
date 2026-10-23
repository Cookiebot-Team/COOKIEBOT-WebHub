// TESTID-02: group picker and group chip IDs (spec AC8), incl. negative ids.
import { beforeAll, describe, expect, mock, test } from 'bun:test';
import type { ComponentType } from 'react';
import { attr, find, findAll, render, text } from './render';

const groups = [-1001234567890, -1000, -1001, -1002, -1003].map((group_id, i) => ({
    group_id, title: `Group ${i}`, username: null, chat_type: 'supergroup', role: i === 0 ? 'creator' : 'administrator',
}));
const webhub = { me: { user_id: 1, is_bot_admin: false, groups }, groupId: -1001234567890, setGroupId: () => {} };
mock.module('../../WebHubProvider', () => ({ useWebHub: () => webhub }));

let GroupSheet: ComponentType<{ open: boolean; onClose: () => void }>;
let GroupChip: ComponentType<{ onOpen: () => void }>;
beforeAll(async () => {
    ({ GroupSheet } = await import('../GroupPicker'));
    ({ GroupChip } = await import('../Shell'));
});

describe('group picker (AC8)', () => {
    test('sheet, search, one option per group, add-another', () => {
        const html = render(<GroupSheet open onClose={() => {}} />);
        expect(attr(find(html, 'group-sheet'), 'role')).toBe('dialog');
        expect(attr(find(html, 'group-search'), 'type')).toBe('search');
        for (const g of groups) {
            const option = find(html, `group-option-${g.group_id}`);
            expect(attr(option, 'role')).toBe('option');
            expect(attr(option, 'aria-selected')).toBe(String(g.group_id === webhub.groupId));
        }
        expect(attr(find(html, 'group-add-another'), 'href')).toBe('https://t.me/CookieMWbot?startgroup=new');
    });

    test('negative supergroup id keeps its minus sign', () => {
        expect(findAll(render(<GroupSheet open onClose={() => {}} />), 'group-option--1001234567890')).toHaveLength(1);
    });

    test('closed sheet renders nothing', () => {
        expect(findAll(render(<GroupSheet open={false} onClose={() => {}} />), 'group-sheet')).toHaveLength(0);
    });

    test('group chip shows the managed group', () => {
        const chip = find(render(<GroupChip onOpen={() => {}} />), 'group-chip');
        expect(chip.tag).toBe('button');
        expect(text(chip)).toContain('Group 0');
    });
});
