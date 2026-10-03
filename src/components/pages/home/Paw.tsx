export function Paw({ className = "" }: { className?: string }) {
	return (
		<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true" className={className}>
			<ellipse cx="32" cy="42" rx="14" ry="11" />
			<ellipse cx="12" cy="28" rx="6" ry="8" transform="rotate(-18 12 28)" />
			<ellipse cx="25" cy="16" rx="6" ry="9" transform="rotate(-6 25 16)" />
			<ellipse cx="39" cy="16" rx="6" ry="9" transform="rotate(6 39 16)" />
			<ellipse cx="52" cy="28" rx="6" ry="8" transform="rotate(18 52 28)" />
		</svg>
	);
}
