# admin-insights — Design

Stack: Next 14 App Router (static export), Tailwind with `cb-*` tokens, next-intl
(`messages/{en,es,pt}.json`, v2 strings under `WebHub.v2.*`), react-query,
`cbFetch` client (`src/lib/cb/client.ts`), `SettingsRepository`
(`src/lib/cb/repository.ts`) with a `MockSettingsRepository`.

## R1 — Events on mobile (S1)

- **R1.1** `src/components/webhub/v2/screens/common.tsx`: add a `WipNotice`
  component (icon + title + one sentence, `role="note"`), full width, visible on
  every layout. `EventsV2` renders it at the top of the body; the `aside` badge may
  stay for desktop.
- **R1.2** `EventsV2.tsx`: every `lg:` utility that is only meant for the wide
  layout must be gated by `wide` (the day-chip `lg:w-auto`, the `SectionLabel`
  `lg:text-cb-brown-700`). Day strip: `overflow-x-auto overscroll-x-contain
  snap-x`, chips `snap-start`, fade edge as scroll affordance; strip never widens
  the page (`min-w-0` on flex/grid parents). Inputs/buttons `w-full`; preview card
  `min-h` reduced on phones (`min-h-[200px] sm:min-h-[240px]`); no fixed widths.
- **R1.3** `Shell.tsx` header spacers `w-[84px]` → `w-12 sm:w-[84px]` (or
  `min-w-0` + `truncate` on the title) so the title gets room at 360px.
- **R1.4** v1 `EventsScreen.tsx`: `w-[289px]` → `w-full max-w-[289px]` (there and
  in `SettingsFrame.tsx`, `BanLogScreen.tsx`); add the same notice (reuse the v2
  `WipNotice` or a v1-styled twin).
- **R1.5** i18n keys `WebHub.v2.events.wip.{title,body}` in en/es/pt. en body:
  "Events are a preview. You can try the form, but nothing is saved or published
  yet — we're still building it."

## R2 — ECharts foundation

- **R2.1** Dependency `echarts@^5` (no React wrapper). Tree-shaken imports from
  `echarts/core` + `LineChart`, `BarChart`, `PieChart`, `GridComponent`,
  `TooltipComponent`, `LegendComponent`, `DatasetComponent`, `CanvasRenderer`.
- **R2.2** `src/components/webhub/v2/charts/EChart.tsx` — `'use client'`
  component `<EChart option height className ariaLabel />`: `echarts.init` in an
  effect (never at module load — static export/SSR safe), `setOption(option,
  {notMerge: true})` on change, `ResizeObserver` → `resize()`, `dispose()` on
  unmount. Container `w-full min-w-0`. Tooltip `confine: true` (keeps it inside
  the `.webhub` root; see the global `h*`/`button` CSS hazard in
  `globals.scss:100-128`).
- **R2.3** `src/components/webhub/v2/charts/theme.ts` — palette and text colours
  from `src/lib/design/tokens.ts`; helpers `lineOption`, `barOption`, `pieOption`
  that set grid margins that work at 320px (`containLabel: true`, legend at
  bottom, axis label `hideOverlap`).
- **R2.4** `src/lib/stats/fillDays.ts` — fills missing days in `[start, end]` with
  zero rows (API omits empty days).
