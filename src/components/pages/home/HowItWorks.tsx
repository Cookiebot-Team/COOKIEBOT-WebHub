"use client";

import { useTranslations } from "next-intl";
import { R } from "./R";

const steps = ["add", "admin", "configure"] as const;

export function HowItWorks() {
	const t = useTranslations("HomePage.how");
	return (
		<section aria-labelledby="home-how" className="px-4 sm:px-8 py-16">
			<div className="mx-auto max-w-6xl rounded-cb-2xl bg-[rgba(42,27,1,0.96)] p-7 sm:p-12 text-cb-cream-50 shadow-cb-raised">
				<R>
					<h2 id="home-how" className="font-mono text-4xl sm:text-5xl">{t("title")}</h2>
				</R>
				<ol className="mt-10 grid md:grid-cols-3 gap-8 md:gap-6">
					{steps.map((s, i) => (
						<li key={s}>
							<R delay={i * 0.1}>
								<span className="font-mono text-6xl leading-none text-cb-warning" aria-hidden="true">{i + 1}</span>
								<h3 className="mt-3 font-jost text-xl font-bold">{t(`${s}.title`)}</h3>
								<p className="mt-2 font-jost text-base text-cb-cream-200">{t(`${s}.body`)}</p>
							</R>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
