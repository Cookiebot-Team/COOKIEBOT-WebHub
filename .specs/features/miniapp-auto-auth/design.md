# Design — miniapp-auto-auth

- **R1.1 SDK first.** Load `https://telegram.org/js/telegram-web-app.js` in
  the ROOT layout (`src/app/layout.tsx`) as a synchronous `<script>` in
  `<head>`, before any app code, so it reads `#tgWebAppData` on whichever
  page Telegram opened. The SDK stores the launch params in
  `sessionStorage` (`__telegram__initParams`) and restores them after
  in-app navigations and reloads, which keeps the data across the hop from
  `/` to `/dashboard`. Outside Telegram the script is a no-op
  (`initData === ''`).
- **R1.2** `WebHubProvider` (src/components/webhub/WebHubProvider.tsx:47,
  `loadTelegramSdk`) uses `window.Telegram.WebApp` when it is already
  present, and keeps the dynamic injection only as a fallback.
  `isMiniApp = Boolean(initData)`, as today.
- **R1.3 Landing redirect.** On `/`, if `window.Telegram?.WebApp?.initData`
  is non-empty, `router.replace('/dashboard')` before the landing paints
  anything interactive. A Mini App user never needs the marketing page.
  It is a small client component mounted in `src/app/(site)/page.tsx`
  (or the (site) layout).
- **R1.4 AuthGate in the Mini App.** When `isMiniApp`, the anonymous state
  never renders `LoginButton`. While the exchange runs it shows a spinner
  ("Entrando com o Telegram…"). If the exchange fails it shows the existing
  `miniappFailed` message with a retry button that re-runs the exchange.
  The widget remains only for `!isMiniApp`.
- **R1.5** The exchange body is unchanged (client.ts `exchangeToken`, JSON
  `{grant_type: MINIAPP_GRANT, init_data}`). Check the field name against
  cb-api `routers/oauth.py`; the UAT probe answered 400 `invalid_grant` for
  `init_data`, so the field is read.
