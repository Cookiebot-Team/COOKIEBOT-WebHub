"use client";

import { useTranslations } from "next-intl";
import { InviteLinks } from "./InviteLinks";
import { Paw } from "./Paw";
import { ProductPreview } from "./ProductPreview";
import { R } from "./R";

export function Hero() {
	const t = useTranslations("HomePage");
	return (
		<section aria-labelledby="home-hero" className="relative px-4 sm:px-8 pt-28 md:pt-40 pb-16">
			<div className="mx-auto max-w-6xl grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-8 items-center">
				<div className="relative rounded-cb-2xl bg-cb-cream-50/85 dark:bg-cb-brown-900/85 backdrop-blur-md p-7 sm:p-10 shadow-cb-card text-cb-brown-900 dark:text-cb-cream-100">
					<Paw className="absolute -top-6 -left-3 w-14 h-14 -rotate-12 text-cb-brown-500/30 dark:text-cb-cream-100/20" />
					<R>
						<p className="font-jost text-sm font-bold uppercase tracking-[0.18em] text-cb-brown-500 dark:text-cb-sand">{t("hero.eyebrow")}</p>
						<h1 id="home-hero" className="mt-2 font-mono text-6xl sm:text-7xl xl:text-8xl leading-none text-cb-brown-800 dark:text-cb-cream-50">Cookiebot!</h1>
						<p className="mt-5 font-jost text-2xl sm:text-3xl font-medium text-balance">{t("slogan")}</p>
						<p className="mt-3 font-jost text-lg text-cb-muted dark:text-cb-cream-200 max-w-prose">{t("hero.lead")}</p>
						<InviteLinks className="mt-8" />
					</R>
				</div>
				<ProductPreview />
			</div>
		</section>
	);
}
