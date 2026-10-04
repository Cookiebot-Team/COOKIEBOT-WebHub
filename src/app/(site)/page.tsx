import { Features } from "@/components/pages/home/Features";
import { FinalCta } from "@/components/pages/home/FinalCta";
import { MiniAppRedirect } from "@/components/webhub/MiniAppRedirect";
import { Hero } from "@/components/pages/home/Hero";
import { HowItWorks } from "@/components/pages/home/HowItWorks";

export default function Home() {
	return (
		<main className="relative min-h-screen w-full overflow-hidden">
			<MiniAppRedirect />
			<Hero />
			<Features />
			<HowItWorks />
			<FinalCta />
		</main>
	);
}
