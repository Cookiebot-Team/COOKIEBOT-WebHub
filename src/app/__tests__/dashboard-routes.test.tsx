// remove-v1-design: every dashboard route is the v2 screen; no design settings.
import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { resolveConfig } from '@/lib/cb/server-config';

const ROUTES: [string, string][] = [
    ['dashboard/page', 'HomeV2'],
    ['dashboard/general/page', 'GeneralV2'],
    ['dashboard/moderation/page', 'ModerationV2'],
    ['dashboard/posts/page', 'PostsV2'],
    ['dashboard/events/page', 'EventsV2'],
];

describe('dashboard routes render v2 (NOV1-01)', () => {
    for (const [route, screen] of ROUTES) {
        test(`/${route.replace(/\/?page$/, '')} -> ${screen}`, async () => {
            const page = await import(`../${route}`);
            const v2 = await import(`@/components/webhub/v2/screens/${screen}`);
            expect(page.default().type).toBe(v2.default);
        });
    }
});

describe('v1 ban log route redirects to moderation (NOV1-02)', () => {
    test('/dashboard/moderation/bans', async () => {
        const page = await import('../dashboard/moderation/bans/page');
        let thrown: unknown;
        try { page.default(); } catch (e) { thrown = e; }
        expect(String((thrown as { digest?: string })?.digest)).toContain(';/dashboard/moderation;');
    });
});

describe('design settings and v1 code are gone (NOV1-03)', () => {
    test('runtime config script carries no design keys, even with DESIGN_* set', () => {
        const script = resolveConfig({ DESIGN_SWITCHER: 'true', DESIGN_DEFAULT: 'v1' }, false).toScript();
        expect(script).not.toContain('designSwitcher');
        expect(script).not.toContain('designDefault');
    });

    test('v1 screens and the design provider are deleted', () => {
        expect(existsSync('src/components/webhub/screens')).toBe(false);
        expect(existsSync('src/components/webhub/design/DesignProvider.tsx')).toBe(false);
    });
});
