"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import CTAButton from "@/components/ui/CTAButton";

type FieldName = "name" | "email" | "message";

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
  errors: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    messageRequired: string;
    messageTooShort: string;
  };
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
    errorGeneric:
      "Could not send message. Try WhatsApp or Cal.com in the meantime.",
    errors: {
      nameRequired: "Tell me your name",
      emailRequired: "I need an email to reply",
      emailInvalid: "That email looks off",
      messageRequired: "Tell me what you're building",
      messageTooShort: "A bit more context — at least 10 characters",
    },
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
    errorGeneric:
      "No pude enviar el mensaje. Probá WhatsApp o Cal.com mientras tanto.",
    errors: {
      nameRequired: "Decime tu nombre",
      emailRequired: "Necesito un email para responderte",
      emailInvalid: "Ese email no parece válido",
      messageRequired: "Contame qué estás construyendo",
      messageTooShort: "Un poco más de contexto — mínimo 10 caracteres",
    },
  },
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(
  name: FieldName,
  value: string,
  errors: Labels["errors"],
): string | undefined {
  const trimmed = value.trim();
  if (name === "name") {
    if (!trimmed) return errors.nameRequired;
  }
  if (name === "email") {
    if (!trimmed) return errors.emailRequired;
    if (!emailRegex.test(trimmed)) return errors.emailInvalid;
  }
  if (name === "message") {
    if (!trimmed) return errors.messageRequired;
    if (trimmed.length < 10) return errors.messageTooShort;
  }
  return undefined;
}

type FieldErrors = Partial<Record<FieldName, string>>;

export default function ContactForm({ locale }: { locale: Locale }) {
  const labels = labelsByLocale[locale];
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleBlur(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const name = event.currentTarget.name as FieldName;
    if (name !== "name" && name !== "email" && name !== "message") return;
    const message = validateField(name, event.currentTarget.value, labels.errors);
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const name = event.currentTarget.name as FieldName;
    if (name !== "name" && name !== "email" && name !== "message") return;
    if (!fieldErrors[name]) return;
    const message = validateField(name, event.currentTarget.value, labels.errors);
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const formData = new FormData(event.currentTarget);
    const values = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      message: String(formData.get("message") ?? ""),
      source: String(formData.get("source") ?? ""),
      website: String(formData.get("website") ?? ""),
    };

    const nextErrors: FieldErrors = {
      name: validateField("name", values.name, labels.errors),
      email: validateField("email", values.email, labels.errors),
      message: validateField("message", values.message, labels.errors),
    };

    if (nextErrors.name || nextErrors.email || nextErrors.message) {
      setFieldErrors(nextErrors);
      const firstInvalid = (event.currentTarget.elements.namedItem(
        nextErrors.name ? "name" : nextErrors.email ? "email" : "message",
      ) as HTMLElement | null);
      firstInvalid?.focus();
      return;
    }

    setFieldErrors({});
    setPending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, locale }),
      });
      const data = (await response.json().catch(() => null)) as
        | { status: "success" }
        | { status: "error"; message?: string }
        | null;

      if (response.ok && data?.status === "success") {
        router.push(`/${locale}/contact/sent`);
        return;
      }
      setServerError(
        data && "message" in data && data.message
          ? data.message
          : labels.errorGeneric,
      );
    } catch {
      setServerError(labels.errorGeneric);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-[var(--spacing-6)]">
      <div aria-hidden className="hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field
        label={labels.name}
        name="name"
        required
        type="text"
        error={fieldErrors.name}
        onBlur={handleBlur}
        onChange={handleChange}
      />
      <Field
        label={labels.email}
        name="email"
        required
        type="email"
        error={fieldErrors.email}
        onBlur={handleBlur}
        onChange={handleChange}
      />
      <Field label={labels.company} name="company" type="text" />

      <div className="space-y-[var(--spacing-2)]">
        <label
          htmlFor="message"
          className="block text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-muted)]"
        >
          {labels.message} <span className="text-[var(--color-accent)]">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={4000}
          placeholder={labels.messagePlaceholder}
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
          onBlur={handleBlur}
          onChange={handleChange}
          className={`w-full rounded-[var(--radius-sm)] border bg-[var(--color-bg-elevated)] px-[var(--spacing-4)] py-[var(--spacing-3)] text-sm text-[var(--color-fg)] placeholder-[var(--color-fg-subtle)] focus:outline-none focus:ring-2 ${
            fieldErrors.message
              ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/30"
              : "border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent-glow)]"
          }`}
        />
        {fieldErrors.message ? (
          <p
            id="message-error"
            role="alert"
            className="text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-danger)]"
          >
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      <Field label={labels.source} name="source" type="text" />

      {serverError ? (
        <p
          role="alert"
          className="border border-[var(--color-danger)] bg-[var(--color-bg-elevated)] px-[var(--spacing-4)] py-[var(--spacing-3)] text-sm text-[var(--color-danger)]"
        >
          {serverError}
        </p>
      ) : null}

      <CTAButton type="submit" disabled={pending}>
        {pending ? labels.submitting : labels.submit}
      </CTAButton>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  type,
  error,
  onBlur,
  onChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  type: string;
  error?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const errorId = `${name}-error`;
  return (
    <div className="space-y-[var(--spacing-2)]">
      <label
        htmlFor={name}
        className="block text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-muted)]"
      >
        {label}{" "}
        {required ? <span className="text-[var(--color-accent)]">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onBlur={onBlur}
        onChange={onChange}
        className={`w-full rounded-[var(--radius-sm)] border bg-[var(--color-bg-elevated)] px-[var(--spacing-4)] py-[var(--spacing-3)] text-sm text-[var(--color-fg)] focus:outline-none focus:ring-2 ${
          error
            ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/30"
            : "border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent-glow)]"
        }`}
      />
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
