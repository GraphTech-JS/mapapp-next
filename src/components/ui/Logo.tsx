export function LogoMark({ className = "size-[30px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="9" fill="#FF6B1A" />
      <path d="M16 6.5c-4.1 0-7.2 3.1-7.2 7 0 5.2 7.2 12 7.2 12s7.2-6.8 7.2-12c0-3.9-3.1-7-7.2-7z" fill="#fff" />
      <circle cx="16" cy="13.4" r="2.8" fill="#FF6B1A" />
    </svg>
  );
}

export function LogoText({ full = false }: { full?: boolean }) {
  return (
    <span className="font-display text-xl font-extrabold tracking-[-0.03em]">
      Q<b className="text-orange">Maply</b>
    </span>
  );
}
