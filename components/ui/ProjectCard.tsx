import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import type { Project } from "@/lib/projects";
import StatusBadge from "./StatusBadge";
import CTAButton from "./CTAButton";

type Props = {
  project: Project;
  locale: Locale;
  labels: Dictionary["cardLabels"];
};

export default function ProjectCard({ project, locale, labels }: Props) {
  const statusLabel =
    project.status === "live" ? labels.live : project.status === "npm" ? labels.npm : labels.demo;

  return (
    <article className="group flex flex-col border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-[var(--spacing-6)] transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-quart)] hover:border-[var(--color-accent)]">
      <header className="flex items-start justify-between gap-3">
        <h3 className="font-bold uppercase tracking-[var(--tracking-widest)] text-base">
          {project.name}
        </h3>
        <StatusBadge status={project.status} label={statusLabel} />
      </header>

      <hr className="my-[var(--spacing-4)] border-0 border-t border-[var(--color-border)]" />

      <p className="text-sm leading-[var(--leading-relaxed)] text-[var(--color-fg-muted)]">
        {project.summary[locale]}
      </p>

      <dl className="mt-[var(--spacing-4)] space-y-1 text-xs text-[var(--color-fg-subtle)]">
        <div className="flex gap-2">
          <dt className="shrink-0">→</dt>
          <dd>{project.stack}</dd>
        </div>
        {project.liveUrl ? (
          <div className="flex gap-2">
            <dt className="shrink-0">→</dt>
            <dd className="truncate">{project.liveUrl.replace(/^https?:\/\//, "")}</dd>
          </div>
        ) : null}
        {project.buildTime ? (
          <div className="flex gap-2">
            <dt className="shrink-0">→</dt>
            <dd>
              {labels.builtIn} {project.buildTime}
              {project.buildLogUrl ? " · BUILD_LOG" : ""}
            </dd>
          </div>
        ) : null}
        {project.cost ? (
          <div className="flex gap-2">
            <dt className="shrink-0">→</dt>
            <dd>{project.cost}</dd>
          </div>
        ) : null}
      </dl>

      <footer className="mt-auto flex flex-col gap-2 pt-[var(--spacing-6)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
        {project.liveUrl ? (
          <CTAButton
            href={project.liveUrl}
            external
            className="w-full sm:w-auto"
          >
            {labels.seeLive}
          </CTAButton>
        ) : null}
        <CTAButton href={project.githubUrl} external variant="secondary">
          {labels.github}
        </CTAButton>
        {project.buildLogUrl ? (
          <CTAButton href={project.buildLogUrl} external variant="secondary">
            {labels.buildLog}
          </CTAButton>
        ) : null}
      </footer>
    </article>
  );
}
