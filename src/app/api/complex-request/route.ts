import { NextResponse } from "next/server";
import { coord, deliverLead, esc, parseContact, rateLimited, readForm, str } from "@/lib/leads";

export async function POST(req: Request) {
  const body = await readForm(req);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });
  if (str(body.website, 200)) return NextResponse.json({ ok: true });

  const complex = str(body.complex, 120);
  const address = str(body.address, 200);
  const name = str(body.name, 80);
  const contact = str(body.contact, 120);
  const comment = str(body.comment, 2000);
  const locale = body.locale === "en" ? "en" : "uk";
  const latitude = coord(body.latitude, 90);
  const longitude = coord(body.longitude, 180);
  const hasPoint = latitude !== undefined && longitude !== undefined;
  const parsed = parseContact(contact);
  if (!complex || !address || !name || !parsed) return NextResponse.json({ ok: false }, { status: 400 });
  if (rateLimited(req)) return NextResponse.json({ ok: false }, { status: 429 });

  const text = [
    "🏢 <b>Нова заявка на підключення ЖК</b>",
    "",
    `<b>ЖК:</b> ${esc(complex)}`,
    `<b>Адреса:</b> ${esc(address)}`,
    ...(hasPoint ? [`<b>Мапа:</b> <a href="https://www.google.com/maps?q=${latitude},${longitude}">${latitude}, ${longitude}</a>`] : []),
    `<b>Ім'я:</b> ${esc(name)}`,
    parsed.html,
    ...(comment ? [`<b>Коментар:</b> ${esc(comment)}`] : []),
  ].join("\n");

  return deliverLead(
    req,
    {
      type: "complex",
      name,
      contact: parsed.value,
      complex,
      address,
      message: comment,
      locale,
      ...(hasPoint ? { latitude, longitude } : {}),
    },
    text,
  );
}
