"use client";

import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/ui/Logo";

const W = 1342;
const H = 2738;
const SCREEN = {
  left: `${(68 / W) * 100}%`,
  top: `${(58 / H) * 100}%`,
  width: `${(1206 / W) * 100}%`,
  height: `${(2622 / H) * 100}%`,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function NotifyDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    let cancelled = false;
    let running = false;
    let visible = false;

    async function run() {
      running = true;
      while (!cancelled && visible) {
        await sleep(1200);
        setShown(true);
        await sleep(3800);
        setShown(false);
        await sleep(1400);
      }
      running = false;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !running) run();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
      <div style={SCREEN} className="absolute overflow-hidden rounded-[12cqw] [clip-path:inset(0_round_12cqw)]">
        <div
          className={`absolute inset-x-[2.4cqw] top-[12.5cqw] flex items-center gap-[2.8cqw] rounded-[5.5cqw] bg-white/90 p-[3cqw] shadow-[0_3cqw_8cqw_-2cqw_rgba(60,30,10,.35)] ring-1 ring-black/5 backdrop-blur-md transition duration-500 ease-[cubic-bezier(.2,1.25,.35,1)] ${
            shown ? "translate-y-0 opacity-100" : "-translate-y-[160%] opacity-0"
          }`}
        >
          <LogoMark className="size-[9.5cqw] flex-none" />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-baseline justify-between gap-2">
              <b className="truncate text-[3.3cqw] text-ink">Відкрився заклад «Ранок»</b>
              <span className="flex-none text-[2.7cqw] text-ink-3">зараз</span>
            </div>
            <p className="mt-[0.6cqw] text-[3cqw] text-ink-2">Кав'ярня у Варшавському масиві, буд. 3. Подивіться на мапі</p>
          </div>
        </div>
      </div>
    </div>
  );
}
