import type { Metadata } from "next";
import "@/style/globals.scss";
import { fonts } from "@/style/fonts";
import { ReactNode } from "react";
import QueryProvider from '../providers/QueryProvider';
import LocaleProvider from '../providers/LocaleProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://cookiebotfur.net'),
  title: {
    default: "Cookiebot",
    template: "%s | Cookiebot"
  },
  openGraph: {
    images: [
      {
        url: '/cookiebot_avatar.jpeg',
        width: 1200,
        height: 630
    }
    ]
  },
  description: "O bot mais crocante do Telegram!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt" className={`${fonts.map(font => font.variable).join(' ')} dark`} suppressHydrationWarning={true}>
      <head>
        {/* Served by the runtime (server/main.ts, or a dev route): per-deployment
            settings from environment variables, read before the app starts. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/runtime-config.js"></script>
      </head>
      <body>
        <QueryProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
