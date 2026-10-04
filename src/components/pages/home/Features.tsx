"use client";

import { useTranslations } from "next-intl";
import { CalendarDaysIcon, ChatBubbleLeftRightIcon, ClockIcon, PhotoIcon, ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { R } from "./R";

const items = [
	{ key: "moderation", Icon: ShieldCheckIcon },
	{ key: "welcome", Icon: ChatBubbleLeftRightIcon },
	{ key: "schedule", Icon: ClockIcon },
	{ key: "events", Icon: CalendarDaysIcon },
	{ key: "memes", Icon: PhotoIcon },
	{ key: "ai", Icon: SparklesIcon },
] as const;

export function Features() {
	const t = useTranslations("HomePage.features");
	return (
		<section aria-labelledby="home-features" className="px-4 sm:px-8 py-16">
			<div className="mx-auto max-w-6xl">
				<R>
					<h2 id="home-features" className="font-mono text-4xl sm:text-5xl text-cb-brown-800 dark:text-cb-cream-50 drop-shadow-sm">{t("title")}</h2>
				</R>
				<ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
					{items.map(({ key, Icon }, i) => (
						<li key={key} className="flex">
							<R delay={(i % 3) * 0.08} className="flex-1 flex">
								<article className="flex-1 rounded-cb-xl bg-cb-cream-50/90 dark:bg-cb-brown-900/85 backdrop-blur-sm border border-cb-line dark:border-cb-brown-500/60 p-6 shadow-cb-card text-cb-brown-900 dark:text-cb-cream-100 motion-safe:transition-transform motion-safe:hover:-translate-y-1">
									<span className="inline-flex w-12 h-12 items-center justify-center rounded-cb-md bg-cb-peach dark:bg-cb-brown-700 text-cb-brown-700 dark:text-cb-cream-100">
										<Icon className="w-6 h-6" aria-hidden="true" />
									</span>
									<h3 className="mt-4 font-jost text-xl font-bold">{t(`${key}.title`)}</h3>
									<p className="mt-2 font-jost text-base text-cb-muted dark:text-cb-cream-200">{t(`${key}.body`)}</p>
								</article>
							</R>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
