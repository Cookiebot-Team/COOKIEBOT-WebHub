# Telegram WebHub + Mini App Specification

## Problem Statement

The WebHub dashboard is a stub: settings screens hold local state only, login stores the raw Telegram Login Widget payload in `localStorage` and re-posts it to a v1 `/login`, and there is no Telegram Mini App entry point. Cookiebot v2 (`../cookiebot/packages/cb-api`) now ships an OAuth-style token endpoint with `telegram-login` and `telegram-miniapp` grants plus `/me` and `/groups/{id}/config|rules|welcome`, so the WebHub can become a real admin console, both on the web and inside Telegram. The new "COOKIEBOT UI 3" Figma design defines the mobile screens; it must first become a Penpot prototype so web and Mini App variants are designed before code.

## Goals

- [ ] "COOKIEBOT UI 3.fig" exists in Penpot under project `cookiebot`, with all 10 top-level frames reproduced plus new prototype boards for web login, web dashboard and Mini App auth states.
- [ ] A group admin can sign in on the web with the Telegram Login Widget and edit a group's v2 config in under 1 minute.
- [ ] A group admin opening the Mini App from Telegram is signed in with zero extra taps and sees their groups.
- [ ] The Mini App can be launched and authenticated end to end against `../telegram-sandbox`, with v2 validating the sandbox-signed initData.
- [ ] Project dependencies are on current majors (Next 16, React 19, next-intl 4, Tailwind 4) and `npm run build` passes.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Official Telegram test DC support | User chose to validate against the local `telegram-sandbox` instead |
| New v2 endpoints (ban reason, external media, events calendar) | Not in v2 (`groups.py`); screens render them read-only as "coming soon" via the mock adapter |
| Ed25519 `signature` verification in v2 | v2 validates HMAC only (`miniapp.py:36-77`); third-party validation is not needed because v2 holds the bot token |
| Bot-owner `/admin/*` console | Not in the design |
| Analytics / audit screens | Not in the design |
| Pixel-perfect vector icons from Figma library symbols | Imported as outlined paths; not re-authored as Penpot components |
| Deploy / push | Blast radius: local branches and commits only |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Auth backend | Cookiebot v2 `POST /oauth2/token` (grants `telegram-login`, `telegram-miniapp`, `refresh_token`) | User: "consider the new cookiebot v2 and the endpoints" | y |
| Browser → v2 transport | Same-origin Next.js rewrite `/cb/:path*` → `${CB_API_URL}/:path*` | v2 CORS omits `PATCH` (`main.py:113-127`); proxy avoids preflight | n |
| Token storage | Access token in memory; refresh token in `sessionStorage` (Mini App) / `localStorage` (web) | No server session in WebHub; v2 rotates refresh tokens and revokes family on reuse | n |
| Raw Login Widget payload | Not persisted after exchange | Current code re-posts stored payload forever; refresh token replaces it | n |
| Settings persistence | `SettingsRepository` interface; `HttpSettingsRepository` (v2) and `MockSettingsRepository` (in-memory) selected by `NEXT_PUBLIC_SETTINGS_BACKEND=mock` or missing `CB_API_URL` | User chose typed client + mock adapter | y |
| Fields not in v2 (ban reason, allow external media, event dates) | Rendered disabled with "coming soon" label; mock adapter stores them | Keep design fidelity without inventing API | n |
| "Telegram sandbox" | `../telegram-sandbox` extended with `web_app` buttons, menu button, iframe launch, HMAC-signed initData and a Login Widget emulator | User chose "Extend ../telegram-sandbox" | y |
| Sandbox bot token | New config `bot.token` / env `TG_SANDBOX_BOT_TOKEN`, default `424242:SANDBOX`; must be in v2 `CB_BOT_TOKENS` | Sandbox never had the token; signing needs it | n |
| Mini App route | `/miniapp` (+ `/miniapp/groups/[id]/{general,moderation,posts,events}`) | Separate layout without web Navbar/Footer | n |
| Web route | Existing `/dashboard/*`, plus `/dashboard/groups/[id]/*` | Reuse existing IA | n |
| Penpot project creation | Penpot RPC `create-project` / `create-file` with token from `~/.config/penpot.env`; shapes via MCP plugin | User chose RPC with token | y |
| Fonts | Futura → "Jost" (Google, geometric), SF Pro → "Inter" | Futura/SF Pro not available in Penpot/web freely | n |
| Dependency upgrade | Latest majors; TypeScript pinned to 5.x if Next 16 lint/build rejects TS 7 | Upgrade requested; build must stay green | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Penpot prototype ⭐ MVP

