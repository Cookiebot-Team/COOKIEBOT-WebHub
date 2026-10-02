'use client';

import { Reveal } from "@/components/fx/Motion";
import { useTranslations } from "next-intl";

export default function Home() {
	const t = useTranslations("HomePage");

	return (
		<main className="relative min-h-screen w-full flex flex-col overflow-hidden">
			<div className="bg-main absolute inset-0 w-full h-full" />
			<div className="relative mt-32 md:mt-48 text-start z-10">
				<div className="flex flex-col items-center md:items-start text-center px-4 md:px-10">
					<Reveal>
						<h1 className="text-5xl md:text-8xl font-extrabold text-yellow-600 font-mono">Cookiebot!</h1>
						<div className="text-start max-w-[90vw] md:w-96">
							<p className="text-2xl md:text-4xl font-medium text-yellow-700 font-mono break-words">
								{t("slogan")}
							</p>
						</div>
					</Reveal>
					<Reveal className="mt-4">
						<a href="https://t.me/CookieMWbot?startgroup=new">
							<button className="primary">
								{t("inviteme")}
								+
							</button>
						</a>
					</Reveal>
				</div>
			</div>
		</main>
	);
}
