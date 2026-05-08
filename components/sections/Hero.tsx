"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export default function Hero({ dict }: Props) {
  return (
    <section className="mx-auto max-w-[var(--container-wide)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-32)]">
      <div className="space-y-[var(--spacing-12)]">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="text-[clamp(2.25rem,5.5vw,4rem)] font-bold leading-[var(--leading-tight)] tracking-[var(--tracking-tighter)]"
        >
          <span className="block">{dict.hero.h1Line1}</span>
          <span className="block">{dict.hero.h1Line2}</span>
          <span className="block text-[var(--color-fg-muted)]">
            {dict.hero.h1Line3}
          </span>
        </motion.h1>

        <div className="grid gap-[var(--spacing-6)] md:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.1 }}
            className="border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-[var(--spacing-8)]"
          >
            <h2 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-muted)]">
              {dict.hero.trackA.label}
            </h2>
            <p className="mt-[var(--spacing-4)] text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
              {dict.hero.trackA.tagline}
            </p>
            <a
              href="https://wa.me/5492241622290"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-[var(--spacing-8)] block w-full text-center sm:inline-block sm:w-auto border-2 border-[var(--color-accent)] bg-transparent px-[var(--spacing-6)] py-[var(--spacing-3)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--text-xs)] text-[var(--color-accent)] transition-all duration-[var(--duration-instant)] ease-[var(--ease-snap)] hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] whitespace-nowrap"
            >
              [ {dict.hero.trackA.cta} → ]
            </a>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.3 }}
            className="border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-[var(--spacing-8)]"
          >
            <h2 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-muted)]">
              {dict.hero.trackB.label}
            </h2>
            <p className="mt-[var(--spacing-4)] text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
              {dict.hero.trackB.tagline}
            </p>
            <a
              href="https://cal.com/martin-minghetti"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-[var(--spacing-8)] block w-full text-center sm:inline-block sm:w-auto border-2 border-[var(--color-accent)] bg-transparent px-[var(--spacing-6)] py-[var(--spacing-3)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--text-xs)] text-[var(--color-accent)] transition-all duration-[var(--duration-instant)] ease-[var(--ease-snap)] hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] whitespace-nowrap"
            >
              [ {dict.hero.trackB.cta} → ]
            </a>
          </motion.article>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.6 }}
          className="text-center text-[var(--text-xs)] uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]"
        >
          {dict.hero.scrollHint} <span className="caret">↓</span>
        </motion.p>
      </div>
    </section>
  );
}
