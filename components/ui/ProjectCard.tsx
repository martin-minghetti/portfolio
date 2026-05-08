import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import type { Project } from "@/lib/projects";
import StatusBadge from "./StatusBadge";

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
        <h3 className="font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--text-base)]">
          {project.name}
        </h3>
        <StatusBadge status={project.status} label={statusLabel} />
      </header>

      <hr className="my-[var(--spacing-4)] border-0 border-t border-[var(--color-border)]" />

      <p className="text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-fg-muted)]">
        {project.summary[locale]}
      </p>

      <dl className="mt-[var(--spacing-4)] space-y-1 text-[var(--text-xs)] text-[var(--color-fg-subtle)]">
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

      <footer className="mt-auto flex flex-col gap-2 pt-[var(--spacing-6)] text-[var(--text-xs)] uppercase tracking-[var(--tracking-wider)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            style={{ backgroundColor: "#7CFF50", color: "#0A0A0A" }}
            className="block w-full text-center sm:inline-block sm:w-auto px-3 py-1.5 font-bold whitespace-nowrap transition-opacity duration-[var(--duration-fast)] hover:opacity-80"
          >
            [ {labels.seeLive} → ]
          </a>
        ) : null}
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer noopener"
          style={{ color: "#7CFF50" }}
          className="block w-full text-center sm:inline-block sm:w-auto whitespace-nowrap transition-opacity duration-[var(--duration-fast)] hover:opacity-70"
        >
          [ {labels.github} → ]
        </a>
        {project.buildLogUrl ? (
          <a
            href={project.buildLogUrl}
            target="_blank"
            rel="noreferrer noopener"
            style={{ color: "#7CFF50" }}
            className="block w-full text-center sm:inline-block sm:w-auto whitespace-nowrap transition-opacity duration-[var(--duration-fast)] hover:opacity-70"
          >
            [ {labels.buildLog} → ]
          </a>
        ) : null}
      </footer>
    </article>
  );
}
