import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { getProjectsByTrack, type ProjectTrack } from "@/lib/projects";
import ProjectCard from "@/components/ui/ProjectCard";
import CTAButton from "@/components/ui/CTAButton";

type Props = {
  track: ProjectTrack;
  dict: Dictionary;
  locale: Locale;
};

export default function TrackSection({ track, dict, locale }: Props) {
  const data = track === "a" ? dict.trackA : dict.trackB;
  const ctaHref = track === "a" ? "https://wa.me/5492241622290" : "https://cal.com/martin-minghetti";
  const projects = getProjectsByTrack(track);
  const sectionId = track === "a" ? "track-a" : "track-b";
  const gridCols =
    track === "a"
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id={sectionId}
      className="border-t border-[var(--color-border)] bg-[var(--color-bg)]"
    >
      <div className="mx-auto max-w-[var(--container-wide)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-24)]">
        <header className="space-y-[var(--spacing-4)]">
          <h2 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent)]">
            {data.sectionHeader}
          </h2>
          <p className="text-[var(--text-2xl)] leading-[var(--leading-snug)] tracking-[var(--tracking-tight)]">
            {data.sectionLead}
          </p>
          <ul className="space-y-1 pt-[var(--spacing-4)] text-[var(--text-base)] text-[var(--color-fg-muted)]">
            {data.pitch.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-accent)]">→</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </header>

        <div className={`mt-[var(--spacing-12)] grid gap-[var(--spacing-6)] ${gridCols}`}>
          {projects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              locale={locale}
              labels={dict.cardLabels}
            />
          ))}
        </div>

        <footer className="mt-[var(--spacing-12)] flex flex-col items-start gap-[var(--spacing-4)] border-t border-[var(--color-border)] pt-[var(--spacing-8)] md:flex-row md:items-center md:justify-between">
          <p className="text-[var(--text-sm)] text-[var(--color-fg-muted)] max-w-md">
            {data.ctaSub}
          </p>
          <CTAButton href={ctaHref} external>
            {data.cta}
          </CTAButton>
        </footer>
      </div>
    </section>
  );
}
