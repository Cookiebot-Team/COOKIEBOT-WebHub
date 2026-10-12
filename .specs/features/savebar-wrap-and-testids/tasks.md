# Save-bar wrap fix + QA test IDs Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path.

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Spec**: `.specs/features/savebar-wrap-and-testids/spec.md`
**Design**: inline (no new architecture: one registry module + optional `testId` props on existing primitives)
**Branch**: `fix/savebar-wrap-and-testids` (from `team/master`)
**Status**: In Progress

---

## Test Coverage Matrix

| Layer | Test type | Location | Coverage expectation |
| ----- | --------- | -------- | -------------------- |
| UI primitives (`v2/ui.tsx`, `v2/screens/common.tsx`, `v2/audit/*`) | unit (static render via `react-dom/server` + `NextIntlClientProvider`) | `src/components/webhub/v2/__tests__/*.test.tsx` | 1:1 with spec ACs: every ID asserted on the element it must sit on; save-bar classes asserted |
| Screens / Shell (need router, auth, query client) | build + manual browser check | n/a | IDs present on each screen (`querySelectorAll('[data-testid]')`), no visual change |
| Docs | none | `docs/testids.md` | lists every ID in `testids.ts` |

Guideline: no prior test suite in this repo; strong defaults applied (Bun test runner, files under `__tests__`).

## Gate Check Commands

| Level | Command |
| ----- | ------- |
| quick | `bun test` |
| full | `bun test` |
| build | `bun test && npm run lint && bun run build:static` |

---

## Execution Plan

### Phase 1: Bug fix, then test IDs

Linear: each task builds on the registry and primitives from the one before.

```
T1 → T2 → T3 → T4 → T5 → T6
```

---

## Task Breakdown

### T1: Save bar keeps button labels on one line (Cookiebot-QA#3)

**What**: Add the `bun test` script and the first test; fix `SaveBar` so buttons are `shrink-0 whitespace-nowrap` and the message is `min-w-0 line-clamp-2`.
**Where**: `package.json`, `src/components/webhub/v2/ui.tsx`, `src/components/webhub/v2/__tests__/render.tsx`, `src/components/webhub/v2/__tests__/savebar.test.tsx`
**Depends on**: None
**Reuses**: `SaveBar` in `v2/ui.tsx`, `messages/{en,pt,es}.json`
**Requirement**: SAVEBAR-01, SAVEBAR-02

**Done when**:

- [x] Discard and Save buttons carry `whitespace-nowrap` and `shrink-0` (en, pt, es; saving state too)
- [x] Message span carries `min-w-0` and `line-clamp-2`
- [x] Gate check passes: `bun test && npm run lint && bun run build:static`

**Tests**: unit
**Gate**: build

---

### T2: Test-ID registry + primitives

**What**: Create `testids.ts`; add IDs to `SaveBar`, `Switch`/`SwitchRow`, `SliderCard`, `TextArea`, `ErrorBanner`, toast (optional `testId` prop where a key is needed).
**Where**: `src/components/webhub/v2/testids.ts`, `src/components/webhub/v2/ui.tsx`, `src/components/webhub/v2/__tests__/primitives.test.tsx`
**Depends on**: T1
**Reuses**: existing primitive props
**Requirement**: TESTID-01

**Done when**:

- [ ] Spec AC1-5 IDs asserted on the right element by tests
- [ ] Rendering without a `testId` prop leaves markup unchanged apart from the always-on IDs
- [ ] Gate check passes: `bun test`

**Tests**: unit
**Gate**: quick

---

### T3: Shell, nav, home tiles, group picker

**What**: `screen-<section>`, `nav-<section>`, `tile-<section>`, header/sidebar/group IDs, language + sign-out buttons.
**Where**: `src/components/webhub/v2/Shell.tsx`, `src/components/webhub/v2/GroupPicker.tsx`, `src/components/webhub/v2/screens/HomeV2.tsx`, `src/components/webhub/v2/testids.ts`, `src/components/webhub/v2/__tests__/picker.test.tsx`
**Depends on**: T2
**Reuses**: `NAV`, `ADMIN_NAV`, `COMMUNITY` arrays
**Requirement**: TESTID-02

**Done when**:

- [ ] Group picker IDs asserted by test (`GroupList` rendered with a stub `WebHubProvider` context), incl. negative group id
- [ ] Shell/nav/home IDs verified in browser
- [ ] Gate check passes: `bun test`

**Tests**: unit
**Gate**: quick

---

### T4: Settings screens pass config keys

**What**: General, Moderation, Posts pass `testId` = config key to `SwitchRow`, `SliderCard`, `TextArea`; moderation audit link + soon rows get IDs.
**Where**: `src/components/webhub/v2/screens/GeneralV2.tsx`, `src/components/webhub/v2/screens/ModerationV2.tsx`, `src/components/webhub/v2/screens/PostsV2.tsx`
**Depends on**: T3
**Reuses**: config keys from `useGroupConfig`
**Requirement**: TESTID-03

**Done when**:

- [ ] Every switch/slider/textarea on the three screens has its key-based ID (browser check)
- [ ] Gate check passes: `bun test && npm run lint && bun run build:static`

**Tests**: none
**Gate**: build

---

### T5: Stats, audit, admin, events

**What**: IDs on `RangePicker`, `KpiTile`, `ChartCard`, `StatsError`, `LiveStamp`, empty states, `AuditFilters`, `AuditList`, `AuditPager`, events form; screens pass KPI/chart names.
**Where**: `src/components/webhub/v2/screens/common.tsx`, `src/components/webhub/v2/audit/AuditFilters.tsx`, `src/components/webhub/v2/audit/AuditList.tsx`, `src/components/webhub/v2/audit/AuditPager.tsx`, `src/components/webhub/v2/screens/{StatsV2,AuditV2,AdminStatsV2,AdminAuditV2,EventsV2}.tsx`, `src/components/webhub/v2/testids.ts`, `src/components/webhub/v2/__tests__/stats-audit.test.tsx`
**Depends on**: T4
**Reuses**: `RANGES`, `AUDIT_*` constants
**Requirement**: TESTID-04

**Done when**:

- [ ] Spec AC9-10 IDs asserted by tests on common + audit components
- [ ] Gate check passes: `bun test`

**Tests**: unit
**Gate**: quick

---

### T6: QA doc

**What**: `docs/testids.md`: convention, scoping rule for duplicated components, full ID table per screen, Playwright examples.
**Where**: `docs/testids.md`
**Depends on**: T5
**Reuses**: `testids.ts`
**Requirement**: TESTID-05

**Done when**:

- [ ] Every ID in `testids.ts` appears in the doc
- [ ] Gate check passes: `bun test && npm run lint && bun run build:static`

**Tests**: none
**Gate**: build
