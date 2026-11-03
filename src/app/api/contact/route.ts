import { NextResponse } from "next/server";

/**
 * Receives the contact form. Wire this to your email provider (Resend,
 * Postmark, SES) or CRM; until then it validates and returns 202 so the
 * form's success state can be exercised in development.
 */
export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const required = ["name", "company", "email", "message"];
  const missing = required.filter((k) => typeof data[k] !== "string" || !(data[k] as string).trim());
  if (missing.length) return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(data.email)))
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  // TODO: deliver the message. Example with Resend:
  // await resend.emails.send({ from: "site@oppa.example", to: "hello@oppa.example", subject: ..., text: ... });
  console.info("[contact]", { name: data.name, company: data.company, email: data.email });
  return NextResponse.json({ ok: true }, { status: 202 });
}
