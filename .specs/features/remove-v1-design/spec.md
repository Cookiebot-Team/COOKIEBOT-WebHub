# Remove the v1 design Specification

## Problem Statement

The WebHub ships two designs behind a V1/V2 switcher (floating "DESIGN V1 V2" pill, `DESIGN_SWITCHER` / `DESIGN_DEFAULT`). v2 is now the product: QA tests it, UAT defaults to it. Keeping v1 doubles the screens to maintain and lets users land on the retired design.

## Goals

- [ ] Every dashboard route renders the v2 screen; no switcher, no way to reach v1.
- [ ] v1 screen code and the design runtime settings are gone from the repo.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Landing page, privacy page, login/auth frames | Not part of the v1/v2 dashboard split |
| Pruning translation keys that v1 used | Many keys are shared with v2; a wrong prune breaks v2 text. Only `WebHub.design` goes |
| Ban log screen for v2 | v2 shows it as "Soon"; building it is a separate feature |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| `/dashboard/moderation/bans` (v1-only) | Redirect to `/dashboard/moderation` | Old links keep working; v2 lists the ban log as "Soon" there | n |
| `DESIGN_SWITCHER` / `DESIGN_DEFAULT` set in a deployment | Ignored (no longer read) | Removing them from manifests is cleanup, not a requirement for correctness | n |
| `?design=v1` in old links, `cb.design` in localStorage | Ignored | Nothing reads them any more | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: v2 is the only design ⭐ MVP

**User Story**: As a group admin, I want the WebHub to always show the current design so that I never land on the retired one.

**Why P1**: Asked for by the product owner; v2 is going to UAT as the main design.

**Acceptance Criteria**:

1. WHEN a user opens `/dashboard`, `/dashboard/general`, `/dashboard/moderation`, `/dashboard/posts` or `/dashboard/events` THEN the WebHub SHALL render the v2 screen for that route (HomeV2, GeneralV2, ModerationV2, PostsV2, EventsV2).
2. The WebHub SHALL NOT render the design switcher on any dashboard route.
3. WHEN a user opens `/dashboard/moderation/bans` THEN the WebHub SHALL redirect to `/dashboard/moderation`.
4. The runtime config SHALL NOT contain `designSwitcher` or `designDefault`, and the server SHALL NOT read `DESIGN_SWITCHER` or `DESIGN_DEFAULT`.
5. The repository SHALL NOT contain the v1 screens (`src/components/webhub/screens/*`) or `src/components/webhub/design/DesignProvider.tsx`.
6. The dashboard SHALL keep the toast provider that v2 screens use for save confirmations.

**Independent Test**: Open each dashboard route in the browser: v2 screen, no "DESIGN V1 V2" pill; `/dashboard/moderation/bans` lands on Moderation.

---

## Edge Cases

- IF a visitor has `cb.design=v1` stored or opens `?design=v1` THEN the WebHub SHALL still render v2.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| NOV1-01 | P1 (AC1, AC2, AC6, edge case) | Verify | Verified |
| NOV1-02 | P1 (AC3) | Verify | Verified |
| NOV1-03 | P1 (AC4, AC5) | Verify | Verified |

**Coverage:** 3 total, 3 mapped, 0 unmapped

---

## Success Criteria

- [ ] UAT shows v2 on every route with no switcher.
- [ ] `bun test`, lint and `build:static` green.
