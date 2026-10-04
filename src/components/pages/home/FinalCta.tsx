"use client";

import { useTranslations } from "next-intl";
import { InviteLinks } from "./InviteLinks";
import { Paw } from "./Paw";
import { R } from "./R";

export function FinalCta() {
	const t = useTranslations("HomePage");
	return (
		<section aria-labelledby="home-cta" className="px-4 sm:px-8 pt-16 pb-28">
			<div className="relative overflow-hidden mx-auto max-w-4xl rounded-cb-2xl bg-cb-cream-50/90 dark:bg-cb-brown-900/85 backdrop-blur-md p-8 sm:p-14 text-center shadow-cb-card text-cb-brown-900 dark:text-cb-cream-100">
				<Paw className="absolute -right-6 -bottom-6 w-32 h-32 rotate-12 text-cb-brown-500/20 dark:text-cb-cream-100/10" />
				<Paw className="absolute -left-4 -top-4 w-20 h-20 -rotate-12 text-cb-brown-500/20 dark:text-cb-cream-100/10" />
				<R className="relative">
					<h2 id="home-cta" className="font-mono text-4xl sm:text-5xl text-cb-brown-800 dark:text-cb-cream-50">{t("final.title")}</h2>
					<p className="mt-3 font-jost text-lg text-cb-muted dark:text-cb-cream-200">{t("final.body")}</p>
					<InviteLinks className="mt-8 justify-center" />
				</R>
			</div>
		</section>
	);
}
