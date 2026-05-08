"use server";

import { z } from "zod";
import { Resend } from "resend";

export const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  company: z.string().max(200).optional().or(z.literal("")),
  message: z.string().min(10).max(4000),
  source: z.string().max(200).optional().or(z.literal("")),
  // honeypot — must be empty
  website: z.string().max(0).optional().or(z.literal("")),
  locale: z.enum(["en", "es"]),
});

export type ContactInput = z.infer<typeof ContactSchema>;

export type ContactState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    message: formData.get("message"),
    source: formData.get("source"),
    website: formData.get("website"),
    locale: formData.get("locale"),
  };

  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    const fallbackLocale = raw.locale === "es" ? "es" : "en";
    return {
      status: "error",
      message:
        fallbackLocale === "es"
          ? "Algunos campos no son válidos. Revisalos y probá de nuevo."
          : "Some fields are invalid. Check them and try again.",
    };
  }

  const data = parsed.data;
  if (data.website) {
    // honeypot triggered — silently succeed
    return { status: "success" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[contact] RESEND_API_KEY missing. Submission was:",
      JSON.stringify({ ...data, message: data.message.slice(0, 100) + "…" }),
    );
    return { status: "success" };
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
    return { status: "success" };
  } catch (error) {
    console.error("[contact] Resend send failed:", error);
    return {
      status: "error",
      message:
        data.locale === "es"
          ? "No pude enviar el mensaje. Probá WhatsApp o Cal.com mientras tanto."
          : "Could not send message. Try WhatsApp or Cal.com in the meantime.",
    };
  }
}
