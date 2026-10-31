import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { getProjectsByTrack } from "@/lib/projects";
import ProjectCard, { hasScreen } from "@/components/ui/ProjectCard";
import CTAButton from "@/components/ui/CTAButton";

type Props = {
  dict: Dictionary;
  locale: Locale;
};

export default function TrackSection({ dict, locale }: Props) {
  const data = dict.trackA;
  const all = getProjectsByTrack("a");
  const projects = all.filter((p) => hasScreen(p.slug));
  const typed = all.filter((p) => !hasScreen(p.slug));

  return (
    <section id="track-a" className="bg-paper border-t border-rule py-(--section-gap-s)">
      <div className="container">
        <h2 className="reveal-head">{data.sectionHeader}</h2>

        <div className="set mt-(--space-2xl) [&>*:last-child]:border-b-0">
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} locale={locale} labels={dict.cardLabels} variant="row" imageRight={i % 2 === 0} />
          ))}
        </div>

        {typed.length > 0 ? (
          <div className="set mt-(--space-2xl)">
            {typed.map((project) => (
              <ProjectCard key={project.slug} project={project} locale={locale} labels={dict.cardLabels} variant="line" />
            ))}
          </div>
        ) : null}

        <footer className="mt-(--space-2xl) flex flex-col items-start gap-(--space-md) border-t border-ink pt-(--space-lg) md:flex-row md:items-center md:justify-between">
          <p className="max-w-[52ch]">{data.ctaSub}</p>
          <CTAButton href="https://wa.me/5492241622290" external variant="primary">
            {data.cta}
          </CTAButton>
        </footer>
      </div>
    </section>
  );
}
