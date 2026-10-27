import type { Locale } from "@/lib/i18n";
import { getRecentCommits } from "@/lib/github";
import CTAButton from "@/components/ui/CTAButton";

type Props = {
  locale: Locale;
};

export default async function LiveBuildLog({ locale }: Props) {
  const rows = await getRecentCommits();

  const labels =
    locale === "es"
      ? {
          header: "Últimos builds",
          live: "En vivo, GitHub API",
          lead: "Repos públicos ordenados por último push. Se actualiza cada 24h.",
          cols: { ts: "Pushed", repo: "Repo", branch: "Branch", diff: "±" },
          seeAll: "Ver todo en GitHub",
          noDiff: "n/d",
        }
      : {
          header: "Recent builds",
          live: "Live, GitHub API",
          lead: "Public repos sorted by last push. Updates every 24h.",
          cols: { ts: "Pushed", repo: "Repo", branch: "Branch", diff: "±" },
          seeAll: "See all on GitHub",
          noDiff: "n/a",
        };

  return (
    <section id="build-log" className="bg-paper-2 py-(--section-gap-s)">
      <div className="container">
        <header className="grid gap-(--space-lg) md:grid-cols-12 md:gap-(--gap-columns)">
          <h2 className="reveal-head md:col-span-6">{labels.header}</h2>
          <div className="reveal md:col-span-5 md:col-start-8" style={{ "--i": 1 } as React.CSSProperties}>
            <p className="lead">{labels.lead}</p>
            <p className="label mt-(--space-sm)">{labels.live}</p>
          </div>
        </header>

        {/* Mobile: stacked rows */}
        <ul className="set mt-(--space-2xl) md:hidden">
          {rows.map((row, i) => (
            <li key={row.repo} className="reveal" style={{ "--i": Math.min(i, 5) } as React.CSSProperties}>
              <a
                href={row.url}
                target="_blank"
                rel="noreferrer noopener"
                className="block py-(--space-md) no-underline"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-(length:--text-title) text-ink">{row.repo}</span>
                  <span className="label num shrink-0">{row.timestamp}</span>
                </span>
                <span className="mt-1 block">{row.description}</span>
                <span className="label mt-1 block">
                  {row.branch}
                  {row.additions > 0 || row.deletions > 0 ? (
                    <>
                      {" "}
                      <span className="num text-success">+{row.additions}</span>{" "}
                      <span className="num text-error">-{row.deletions}</span>
                    </>
                  ) : null}
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop: table */}
        <div className="mt-(--space-2xl) hidden md:block">
          <table className="border-t border-ink">
            <thead>
              <tr className="border-b border-rule">
                <th className="label py-(--space-sm) pr-(--space-md)">{labels.cols.ts}</th>
                <th className="label py-(--space-sm) pr-(--space-md)">{labels.cols.repo}</th>
                <th className="label py-(--space-sm) pr-(--space-md)">Description</th>
                <th className="label py-(--space-sm) pr-(--space-md)">{labels.cols.branch}</th>
                <th className="label py-(--space-sm) text-right">{labels.cols.diff}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.repo} style={{ "--i": Math.min(i, 8) } as React.CSSProperties} className="reveal-fade border-b border-rule transition-colors duration-(--dur-micro) hover:bg-paper-3">
                  <td className="num py-(--space-sm) pr-(--space-md)">{row.timestamp}</td>
                  <td className="py-(--space-sm) pr-(--space-md)">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="tlink !min-h-0 whitespace-nowrap font-display text-(length:--text-lg)"
                    >
                      {row.repo}
                    </a>
                  </td>
                  <td className="max-w-[300px] truncate py-(--space-sm) pr-(--space-md)">{row.description}</td>
                  <td className="py-(--space-sm) pr-(--space-md)">{row.branch}</td>
                  <td className="num whitespace-nowrap py-(--space-sm) text-right">
                    {row.additions > 0 || row.deletions > 0 ? (
                      <>
                        <span className="text-success">+{row.additions}</span>{" "}
                        <span className="text-error">-{row.deletions}</span>
                      </>
                    ) : (
                      <span className="text-muted">{labels.noDiff}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-(--space-lg)">
          <CTAButton href="https://github.com/martin-minghetti" external variant="secondary">
            {labels.seeAll}
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
