"use client";

import { useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/fx/Motion";

// Scroll reveal that steps aside when the visitor asks for less motion.
export function R({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
	const reduced = useReducedMotion();
	if (reduced) return <div className={className}>{children}</div>;
	return (
		<Reveal width="100%" ignoreView={false} delay={delay} duration={0.6} ease="easeOut" className={className}>
			{children}
		</Reveal>
	);
}