- **R2.5** `KpiTile` in `v2/screens/common.tsx` (label, value, optional hint);
  grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`.

## R3 — Data layer

- **R3.1** Types in `src/lib/cb/types.ts` (or next to the repository, matching
  current placement) mirroring the API shapes:
  - Group analytics: `DailyRow`, `CommandRow`, `LlmUsage`, `Summary`
    (`GET /groups/{id}/analytics/{daily,commands,llm,summary}?start&end`).
  - Admin: `AdminOverview`, `AdminDailyRow` (+`groups`), `TopGroupRow`,
    `AdminCommandRow` (+`groups`), `LlmUsage`
    (`GET /admin/{overview,analytics/daily,analytics/groups,analytics/commands,analytics/llm}`).
  - Audit: `AuditEvent {id, ts, action, surface, actor_user_id, actor_kind,
    summary, before, after, trace_id}`, `AuditPage {group_id, events,
    next_before}`, `AdminAuditEvent = AuditEvent & {group_id, group_title}`,
    `AdminAuditPage {events, next_before}`, `AuditFilters {action?, surface?,
    actor_user_id?, since?, until?, group_id?}`.
  - Enums: actions `config.updated | rules.updated | welcome.updated |
    session.started`; surfaces `telegram | miniapp | api | system`.
- **R3.2** `SettingsRepository` gains `groupAnalytics(groupId, range)`,
  `adminOverview(range)`, `adminDaily(range)`, `adminTopGroups(range, limit)`,
  `adminCommands(range)`, `adminLlm(range)`, `groupAudit(groupId, filters,
  before?, limit)`, `adminAudit(filters, before?, limit)`. Query params built with
  `URLSearchParams`, empty values omitted. `groupAnalytics` fetches the four
  group endpoints in parallel.
- **R3.3** `MockSettingsRepository` implements all of them with deterministic
  generated data (seeded by day index) and ~120 audit events so paging is testable.
- **R3.4** react-query hooks in `src/lib/hooks/` (`useGroupStats`, `useAdminStats`,
  `useAuditPage`), keys include range/filters/cursor, `placeholderData:
  keepPreviousData` for paging.

## R4 — Stats screens (S2, S3)

- **R4.1** `src/components/webhub/v2/screens/StatsV2.tsx` + route
  `src/app/dashboard/stats/page.tsx` (uses the selected group like other
  group screens; 404 → existing "not an admin" handling).
- **R4.2** `src/components/webhub/v2/screens/AdminStatsV2.tsx` + route
  `src/app/dashboard/admin/page.tsx`; if `!is_bot_admin` render a "not available"
  state (do not redirect-loop). 403 → re-auth message (S3.3).
- **R4.3** Shared `RangePicker` (7/30/90) segmented control in `common.tsx`.
- **R4.4** Number formatting via `Intl.NumberFormat(locale)`; currency USD with 2
  decimals; dates via `Intl.DateTimeFormat(locale)`.

## R5 — Audit screens (S4)

- **R5.1** `src/components/webhub/v2/audit/` — `AuditFilters.tsx` (collapsible
  on phones), `AuditList.tsx` (cards < sm, table-like rows ≥ sm; expandable
  before/after rendered as key-level diff of the two JSON objects, `<pre>`
  fallback), `AuditPager.tsx`, `useCursorPager.ts` (stack of `before` cursors:
  page 1 = undefined; *Older* pushes `next_before`; *Newer* pops; reset on filter
  change).
- **R5.2** `src/components/webhub/v2/screens/AuditV2.tsx` + route
  `src/app/dashboard/audit/page.tsx` (selected group).
- **R5.3** `src/components/webhub/v2/screens/AdminAuditV2.tsx` + route
  `src/app/dashboard/admin/audit/page.tsx` (bot admins; adds group filter and
  group column).
- **R5.4** Date filters: `<input type="date">`; `since` = start of local day →
  ISO UTC; `until` = start of the day after "to". Client-side validation that from
  ≤ to.
- **R5.5** Action/surface labels localised (`WebHub.v2.audit.actions.*`,
  `.surfaces.*`); unknown values shown raw.

## R6 — Navigation (S5)

- **R6.1** `Shell.tsx` sidebar: add *Stats* and *Activity log* in the group
  section; *Admin* section (Fleet stats, Audit log) only when `is_bot_admin`.
- **R6.2** `HomeV2.tsx`: tiles for Stats and Activity log; Admin tile for owners.
- **R6.3** `ModerationV2.tsx`: an *Activity log* row linking to
  `/dashboard/audit` (the Ban log row keeps its Soon badge).
- **R6.4** Each new route's `page.tsx` follows the existing pages' pattern; since
  there is no v1 design, render the v2 screen directly.

## Open decisions

| # | Question | Answer |
|---|---|---|
| O1 | echarts-for-react or own wrapper? | Own ~60-line wrapper: no extra dep, explicit dispose/resize, React-18 safe. |
| O2 | Page numbers "of N"? | No — the API is keyset and has no counts (backend O4). |
| O3 | Filters in the URL? | No (static export, kept simple); local state, reset on group change. |
| O4 | Tests? | WebHub has no test runner; gate stays lint + static build + manual checks. |
