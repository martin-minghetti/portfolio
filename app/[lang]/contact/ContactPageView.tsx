"use client";

import { motion } from "framer-motion";
import type { Locale } from "@/lib/i18n";
import ContactForm from "@/components/sections/ContactForm";

type TrackBlockData = {
  heading: string;
  tagline: string;
  cta: string;
  ctaHref: string;
  orForm: string;
};

type Labels = {
  sectionHeader: string;
  lead: string;
  trackA: TrackBlockData;
  trackB: TrackBlockData;
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOutExpo },
  },
};

export default function ContactPageView({
  labels,
  locale,
}: {
  labels: Labels;
  locale: Locale;
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-[var(--container-default)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-24)]"
    >
      <motion.header variants={item} className="space-y-[var(--spacing-4)]">
        <h1 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent)]">
          {labels.sectionHeader}
        </h1>
        <p className="text-[var(--text-2xl)] leading-[var(--leading-snug)] tracking-[var(--tracking-tight)]">
          {labels.lead}
        </p>
      </motion.header>

      <motion.div
        variants={item}
        className="mt-[var(--spacing-12)] grid gap-[var(--spacing-6)] md:grid-cols-2"
      >
        <TrackBlock data={labels.trackA} />
        <TrackBlock data={labels.trackB} />
      </motion.div>

      <motion.hr
        variants={item}
        className="my-[var(--spacing-16)] border-[var(--color-border)]"
      />

      <motion.div variants={item}>
        <ContactForm locale={locale} />
      </motion.div>
    </motion.div>
  );
}

function TrackBlock({ data }: { data: TrackBlockData }) {
  return (
    <article className="border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-[var(--spacing-8)]">
      <h2 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-muted)]">
        {data.heading}
      </h2>
      <p className="mt-[var(--spacing-4)] text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-fg)]">
        {data.tagline}
      </p>
      <a
        href={data.ctaHref}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-[var(--spacing-6)] inline-block border-2 border-[var(--color-fg)] px-[var(--spacing-6)] py-[var(--spacing-3)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--text-xs)] text-[var(--color-fg)] transition-all duration-[var(--duration-instant)] ease-[var(--ease-snap)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] hover:text-[var(--color-accent)]"
      >
        [ {data.cta} → ]
      </a>
      <p className="mt-[var(--spacing-4)] text-[var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-subtle)]">
        {data.orForm}
      </p>
    </article>
  );
}
