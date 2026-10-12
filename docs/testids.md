# WebHub v2 test IDs

Stable `data-testid` hooks for QA automation (Playwright `page.getByTestId`). They do not change with the locale or with styling. The source of truth is `src/components/webhub/v2/testids.ts`; rename an ID only together with this file and the Cookiebot-QA page objects.

## Convention

- kebab-case `<area>-<element>[-<key>]`.
- Keys are API values, never labels: config keys (`setting-sfw`), group ids (`group-option--1001234567890`, minus sign kept), audit event ids, section names.
- Only the v2 design carries IDs. v1 screens, the landing page and the login screen do not.

## Scoping: components rendered twice

Some parts render twice and one copy is hidden with CSS, depending on layout. Playwright strict mode rejects a locator that matches both, so scope through the container:

| Rendered twice | Scope with |
| -------------- | ---------- |
| Save bar (floating on phones and the Mini App, docked on desktop) | `savebar-floating` / `savebar-docked` |
| Language button (phone header on the overview, desktop top bar) | `header-mobile` / `header-desktop` |
| Community links (sidebar, phone overview) | `sidebar` / `screen-overview` |
| Diff toggle (one per audit row) | `audit-row-<id>` |

```ts
const bar = page.getByTestId('savebar-floating');   // Mini App
await bar.getByTestId('savebar-save').click();
await page.getByTestId('header-desktop').getByTestId('language-button').click();
```

## Shell and navigation

| ID | Element |
| -- | ------- |
| `screen-<section>` | Content area of each screen. Sections: `overview`, `general`, `moderation`, `posts`, `events`, `stats`, `audit`, `admin`, `adminAudit` |
| `sidebar` | Desktop sidebar |
| `sidebar-group` | Sidebar "managing" button, opens the group popover |
| `nav-<section>` | Sidebar link per section |
| `community-<key>` | Community link: `publications`, `testGroup`, `privacy` |
| `sign-out` | Sidebar sign-out button |
| `header-mobile` | Phone / Mini App header |
| `header-desktop` | Desktop top bar |
| `header-back` | Back button in the phone header (web only; the Mini App uses Telegram's BackButton) |
| `header-title` | Screen title in the phone header |
| `language-button` | Opens the language menu |
| `language-<locale>` | Language option: `en`, `pt`, `es` (radio, `aria-checked`) |

## Overview (home)

| ID | Element |
| -- | ------- |
| `home-add-bot` | "Add me to a group" link |
| `home-group-card` | Current group card, opens the group sheet |
| `tile-<section>` | Settings tile: `general`, `moderation`, `posts`, `events`, `stats`, `audit`, and for bot owners `admin`, `adminAudit` |

## Group picker

| ID | Element |
| -- | ------- |
| `group-chip` | Group chip at the top of phone screens, opens the sheet |
| `group-sheet` | Bottom sheet dialog (phones, Mini App) |
| `group-popover` | Sidebar popover (desktop) |
| `group-search` | Search field (only with more than 4 groups) |
| `group-option-<group_id>` | Group option; `aria-selected="true"` on the current group |
| `group-add-another` | "Add to another group" link |

## Settings screens

| ID | Element |
| -- | ------- |
| `setting-<key>` | Switch button (`role="switch"`, state in `aria-checked`) |
| `slider-<key>` | Range input |
| `slider-<key>-value` | Value badge next to the slider label |
| `textarea-<key>` | Text area |
| `textarea-<key>-count` | Character counter, `"<n> / <max>"` |
| `moderation-audit-link` | Moderation: link to the activity log |
| `error-banner` | Load/save error banner |

Keys per screen:

| Screen | Switches | Sliders | Text areas |
| ------ | -------- | ------- | ---------- |
| General | `allow_furbots`, `sfw`, `functions_fun`, `functions_utility` | | `welcome`, `rules` |
| Moderation | `external_media` (disabled, "soon") | `captcha_timeout_seconds`, `sticker_spam_limit`, `media_restrict_seconds` (shown in minutes) | |
| Posts | `publisher_ask`, `publisher_post` | `max_posts` (disabled while `publisher_post` is off) | |

## Save bar and toast

| ID | Element |
| -- | ------- |
| `savebar-floating` | Floating bar (phones, Mini App) |
| `savebar-docked` | Docked bar (desktop) |
| `savebar-message` | "N unsaved changes in <group>" |
| `savebar-discard` | Discard button |
| `savebar-save` | Save button (label switches to "Saving…" while saving) |
| `toast` | Confirmation toast ("Saved", "Now managing …") |

## Stats (group and fleet)

| ID | Element |
| -- | ------- |
| `range-picker` | 7/30/90 day radiogroup |
| `range-<days>` | `range-7`, `range-30`, `range-90` (`aria-checked`) |
| `kpi-<name>` | KPI tile. Group: `messages`, `commands`, `peak`, `joins-leaves`, `captcha`, `llm-cost`. Fleet: `groups`, `members`, `messages`, `commands`, `errors`, `budget` |
| `chart-<name>` | Chart card. Group: `daily`, `joins-leaves`, `top-commands`. Fleet: `daily`, `top-groups`, `top-commands`, `llm` |
| `stats-error` | Error card (also used by the audit screens) |
| `stats-error-retry` | Retry button (any error except 403/404) |
| `stats-error-signout` | Sign-out button (403) |
| `stats-empty` | "No activity yet" card |
| `select-group-prompt` | "Select a group" card (no group selected) |
| `admin-audit-link` | Fleet stats: link to the fleet audit log |
| `admin-not-available` | Fleet screens for a user who is not a bot owner |

## Audit log (group and fleet)

| ID | Element |
| -- | ------- |
| `audit-filters` | Filter form |
| `audit-filters-toggle` | Shows/hides the form on phones |
| `audit-filter-<field>` | `action`, `surface` (selects), `actor`, `from`, `to`, and fleet only `group` (inputs) |
| `audit-filter-apply` | Apply (submit) |
| `audit-filter-reset` | Reset |
| `audit-filter-error` | Validation message (bad range, actor or group id) |
| `audit-list` | Event list |
| `audit-row-<id>` | One event, by audit event id |
| `audit-row-diff-toggle` | Show/hide changes (only on events with a diff) |
| `audit-row-diff` | Changes panel (`hidden` until toggled) |
| `audit-pager-newer` / `audit-pager-older` | Pager buttons (`disabled` at the ends) |
| `audit-pager-page` | "Page N" |
| `audit-empty` | Empty / no-match card |

## Events (local draft)

| ID | Element |
| -- | ------- |
| `event-name` | Name input |
| `textarea-description` | Description text area |
| `event-day-<index>` | Day button, `0` = today, up to `13` (`aria-pressed`) |
| `event-cover` | Cover upload (disabled) |
| `event-preview` | Chat preview |
| `event-publish` | Publish (disabled) |
