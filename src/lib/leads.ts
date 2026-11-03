import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram/send";

const recent = new Map<string, number[]>();

export type Lead = {
  type: "complex" | "listing" | "business" | "question";
  name: string;
  contact: string;
  complex?: string;
  address?: string;
  role?: string;
  business?: string;
  message?: string;
  latitude?: number;
  longitude?: number;
  locale: "uk" | "en";
};

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function coord(v: unknown, limit: number) {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) && Math.abs(n) <= limit ? Math.round(n * 1e6) / 1e6 : undefined;
}

export async function readForm(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}

export function rateLimited(req: Request, max = 5, windowMs = 10 * 60_000) {
  const ip = clientIp(req) || "unknown";
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > max;
}

const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";

async function saveToAdmin(lead: Lead, ip: string): Promise<boolean | null> {
  const api = process.env.QMAP_API_URL;
  if (!api) return null;
  const body = Object.fromEntries(Object.entries(lead).filter(([, v]) => v !== "" && v !== undefined));
  try {
    const res = await fetch(`${api.replace(/\/$/, "")}/v1/site-leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(ip ? { "x-forwarded-for": ip } : {}) },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error("site-leads: admin API error", res.status, await res.text());
    return res.ok;
  } catch (error) {
    console.error("site-leads: admin API unreachable", error);
    return false;
  }
}

export async function deliverLead(req: Request, lead: Lead, telegramText: string) {
  const [admin, telegram] = await Promise.all([saveToAdmin(lead, clientIp(req)), sendTelegramMessage(telegramText)]);
  if (admin === null && telegram === null) {
    console.error("site-leads: neither QMAP_API_URL nor Telegram is configured");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  const ok = admin ?? telegram;
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
