export function LogoMark({ className = "size-[30px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1024 1024" aria-hidden="true" className={className}>
      <rect width="1024" height="1024" rx="228" fill="#F97316" />
      <rect x="180" y="180" width="192" height="192" rx="40" fill="#fff" fillOpacity={0.25} />
      <rect x="416" y="180" width="192" height="192" rx="40" fill="#fff" fillOpacity={0.25} />
      <rect x="652" y="180" width="192" height="192" rx="40" fill="#fff" fillOpacity={0.25} />
      <rect x="180" y="416" width="192" height="192" rx="40" fill="#fff" fillOpacity={0.25} />
      <rect x="416" y="416" width="192" height="192" rx="40" fill="#fff" />
      <rect x="652" y="416" width="192" height="192" rx="40" fill="#fff" fillOpacity={0.25} />
      <rect x="180" y="652" width="192" height="192" rx="40" fill="#fff" fillOpacity={0.25} />
      <rect x="416" y="652" width="192" height="192" rx="40" fill="#fff" fillOpacity={0.25} />
      <rect x="652" y="652" width="192" height="192" rx="40" fill="#fff" fillOpacity={0.25} />
      <path d="M512 582L470.4 519.8A50 50 0 1 1 553.6 519.8Z" fill="#28272C" />
      <circle cx="512" cy="492" r="17" fill="#fff" />
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
