# Tasks — desktop-web-landing

Repo: COOKIEBOT-WebHub, branch `feat/telegram-auth-miniapp`. Gate for every
code task (run from the repo root):
`npm run lint && bun run build:static`

## Status

| Task | Status | Notes |
|------|--------|-------|
| T1 [P] — Remove third-party chat prints | ✅ done | |
| T2 [P] — Desktop sign-in layout | ✅ done | verified 1470 px and 420 px in dev |
| T3 — Modern landing page | ✅ done | verified 1470 px and 420 px in dev |
| T4 — Bot photo and feature summary in the hero | ✅ done | verified 1470 px and 420 px in dev |
| T-final — Close out | ✅ done | awaiting human UAT |

### T1 [P] — Remove third-party chat prints

- **Agent:** frontend
- **Skills:** none
- **What:** Delete `public/Overlay.png` and `public/Background2.png`. Remove
  the `globals.scss` rule that uses `Overlay.png` (src/style/globals.scss:~60),
  together with any class or selector that only exists to apply it; grep for
  its class name across `src/` and remove the usages. The landing must still
  render with no broken background.
- **Where:** public/Overlay.png, public/Background2.png, src/style/globals.scss, usages under src/
- **Depends on:** none
- **Reuses:** none
- **Done when:** `grep -rn "Overlay.png\|Background2" src public` is empty and the gate passes
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `chore(landing): drop screenshots of real Telegram chats`
- **→ R2.1**

### T2 [P] — Desktop sign-in layout

- **Agent:** frontend
- **Skills:** impeccable
- **What:** In `src/components/webhub/AuthGate.tsx`, when `!isMiniApp` (from
  `WebHubProvider`), render at `lg:` and up a full-viewport two-column layout,
  as described in design.md R1.3–R1.4. Below `lg:`, and always inside the
  Mini App, render exactly today's markup. Use CSS breakpoints only (R1.1).
  Reuse the v2 sidebar's background treatment (src/components/webhub/v2/Shell.tsx:78)
  and the `cb-*` tokens. Copy goes in `messages/*.json` under the existing
  `WebHub` namespace (pt/en/es).
- **Where:** src/components/webhub/AuthGate.tsx (+ a new `src/components/webhub/DesktopAuthFrame.tsx` if it keeps AuthGate readable), messages/{pt,en,es}.json
- **Depends on:** none
- **Reuses:** src/components/webhub/v2/Shell.tsx (wide layout), src/components/webhub/ui.tsx (`Screen`)
- **Done when:** at 1440 px, signed out, `/dashboard` shows two columns and the login widget; at 390 px it shows the current phone card
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `feat(webhub): desktop sign-in layout outside Telegram`
- **→ R1.1, R1.2, R1.3, R1.4**

### T3 — Modern landing page

- **Agent:** frontend
- **Skills:** impeccable
- **What:** Rebuild `/` per design.md R2.2–R2.7: section components `Hero`,
  `ProductPreview`, `Features` (6 cards: moderation and anti-spam, welcome and
  captcha, scheduled posts, events, memes and image search, AI chat), and
  `HowItWorks` (add to a group → make admin → configure in the panel or the
  Mini App), plus `FinalCta`. The invite link uses
  `runtimeConfig().telegramBotUsername`. All copy in pt/en/es. Responsive
  360–1440 px, reduced motion respected, no screenshots.
- **Where:** src/app/(site)/page.tsx, src/components/pages/home/*.tsx, messages/{pt,en,es}.json
- **Depends on:** T1
- **Reuses:** src/components/fx/Motion.tsx (`Reveal`), src/lib/design/tokens.ts, src/style/fonts.ts, src/lib/runtime-config.ts
- **Done when:** `/` renders every section at 1440 and 390 px with no console errors and the gate passes
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `feat(landing): modern multi-section landing page`
- **→ R2.2, R2.3, R2.4, R2.5, R2.6, R2.7**

### T-final — Close out

- **Agent:** docs
- **Skills:** none
- **What:** Run the WebHub locally and screenshot `/` and `/dashboard` at
  1440 and 390 px. Tick the goals in spec.md, flip the statuses, and note
  anything the human must validate (Login Widget needs BotFather `/setdomain`).
- **Where:** .specs/features/desktop-web-landing/*
- **Depends on:** T1, T2, T3
- **Reuses:** none
- **Done when:** screenshots reviewed; spec.md goals reflect reality
- **Gate:** none
- **Commit:** `docs(desktop-web-landing): close out`
- **→ all**

### T4 — Bot photo and feature summary in the hero

- **Agent:** frontend
- **Skills:** impeccable
- **What:** Show the bot's photo (`/cookiebot_avatar.jpeg`) prominently in
  the hero: a large round avatar with a soft ring, next to or overlapping the
  `ProductPreview`. Add a brief feature summary to the hero, a row of 4–6
  short chips such as "Moderação", "Boas-vindas", "Posts", "Eventos",
  "Memes", "IA", so visitors get the gist without scrolling. The full
  `Features` section stays. The copy goes in `HomePage.hero.*` in pt/en/es,
  keeping each file's line endings.
- **Where:** src/components/pages/home/Hero.tsx, src/components/pages/home/ProductPreview.tsx, messages/{pt,en,es}.json
- **Depends on:** T3
- **Reuses:** public/cookiebot_avatar.jpeg
- **Done when:** the avatar and the chips are visible above the fold at 1440 and 390 px
- **Gate:** `npm run lint && bun run build:static`
- **Commit:** `feat(landing): bot photo and feature summary in the hero`
- **→ R2.2**
