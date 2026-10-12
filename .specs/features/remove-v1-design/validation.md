# Validation: remove-v1-design: PASS

**Result**: PASS
**Date**: 2026-10-11
**Spec**: `.specs/features/remove-v1-design/spec.md`
**Diff range**: HEAD~2..HEAD (a40cd88..994d8c6; c6e6bf2 feature + 994d8c6 verifier fix)
**Iteration**: 2 (re-verify after fix commit 994d8c6)
**Verifier**: independent sub-agent (author != verifier)

---

## Task Completion

No `tasks.md` for this feature (single-commit change). The whole diff is in c6e6bf2.

---

## Spec-Anchored Acceptance Criteria

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| AC1: 5 dashboard routes render v2 | `/dashboard`->HomeV2, general->GeneralV2, moderation->ModerationV2, posts->PostsV2, events->EventsV2 | `src/app/__tests__/dashboard-routes.test.tsx:19` - `expect(page.default().type).toBe(v2.default)` over ROUTES at `:6-12`; source `src/app/dashboard/page.tsx:4`, `general/page.tsx:4`, `moderation/page.tsx:4`, `posts/page.tsx:4`, `events/page.tsx:4` | PASS |
| AC2: no design switcher on any dashboard route | switcher not rendered | `dashboard-routes.test.tsx:56-57` - renders `DashboardLayout`, `expect(html).not.toContain('role="radiogroup"')`, `expect(html).not.toMatch(/>V1</)`; plus `:44` DesignProvider deleted and 0 grep hits for switcher code. M6/M6b killed | PASS |
| AC3: `/dashboard/moderation/bans` redirects to `/dashboard/moderation` | redirect target `/dashboard/moderation` | `dashboard-routes.test.tsx:29` - `expect(String(thrown.digest)).toContain(';/dashboard/moderation;')`; source `src/app/dashboard/moderation/bans/page.tsx:5` | PASS |
| AC4: runtime config has no `designSwitcher`/`designDefault`; server does not read `DESIGN_*` | keys absent even with env set | `dashboard-routes.test.tsx:35-37` - `resolveConfig({DESIGN_SWITCHER:'true',DESIGN_DEFAULT:'v1'}).toScript()` `not.toContain('designSwitcher')` / `('designDefault')`; `src/lib/runtime-config.ts:6-20` has no design fields; `src/lib/cb/server-config.ts` has no `DESIGN_` read (grep) | PASS |
| AC5: v1 screens dir and DesignProvider gone | paths absent | `dashboard-routes.test.tsx:41-42` - `existsSync(...screens)).toBe(false)`, `existsSync(...DesignProvider.tsx)).toBe(false)` | PASS |
| AC6: dashboard keeps the toast provider | ToastProvider wraps dashboard children | `dashboard-routes.test.tsx:53,55` - `expect(html).toContain('<p id="screen">screen</p>')` and `expect(html).toMatch(/<div aria-live="polite" class="pointer-events-none fixed[^"]*">/)` (ToastProvider live region, `src/components/webhub/v2/ui.tsx:195`); source `src/app/dashboard/layout.tsx:12`. M5 killed | PASS |
| Edge: `cb.design=v1` / `?design=v1` still render v2 | v2 rendered | Pages render V2 unconditionally (AC1 evidence, test `:19`); nothing reads `cb.design` or `design` query (grep: 0 hits in `src/`) | PASS (structural) |

**Status**: 6/6 ACs + edge case covered.

### Removal safety (nothing still used was deleted)

- `src/components/webhub/ui.tsx` keeps `Screen`, `PillButton`, `EnvSelector`, `StatusMessage`, `Spinner` (`ui.tsx:9,22,56,86,95`) - exactly what `src/components/webhub/AuthGate.tsx:7` imports. Removed NavBar/Panel/SettingRow/Checkbox/Switch/SliderField/TextField/ComingSoon have no remaining importers (v2 imports its own `v2/ui`). `tsc --noEmit` clean.
- `stayOnSave` removed from `src/components/webhub/useGroupConfig.ts:11`; all 3 callers updated (`GeneralV2.tsx:15`, `ModerationV2.tsx:15`, `PostsV2.tsx:12`); save now always `setConfig(saved)` (`useGroupConfig.ts:61`) and never navigates - matches the previous v2 behaviour.
- i18n: `WebHub.design` removed from en/pt/es; all three parse (`json.load` OK); flattened-key diff of es.json vs HEAD~1 = only `WebHub.design.label` removed, no other key or value changed. No code references `WebHub.design`.

