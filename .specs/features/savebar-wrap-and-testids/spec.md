# Save-bar wrap fix + QA test IDs Specification

## Problem Statement

QA reported (Cookiebot-QA#3, V2.0 UAT, 3/3 repro) that the floating "unsaved changes" bar in the Mini App breaks its button labels mid-word ("Discar/d", "Sav/e") once the message gets long (e.g. "1 unsaved change in Cookie testing V2.0"). Separately, QA plans Playwright regressions against the WebHub (`Cookiebot-QA/pages`), but the v2 UI exposes no stable selectors: text changes per locale and Tailwind classes change with every design pass.

## Goals

- [ ] Save-bar buttons never break their label across lines, in any locale, at 320px viewport width and up.
- [ ] Every interactive control and every state QA asserts on in the v2 WebHub carries a stable `data-testid`, documented in one place.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| v1 WebHub screens (`src/components/webhub/screens/*`) | v2 is the UAT target; v1 is being retired |
| Landing page, privacy page, AuthGate / login screen | Not part of the Mini App settings flow QA reported on |
| Writing the Playwright suite in Cookiebot-QA | Separate repo, owned by QA; this feature only provides the selectors |
| Other open QA issues (Cookiebot-QA#1, #2, Group-Bot#57) | Bot-side, not WebHub |
| Chart internals (ECharts canvas) | Canvas content is not DOM-addressable; the chart container gets an ID |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Attribute name | `data-testid` | Playwright `getByTestId` default; no config needed in Cookiebot-QA | n |
| ID format | kebab-case, `<area>-<element>[-<key>]`; dynamic keys use the API value (`setting-sfw`, `group-option--100123`, `nav-general`) | Stable across locales and design passes; keys already exist in the API contract | n |
| Long group name in the save bar | Message text wraps (up to 2 lines) and then truncates; buttons keep full width | Buttons are the action; the message is context | n |
| Duplicated components rendered twice (docked + floating save bar, mobile + desktop headers) | Container IDs differ (`savebar-floating` / `savebar-docked`); children share IDs and are scoped through the container | Playwright strict mode fails on duplicate visible+hidden matches; scoping by container is the documented pattern | n |
| Test harness | `bun test` + `react-dom/server` static render, no new dependencies | Bun already builds the binary; probe confirmed TSX + next-intl render works | n |
| Visual wrap check | Class-level assertion in unit tests + manual browser check at 320/360px in en/pt/es | jsdom/SSR has no layout engine | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Save-bar buttons stay readable ⭐ MVP

**User Story**: As a group admin in the Mini App, I want the Discard/Save buttons to show whole words so that I can tell what each button does.

**Why P1**: Reported UAT bug, 100% repro.

**Acceptance Criteria**:

1. The save bar Discard and Save buttons SHALL keep their label on a single line (`white-space: nowrap`) and SHALL NOT shrink below their content width (`flex-shrink: 0`).  <!-- ubiquitous -->
2. WHILE the save bar message is longer than the remaining width, the save bar SHALL wrap the message text and SHALL clamp it to 2 lines.  <!-- state-driven -->
3. WHEN a save is in progress THEN the Save button SHALL show the `saving` label on a single line.  <!-- event-driven -->

**Independent Test**: Mini App, General settings, toggle "Block NSFW content" in a group with a long name at 360px width: buttons read "Discard" and "Save" on one line each.

---

### P1: Stable test IDs on the v2 WebHub ⭐ MVP

**User Story**: As a QA engineer, I want stable `data-testid` hooks on the v2 WebHub so that Playwright tests survive locale and design changes.

**Why P1**: Asked for with the bug fix; unblocks `Cookiebot-QA/pages`.

**Acceptance Criteria**:

1. The save bar SHALL expose `savebar-floating` or `savebar-docked` on its container, and `savebar-message`, `savebar-discard`, `savebar-save` on its parts.
2. WHEN a settings switch renders for config key `<key>` THEN its switch button SHALL carry `data-testid="setting-<key>"`.
3. WHEN a slider renders for config key `<key>` THEN its range input SHALL carry `data-testid="slider-<key>"` and its value badge SHALL carry `slider-<key>-value`.
4. WHEN a text area renders for text key `<key>` THEN its textarea SHALL carry `textarea-<key>` and its counter SHALL carry `textarea-<key>-count`.
5. The toast SHALL carry `toast`, the error banner SHALL carry `error-banner`, and the stats/audit error card SHALL carry `stats-error` with its action button `stats-error-retry` or `stats-error-signout`.
6. The Shell SHALL mark the content area of every screen with `screen-<section>` (sections: overview, general, moderation, posts, events, stats, audit, admin, adminAudit).
7. Every sidebar nav link SHALL carry `nav-<section>`, every home tile `tile-<section>`.
8. The group picker SHALL expose `group-chip`, `group-sheet`, `group-search`, `group-option-<group_id>` (with `aria-selected`) and `group-add-another`.
9. The range picker SHALL expose `range-picker` and `range-<days>` per option; each KPI tile SHALL expose `kpi-<name>`; each chart card SHALL expose `chart-<name>`.
10. The audit screens SHALL expose `audit-filters`, `audit-filter-<field>`, `audit-filter-apply`, `audit-filter-reset`, `audit-filter-error`, `audit-list`, `audit-row-<id>`, `audit-row-diff-toggle`, `audit-pager-newer`, `audit-pager-older`, `audit-pager-page`, and `audit-empty`.
11. The test-ID values SHALL be defined in one module (`src/components/webhub/v2/testids.ts`) and documented in `docs/testids.md`.
12. Adding test IDs SHALL NOT change any rendered text, ARIA attribute or class list other than the save-bar fix.

**Independent Test**: In a browser, `document.querySelectorAll('[data-testid]')` on each v2 screen lists the IDs from `docs/testids.md`; `bun test` passes.

---

## Edge Cases

- IF the group name is empty (group not resolved yet) THEN the save bar SHALL still render the buttons on one line.
- WHEN the locale is pt or es (longer labels "Descartar", "Salvar"/"Guardar") THEN the buttons SHALL still render on one line.
- IF a group id is negative (Telegram supergroups, `-100…`) THEN `group-option-<group_id>` SHALL keep the minus sign verbatim.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| SAVEBAR-01 | P1: Save-bar buttons (AC1, AC3) | Execute | Implementing |
| SAVEBAR-02 | P1: Save-bar buttons (AC2) | Execute | Implementing |
| TESTID-01 | P1: Test IDs (AC1-5, AC11-12) primitives + registry | Execute | Implementing |
| TESTID-02 | P1: Test IDs (AC6-8) shell, nav, home, group picker | Execute | Implementing |
| TESTID-03 | P1: Test IDs (AC2-4) settings screens pass keys | Execute | Implementing |
| TESTID-04 | P1: Test IDs (AC9-10) stats, audit, admin, events | Tasks | Pending |
| TESTID-05 | P1: Test IDs (AC11) QA doc | Tasks | Pending |

**Coverage:** 7 total, 7 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] Cookiebot-QA#3 repro steps show "Discard" and "Save" on one line each at 360px in en, pt, es.
- [ ] `bun test` green; `npm run lint && bun run build:static` green.
- [ ] QA can address every control listed in `docs/testids.md` with `page.getByTestId(...)`.
