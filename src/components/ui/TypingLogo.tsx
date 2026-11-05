"use client";

import { useEffect, useState } from "react";

const HEAD = "Q";
const TAIL = "Maply";
const TOTAL = HEAD.length + TAIL.length;

export default function TypingLogo({ className = "text-xl" }: { className?: string }) {
  const [n, setN] = useState(0);
  const [caret, setCaret] = useState(true);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(TOTAL);
      setCaret(false);
      return;
    }
    const timers: number[] = [];
    for (let i = 1; i <= TOTAL; i++) timers.push(window.setTimeout(() => setN(i), 250 + i * 90));
    timers.push(window.setTimeout(() => setCaret(false), 250 + TOTAL * 90 + 1600));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <span className={`relative inline-block font-display font-extrabold tracking-[-0.03em] whitespace-nowrap ${className}`}>
      <span className="invisible">
        {HEAD}
        <b>{TAIL}</b>
      </span>
      <span aria-hidden className="absolute inset-0">
        {HEAD.slice(0, n)}
        <b className="text-orange">{TAIL.slice(0, Math.max(0, n - HEAD.length))}</b>
        {caret && <span className="ml-0.5 inline-block h-[0.9em] w-[0.09em] translate-y-[0.1em] animate-caret bg-orange" />}
      </span>
    </span>
  );
}