**User Story**: As the maintainer, I want the Figma design imported into Penpot and extended with web and Mini App boards so that the UI is agreed before implementation.

**Why P1**: User asked to prototype on Penpot first.

**Acceptance Criteria**:

1. WHEN the import runs THEN the system SHALL create a Penpot project named `cookiebot` containing a file named `COOKIEBOT UI 3`.
2. WHEN the import completes THEN the file SHALL contain one board per top-level Figma frame (10 boards) with matching names and sizes within 1 px.
3. WHEN the import completes THEN each imported board SHALL contain every visible text string from the Figma frame.
4. WHEN prototyping completes THEN the file SHALL contain boards `Web / Login`, `Web / Dashboard`, `Mini App / Loading`, `Mini App / Auth Error` and `Mini App / Group Picker`.
5. IF an image referenced by the Figma file is missing from the archive THEN the importer SHALL fill that shape with `#D9D9D9` and log the missing hash.

**Independent Test**: Open the Penpot file; count boards, spot-check texts against `scene.json`.

---

### P1: Web login with Telegram Login Widget ⭐ MVP

**User Story**: As a group admin on the web, I want to sign in with Telegram so that I can manage my groups.

**Why P1**: Nothing else works without identity.

**Acceptance Criteria**:

1. WHEN the widget callback returns auth data THEN the WebHub SHALL POST `{grant_type: "urn:cookiebot:params:oauth:grant-type:telegram-login", auth_data}` to `/cb/oauth2/token`.
2. WHEN `/cb/oauth2/token` returns 200 THEN the WebHub SHALL store the refresh token, hold the access token in memory and navigate to `/dashboard`.
3. IF `/cb/oauth2/token` returns 400 THEN the WebHub SHALL show the message key `Auth.loginFailed` and stay on the login screen.
4. The WebHub SHALL NOT persist the raw widget payload after the exchange.
5. WHILE no valid session exists the WebHub SHALL redirect `/dashboard/*` to `/login`.
6. WHEN the user selects logout THEN the WebHub SHALL POST the refresh token to `/cb/oauth2/revoke`, clear stored tokens and navigate to `/`.

**Independent Test**: With v2 running locally and a bot token configured, log in via widget, reach `/dashboard`, reload, still logged in, logout.

---

### P1: Mini App auto-auth ⭐ MVP

**User Story**: As a group admin in Telegram, I want the Mini App to sign me in automatically so that I land on my groups.

**Why P1**: Core Mini App value.

**Acceptance Criteria**:

1. WHEN `/miniapp` loads with non-empty `Telegram.WebApp.initData` THEN the WebHub SHALL POST `{grant_type: "urn:cookiebot:params:oauth:grant-type:telegram-miniapp", init_data}` to `/cb/oauth2/token`.
2. WHILE the token request is pending the Mini App SHALL render the `Mini App / Loading` screen.
3. IF `initData` is empty THEN the Mini App SHALL render the `Mini App / Auth Error` screen with message key `Auth.openInTelegram`.
4. IF `/cb/oauth2/token` returns a non-2xx status THEN the Mini App SHALL render `Mini App / Auth Error` with message key `Auth.miniappFailed` and a retry button.
5. WHEN auth succeeds THEN the Mini App SHALL call `Telegram.WebApp.ready()` and `expand()` and render the group picker from `GET /cb/me`.
6. The Mini App SHALL apply Telegram `themeParams` `bg_color` and `text_color` as CSS variables `--tg-bg` and `--tg-text`.
7. WHEN a Mini App sub-screen is open THEN the Mini App SHALL show Telegram `BackButton` and navigate back on its click.

**Independent Test**: Launch from `telegram-sandbox` web client; land on group picker without input.

---

### P1: Session refresh ⭐ MVP

**User Story**: As a signed-in admin, I want my session to renew silently so that edits don't fail after 15 minutes.

**Acceptance Criteria**:

