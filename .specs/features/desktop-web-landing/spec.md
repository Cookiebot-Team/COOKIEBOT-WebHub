# Desktop web experience + modern landing — Specification

## Problem Statement

Opened from a desktop browser, the WebHub dashboard's sign-in screen renders
the Mini App's 430 px phone frame in the middle of a wide viewport
(`AuthGate` → `Screen`), so the web console looks like a phone emulator. The
landing page (`/`) is a single hero over a background (`public/Overlay.png`)
that is a screenshot of a third-party community's Telegram chat ("Fursocial
Brasil"). A second unused asset, `public/Background2.png`, is a screenshot of
the team's private chat. Neither should ship.

## Goals

- [ ] A desktop browser user (outside Telegram, viewport ≥ 1024 px) never sees
      the phone frame: sign-in and every dashboard state use a desktop layout.
- [ ] Inside the Telegram Mini App, and below 1024 px, the dashboard looks and
      behaves exactly as it does today.
- [ ] `/` is a modern, multi-section landing page with no screenshots of real
      chats, translated in pt/en/es.
- [ ] `Overlay.png` and `Background2.png` are deleted from the repository and
      the image.
- [ ] `bun run build:static` and `npm run lint` pass.

## Out of Scope

| Feature | Reason |
| --- | --- |
| v1 design screens | Legacy; UAT and prd default to v2. v1 stays as is behind the switcher |
| Dependency upgrades (Next 16 etc.) | Tracked in `telegram-webhub-miniapp` |
| New API endpoints | The landing uses static content only |
| Deploy / image bump | Separate step after review |

## Volumetry

Tier: **low**. Static pages served from the embedded binary; nothing here
changes request volume or payload size beyond a few KB of markup.

## User Stories

### P1: Desktop sign-in ⭐ MVP
As a group admin on a laptop, I want the WebHub sign-in to use the screen
like a website, so it does not look like a phone emulator.
**Acceptance:** at 1440×900 outside Telegram, `/dashboard` (signed out) shows
a full-width two-column layout with the Telegram Login Widget; at 390×844 and
inside the Mini App it shows today's phone layout.

### P1: No third-party prints
As the maintainer, I do not want screenshots of real Telegram groups shipped.
**Acceptance:** `git ls-files public` contains neither file; no stylesheet or
component references them; the landing has no chat screenshot.

### P2: Modern landing
As a visitor, I want to understand what Cookiebot does and how to add it.
**Acceptance:** `/` has hero (title, slogan, "Me Convide!" + "Abrir painel"),
a product preview drawn in HTML/CSS (not a screenshot), a feature grid, a
three-step how-it-works, and a closing CTA; responsive 360–1440 px; respects
`prefers-reduced-motion`; all copy in `messages/{pt,en,es}.json`. The invite
link uses the deployment's bot (`runtimeConfig().telegramBotUsername`), so UAT
invites `cookiebot_uat_bot`, not production's bot.
