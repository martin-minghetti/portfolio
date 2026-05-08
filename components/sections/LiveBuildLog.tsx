import type { Locale } from "@/lib/i18n";
import { getRecentCommits } from "@/lib/github";

type Props = {
  locale: Locale;
};

export default async function LiveBuildLog({ locale }: Props) {
  const rows = await getRecentCommits();

  const labels =
    locale === "es"
      ? {
          header: "ÚLTIMOS BUILDS",
          live: "live · github API",
          lead: "Se actualiza en cada deploy. Últimos 7 commits a través de mis repos públicos.",
          cols: { ts: "TIMESTAMP", repo: "REPO", event: "EVENTO", branch: "BRANCH", count: "+/-" },
          seeAll: "Ver todo en GitHub",
        }
      : {
          header: "RECENT BUILDS",
          live: "live · github API",
          lead: "Updated on every deploy. Last 7 commits across my public repos.",
          cols: { ts: "TIMESTAMP", repo: "REPO", event: "EVENT", branch: "BRANCH", count: "+/-" },
          seeAll: "See all on GitHub",
        };

  return (
    <section
      id="build-log"
      className="border-t border-[var(--color-border)] bg-[var(--color-bg)]"
    >
      <div className="mx-auto max-w-[var(--container-wide)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-24)]">
        <header className="flex flex-col gap-[var(--spacing-4)] md:flex-row md:items-end md:justify-between">
          <div className="space-y-[var(--spacing-2)]">
            <h2 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent)]">
              {labels.header}
            </h2>
            <p className="text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-fg-muted)]">
              {labels.lead}
            </p>
          </div>
          <p className="text-[var(--text-xs)] uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
            [ {labels.live}{" "}
            <span className="caret text-[var(--color-accent)]">_</span> ]
          </p>
        </header>

        <div className="mt-[var(--spacing-12)] overflow-x-auto border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
          <table className="w-full min-w-[640px] text-left text-[var(--text-xs)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-subtle)]">
                <th className="px-[var(--spacing-4)] py-[var(--spacing-3)] font-normal">{labels.cols.ts}</th>
                <th className="px-[var(--spacing-4)] py-[var(--spacing-3)] font-normal">{labels.cols.repo}</th>
                <th className="px-[var(--spacing-4)] py-[var(--spacing-3)] font-normal">{labels.cols.event}</th>
                <th className="px-[var(--spacing-4)] py-[var(--spacing-3)] font-normal">{labels.cols.branch}</th>
                <th className="px-[var(--spacing-4)] py-[var(--spacing-3)] font-normal text-right">{labels.cols.count}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={`${row.repo}-${i}`}
                  className="border-b border-[var(--color-border)]/60 transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-bg-overlay)]"
                >
                  <td className="px-[var(--spacing-4)] py-[var(--spacing-3)] text-[var(--color-fg-muted)]">
                    {row.timestamp}
                  </td>
                  <td className="px-[var(--spacing-4)] py-[var(--spacing-3)]">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[var(--color-fg)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-accent)]"
                    >
                      {row.repo}
                    </a>
                  </td>
                  <td className="px-[var(--spacing-4)] py-[var(--spacing-3)] text-[var(--color-fg-muted)]">
                    {row.event}
                  </td>
                  <td className="px-[var(--spacing-4)] py-[var(--spacing-3)] text-[var(--color-fg-muted)]">
                    {row.branch}
                  </td>
                  <td className="px-[var(--spacing-4)] py-[var(--spacing-3)] text-right text-[var(--color-accent)]">
                    {row.commitCount > 0 ? `+${row.commitCount}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-[var(--spacing-6)] text-right text-[var(--text-xs)] uppercase tracking-[var(--tracking-wider)]">
          <a
            href="https://github.com/martin-minghetti"
            target="_blank"
            rel="noreferrer noopener"
            className="text-[var(--color-fg-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-fg)]"
          >
            [ {labels.seeAll} → ]
          </a>
        </p>
      </div>
    </section>
  );
}
