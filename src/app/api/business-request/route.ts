import { NextResponse } from "next/server";
import { deliverLead, esc, parseContact, rateLimited, readForm, str } from "@/lib/leads";

export async function POST(req: Request) {
  const body = await readForm(req);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });
  if (str(body.website, 200)) return NextResponse.json({ ok: true });

  const complex = str(body.complex, 120);
  const business = str(body.business, 120);
  const name = str(body.name, 80);
  const contact = str(body.contact, 64);
  const comment = str(body.comment, 1000);
  const locale = body.locale === "en" ? "en" : "uk";
  const parsed = parseContact(contact);
  if (!complex || !business || !name || !parsed) return NextResponse.json({ ok: false }, { status: 400 });
  if (rateLimited(req)) return NextResponse.json({ ok: false }, { status: 429 });

  const text = [
    "🏪 <b>Заявка бізнесу на мапу</b>",
    "",
    `<b>ЖК:</b> ${esc(complex)}`,
    `<b>Заклад:</b> ${esc(business)}`,
    `<b>Ім'я:</b> ${esc(name)}`,
    parsed.html,
    ...(comment ? [`<b>Коментар:</b> ${esc(comment)}`] : []),
  ].join("\n");

  return deliverLead(req, { type: "listing", name, contact: parsed.value, complex, business, message: comment, locale }, text);
}
