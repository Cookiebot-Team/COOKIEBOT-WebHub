# Validation: Save-bar wrap fix + QA test IDs - PASS

**Verdict**: PASS

**Date**: 2026-10-11
**Spec**: `.specs/features/savebar-wrap-and-testids/spec.md`
**Diff range**: `team/master..HEAD` (6 commits, c69bb41..1006521), branch `fix/savebar-wrap-and-testids`
**Verifier**: independent sub-agent (author != verifier)

Test paths below are relative to `src/components/webhub/v2/` (`__tests__/...`) unless they start with `src/` or `docs/`.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | Done | Save-bar classes plus `bun test` script |
| T2 | Done | Registry and primitives; toast ID has no unit test (see Gaps) |
| T3 | Done | Picker is unit-tested; Shell, nav and home are checked in the browser (author's check) |
| T4 | Done | Settings screens pass keys (browser, per matrix) |
| T5 | Done | `audit-filter-error` has no unit test (see Gaps) |
| T6 | Done | Every registry value and prefix appears in `docs/testids.md` (checked by script) |

---

## Spec-Anchored Acceptance Criteria

### P1: Save-bar buttons stay readable

| AC | Spec-defined outcome | Evidence (`file:line` + assertion) | Result |
| -- | -------------------- | ---------------------------------- | ------ |
| S1 | Discard and Save have `whitespace-nowrap` and `shrink-0` | `src/components/webhub/v2/__tests__/savebar.test.tsx:23-26`: `expect(classes(button)).toContain('whitespace-nowrap')` / `'shrink-0'` on both buttons, en/pt/es, with label text checked at :21-22. Implementation: `src/components/webhub/v2/ui.tsx:156,160` | PASS |
| S2 | The message wraps and is clamped to 2 lines | `src/components/webhub/v2/__tests__/savebar.test.tsx:48-49`: `toContain('min-w-0')`, `toContain('line-clamp-2')`. Implementation: `src/components/webhub/v2/ui.tsx:155` | PASS |
| S3 | While saving, Save shows the `saving` label on one line | `src/components/webhub/v2/__tests__/savebar.test.tsx:31-33`: `expect(text(save)).toBe(v2.saving)` plus the nowrap and shrink-0 classes | PASS |
| Edge: empty group name | Buttons stay on one line | `src/components/webhub/v2/__tests__/savebar.test.tsx:37-41` | PASS |
| Edge: pt/es labels | Buttons stay on one line | The loop at `src/components/webhub/v2/__tests__/savebar.test.tsx:14` runs over every locale | PASS |

The real wrap behaviour depends on layout and cannot be checked by a static render. The tests check the classes; the author's browser check (scrollHeight 135px before the fix, 40px after) covers the actual layout. The Verifier did not repeat the browser check.

### P1: Stable test IDs

| AC | Spec-defined outcome | Evidence | Result |
| -- | -------------------- | -------- | ------ |
| T1 | `savebar-floating`/`-docked`, `-message`, `-discard`, `-save` | `src/components/webhub/v2/__tests__/savebar.test.tsx:53-54` (containers), :46 (message), :19-20 (buttons) | PASS |
| T2 | `setting-<key>` on the switch button | `src/components/webhub/v2/__tests__/primitives.test.tsx:11-14` (`tag` is `button`, `role` is `switch`), :18. Screen wiring: `src/components/webhub/v2/screens/GeneralV2.tsx` and the other settings screens (browser) | PASS |
| T3 | `slider-<key>` on the range input, `slider-<key>-value` on the badge | `src/components/webhub/v2/__tests__/primitives.test.tsx:30-34` (`type` is `range`; badge text is `'120 s'`) | PASS |
| T4 | `textarea-<key>` and `textarea-<key>-count` | `src/components/webhub/v2/__tests__/primitives.test.tsx:41-43` (`tag` is `textarea`; count is `'3 / 4096'`) | PASS |
| T5 | `toast`, `error-banner`, `stats-error` plus `-retry`/`-signout` | `error-banner`: `src/components/webhub/v2/__tests__/primitives.test.tsx:49-51`. Stats error: `src/components/webhub/v2/__tests__/stats-audit.test.tsx:45-53` (500 shows retry only; 403 shows sign out only). **`toast`**: implemented at `src/components/webhub/v2/ui.tsx:197`, no unit test (it needs runtime state; the author checked it in the browser) | PASS with gap G1 |
| T6 | `screen-<section>` for all 9 sections | Implemented at `src/components/webhub/v2/Shell.tsx:267`, with the `Section` union at `src/components/webhub/v2/Shell.tsx:17` listing all 9. Covered by the browser check, as the matrix assigns | PASS (browser layer) |
| T7 | `nav-<section>` and `tile-<section>` | `src/components/webhub/v2/Shell.tsx:89`, `src/components/webhub/v2/screens/HomeV2.tsx:99` (browser layer) | PASS (browser layer) |
| T8 | Picker IDs, `group-option-<id>` with `aria-selected`, negative ids kept verbatim | `src/components/webhub/v2/__tests__/picker.test.tsx:22-29` (aria-selected compared with the selected group), :33 (`group-option--1001234567890`), :41-43 (chip) | PASS |
| T9 | `range-picker`, `range-<days>`, `kpi-<name>`, `chart-<name>` | `src/components/webhub/v2/__tests__/stats-audit.test.tsx:25-28,32-33,37-38` | PASS (spec gap G3) |
| T10 | Audit IDs (filters, fields, apply/reset/error, list, rows, diff toggle, pager, empty) | `src/components/webhub/v2/__tests__/stats-audit.test.tsx:60-66` (filters), :79-82 (list, rows, toggle), :87-89 (pager). **`audit-filter-error`** (`src/components/webhub/v2/audit/AuditFilters.tsx:96`) has no unit test. **`audit-empty`** is set on screens (`src/components/webhub/v2/screens/AuditV2.tsx:45`, `src/components/webhub/v2/screens/AdminAuditV2.tsx:42`), which is the browser layer | PASS with gap G1 |
| T11 | All IDs live in one module and are documented | `src/components/webhub/v2/testids.ts:5-78`. A Verifier script found every literal and every dynamic prefix in `docs/testids.md` (0 missing) | PASS |
| T12 | No change to text, ARIA attributes or classes beyond the save bar | The Verifier removed every `data-testid` attribute from the old and new versions of every changed v2 source file and diffed them token by token. The only remaining changes are `TID` imports, `testId` props and plumbing, a `section` field on the HomeV2 tile data, a JSX comment, and the save-bar classes (`line-clamp-2 min-w-0`, `shrink-0 whitespace-nowrap` twice) in `src/components/webhub/v2/ui.tsx:155-160`. No ARIA attribute or text changed | PASS |
| Edge: negative group id | Minus sign kept verbatim | `src/components/webhub/v2/__tests__/picker.test.tsx:33` | PASS |

**Status**: All ACs are covered at their matrix layer. 2 IDs reachable only at runtime have no automated evidence (G1), and 2 spec-precision gaps are flagged (G2, G3).

---

## Discrimination Sensor

The Verifier ran these mutants in a scratch `git worktree` at HEAD, with `node_modules` symlinked in, and ran `bun test` after each mutant.

| # | File | Mutation | Result |
| - | ---- | -------- | ------ |
| M1 | `ui.tsx:160` | Drop `whitespace-nowrap` from Save | Killed (7 fail) |
| M2 | `ui.tsx:156` | Drop `shrink-0` from Discard | Killed (3) |
| M3 | `ui.tsx:155` | Drop `line-clamp-2` | Killed (1) |
| M4 | `ui.tsx:155` | Drop `min-w-0` | Killed (1) |
| M5 | `ui.tsx` | Save always shows `save`, never `saving` | Killed (3) |
| M6 | `ui.tsx:148` | Swap the floating and docked container IDs | Killed (1) |
| M7 | `ui.tsx` | Slider value badge gets the wrong ID | Killed (1) |
| M8 | `screens/common.tsx:162-164` | Swap the retry and signout IDs | Killed (2) |
| M9 | `GroupPicker.tsx:43` | Group-option key uses `Math.abs(id)` | Killed (2) |
| M10 | `GroupPicker.tsx:43` | Invert `aria-selected` | Killed (1) |
| M11 | `audit/AuditList.tsx:59` | Remove the audit-row ID | Killed (1) |
| M12 | `ui.tsx` | Switch ID ignores the key | Killed (2) |
| M13 | `ui.tsx` | Remove the textarea count ID | Killed (1) |
| M14 | `screens/common.tsx:136` | `range-<days+1>` | Killed (1) |
| M15 | `audit/AuditPager.tsx:16` | Older button gets the newer ID | Killed (1) |
| M16 | `ui.tsx:197` | Remove the `toast` ID | **Survived** (harness limit, G1) |
| M17 | `audit/AuditFilters.tsx:96` | Remove the `audit-filter-error` ID | **Survived** (harness limit, G1) |
| M18 | `Shell.tsx:267` | Remove the `screen-<section>` ID | Survived (by design: the matrix puts Shell in the browser layer) |

**Result**: PASS - 15/15 mutants on unit-layer code paths were killed. 3 survived on paths the static-render harness cannot reach. The `git status --porcelain` of the real tree matches the baseline taken before the sensor ran, and the worktree has been removed.

---

## Gate Check

- `bun test`: 29 pass, 0 fail, 94 expect() calls, 4 files. Before this feature there was no test suite, so the delta is +29.
- `npm run lint`: no warnings or errors.
- `npx tsc --noEmit -p .`: exit 0.
- `bun run build:static` was not run, at the orchestrator's instruction (it clobbers the dev server's `.next`).

