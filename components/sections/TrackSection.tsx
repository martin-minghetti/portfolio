import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { getProjectsByTrack, type ProjectTrack } from "@/lib/projects";
import ProjectCard, { hasScreen } from "@/components/ui/ProjectCard";
import CTAButton from "@/components/ui/CTAButton";

type Props = {
  track: ProjectTrack;
  dict: Dictionary;
  locale: Locale;
};

export default function TrackSection({ track, dict, locale }: Props) {
  const data = track === "a" ? dict.trackA : dict.trackB;
  const ctaHref = track === "a" ? "https://wa.me/5492241622290" : "https://cal.com/martin-minghetti";
  const all = getProjectsByTrack(track);
  const projects = all.filter((p) => hasScreen(p.slug));
  const typed = all.filter((p) => !hasScreen(p.slug));
  const sectionId = track === "a" ? "track-a" : "track-b";
  const isIndex = track === "a";

  return (
    <section
      id={sectionId}
      className={`${isIndex ? "bg-paper" : "bg-paper-2"} border-t border-rule py-(--section-gap-s)`}
    >
      <div className="container">
        <header className="grid gap-(--space-lg) md:grid-cols-12 md:gap-(--gap-columns)">
          <div className="md:col-span-6">
            <h2>{data.sectionHeader}</h2>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="lead">{data.sectionLead}</p>
            <ul className="mt-(--space-lg)">
              {data.pitch.map((line, i) => (
                <li key={i} className="border-t border-rule py-(--space-xs) last:border-b">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </header>

        {isIndex ? (
          <div className="set mt-(--space-2xl) [&>*:last-child]:border-b-0">
            {projects.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                locale={locale}
                labels={dict.cardLabels}
                variant="row"
              />
            ))}
          </div>
        ) : (
          <div className="mt-(--space-2xl) grid gap-x-(--gap-columns) gap-y-(--space-2xl) md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <div key={project.slug} className={i === 0 ? "md:col-span-2" : ""}>
                <ProjectCard
                  project={project}
                  locale={locale}
                  labels={dict.cardLabels}
                  variant="tile"
                  lead={i === 0}
                />
              </div>
            ))}
          </div>
        )}

        {typed.length > 0 ? (
          <div className="set mt-(--space-2xl)">
            {typed.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                locale={locale}
                labels={dict.cardLabels}
                variant="line"
              />
            ))}
          </div>
        ) : null}

        <footer className="mt-(--space-2xl) flex flex-col items-start gap-(--space-md) border-t border-ink pt-(--space-lg) md:flex-row md:items-center md:justify-between">
          <p className="max-w-[52ch]">{data.ctaSub}</p>
          <CTAButton href={ctaHref} external variant={isIndex ? "primary" : "outline"}>
            {data.cta}
          </CTAButton>
        </footer>
      </div>
    </section>
  );
}
