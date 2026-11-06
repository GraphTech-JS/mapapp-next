"use client";

import { useEffect, useRef, useState } from "react";

const W = 1342;
const H = 2738;
const OX = 68;
const OY = 58;
const box = (x1: number, y1: number, x2: number, y2: number) => ({
  left: `${((x1 + OX) / W) * 100}%`,
  top: `${((y1 + OY) / H) * 100}%`,
  width: `${((x2 - x1) / W) * 100}%`,
  height: `${((y2 - y1) / H) * 100}%`,
});

const QUERY = "Нова Пошта";
const FIELD = box(220, 198, 1000, 290);
const LIST = box(0, 480, 1206, 2622);
const CARD = { x1: 48 + OX, y1: 1764 + OY, x2: 1157 + OX, y2: 2051 + OY, to: 505 + OY };
const cardW = CARD.x2 - CARD.x1;
const cardH = CARD.y2 - CARD.y1;

type Phase = "idle" | "typing" | "filtered" | "reset";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function SearchDemo({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(QUERY.length);
      setPhase("filtered");
      return;
    }

    let cancelled = false;
    let running = false;
    let visible = false;

    async function run() {
      running = true;
      while (!cancelled && visible) {
        setTyped(0);
        setPhase("idle");
        await sleep(900);
        setPhase("typing");
        for (let c = 1; c <= QUERY.length && !cancelled; c++) {
          setTyped(c);
          await sleep(90 + Math.random() * 70);
        }
        await sleep(350);
        setPhase("filtered");
        await sleep(3000);
        setPhase("reset");
        await sleep(600);
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

  const filtered = phase === "filtered";
  const showText = phase === "typing" || phase === "filtered";

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 text-[3.4cqw] leading-none text-ink">
      {phase !== "idle" && (
        <div
          style={FIELD}
          className={`absolute flex items-center bg-[#F5F5F4] pl-[0.9cqw] transition-opacity duration-300 ${showText ? "" : "opacity-0"}`}
        >
          {QUERY.slice(0, typed)}
          <span className="ml-px inline-block h-[1.15em] w-[0.45cqw] animate-caret bg-[#3478F6]" />
        </div>
      )}

      <div
        style={LIST}
        className={`absolute rounded-b-[12.7cqw] bg-[#FAF7F2] transition-opacity duration-400 ${filtered ? "opacity-100" : "opacity-0"}`}
      />

      <div
        style={{
          left: `${(CARD.x1 / W) * 100}%`,
          top: `${((filtered ? CARD.to : CARD.y1) / H) * 100}%`,
          width: `${(cardW / W) * 100}%`,
          height: `${(cardH / H) * 100}%`,
        }}
        className={`absolute overflow-hidden rounded-[3cqw] transition-[top] duration-500 ease-out ${
          phase === "filtered" || phase === "reset" ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          style={{
            backgroundImage: `url(${src})`,
            width: `${(W / cardW) * 100}%`,
            height: `${(H / cardH) * 100}%`,
            left: `${(-CARD.x1 / cardW) * 100}%`,
            top: `${(-CARD.y1 / cardH) * 100}%`,
          }}
          className="absolute bg-[length:100%_100%]"
        />
      </div>
    </div>
  );
}
