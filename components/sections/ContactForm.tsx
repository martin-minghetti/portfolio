"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type Labels = {
  name: string;
  email: string;
  company: string;
  message: string;
  source: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
  errorGeneric: string;
};

const labelsByLocale: Record<Locale, Labels> = {
  en: {
    name: "NAME",
    email: "EMAIL",
    company: "COMPANY OR PROJECT",
    message: "WHAT ARE YOU BUILDING?",
    source: "HOW DID YOU FIND ME?",
    messagePlaceholder:
      "Briefly: what it does, current stage, what you need help with",
    submit: "SEND MESSAGE",
    submitting: "SENDING…",
    errorGeneric: "Could not send message. Try WhatsApp or Cal.com in the meantime.",
  },
  es: {
    name: "NOMBRE",
    email: "EMAIL",
    company: "EMPRESA O PROYECTO",
    message: "¿QUÉ ESTÁS CONSTRUYENDO?",
    source: "¿CÓMO ME ENCONTRASTE?",
    messagePlaceholder:
      "En corto: qué hace, en qué etapa está, y en qué necesitás ayuda",
    submit: "ENVIAR MENSAJE",
    submitting: "ENVIANDO…",
    errorGeneric: "No pude enviar el mensaje. Probá WhatsApp o Cal.com mientras tanto.",
  },
};

export default function ContactForm({ locale }: { locale: Locale }) {
  const labels = labelsByLocale[locale];
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      message: String(formData.get("message") ?? ""),
      source: String(formData.get("source") ?? ""),
      website: String(formData.get("website") ?? ""),
      locale,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as
        | { status: "success" }
        | { status: "error"; message?: string }
        | null;

      if (response.ok && data?.status === "success") {
        router.push(`/${locale}/contact/sent`);
        return;
      }
      setError(data && "message" in data && data.message ? data.message : labels.errorGeneric);
    } catch {
      setError(labels.errorGeneric);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-[var(--spacing-6)]">
      <div aria-hidden className="hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label={labels.name} name="name" required type="text" />
      <Field label={labels.email} name="email" required type="email" />
      <Field label={labels.company} name="company" type="text" />

      <div className="space-y-[var(--spacing-2)]">
        <label
          htmlFor="message"
          className="block text-[var(--text-xs)] uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-muted)]"
        >
          {labels.message} <span className="text-[var(--color-accent)]">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={5}
          placeholder={labels.messagePlaceholder}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-[var(--spacing-4)] py-[var(--spacing-3)] text-[var(--text-sm)] text-[var(--color-fg)] placeholder-[var(--color-fg-subtle)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-glow)]"
        />
      </div>

      <Field label={labels.source} name="source" type="text" />

      {error ? (
        <p
          role="alert"
          className="border border-[var(--color-danger)] bg-[var(--color-bg-elevated)] px-[var(--spacing-4)] py-[var(--spacing-3)] text-[var(--text-sm)] text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="border-2 border-[var(--color-fg)] px-[var(--spacing-6)] py-[var(--spacing-3)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--text-xs)] text-[var(--color-fg)] transition-all duration-[var(--duration-instant)] ease-[var(--ease-snap)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] hover:text-[var(--color-accent)] disabled:opacity-60"
      >
        [ {pending ? labels.submitting : labels.submit} → ]
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  type,
}: {
  label: string;
  name: string;
  required?: boolean;
  type: string;
}) {
  return (
    <div className="space-y-[var(--spacing-2)]">
      <label
        htmlFor={name}
        className="block text-[var(--text-xs)] uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-muted)]"
      >
        {label}{" "}
        {required ? <span className="text-[var(--color-accent)]">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        type={type}
        autoComplete="off"
        className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-[var(--spacing-4)] py-[var(--spacing-3)] text-[var(--text-sm)] text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-glow)]"
      />
    </div>
  );
}
