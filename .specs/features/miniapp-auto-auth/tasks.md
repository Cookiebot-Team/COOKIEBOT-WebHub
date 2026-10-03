# Tasks — miniapp-auto-auth

Gate for code tasks: `npm run lint && bun run build:static`

## Status

| Task | Status | Notes |
|------|--------|-------|
| T1 — SDK in the root layout, provider reuse, landing redirect | ✅ done | provider already reused window.Telegram.WebApp |
| T2 — AuthGate never shows the widget inside the Mini App | ⏳ not started | |
| T-final — Close out | ⏳ not started | |

### T1 — SDK in the root layout, provider reuse, landing redirect

- **Agent:** frontend
- **Skills:** none
- **What:** design.md R1.1–R1.3.
- **Where:** src/app/layout.tsx, src/components/webhub/WebHubProvider.tsx, src/app/(site)/page.tsx (+ new src/components/webhub/MiniAppRedirect.tsx)
- **Depends on:** none
- **Done when:** loading `/#tgWebAppData=<anything>` with the SDK present redirects to `/dashboard`, and `window.Telegram.WebApp` exists before React hydrates
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `fix(miniapp): load the Telegram SDK first and keep launch data across pages`
- **→ R1.1, R1.2, R1.3**

### T2 — AuthGate never shows the widget inside the Mini App

- **Agent:** frontend
- **Skills:** none
- **What:** design.md R1.4.
- **Where:** src/components/webhub/AuthGate.tsx, src/components/webhub/WebHubProvider.tsx (expose a `retry`), messages/{pt,en,es}.json (keep line endings; es.json is CRLF)
- **Depends on:** T1
- **Done when:** with `isMiniApp` true and a failing exchange, the page shows the error and a retry button, never the widget
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `fix(miniapp): no Login Widget inside Telegram`
- **→ R1.4**

### T-final — Close out

- **Agent:** docs
- **What:** Deploy to UAT, then verify with a real `initData` in Telegram (human).
- **Depends on:** T1, T2
- **Gate:** none
- **Commit:** `docs(miniapp-auto-auth): close out`
