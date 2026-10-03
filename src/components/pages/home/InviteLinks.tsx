"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { runtimeConfig } from "@/lib/runtime-config";

const base = "inline-flex items-center justify-center rounded-cb-lg px-6 py-3 text-lg font-jost font-bold transition-all duration-200 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cb-brown-700/60 dark:focus-visible:ring-cb-cream-100/70";

export function InviteLinks({ className = "" }: { className?: string }) {
	const t = useTranslations("HomePage");
	// The bot name is injected at runtime; read it after mount so the static
	// HTML and the first client render agree.
	const [bot, setBot] = useState(() => runtimeConfig().telegramBotUsername);
	useEffect(() => setBot(runtimeConfig().telegramBotUsername), []);

	return (
		<div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
			<a
				href={`https://t.me/${bot}?startgroup=new`}
				className={`${base} bg-cb-brown-800 text-cb-cream-50 shadow-cb-raised hover:bg-cb-brown-900 dark:bg-cb-cream-100 dark:text-cb-brown-900 dark:hover:bg-cb-cream-50`}
			>
				{t("inviteme").trim()}
			</a>
			<Link
				href="/dashboard"
				className={`${base} border-2 border-cb-brown-800 text-cb-brown-800 hover:bg-cb-brown-800/10 dark:border-cb-cream-100 dark:text-cb-cream-100 dark:hover:bg-cb-cream-100/10`}
			>
				{t("hero.openPanel")}
			</Link>
		</div>
	);
}
