"use client";

import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/ui/Logo";

const W = 1315;
const H = 2672;
const OX = 68;
const OY = 58;
const box = (x1: number, y1: number, x2: number, y2: number) => ({
  left: `${((x1 + OX) / W) * 100}%`,
  top: `${((y1 + OY) / H) * 100}%`,
  width: `${((x2 - x1) / W) * 100}%`,
  height: `${((y2 - y1) / H) * 100}%`,
});

const FIELDS = [
  { frame: box(48, 498, 1130, 628), cover: box(76, 510, 1110, 616), text: "Дегустація кави в суботу" },
  { frame: box(48, 664, 1130, 1024), cover: box(76, 680, 1110, 1010), text: "Чекаємо сусідів о 12:00 біля буд. 3. Перша чашка — безкоштовно!", multiline: true },
];
const TOGGLE = box(909, 1422, 1097, 1505);
const BROADCAST = box(0, 1384, 1179, 2556);
const PUBLISH = box(48, 2049, 1133, 2171);
const SCREEN = box(0, 0, 1179, 2556);

type Phase = "typing" | "toggle" | "on" | "press" | "sent" | "reset";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function PostDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState<number[]>(() => FIELDS.map(() => 0));
  const [active, setActive] = useState(-1);
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(FIELDS.map((f) => f.text.length));
      setPhase("sent");
      return;
    }

    let cancelled = false;
    let running = false;
    let visible = false;

    async function run() {
      running = true;
      while (!cancelled && visible) {
        setPhase("typing");
        setTyped(FIELDS.map(() => 0));
        await sleep(700);
        for (let i = 0; i < FIELDS.length && !cancelled; i++) {
          setActive(i);
          for (let c = 1; c <= FIELDS[i].text.length && !cancelled; c++) {
            setTyped((t) => t.map((v, j) => (j === i ? c : v)));
            await sleep(35 + Math.random() * 55);
          }
          await sleep(350);
        }
        setActive(-1);
        setPhase("toggle");
        await sleep(250);
        setPhase("on");
        await sleep(1400);
        setPhase("press");
        await sleep(220);
        setPhase("sent");
        await sleep(4000);
        setPhase("reset");
        await sleep(450);
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

  const on = phase === "on" || phase === "press" || phase === "sent";

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 text-[3.7cqw] leading-[1.3] text-ink">
      {FIELDS.map((f, i) => (
        <div key={i}>
          <div
            style={f.frame}
            className={`absolute rounded-[3.4cqw] outline-2 transition-[outline-color] duration-200 ${
              active === i ? "outline-orange" : "outline-transparent"
            }`}
          />
          {(typed[i] > 0 || active === i) && (
            <div
              style={f.cover}
              className={`absolute flex bg-white px-[1cqw] transition-opacity duration-300 ${
                f.multiline ? "items-start pt-[0.6cqw]" : "items-center"
              } ${phase === "reset" ? "opacity-0" : ""}`}
            >
              <span className={f.multiline ? "" : "truncate"}>
                {f.text.slice(0, typed[i])}
                {active === i && <span className="animate-caret ml-px inline-block h-[1.1em] w-[0.4cqw] translate-y-[0.15em] bg-orange" />}
              </span>
            </div>
          )}
        </div>
      ))}

      <div
        style={{ ...BROADCAST, backgroundImage: "url(/screens/post-on.jpg)" }}
        className={`absolute bg-[length:100%_100%] transition-opacity duration-300 ${on ? "opacity-100" : "opacity-0"}`}
      />
      <div
        style={TOGGLE}
        className={`absolute rounded-full transition duration-200 ${phase === "toggle" ? "scale-90 bg-black/15" : "bg-transparent"}`}
      />
      <div
        style={PUBLISH}
        className={`absolute rounded-[4.9cqw] transition duration-200 ${phase === "press" ? "scale-95 bg-black/15" : "bg-transparent"}`}
      />

      <div style={SCREEN} className="absolute overflow-hidden rounded-[12cqw] [clip-path:inset(0_round_12cqw)]">
        <div
          className={`absolute inset-x-[2.4cqw] top-[12.5cqw] flex items-center gap-[2.8cqw] rounded-[5.5cqw] bg-white/90 p-[3cqw] leading-tight shadow-[0_3cqw_8cqw_-2cqw_rgba(60,30,10,.35)] ring-1 ring-black/5 backdrop-blur-md transition duration-500 ease-[cubic-bezier(.2,1.25,.35,1)] ${
            phase === "sent" ? "translate-y-0 opacity-100" : "-translate-y-[160%] opacity-0"
          }`}
        >
          <LogoMark className="size-[9.5cqw] flex-none" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <b className="truncate text-[3.3cqw] text-ink">Кав'ярня «Ранок»</b>
              <span className="flex-none text-[2.7cqw] text-ink-3">зараз</span>
            </div>
            <p className="mt-[0.6cqw] text-[3cqw] text-ink-2">Дегустація кави в суботу ☕ Перша чашка — безкоштовно!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
