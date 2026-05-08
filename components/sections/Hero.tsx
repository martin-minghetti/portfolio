"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/dictionaries";
import CTAButton from "@/components/ui/CTAButton";

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
            <h2 className="text-xs font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-muted)]">
              {dict.hero.trackA.label}
            </h2>
            <p className="mt-[var(--spacing-4)] text-lg leading-[var(--leading-relaxed)]">
              {dict.hero.trackA.tagline}
            </p>
            <div className="mt-[var(--spacing-8)]">
              <CTAButton
                href="https://wa.me/5492241622290"
                external
                className="w-full sm:w-auto"
              >
                {dict.hero.trackA.cta}
              </CTAButton>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.3 }}
            className="border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-[var(--spacing-8)]"
          >
            <h2 className="text-xs font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-muted)]">
              {dict.hero.trackB.label}
            </h2>
            <p className="mt-[var(--spacing-4)] text-lg leading-[var(--leading-relaxed)]">
              {dict.hero.trackB.tagline}
            </p>
            <div className="mt-[var(--spacing-8)]">
              <CTAButton
                href="https://cal.com/martin-minghetti"
                external
                className="w-full sm:w-auto"
              >
                {dict.hero.trackB.cta}
              </CTAButton>
            </div>
          </motion.article>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.6 }}
          className="text-center text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]"
        >
          {dict.hero.scrollHint} <span className="caret">↓</span>
        </motion.p>
      </div>
    </section>
  );
}
