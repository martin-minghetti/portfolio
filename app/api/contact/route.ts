import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ContactSchema } from "@/lib/contact-schema";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error", message: "Some fields are invalid." },
      { status: 422 },
    );
  }

  const data = parsed.data;
  if (data.website) {
    return NextResponse.json({ status: "success" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[contact] RESEND_API_KEY missing. Submission was:",
      JSON.stringify({ ...data, message: data.message.slice(0, 100) + "…" }),
    );
    return NextResponse.json({ status: "success" });
  }

  try {
    const resend = new Resend(apiKey);
    const subject = `[portfolio] ${data.name} — ${data.company || "no company"}`;
    const text = [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Company / Project: ${data.company || "—"}`,
      `Source: ${data.source || "—"}`,
      `Locale: ${data.locale}`,
      "",
      "Message:",
      data.message,
    ].join("\n");

    await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: ["martin.minghetti@gmail.com"],
      replyTo: data.email,
      subject,
      text,
    });
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("[contact] Resend send failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message:
          data.locale === "es"
            ? "No pude enviar el mensaje. Probá WhatsApp o Cal.com mientras tanto."
            : "Could not send message. Try WhatsApp or Cal.com in the meantime.",
      },
      { status: 500 },
    );
  }
}
