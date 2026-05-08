type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    ref?: string;
    commits?: { message: string; sha: string }[];
    size?: number;
  };
};

export type CommitRow = {
  timestamp: string;
  repo: string;
  event: string;
  branch: string;
  commitCount: number;
  topMessage: string;
  url: string;
};

const USERNAME = "martin-minghetti";

const FALLBACK_ROWS: CommitRow[] = [
  {
    timestamp: "2026-05-08",
    repo: "portfolio",
    event: "push",
    branch: "main",
    commitCount: 1,
    topMessage: "Build home sections — Hero animated + 6 core sections",
    url: "https://github.com/martin-minghetti/portfolio",
  },
  {
    timestamp: "2026-05-07",
    repo: "modelsentry",
    event: "push",
    branch: "main",
    commitCount: 1,
    topMessage: "Daily run + dashboard regeneration",
    url: "https://github.com/martin-minghetti/modelsentry",
  },
  {
    timestamp: "2026-05-07",
    repo: "sur41",
    event: "push",
    branch: "main",
    commitCount: 2,
    topMessage: "Phase 2 — booking flow + security audit",
    url: "https://github.com/martin-minghetti/sur41",
  },
  {
    timestamp: "2026-05-06",
    repo: "bosque",
    event: "push",
    branch: "main",
    commitCount: 3,
    topMessage: "E-commerce demo with Argentine shipping engine",
    url: "https://github.com/martin-minghetti/bosque",
  },
  {
    timestamp: "2026-05-06",
    repo: "cohere",
    event: "push",
    branch: "main",
    commitCount: 2,
    topMessage: "MP Subscriptions + customer portal",
    url: "https://github.com/martin-minghetti/cohere",
  },
  {
    timestamp: "2026-05-05",
    repo: "norhaven-lodge",
    event: "push",
    branch: "main",
    commitCount: 1,
    topMessage: "Booking + AI semantic search",
    url: "https://github.com/martin-minghetti/norhaven-lodge",
  },
  {
    timestamp: "2026-05-03",
    repo: "cortex",
    event: "push",
    branch: "main",
    commitCount: 1,
    topMessage: "Walking skeleton phases 0-4",
    url: "https://github.com/martin-minghetti/cortex",
  },
];

export async function getRecentCommits(): Promise<CommitRow[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${USERNAME}/events/public?per_page=50`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 60 * 60 * 24 },
      },
    );

    if (!response.ok) return FALLBACK_ROWS;
    const events = (await response.json()) as GitHubEvent[];

    const pushEvents = events.filter((event) => event.type === "PushEvent");
    const rows: CommitRow[] = pushEvents.slice(0, 7).map((event) => {
      const commits = event.payload.commits ?? [];
      const topMessage = commits[commits.length - 1]?.message?.split("\n")[0] ?? "—";
      const branch = (event.payload.ref ?? "refs/heads/main").replace("refs/heads/", "");
      return {
        timestamp: event.created_at.slice(0, 10),
        repo: event.repo.name.split("/")[1],
        event: "push",
        branch,
        commitCount: event.payload.size ?? commits.length,
        topMessage,
        url: `https://github.com/${event.repo.name}/commits/${branch}`,
      };
    });

    return rows.length > 0 ? rows : FALLBACK_ROWS;
  } catch {
    return FALLBACK_ROWS;
  }
}
