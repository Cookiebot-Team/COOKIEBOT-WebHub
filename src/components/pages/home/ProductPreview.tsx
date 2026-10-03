import { R } from "./R";

function Bar({ w, tone = "bg-cb-line" }: { w: string; tone?: string }) {
	return <div className={`h-2 rounded-full ${tone}`} style={{ width: w }} />;
}

// Decorative mock of the panel and a Telegram chat. Drawn in markup on
// purpose: no screenshots, no real group or user names.
export function ProductPreview() {
	return (
		<div aria-hidden="true" className="relative mx-auto w-full max-w-md lg:max-w-none h-[430px] sm:h-[470px]">
			<R className="absolute inset-0">
				<div className="absolute left-0 top-0 w-[88%] rounded-cb-xl bg-cb-cream-50 dark:bg-cb-brown-800 border border-cb-line dark:border-cb-brown-500 shadow-cb-raised p-5 rotate-[-2deg]">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-cb-warning" />
						<div className="flex-1 space-y-2">
							<Bar w="55%" tone="bg-cb-brown-700 dark:bg-cb-cream-100" />
							<Bar w="35%" />
						</div>
						<div className="h-6 w-11 rounded-full bg-cb-success p-0.5 flex justify-end"><div className="h-5 w-5 rounded-full bg-white" /></div>
					</div>
					<div className="mt-5 space-y-4">
						{["72%", "58%", "84%"].map((w, i) => (
							<div key={i} className="flex items-center gap-3">
								<div className="w-6 h-6 rounded-cb-sm bg-cb-peach dark:bg-cb-brown-700" />
								<div className="flex-1 space-y-1.5"><Bar w={w} tone="bg-cb-sand/70" /><Bar w="40%" /></div>
								<div className={`h-5 w-9 rounded-full p-0.5 flex ${i === 1 ? "bg-cb-line justify-start" : "bg-cb-success justify-end"}`}><div className="h-4 w-4 rounded-full bg-white" /></div>
							</div>
						))}
					</div>
					<div className="mt-5 h-9 rounded-cb-md bg-cb-brown-800 dark:bg-cb-cream-100" />
				</div>
			</R>
			<R delay={0.15} className="absolute right-0 bottom-0 w-[82%]">
				<div className="rounded-cb-xl bg-white dark:bg-cb-slate-900 shadow-cb-float p-4 space-y-3 font-jost text-sm text-cb-ink dark:text-cb-cream-50 rotate-[1.5deg]">
					<div className="flex items-center gap-2 pb-2 border-b border-black/10 dark:border-white/10">
						<span className="w-3 h-3 rounded-full bg-cb-telegram" />
						<Bar w="35%" tone="bg-cb-gray-600/50" />
					</div>
					<div className="ml-auto w-fit rounded-2xl rounded-br-sm bg-cb-telegram text-white px-3 py-2"><b>/meme</b></div>
					<div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-cb-cream-100 dark:bg-cb-brown-800 px-3 py-2 space-y-2">
						<div className="h-16 w-40 rounded-cb-sm bg-gradient-to-br from-cb-warning to-cb-sand" />
						<Bar w="60%" tone="bg-cb-brown-500/50" />
					</div>
					<div className="ml-auto w-fit rounded-2xl rounded-br-sm bg-cb-telegram text-white px-3 py-2"><b>/searchimage</b> cookie</div>
					<div className="ml-auto w-fit rounded-2xl rounded-br-sm bg-cb-telegram text-white px-3 py-2"><b>/everyone</b></div>
				</div>
			</R>
		</div>
	);
}
