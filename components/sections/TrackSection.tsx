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

// One track in the reading half of the split: its heading, then one entry per project.
export default function TrackSection({ track, dict, locale }: Props) {
  const data = track === "a" ? dict.trackA : dict.trackB;
  const ctaHref = track === "a" ? "https://wa.me/5492241622290" : "https://cal.com/martin-minghetti";
  const all = getProjectsByTrack(track);
  const projects = all.filter((p) => hasScreen(p.slug));
  const typed = all.filter((p) => !hasScreen(p.slug));

  return (
    <section id={track === "a" ? "track-a" : "track-b"} className="track">
      <header className="track-head">
        <h2 className="reveal-head">{data.sectionHeader}</h2>
        <p className="lead reveal mt-(--space-md)">{data.sectionLead}</p>
        <ul className="track-pitch reveal">
          {data.pitch.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </header>

      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} locale={locale} labels={dict.cardLabels} />
      ))}

      {typed.map((project) => (
        <ProjectCard key={project.slug} project={project} locale={locale} labels={dict.cardLabels} variant="line" />
      ))}

      <footer className="track-foot">
        <p className="max-w-[44ch]">{data.ctaSub}</p>
        <CTAButton href={ctaHref} external variant={track === "a" ? "primary" : "outline"}>
          {data.cta}
        </CTAButton>
      </footer>
    </section>
  );
}
