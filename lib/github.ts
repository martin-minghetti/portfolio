type GitHubRepo = {
  name: string;
  full_name: string;
  pushed_at: string;
  default_branch: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  private: boolean;
  stargazers_count: number;
  language: string | null;
  html_url: string;
};

type GitHubCommit = {
  stats?: { additions: number; deletions: number; total: number };
};

export type CommitRow = {
  timestamp: string;
  repo: string;
  branch: string;
  description: string;
  language: string;
  url: string;
  additions: number;
  deletions: number;
};

const USERNAME = "martin-minghetti";

const FALLBACK_ROWS: CommitRow[] = [
  {
    timestamp: "2026-05-08",
    repo: "portfolio",
    branch: "main",
    description: "This site",
    language: "TypeScript",
    url: "https://github.com/martin-minghetti/portfolio",
    additions: 0,
    deletions: 0,
  },
  {
    timestamp: "2026-05-07",
    repo: "modelsentry",
    branch: "main",
    description: "AI early warning system",
    language: "TypeScript",
    url: "https://github.com/martin-minghetti/modelsentry",
    additions: 0,
    deletions: 0,
  },
  {
    timestamp: "2026-05-07",
    repo: "sur41",
    branch: "main",
    description: "Travel agency Bariloche",
    language: "TypeScript",
    url: "https://github.com/martin-minghetti/sur41",
    additions: 0,
    deletions: 0,
  },
  {
    timestamp: "2026-05-06",
    repo: "bosque",
    branch: "main",
    description: "E-commerce demo",
    language: "TypeScript",
    url: "https://github.com/martin-minghetti/bosque",
    additions: 0,
    deletions: 0,
  },
  {
    timestamp: "2026-05-06",
    repo: "cohere",
    branch: "main",
    description: "Membership platform",
    language: "TypeScript",
    url: "https://github.com/martin-minghetti/cohere",
    additions: 0,
    deletions: 0,
  },
  {
    timestamp: "2026-05-05",
    repo: "norhaven-lodge",
    branch: "main",
    description: "Booking demo",
    language: "TypeScript",
    url: "https://github.com/martin-minghetti/norhaven-lodge",
    additions: 0,
    deletions: 0,
  },
  {
    timestamp: "2026-05-03",
    repo: "skillcam",
    branch: "main",
    description: "Skill distillation CLI",
    language: "TypeScript",
    url: "https://github.com/martin-minghetti/skillcam",
    additions: 0,
    deletions: 0,
  },
];

async function fetchLastCommitStats(
  repo: string,
  branch: string,
): Promise<{ additions: number; deletions: number }> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${USERNAME}/${repo}/commits/${branch}`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 60 * 60 * 24 },
      },
    );
    if (!response.ok) return { additions: 0, deletions: 0 };
    const data = (await response.json()) as GitHubCommit;
    return {
      additions: data.stats?.additions ?? 0,
      deletions: data.stats?.deletions ?? 0,
    };
  } catch {
    return { additions: 0, deletions: 0 };
  }
}

export async function getRecentCommits(): Promise<CommitRow[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?sort=pushed&direction=desc&per_page=20`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 60 * 60 * 24 },
      },
    );

    if (!response.ok) return FALLBACK_ROWS;
    const repos = (await response.json()) as GitHubRepo[];

    const filtered = repos
      .filter((repo) => !repo.fork && !repo.archived && !repo.private)
      .slice(0, 7);

    const rows: CommitRow[] = await Promise.all(
      filtered.map(async (repo) => {
        const stats = await fetchLastCommitStats(repo.name, repo.default_branch);
        return {
          timestamp: repo.pushed_at.slice(0, 10),
          repo: repo.name,
          branch: repo.default_branch,
          description: (repo.description ?? "—").split(".")[0].slice(0, 60),
          language: repo.language ?? "—",
          url: repo.html_url,
          additions: stats.additions,
          deletions: stats.deletions,
        };
      }),
    );

    return rows.length > 0 ? rows : FALLBACK_ROWS;
  } catch {
    return FALLBACK_ROWS;
  }
}