---

## Discrimination Sensor

### Iteration 2 (HEAD = 994d8c6)

Scratch: `git worktree` at scratchpad/wt2 (node_modules symlinked), removed afterwards. Real tree `git status --porcelain` identical to the pre-sensor baseline.

| # | File | Mutation | Killed? |
| - | ---- | -------- | ------- |
| M1 | `src/app/dashboard/events/page.tsx:4` | route renders GeneralV2 instead of EventsV2 | Killed (37 pass / 1 fail) |
| M2 | `src/app/dashboard/moderation/bans/page.tsx:5` | redirect to `/dashboard` | Killed (37/1) |
| M3 | `src/lib/cb/server-config.ts` toScript | re-add `designSwitcher: true` | Killed (37/1) |
| M4 | `src/components/webhub/screens/` | recreate dir with a screen file | Killed (37/1) |
| M5 | `src/app/dashboard/layout.tsx:12` | drop `<ToastProvider>` wrapper | Killed (37/1) |
| M6 | `src/app/dashboard/layout.tsx:12` | render a `DESIGN V1 V2` radiogroup next to children | Killed (37/1) |
| M6b | `src/app/dashboard/layout.tsx:12` | switcher without role: `<button>V1</button><button>V2</button>` | Killed (37/1) |

**Sensor depth**: lightweight. **Result**: 7/7 killed - PASS.

### Iteration 1 (HEAD = c6e6bf2) - superseded

M1-M4 killed; M5 (drop ToastProvider) and M6 (switcher markup in layout) survived; M7 (navigate to `/dashboard` after save, `useGroupConfig.ts:61`) survived - informational, not a spec AC, still untested.

---

## Gate Check

- `bun test` (HEAD 994d8c6): 38 pass, 0 fail (feature adds 9 tests in `src/app/__tests__/dashboard-routes.test.tsx`; no tests deleted).
- `npm run lint`: no ESLint warnings or errors.
- `npx tsc --noEmit -p .`: exit 0.
- `bun run build:static` (iteration 1, scratch worktree on c6e6bf2): exit 0, 16/16 static pages, no "couldn't be rendered statically" errors. 994d8c6 touches only the test file and es.json line endings, so it was not rebuilt. `/dashboard/moderation/bans` exports as an error-shell page carrying `NEXT_REDIRECT;replace;/dashboard/moderation;307`; the redirect runs client-side. Author reports a browser check (http.server over `out/`) landing on `/dashboard/moderation`. The Verifier did not reproduce that in a browser.

---

## Code Quality

| Check | Status |
| ----- | ------ |
| Minimum code / surgical | Mostly - see gap 3 (es.json line endings) |
| No scope creep | OK (removal of stale "v2 design only" comments is in-scope cleanup) |
| Matches patterns | OK |
| Spec-anchored asserted values | OK for AC1/3/4/5 |
| Every test maps to an AC | OK (NOV1-01/02/03) |

---

## Gaps (ranked)

Iteration 1 gaps, all resolved in 994d8c6:

1. AC6 had no test evidence (M5): resolved, `dashboard-routes.test.tsx:55`.
2. AC2 was only structurally covered (M6): resolved, `dashboard-routes.test.tsx:56-57`.
3. es.json CRLF -> LF churn: resolved. `git diff HEAD~2 HEAD -- messages/es.json` is 3 deletions (only `WebHub.design`). es.json is CRLF again and parses.
4. Bans redirect is client-side in the static export. The author checked it in a browser; the Verifier did not reproduce it. Confirm during UAT.

Remaining, non-blocking:

- The "save stays on screen" behaviour of `useGroupConfig` (M7) is not tested. It is not a spec AC.
- The test's `mock.module('@/components/webhub/WebHubProvider')` is process-global in bun. The suite passes, but a later test that needs the real provider could be affected.

## Requirement Traceability Update

| Requirement | New Status |
| ----------- | ---------- |
| NOV1-01 (AC1, AC2, AC6, edge) | Verified |
| NOV1-02 (AC3) | Verified |
| NOV1-03 (AC4, AC5) | Verified |
