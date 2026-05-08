import Link from "next/link";
import { getProjectsByTrack } from "@/lib/projects";

// Bilingual fallback — keeps SSG static. Visitor can use lang switcher in header.
const copy = {
  h1En: "404 · This page never shipped.",
  h1Es: "404 · Esta página nunca shippeó.",
  bodyEn:
    "The link you followed leads nowhere. Maybe it was renamed, deleted, or never existed.",
  bodyEs:
    "El link que seguiste no lleva a ningún lado. Quizás fue renombrado, borrado, o nunca existió.",
  suggest: "What did exist · Lo que sí existe:",
  backHome: "Back to home · Volver al inicio",
};

export default function NotFound() {
  const trackA = getProjectsByTrack("a");
  const locale: "en" = "en";

  return (
    <div className="mx-auto max-w-[var(--container-default)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-32)]">
      <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[var(--leading-tight)] tracking-[var(--tracking-tighter)]">
        <span className="text-[var(--color-accent)]">404</span> · This page never shipped.
      </h1>

      <p className="mt-[var(--spacing-4)] text-[var(--text-base)] text-[var(--color-fg-subtle)]">
        {copy.h1Es.split("· ")[1]}
      </p>

      <p className="mt-[var(--spacing-6)] max-w-[600px] text-[var(--text-lg)] leading-[var(--leading-relaxed)] text-[var(--color-fg-muted)]">
        {copy.bodyEn}
      </p>
      <p className="mt-[var(--spacing-2)] max-w-[600px] text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-fg-subtle)]">
        {copy.bodyEs}
      </p>

      <hr className="my-[var(--spacing-12)] border-[var(--color-border)]" />

      <p className="text-[var(--text-xs)] uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
        {copy.suggest}
      </p>

      <ul className="mt-[var(--spacing-6)] grid gap-[var(--spacing-4)] md:grid-cols-2">
        {trackA.map((project) => (
          <li key={project.slug}>
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="block border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-[var(--spacing-6)] py-[var(--spacing-4)] transition-colors duration-[var(--duration-base)] hover:border-[var(--color-accent)]"
            >
              <p className="text-[var(--text-sm)] font-bold uppercase tracking-[var(--tracking-widest)]">
                {project.name}
              </p>
              <p className="mt-1 text-[var(--text-xs)] text-[var(--color-fg-muted)]">
                {project.summary[locale]}
              </p>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-[var(--spacing-12)] flex flex-wrap gap-[var(--spacing-4)]">
        <Link
          href="/en"
          className="border-2 border-[var(--color-fg)] px-[var(--spacing-6)] py-[var(--spacing-3)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--text-xs)] text-[var(--color-fg)] transition-all duration-[var(--duration-instant)] ease-[var(--ease-snap)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] hover:text-[var(--color-accent)]"
        >
          [ ← {copy.backHome} ]
        </Link>
      </div>
    </div>
  );
}
