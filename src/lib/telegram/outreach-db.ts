import type { OutreachStatus } from "@/lib/telegram/outreach-constants";

export type OutreachRecord = {
  complex: string;
  business: string;
  category: string;
  contact: string;
  personName: string;
  position: string;
  status: OutreachStatus;
  comment: string;
  createdBy: number;
};

export type StatusCounts = Record<OutreachStatus, number> & { total: number };

function emptyCounts(): StatusCounts {
  return { added: 0, contact_passed: 0, not_interested: 0, total: 0 };
}

function kyivDay(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function apiBase() {
  return (process.env.QMAP_API_URL || "").replace(/\/$/, "");
}

function outreachSecret() {
  return (
    process.env.OUTREACH_API_SECRET?.trim() ||
    process.env.TELEGRAM_BOT_TOKEN?.trim() ||
    ""
  );
}

async function outreachFetch(path: string, init?: RequestInit) {
  const base = apiBase();
  const secret = outreachSecret();
  if (!base || !secret) {
    throw new Error("outreach_api_unconfigured");
  }
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-outreach-secret": secret,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`outreach_api_${res.status}:${body.slice(0, 200)}`);
  }
  return res;
}

export async function insertOutreach(record: OutreachRecord) {
  await outreachFetch("/v1/outreach", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function outreachStats() {
  try {
    const res = await outreachFetch("/v1/outreach/stats");
    const data = (await res.json()) as {
      today?: StatusCounts;
      all?: StatusCounts;
      dayLabel?: string;
    };
    return {
      today: { ...emptyCounts(), ...data.today },
      all: { ...emptyCounts(), ...data.all },
      dayLabel: data.dayLabel || kyivDay(),
    };
  } catch (error) {
    console.error("outreach stats failed", error);
    return {
      today: emptyCounts(),
      all: emptyCounts(),
      dayLabel: kyivDay(),
    };
  }
}
