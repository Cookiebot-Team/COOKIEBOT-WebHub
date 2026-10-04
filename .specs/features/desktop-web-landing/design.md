# Design — desktop-web-landing

## R1 Desktop vs Mini App

- **R1.1** The switch is CSS, not JS: `lg:` (1024 px) breakpoints plus
  `isMiniApp` from `WebHubProvider` (`initData` present). No user-agent
  sniffing, no `matchMedia` — static export renders one HTML for everyone and
  a JS decision would flash the wrong layout on hydration.
- **R1.2** Mini App (`isMiniApp === true`) always keeps the phone layout,
  whatever the width (Telegram Desktop opens Mini Apps in a ~400 px panel, and
  `v2/Shell.tsx` already follows this rule: `wide = !isMiniApp`).
- **R1.3** `AuthGate` (src/components/webhub/AuthGate.tsx) gets a desktop
  variant used when `!isMiniApp`: at `lg:` and up, a full-viewport two-column
  layout. The left column is a brand panel in the v2 sidebar style (dark
  `bg1.jpg` gradient, avatar, title, three short value props). The right
  column, on the `setup-pattern.jpg` background, holds a card with the prompt
  and the Telegram Login Widget. Below `lg:` it renders today's `Screen`
  markup unchanged.
- **R1.4** Every other `AuthGate` state (loading, error, "pick a group" when
  `requireGroup`) uses the same desktop frame on `lg:`.
- **R1.5** The dashboard after sign-in is already wide (`v2/Shell.tsx`);
  no change.

## R2 Landing

- **R2.1** Delete `public/Overlay.png`, `public/Background2.png` and the
  `globals.scss` rule(s) that reference them (around line 60). Grep shows no
  other reference to either.
- **R2.2** `src/app/(site)/page.tsx` becomes a composition of section
  components under `src/components/pages/home/`: `Hero`, `ProductPreview`,
  `Features`, `HowItWorks`, `FinalCta`. The existing `Navbar`, `Footer`,
  `Splash` and `BackgroundImage` stay.
- **R2.3** `ProductPreview` draws a stylised dashboard card plus a Telegram
  chat bubble with Cookiebot commands (`/meme`, `/searchimage`, `/everyone`)
  in HTML/Tailwind, using the `cb-*` tokens (src/lib/design/tokens.ts). It
  shows no real group or user names. It is decorative: `aria-hidden`.
- **R2.4** Invite link `https://t.me/<bot>?startgroup=new`, where `<bot>`
  comes from `runtimeConfig().telegramBotUsername` (src/lib/runtime-config.ts),
  read on the client. Secondary CTA: `/dashboard`.
- **R2.5** Motion: the existing `Reveal` (src/components/fx/Motion.tsx) on
  scroll; no new animation library. Respect `prefers-reduced-motion`
  (framer-motion `useReducedMotion` or the `motion-safe:` variant).
- **R2.6** Copy: new keys under `HomePage.*` in `messages/pt.json`,
  `messages/en.json` and `messages/es.json`, with pt as the source. Keep
  `HomePage.inviteme` and `HomePage.slogan`.
- **R2.7** Type: title in Lobster (the brand), body in Jost; the existing
  `font-mono` hero goes. Semantic structure: one `h1`, `h2` per section,
  `section` landmarks, visible focus rings.
