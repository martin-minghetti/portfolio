"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { submitContact, type ContactState } from "@/lib/contact";
import type { Locale } from "@/lib/i18n";

const initial: ContactState = { status: "idle" };

type Labels = {
  name: string;
  email: string;
  company: string;
  message: string;
  source: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
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
  },
};

function SubmitButton({ locale }: { locale: Locale }) {
  const { pending } = useFormStatus();
  const labels = labelsByLocale[locale];
  return (
    <button
      type="submit"
      disabled={pending}
      className="border-2 border-[var(--color-fg)] px-[var(--spacing-6)] py-[var(--spacing-3)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--text-xs)] text-[var(--color-fg)] transition-all duration-[var(--duration-instant)] ease-[var(--ease-snap)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] hover:text-[var(--color-accent)] disabled:opacity-60"
    >
      [ {pending ? labels.submitting : labels.submit} → ]
    </button>
  );
}

export default function ContactForm({ locale }: { locale: Locale }) {
  const [state, formAction] = useActionState(submitContact, initial);
  const router = useRouter();
  const labels = labelsByLocale[locale];

  useEffect(() => {
    if (state.status === "success") {
      router.push(`/${locale}/contact/sent`);
    }
  }, [state, router, locale]);

  return (
    <form action={formAction} className="space-y-[var(--spacing-6)]">
      <input type="hidden" name="locale" value={locale} />
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

      {state.status === "error" ? (
        <p
          role="alert"
          className="border border-[var(--color-danger)] bg-[var(--color-bg-elevated)] px-[var(--spacing-4)] py-[var(--spacing-3)] text-[var(--text-sm)] text-[var(--color-danger)]"
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton locale={locale} />
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
