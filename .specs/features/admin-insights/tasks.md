# Tasks — admin-insights

Grammar: `tlc-spec-driven` §5. Spec: `spec.md`, design: `design.md` (same dir).
Branch: `feat/admin-stats-audit-events`.
Gate for code tasks: `npm run lint && bun run build:static`

## Status

| Task | Status | Notes |
|------|--------|-------|
| T1 — Events: mobile layout + WIP notice | ✅ done | R1; reviewed, 9 fixes applied |
| T2 [P] — ECharts foundation | ✅ done | R2; replaceMerge series, lazy echarts chunk |
| T3 [P] — Data layer: types, repository, mock, hooks | ✅ done | R3; mock me is bot admin |
| T4 — Group stats screen | ✅ done | R4.1, R4.3, R4.4; reviewed, 10 fixes |
| T5 — Fleet stats screen | ✅ done | R4.2; Shell groupScoped prop |
| T6 — Audit components + group activity log | ✅ done | R5.1, R5.2, R5.4, R5.5; mock paging scripted-verified |
| T7 — Fleet audit log | ✅ done | R5.3; 360 mock events paged, no dupes |
| T8 — Navigation | ✅ done | R6 |
| T-final — Close out | ✅ done | Browser QA (mock, 360 + 1280, pt/en): no overflow, charts render, audit paging + filter reset OK; QA found dotted i18n keys + KPI wrap → fixed. Pre-existing, not touched: home chat count needs BOTSERVER_URL; EnvSelector hydration warning. telegram-webhub-miniapp spec is untracked user WIP — Out-of-Scope rows not edited. |

## Tasks

### T1 — Events: mobile layout + WIP notice

- **Skills:** none
- **What:** design.md R1.1–R1.5. Add `WipNotice`, render it on v2 and v1 events
  screens; gate the stray `lg:` utilities on `wide`; make the day strip scroll
  inside itself with snap + fade; remove fixed widths; shrink header spacers;
  fluid v1 footer buttons; add i18n keys in all three locales (es/pt translated
  properly, not English copies).
- **Where:** `src/components/webhub/v2/screens/common.tsx`,
  `src/components/webhub/v2/screens/EventsV2.tsx`,
  `src/components/webhub/v2/Shell.tsx`,
  `src/components/webhub/screens/EventsScreen.tsx`,
  `src/components/webhub/screens/SettingsFrame.tsx`,
  `src/components/webhub/screens/BanLogScreen.tsx`, `messages/{en,es,pt}.json`
- **Depends on:** none
- **Reuses:** `PageIntro`, `SectionLabel`, `cb-*` tokens
- **Done when:** at 360px no horizontal page scroll, notice visible in phone,
  Mini App and desktop layouts.
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `fix(events): fit phones and say the feature is a preview`
- **→ R1.1–R1.5**

### T2 [P] — ECharts foundation

- **Skills:** none
- **What:** design.md R2.1–R2.5: `npm install echarts@^5`; `EChart` wrapper;
  token-based theme + `lineOption`/`barOption`/`pieOption` helpers; `fillDays`;
  `KpiTile`.
- **Where:** `package.json`, `package-lock.json`,
  `src/components/webhub/v2/charts/EChart.tsx`,
  `src/components/webhub/v2/charts/theme.ts`, `src/lib/stats/fillDays.ts`,
  `src/components/webhub/v2/screens/common.tsx`
- **Depends on:** T1 (both touch `common.tsx`)
- **Reuses:** `src/lib/design/tokens.ts`
- **Done when:** wrapper compiles in the static build; no `window` access at module load.
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `feat(charts): Apache ECharts wrapper and token theme`
- **→ R2.1–R2.5**

### T3 [P] — Data layer: types, repository, mock, hooks

- **Skills:** none
- **What:** design.md R3.1–R3.4. Response shapes are listed in R3.1; the audit
  `since`/`until`/`surface` and `GET /admin/audit` come from
  `cookiebot/.specs/features/x_admin_audit/spec.md` (read its behaviour table).
