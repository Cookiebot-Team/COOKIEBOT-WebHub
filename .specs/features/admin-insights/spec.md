# admin-insights — Spec

## Goal

Three WebHub changes, shipped together:

1. **Events screen fits phones** and clearly says the feature is a work in progress.
2. **Stats visualised with Apache ECharts** for admins — per-group stats for group
   admins, fleet stats for bot admins (owners).
3. **Audit log viewer** with filters and keyset pagination, on by default for group
   admins (their groups) and bot admins (whole fleet).

Backend counterpart: `cookiebot/.specs/features/x_admin_audit/` (audit filters +
`GET /admin/audit`). Stats use endpoints that already exist (`x_analytics_api`,
`x_admin_api`).

This lifts two items from `telegram-webhub-miniapp/spec.md` *Out of Scope*:
"Bot-owner `/admin/*` console" (stats + audit only) and "Analytics / audit screens".
The events calendar stays a non-functional preview.

## Stories

### S1 — Events on mobile (P1)
- **S1.1** At 320–430px widths (browser and Telegram Mini App) no element of the
  events screen overflows horizontally, gets clipped, or forces page-level
  horizontal scroll. The 14-day strip scrolls inside its own container only.
- **S1.2** In the Mini App on a ≥1024px viewport (Telegram Desktop), day chips keep
  their width and the section labels stay readable on the dark background.
- **S1.3** A visible "work in progress" notice explains that events are a preview:
  nothing is saved or published yet. Visible on every layout (phone, Mini App,
  desktop) — not only in the desktop `aside`. Localised en/es/pt.
- **S1.4** The v1 events screen gets the same notice and loses its fixed 289px
  button widths (fluid up to that max).

### S2 — Group stats (P1)
- **S2.1** A group admin opens *Stats* for the selected group and sees: KPI tiles
  (messages, commands, active-user peak, joins/leaves, captcha solve rate, LLM
  cost), a daily line chart (messages, commands, active users), a joins vs leaves
  bar chart, and a top-commands bar chart.
- **S2.2** Range selector 7 / 30 / 90 days (default 30). Days without activity
  render as 0, not as gaps.
- **S2.3** Loading skeleton, empty state ("no activity in this period"), error state
  with retry.

### S3 — Fleet stats for bot admins (P1)
- **S3.1** Visible only when `me().is_bot_admin`. Shows overview tiles (groups,
  members, admins, messages, LLM spend vs budget), daily line chart (messages,
  active groups), top-groups bar chart, commands bar chart, LLM cost by model.
- **S3.2** Same range selector and states as S2.
- **S3.3** A 403 (token lacks `admin:read`) shows "sign in again to refresh your
  permissions" with a sign-out/in action, not a crash.

### S4 — Audit log (P1)
- **S4.1** Group admins: *Activity log* for the selected group. Bot admins: a fleet
  *Audit log* across all groups (with group name per row and a group filter).
- **S4.2** Filters: action, surface, actor user id, from/to date (fleet adds group
  id). Changing a filter returns to page 1.
- **S4.3** Pagination on by default: page size 25, *Newer* / *Older* buttons, page
  number shown. Keyset cursors; *Older* disabled when `next_before` is null.
- **S4.4** Each row: time (locale-formatted, relative + absolute on hover/tap),
  action label, surface, actor, summary; expandable before/after diff.
- **S4.5** Mobile-first: rows are cards at phone width, filters collapse into a
  toggle panel.
- **S4.6** Empty, loading, error states as S2.3.

### S5 — Navigation (P1)
- **S5.1** *Stats* and *Activity log* entries reachable for every group admin
  (sidebar on desktop, Home tiles / Moderation rows on phone & Mini App).
- **S5.2** *Admin* section (fleet stats, fleet audit) appears only for bot admins.

## Out of scope
- Making events functional (backend for events).
- Moderation actions in the audit trail (backend doesn't record them yet).
- The planned Next 16 / React 19 / Tailwind 4 upgrade.
- v1-design variants of the new screens (they render the v2 design only).

## Success criteria
- `npm run lint && bun run build:static` green.
- Manual check at 360×740 and 1280×800, browser and Mini App mock, in all three
  locales, with `settingsBackend = 'mock'`.
