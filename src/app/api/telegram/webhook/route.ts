import { NextResponse } from "next/server";
import { handleTelegramUpdate } from "@/lib/telegram/bot";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("telegram webhook: TELEGRAM_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const header = req.headers.get("x-telegram-bot-api-secret-token");
  if (header !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: unknown;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!update || typeof update !== "object") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await handleTelegramUpdate(update as Parameters<typeof handleTelegramUpdate>[0]);
  } catch (error) {
    console.error("telegram webhook: handler error", error);
  }

  // Always 200 so Telegram does not retry endlessly on app errors
  return NextResponse.json({ ok: true });
}