- **Where:** `src/lib/cb/repository.ts`, `src/lib/cb/types.ts` (new if types
  aren't already split out), `src/lib/hooks/useGroupStats.ts`,
  `src/lib/hooks/useAdminStats.ts`, `src/lib/hooks/useAuditPage.ts`
- **Depends on:** none
- **Reuses:** `cbFetch`, `CbError`, `MockSettingsRepository`, `QueryProvider`
- **Done when:** both repository implementations satisfy the interface; mock
  serves ≥120 audit events with working cursors and filters.
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `feat(api): analytics, admin and audit reads in the repository`
- **→ R3.1–R3.4**

### T4 — Group stats screen

- **Skills:** none
- **What:** design.md R4.1, R4.3, R4.4 — `StatsV2` + `/dashboard/stats` route,
  `RangePicker`, KPI tiles, daily line, joins/leaves bars, top commands bars,
  loading/empty/error states (S2). i18n keys `WebHub.v2.stats.*` in en/es/pt.
- **Where:** `src/components/webhub/v2/screens/StatsV2.tsx`,
  `src/app/dashboard/stats/page.tsx`,
  `src/components/webhub/v2/screens/common.tsx`, `messages/{en,es,pt}.json`
- **Depends on:** T2, T3
- **Reuses:** `EChart`, theme helpers, `fillDays`, `KpiTile`, `useGroupStats`,
  group selection used by `GeneralV2`/`ModerationV2`
- **Done when:** with the mock backend, charts render and resize at 360px and 1280px.
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `feat(stats): group stats with Apache ECharts`
- **→ R4.1, R4.3, R4.4**

### T5 — Fleet stats screen

- **Skills:** none
- **What:** design.md R4.2 — `AdminStatsV2` + `/dashboard/admin` route; owner
  gate on `is_bot_admin`; 403 re-auth state (S3).
  i18n `WebHub.v2.admin.*` in en/es/pt.
- **Where:** `src/components/webhub/v2/screens/AdminStatsV2.tsx`,
  `src/app/dashboard/admin/page.tsx`, `messages/{en,es,pt}.json`
- **Depends on:** T4
- **Reuses:** everything from T4, `useAdminStats`, `me()`
- **Done when:** non-owners see "not available"; owners see all five charts/tiles.
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `feat(admin): fleet stats for bot owners`
- **→ R4.2**

### T6 — Audit components + group activity log

- **Skills:** none
- **What:** design.md R5.1, R5.2, R5.4, R5.5 — filters, list (cards on phones),
  before/after diff, pager with cursor stack, `AuditV2` + `/dashboard/audit`
  route. i18n `WebHub.v2.audit.*` in en/es/pt.
- **Where:** `src/components/webhub/v2/audit/AuditFilters.tsx`,
  `src/components/webhub/v2/audit/AuditList.tsx`,
  `src/components/webhub/v2/audit/AuditPager.tsx`,
  `src/components/webhub/v2/audit/useCursorPager.ts`,
  `src/components/webhub/v2/screens/AuditV2.tsx`,
  `src/app/dashboard/audit/page.tsx`, `messages/{en,es,pt}.json`
- **Depends on:** T3, T4 (i18n file contention)
- **Reuses:** `useAuditPage`, `PageIntro`, `SectionLabel`
- **Done when:** with the mock, Older/Newer walk all pages, filters reset to
  page 1, Older disabled on last page.
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `feat(audit): group activity log with filters and pages`
- **→ R5.1, R5.2, R5.4, R5.5**

### T7 — Fleet audit log

- **Skills:** none
- **What:** design.md R5.3 — `AdminAuditV2` + `/dashboard/admin/audit`, adds
  group-id filter and group title per row; owner gate + 403 state as T5.
- **Where:** `src/components/webhub/v2/screens/AdminAuditV2.tsx`,
  `src/app/dashboard/admin/audit/page.tsx`,
  `src/components/webhub/v2/audit/*` (props only), `messages/{en,es,pt}.json`
- **Depends on:** T5, T6
- **Reuses:** T6 components, `useAuditPage`
- **Done when:** owners page through the mock fleet trail with group filter.
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `feat(admin): fleet audit log for bot owners`
- **→ R5.3**

### T8 — Navigation

- **Skills:** none
- **What:** design.md R6.1–R6.3 — sidebar entries, Home tiles, Moderation row;
  Admin entries only for `is_bot_admin`.
- **Where:** `src/components/webhub/v2/Shell.tsx`,
  `src/components/webhub/v2/screens/HomeV2.tsx`,
  `src/components/webhub/v2/screens/ModerationV2.tsx`, `messages/{en,es,pt}.json`
- **Depends on:** T7
- **Reuses:** existing nav item/tile components
- **Done when:** every new screen reachable from phone and desktop layouts;
  owners-only entries hidden for group admins.
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `feat(nav): stats, activity log and admin entries`
- **→ R6.1–R6.3**

### T-final — Close out

- **Skills:** none
- **What:** flip statuses; in `.specs/features/telegram-webhub-miniapp/spec.md`
  mark the two lifted *Out of Scope* rows as moved to `admin-insights`; manual
  check list from spec *Success criteria* recorded in Notes.
- **Where:** `.specs/features/admin-insights/tasks.md`,
  `.specs/features/telegram-webhub-miniapp/spec.md`
- **Depends on:** T8
- **Reuses:** none
- **Done when:** gate green, statuses flipped.
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `docs(admin-insights): close out`