---

## Gaps (ranked)

1. **G1 (Minor)**: `toast` (AC T5) and `audit-filter-error` (AC T10) sit in components the matrix assigns to the unit layer, but no test asserts either ID, and mutants M16 and M17 survived. Both appear only after a state change, which static SSR cannot trigger. The only evidence is the author's browser check. Possible fix: give `AuditFilters` an `initialError` prop, or add a DOM-capable test for the toast. The spec's "no new dependencies" rule constrains the DOM option.
2. **G2 (Spec precision)**: AC T10 says `audit-filter-<field>` without listing the fields. The tests pin action, surface, actor, group, from and to (`src/components/webhub/v2/__tests__/stats-audit.test.tsx:62-64`), but the spec defines no expected set.
3. **G3 (Spec precision)**: AC T9 says `kpi-<name>` and `chart-<name>` without listing the names. The names (messages, joins-leaves, llm-cost, top-groups and others) exist only in screen code and `docs/testids.md`, so a rename would pass every test.
4. **Out of scope, pre-existing on `team/master`**: `src/components/webhub/v2/GroupPicker.tsx:58` calls `t('admin')`, which resolves to an object (`WebHub.v2.admin`). next-intl logs INSUFFICIENT_PATH during the picker tests, and the role label for administrator groups probably renders the fallback key. This should go in a separate ticket.

## Code Quality

Changes are minimal and surgical, and they follow existing patterns (an optional `testId` prop, IDs built through `TID`). No scope creep. Every test maps to a spec AC or edge case. Guidelines: none documented; strong defaults applied.

## Summary

**Overall**: Ready. The bug fix is fully discriminated. Test-ID coverage matches the matrix, apart from G1.
