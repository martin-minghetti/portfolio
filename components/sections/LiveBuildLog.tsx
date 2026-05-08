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
          lead: "Repos públicos ordenados por último push. Se actualiza cada 24h.",
          cols: { ts: "PUSHED", repo: "REPO", branch: "BRANCH", lang: "LANG" },
          seeAll: "Ver todo en GitHub",
        }
      : {
          header: "RECENT BUILDS",
          live: "live · github API",
          lead: "Public repos sorted by last push. Updates every 24h.",
          cols: { ts: "PUSHED", repo: "REPO", branch: "BRANCH", lang: "LANG" },
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

        {/* Mobile: stacked cards */}
        <ul className="mt-[var(--spacing-12)] space-y-[var(--spacing-3)] md:hidden">
          {rows.map((row) => (
            <li key={row.repo}>
              <a
                href={row.url}
                target="_blank"
                rel="noreferrer noopener"
                className="block border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-[var(--spacing-4)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-accent)]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className="text-[var(--text-sm)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg)]"
                  >
                    {row.repo}
                  </span>
                  <span
                    style={{ color: "#7CFF50" }}
                    className="shrink-0 text-[var(--text-xs)] uppercase tracking-[var(--tracking-wider)]"
                  >
                    {row.timestamp}
                  </span>
                </div>
                <p className="mt-1 text-[var(--text-xs)] text-[var(--color-fg-muted)]">
                  {row.description}
                </p>
                <p className="mt-2 text-[var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-subtle)]">
                  {row.branch} · {row.language}
                </p>
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop: table */}
        <div className="mt-[var(--spacing-12)] hidden border border-[var(--color-border)] bg-[var(--color-bg-elevated)] md:block">
          <table className="w-full text-left text-[var(--text-xs)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-subtle)]">
                <th className="px-[var(--spacing-4)] py-[var(--spacing-3)] font-normal">{labels.cols.ts}</th>
                <th className="px-[var(--spacing-4)] py-[var(--spacing-3)] font-normal">{labels.cols.repo}</th>
                <th className="px-[var(--spacing-4)] py-[var(--spacing-3)] font-normal">DESCRIPTION</th>
                <th className="px-[var(--spacing-4)] py-[var(--spacing-3)] font-normal">{labels.cols.branch}</th>
                <th className="px-[var(--spacing-4)] py-[var(--spacing-3)] font-normal text-right">{labels.cols.lang}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.repo}
                  className="border-b border-[var(--color-border)]/60 transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-bg-overlay)]"
                >
                  <td className="px-[var(--spacing-4)] py-[var(--spacing-3)]" style={{ color: "#7CFF50" }}>
                    {row.timestamp}
                  </td>
                  <td className="px-[var(--spacing-4)] py-[var(--spacing-3)]">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-bold text-[var(--color-fg)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-accent)]"
                    >
                      {row.repo}
                    </a>
                  </td>
                  <td className="px-[var(--spacing-4)] py-[var(--spacing-3)] text-[var(--color-fg-muted)] truncate max-w-[300px]">
                    {row.description}
                  </td>
                  <td className="px-[var(--spacing-4)] py-[var(--spacing-3)] text-[var(--color-fg-muted)]">
                    {row.branch}
                  </td>
                  <td className="px-[var(--spacing-4)] py-[var(--spacing-3)] text-right text-[var(--color-fg-muted)]">
                    {row.language}
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