1. WHEN an API call returns 401 and a refresh token exists THEN the client SHALL POST `{grant_type: "refresh_token", refresh_token}` once and retry the original request once.
2. IF the refresh call fails THEN the client SHALL clear tokens and route to `/login` (web) or `Mini App / Auth Error` (Mini App).
3. WHEN two requests receive 401 concurrently THEN the client SHALL issue exactly one refresh request.
4. WHEN a refresh succeeds THEN the client SHALL replace the stored refresh token with the rotated one.

**Independent Test**: Unit test with a mocked fetch returning 401 then 200.

---

### P1: Group settings screens (web + Mini App) ⭐ MVP

**User Story**: As a group admin, I want the General, Moderation, Posts and Events screens from the design so that I can configure the bot.

**Acceptance Criteria**:

1. WHEN a group screen loads THEN the client SHALL fetch `GET /cb/groups/{id}/config` through the `SettingsRepository`.
2. The General screen SHALL map toggles: "Avoid Conflicting Commands with other Furry Bots" → `allow_furbots`, "Block NSFW Content" → `sfw`, "Entertainment Functions" → `functions_fun`, "Utility Functions" → `functions_utility`.
3. The Posts screen SHALL map "Allow to send content from this group to others" → `publisher_ask` and "Allow to receive content from other groups" → `publisher_post`.
4. WHEN the user presses Done / Save THEN the client SHALL send `PATCH /cb/groups/{id}/config` with only changed fields.
5. IF no field changed THEN the client SHALL NOT send a PATCH.
6. IF the PATCH returns 422 THEN the screen SHALL show the `detail` text and keep the edited values.
7. IF the config GET returns 404 THEN the screen SHALL show message key `Groups.notAdmin`.
8. WHERE a field has no v2 backing (ban reason, external media, event date) the screen SHALL render it disabled with message key `Common.comingSoon` when using the HTTP repository.
9. WHERE `NEXT_PUBLIC_SETTINGS_BACKEND=mock` the client SHALL use `MockSettingsRepository` and SHALL NOT make network calls for settings.

**Independent Test**: Mock backend: toggle, save, reload page state from mock; HTTP backend: v2 audit log shows `surface=miniapp` change.

---

### P1: Mini App validation in telegram-sandbox ⭐ MVP

**User Story**: As the maintainer, I want to open the Mini App from the local sandbox so that auth is validated without real Telegram.

**Acceptance Criteria** (repo `../telegram-sandbox`):

1. The sandbox config SHALL accept `bot.token` (env `TG_SANDBOX_BOT_TOKEN`, default `424242:SANDBOX`) and `webapp.url` (env `TG_SANDBOX_WEBAPP_URL`).
2. WHEN the web client opens a Mini App (menu button or inline `web_app` button) THEN the sandbox SHALL build initData with `query_id`, `user` (JSON), `auth_date`, `hash` where `hash = hex(HMAC_SHA256(key=HMAC_SHA256("WebAppData", bot_token), data_check_string))`.
3. WHEN the web client opens a Mini App THEN it SHALL render the URL in an iframe with `#tgWebAppData=<urlencoded initData>&tgWebAppVersion=8.0&tgWebAppPlatform=web&tgWebAppThemeParams=<json>` appended.
4. WHEN the iframe posts `{eventType: "web_app_close"}` THEN the client SHALL close the Mini App panel.
5. WHEN the iframe posts `{eventType: "web_app_setup_back_button", eventData: {is_visible}}` THEN the client SHALL show or hide a back button that posts `{eventType: "back_button_pressed"}` into the iframe.
6. WHEN `GET /api/login-widget?origin=<o>&return_to=<url>&user_id=<id>` is called THEN the sandbox SHALL redirect to `return_to` with `id, first_name, username, auth_date, hash` where `hash = hex(HMAC_SHA256(key=SHA256(bot_token), data_check_string))`.
7. IF `return_to` origin is not in `TG_SANDBOX_CORS_ORIGINS` THEN the login-widget endpoint SHALL return 400.
8. The sandbox SHALL expose `POST /api/webapp/init-data {user_id}` returning `{init_data}` for tests.
9. WHEN `inline_keyboard` contains a `web_app` button THEN the chat UI SHALL render it and open the Mini App on click.

**Independent Test**: pytest verifying the hash with an independent reference implementation; v2 `/oauth2/token` accepts sandbox initData when `CB_BOT_TOKENS` includes the sandbox token.

---

### P2: WebHub sandbox login mode

**User Story**: As the maintainer, I want the web login to use the sandbox widget emulator so that web auth is testable offline.

