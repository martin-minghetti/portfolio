import Link from "next/link";
import { getProjectsByTrack } from "@/lib/projects";

// Bilingual fallback, keeps SSG static. Visitor can use lang switcher in header.
const copy = {
  h1En: "This page never shipped.",
  h1Es: "Esta página nunca shippeó.",
  bodyEn:
    "The link you followed leads nowhere. Maybe it was renamed, deleted, or never existed.",
  bodyEs:
    "El link que seguiste no lleva a ningún lado. Quizás fue renombrado, borrado, o nunca existió.",
  suggest: "What did exist / Lo que sí existe:",
  backHome: "Back to home / Volver al inicio",
};

export default function NotFound() {
  const trackA = getProjectsByTrack("a");
  const locale: "en" = "en";

  return (
    <section>
      <div className="container py-(--space-3xl)">
        <p className="num font-display text-(length:--text-display) leading-none text-muted">404</p>
        <h1 className="mt-(--space-md)">{copy.h1En}</h1>
        <p className="label mt-(--space-md)">{copy.h1Es}</p>

        <p className="lead mt-(--space-lg)">{copy.bodyEn}</p>
        <p className="mt-(--space-xs) text-muted">{copy.bodyEs}</p>

        <p className="label mt-(--space-2xl)">{copy.suggest}</p>
        <ul className="set mt-(--space-xs)">
          {trackA.map((project) => (
            <li key={project.slug}>
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="block py-(--space-md) no-underline"
              >
                <span className="font-display text-(length:--text-title) text-ink">{project.name}</span>
                <span className="mt-1 block">{project.summary[locale]}</span>
              </a>
            </li>
          ))}
        </ul>

        <Link href="/en" className="btn btn--primary mt-(--space-2xl)">
          {copy.backHome}
        </Link>
      </div>
    </section>
  );
}
