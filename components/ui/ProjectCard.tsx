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
    {
      live: labels.live,
      npm: labels.npm,
      wip: labels.wip,
      demo: labels.demo,
    }[project.status];

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
        {project.demoLogins?.map((login) => (
          <div key={login.email} className="flex gap-2">
            <dt className="shrink-0">→</dt>
            <dd className="min-w-0 break-words">
              <a
                href={login.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] hover:opacity-70"
              >
                {login.role[locale]} {labels.login}
              </a>{" "}
              · {login.email} / {login.password}
            </dd>
          </div>
        ))}
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
        {project.githubUrl ? (
          <CTAButton href={project.githubUrl} external variant="secondary">
            {labels.github}
          </CTAButton>
        ) : null}
        {project.buildLogUrl ? (
          <CTAButton href={project.buildLogUrl} external variant="secondary">
            {labels.buildLog}
          </CTAButton>
        ) : null}
        {project.supportUrl ? (
          <CTAButton href={project.supportUrl} variant="secondary">
            {labels.support}
          </CTAButton>
        ) : null}
      </footer>
    </article>
  );
}