**Acceptance Criteria**:

1. WHERE `NEXT_PUBLIC_TG_SANDBOX_URL` is set the login screen SHALL render a "Log in with Sandbox" button instead of the Telegram widget.
2. WHEN `/login/callback` receives widget query params THEN the WebHub SHALL exchange them exactly as in Web login AC1.

**Independent Test**: Click sandbox login → redirected back → `/dashboard`.

---

### P2: Dependency upgrade

**User Story**: As the maintainer, I want current dependency majors so that the project is secure and supported.

**Acceptance Criteria**:

1. The project SHALL depend on `next@16`, `react@19`, `react-dom@19`, `next-intl@4`, `tailwindcss@4`, `eslint-config-next@16`.
2. WHEN `npm run build` runs THEN it SHALL exit 0.
3. WHEN `npm run lint` runs THEN it SHALL exit 0.
4. The landing page `/` SHALL render the same sections as before the upgrade.

**Independent Test**: `npm ci && npm run lint && npm run build`.

---

## Edge Cases

- IF `initData` `auth_date` is older than v2 `CB_MINIAPP_INIT_DATA_MAX_AGE_SECONDS` THEN the Mini App SHALL render `Mini App / Auth Error` with retry (v2 returns 400).
- IF `GET /cb/me` returns an empty `groups` list THEN the group picker SHALL render message key `Groups.empty` and the "Add me to a group" link `https://t.me/CookieMWbot?startgroup=new`.
- IF the v2 API is unreachable (network error) THEN the client SHALL show message key `Common.networkError` with retry.
- WHEN the refresh token is reused (v2 revokes family) THEN the client SHALL treat it as refresh failure (Session refresh AC2).

---

## Implicit-Requirement Dimensions

| Dimension | Resolution |
| --- | --- |
| Input validation & bounds | Rules/welcome ≤4096 chars client-side; numeric config bounds per v2 `ConfigPatch`; 422 surfaced (Settings AC6) |
| Failure / partial-failure | Auth error screens, network error, 422 keep values |
| Idempotency / retry | Single-flight refresh (Refresh AC3); PATCH only changed fields |
| Auth boundaries & rate limits | v2 enforces admin + scopes; 404 → notAdmin; client never sees bot token |
| Concurrency / ordering | Single-flight refresh |
| Data lifecycle / expiry | Access 900 s memory-only; refresh rotated; widget payload never stored |
| Observability | N/A because WebHub has no telemetry stack; v2 audit log records writes |
| External-dependency failure | v2 unreachable → networkError; Telegram SDK absent → openInTelegram |
| State-transition integrity | Auth state machine: idle → authenticating → authenticated / error |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| PEN-01 | P1: Penpot prototype (AC1-3, 5) | Tasks | Pending |
| PEN-02 | P1: Penpot prototype (AC4) | Tasks | Pending |
| WEB-01 | P1: Web login (AC1-4) | Tasks | Pending |
| WEB-02 | P1: Web login (AC5-6) | Tasks | Pending |
| MINI-01 | P1: Mini App auto-auth (AC1-4) | Tasks | Pending |
| MINI-02 | P1: Mini App auto-auth (AC5-7) | Tasks | Pending |
| SESS-01 | P1: Session refresh | Tasks | Pending |
| SET-01 | P1: Settings screens (AC1, 4-7, 9) | Tasks | Pending |
| SET-02 | P1: Settings screens (AC2-3, 8) | Tasks | Pending |
| SBX-01 | P1: Sandbox (AC1-2, 8) | Tasks | Pending |
| SBX-02 | P1: Sandbox (AC3-5, 9) | Tasks | Pending |
| SBX-03 | P1: Sandbox (AC6-7) | Tasks | Pending |
| SBXL-01 | P2: WebHub sandbox login | Tasks | Pending |
| DEP-01 | P2: Dependency upgrade | Tasks | Pending |

**Coverage:** 14 total, 0 mapped to tasks, 14 unmapped ⚠️

---

## Success Criteria

- [ ] Penpot file has 15 boards (10 imported + 5 prototype).
- [ ] Mini App launched from sandbox reaches group picker with zero user input.
- [ ] Web login → edit `sfw` → v2 `GET /groups/{id}/config` reflects change.
- [ ] `npm run lint && npm run build && npm test` exit 0.
