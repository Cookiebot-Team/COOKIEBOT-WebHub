# Mini App signs in by itself — Specification

## Problem Statement

Opened from the bot's menu button, the WebHub still asks the user to log in
with the Telegram Login Widget, and on UAT that widget says "Bot domain
invalid". Inside Telegram there should be no login at all: the Mini App SDK
hands the page `initData` signed by Telegram, and cb-api already accepts it at
`POST /oauth2/token` (grant `urn:cookiebot:params:oauth:grant-type:telegram-miniapp`).

Observed on UAT, 2026-10-03: cb-api logged no Mini App grant attempt ever, so
the client never got as far as the exchange. Cause: the menu button opens `/`,
which never loads the SDK. Telegram passes the launch data in the URL hash
(`#tgWebAppData=…`), and a navigation to `/dashboard` drops it. By the time
`WebHubProvider` injects `telegram-web-app.js`, there is no `initData` left to
read, so the page treats the user as a plain browser visitor.

## Goals

- [ ] Opened as a Mini App, on any entry URL (`/`, `/dashboard`, deep
      links), the user lands signed in on the dashboard with zero taps.
- [ ] Inside the Mini App the Telegram Login Widget never renders. Instead it
      shows a spinner, then the dashboard, or an error with a retry.
- [ ] Plain browsers behave as before: the landing page, then the Login
      Widget on `/dashboard`.
- [ ] Gate: `npm run lint && bun run build:static`.

## Out of Scope

| | |
|---|---|
| cb-api changes | the grant works; it answers 400 `invalid_grant` for bad data |
| Login Widget domain | BotFather `/setdomain`, done by a human |
