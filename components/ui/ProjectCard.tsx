import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import type { Project } from "@/lib/projects";
import StatusBadge from "./StatusBadge";
import CTAButton from "./CTAButton";

type Props = {
  project: Project;
  locale: Locale;
  labels: Dictionary["cardLabels"];
  variant?: "row" | "tile" | "line";
  lead?: boolean;
};

// Screens captured from each live demo (public/projects). A project without one is set in type alone.
const screens: Record<string, string> = {
  cumbre: "/projects/cumbre.jpg",
  "norhaven-lodge": "/projects/norhaven-lodge.jpg",
  cohere: "/projects/cohere.jpg",
  bosque: "/projects/bosque.jpg",
  sur41: "/projects/sur41.jpg",
  ragbench: "/projects/ragbench.jpg",
  "invoice-processor": "/projects/invoice-processor.jpg",
  "code-review-orchestrator": "/projects/code-review-orchestrator.jpg",
  "gtm-briefing-copilot": "/projects/gtm-briefing-copilot.jpg",
  modelsentry: "/projects/modelsentry.jpg",
};

export const hasScreen = (slug: string) => slug in screens;

export default function ProjectCard({ project, locale, labels, variant = "row", lead = false }: Props) {
  const statusLabel =
    {
      live: labels.live,
      npm: labels.npm,
      wip: labels.wip,
      demo: labels.demo,
    }[project.status];

  const screen = screens[project.slug];
  const stack = project.stack.split(" · ");
  const isRow = variant === "row";
  const isLine = variant === "line";

  const picture = screen ? (
    <div className="relative">
      <div
        data-slot={`screen-${project.slug}`}
        data-kind="product"
        data-alt={project.name}
        className="screen crop-shadow aspect-[16/10] rounded-card outline outline-1 -outline-offset-1 outline-ink/10"
      >
        <Image
          src={screen}
          alt={project.name}
          fill
          sizes={isRow || lead ? "(min-width: 768px) 55vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"}
          className="object-cover object-top"
        />
      </div>
    </div>
  ) : null;

  const body = (
    <div className="reveal flex min-w-0 flex-col" style={{ "--i": 1 } as React.CSSProperties}>
      <header className="flex items-start justify-between gap-3">
        <h3 className="font-display text-(length:--text-title) leading-tight">{project.name}</h3>
        <StatusBadge status={project.status} label={statusLabel} />
      </header>

      <p className="mt-(--space-sm)">{project.summary[locale]}</p>

      <ul className="label mt-(--space-md) flex flex-wrap gap-x-4 gap-y-1">
        {stack.map((item) => (
          <li key={item} className="!text-muted">
            {item}
          </li>
        ))}
      </ul>

      <dl className="label mt-(--space-sm) space-y-1">
        {project.liveUrl ? (
          <div>
            <dt className="visually-hidden">URL</dt>
            <dd className="!text-muted break-words">{project.liveUrl.replace(/^https?:\/\//, "")}</dd>
          </div>
        ) : null}
        {project.demoLogins?.map((login) => (
          <div key={login.email}>
            <dt className="visually-hidden">{login.role[locale]}</dt>
            <dd className="!text-muted min-w-0 break-words">
              <a href={login.url} target="_blank" rel="noopener noreferrer" className="tlink !min-h-0">
                {login.role[locale]} {labels.login}
              </a>{" "}
              <span className="num">
                {login.email} / {login.password}
              </span>
            </dd>
          </div>
        ))}
        {project.buildTime ? (
          <div>
            <dt className="visually-hidden">{labels.builtIn}</dt>
            <dd className="!text-muted">
              {labels.builtIn} {project.buildTime}
            </dd>
          </div>
        ) : null}
        {project.cost ? (
          <div>
            <dt className="visually-hidden">Cost</dt>
            <dd className="!text-muted">{project.cost}</dd>
          </div>
        ) : null}
      </dl>

      <footer className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 pt-(--space-md)">
        {project.liveUrl ? (
          <CTAButton href={project.liveUrl} external variant="outline" className="!min-h-11">
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
          <CTAButton href={project.supportUrl} external variant="secondary">
            {labels.support}
          </CTAButton>
        ) : null}
      </footer>
    </div>
  );

  if (isLine) {
    return (
      <article className="reveal grid gap-(--space-sm) border-b border-rule py-(--space-lg) md:grid-cols-12 md:gap-(--gap-columns)">
        <header className="flex items-start justify-between gap-3 md:col-span-4">
          <h3 className="font-display text-(length:--text-title) leading-tight">{project.name}</h3>
          <StatusBadge status={project.status} label={statusLabel} />
        </header>
        <div className="md:col-span-5">
          <p>{project.summary[locale]}</p>
          <ul className="label mt-(--space-xs) flex flex-wrap gap-x-4 gap-y-1">
            {stack.map((item) => (
              <li key={item} className="!text-muted">
                {item}
              </li>
            ))}
          </ul>
          {project.buildTime ? (
            <p className="label mt-(--space-xs)">
              {labels.builtIn} {project.buildTime}
            </p>
          ) : null}
          {project.cost ? <p className="label mt-(--space-xs)">{project.cost}</p> : null}
        </div>
        <div className="flex flex-wrap items-start gap-x-5 md:col-span-3">
          {project.liveUrl ? (
            <CTAButton href={project.liveUrl} external variant="secondary">
              {labels.seeLive}
            </CTAButton>
          ) : null}
          {project.githubUrl ? (
            <CTAButton href={project.githubUrl} external variant="secondary">
              {labels.github}
            </CTAButton>
          ) : null}
          {project.supportUrl ? (
            <CTAButton href={project.supportUrl} external variant="secondary">
              {labels.support}
            </CTAButton>
          ) : null}
        </div>
      </article>
    );
  }

  if (isRow) {
    return (
      <article className="grid gap-(--space-lg) border-b border-rule py-(--space-xl) md:grid-cols-12 md:gap-(--gap-columns)">
        {picture ? <div className="md:col-span-5">{picture}</div> : null}
        <div className="md:col-span-6 md:col-start-7">{body}</div>
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-(--space-md) border-t border-ink pt-(--space-lg)">
      {picture}
      {body}
    </article>
  );
}
