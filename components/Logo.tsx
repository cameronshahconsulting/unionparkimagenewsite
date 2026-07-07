export function LeafMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="var(--color-pine-800)" />
      <path
        d="M20 31c-6-4.5-9-9.5-9-14.5C11 11 15 8 20 8s9 3 9 8.5c0 5-3 10-9 14.5Z"
        fill="var(--color-pine-100)"
      />
      <path
        d="M20 9.5V30M20 16l-4.5-3M20 16l4.5-3M20 22l-5.5-3.5M20 22l5.5-3.5"
        stroke="var(--color-pine-800)"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LeafMark className="h-9 w-9 shrink-0" />
      <span className="leading-none">
        <span
          className={`block font-display text-lg font-semibold tracking-tight sm:text-xl ${
            light ? "text-white" : "text-pine-950"
          }`}
        >
          Union Park
        </span>
        <span
          className={`block text-[0.65rem] font-semibold uppercase tracking-[0.22em] ${
            light ? "text-pine-100" : "text-pine-700"
          }`}
        >
          Landscaping
        </span>
      </span>
    </span>
  );
}
