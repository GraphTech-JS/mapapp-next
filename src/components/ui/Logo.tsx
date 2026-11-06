export function LogoMark({ className = "size-[44px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true" className={className}>
      <rect width="44" height="44" rx="10" fill="#F97316" />
      <rect x="8" y="8" width="8" height="8" rx="1.75" fill="#fff" fillOpacity={0.25} />
      <rect x="18" y="8" width="8" height="8" rx="1.75" fill="#fff" fillOpacity={0.25} />
      <rect x="28" y="8" width="8" height="8" rx="1.75" fill="#fff" fillOpacity={0.25} />
      <rect x="8" y="18" width="8" height="8" rx="1.75" fill="#fff" fillOpacity={0.25} />
      <rect x="18" y="18" width="8" height="8" rx="1.75" fill="#fff" />
      <rect x="28" y="18" width="8" height="8" rx="1.75" fill="#fff" fillOpacity={0.25} />
      <rect x="8" y="28" width="8" height="8" rx="1.75" fill="#fff" fillOpacity={0.25} />
      <rect x="18" y="28" width="8" height="8" rx="1.75" fill="#fff" fillOpacity={0.25} />
      <rect x="28" y="28" width="8" height="8" rx="1.75" fill="#fff" fillOpacity={0.25} />
      <path d="M22 25L20.25 22.36A2.1 2.1 0 1 1 23.75 22.36Z" fill="#28272C" />
      <circle cx="22" cy="21.2" r="0.75" fill="#fff" />
    </svg>
  );
}

export function LogoText({ full = false }: { full?: boolean }) {
  return (
    <span className="font-display text-[22px] font-extrabold tracking-[-0.03em]">
      Q<b className="text-orange">Maply</b>
    </span>
  );
}
