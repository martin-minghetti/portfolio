import type { Locale } from "./i18n";

export type ProjectStatus = "live" | "demo" | "npm";
export type ProjectTrack = "a" | "b";

export type Project = {
  slug: string;
  track: ProjectTrack;
  name: string;
  status: ProjectStatus;
  stack: string;
  liveUrl?: string;
  githubUrl: string;
  buildLogUrl?: string;
  buildTime?: string;
  cost?: string;
  summary: Record<Locale, string>;
};

export const projects: Project[] = [
  // ─────────────────────────────────────────────
  // TRACK A — Commercial demos
  // ─────────────────────────────────────────────
  {
    slug: "norhaven-lodge",
    track: "a",
    name: "Norhaven Lodge",
    status: "live",
    stack: "Next 16 · Drizzle · Supabase · MP Checkout Pro · Resend",
    liveUrl: "https://norhaven-lodge.vercel.app",
    githubUrl: "https://github.com/martin-minghetti/norhaven-lodge",
    buildLogUrl: "https://github.com/martin-minghetti/norhaven-lodge/blob/main/BUILD_LOG.md",
    buildTime: "~2h 18min",
    summary: {
      en: "Boutique cabin booking site. Calendar with date-overlap validation, Mercado Pago Checkout Pro, transactional email, AI semantic search.",
      es: "Sitio de booking para cabañas boutique. Calendario con validación de overlap, Mercado Pago Checkout Pro, email transaccional, búsqueda semántica con IA.",
    },
  },
  {
    slug: "cohere",
    track: "a",
    name: "Cohere",
    status: "live",
    stack: "Next 16 · Drizzle · Neon · MP Subscriptions · Resend",
    liveUrl: "https://cohere-six.vercel.app",
    githubUrl: "https://github.com/martin-minghetti/cohere",
    buildLogUrl: "https://github.com/martin-minghetti/cohere/blob/main/BUILD_LOG.md",
    buildTime: "~3h",
    summary: {
      en: "SaaS membership platform for professionals (yoga, pilates, coaching). Monthly recurring billing with MP Subscriptions, customer portal with real cancel/pause/resume, MRR dashboard.",
      es: "Plataforma SaaS de membresías para profesionales (yoga, pilates, coaching). Cobro recurrente mensual con MP Subscriptions, portal del cliente con cancel/pausa/reanudar real, dashboard MRR.",
    },
  },
  {
    slug: "bosque",
    track: "a",
    name: "Bosque",
    status: "live",
    stack: "Next 16 · Drizzle · Neon · MP Checkout Pro · Resend",
    liveUrl: "https://bosque-three.vercel.app",
    githubUrl: "https://github.com/martin-minghetti/bosque",
    buildLogUrl: "https://github.com/martin-minghetti/bosque/blob/main/BUILD_LOG.md",
    buildTime: "~2h 25min",
    summary: {
      en: "E-commerce demo for a Patagonian chocolatier. Multi-item cart with HMAC session, Argentine shipping engine (3 zones × 3 carriers), admin panel, transactional email.",
      es: "E-commerce demo para una chocolatería patagónica. Carrito multi-item con sesión HMAC, motor de envíos argentino (3 zonas × 3 carriers), panel admin, email transaccional.",
    },
  },
  {
    slug: "sur41",
    track: "a",
    name: "Sur41",
    status: "live",
    stack: "Next 16 · Drizzle · Neon · MP · Resend · Replicate",
    liveUrl: "https://sur41.vercel.app",
    githubUrl: "https://github.com/martin-minghetti/sur41",
    buildLogUrl: "https://github.com/martin-minghetti/sur41/blob/main/BUILD_LOG.md",
    buildTime: "~30min snapshot + phase 2",
    summary: {
      en: "Travel agency for Bariloche, Patagonia. 14 real excursions, native i18n (ES / EN / PT-BR), 96 SSG pages, AI-generated FLUX 1.1 Pro hero images, full security audit.",
      es: "Agencia de viajes para Bariloche, Patagonia. 14 excursiones reales, i18n nativa (ES / EN / PT-BR), 96 páginas SSG, imágenes hero generadas con FLUX 1.1 Pro, security audit completo.",
    },
  },

  // ─────────────────────────────────────────────
  // TRACK B — AI engineering
  // ─────────────────────────────────────────────
  {
    slug: "sdr-swarm",
    track: "b",
    name: "SDR Swarm",
    status: "demo",
    stack: "FastAPI · Next 16 · Supabase · Sonnet + Haiku",
    githubUrl: "https://github.com/martin-minghetti/sdr-swarm",
    cost: "~$0.08-0.15 / run",
    summary: {
      en: "B2B sales research pipeline. Company URL → scored outreach draft in 15-30s. Researcher fetches Tavily + homepage scraper + Apollo in parallel. 4 sequential agents.",
      es: "Pipeline de research de ventas B2B. URL de empresa → draft de outreach scoreado en 15-30s. El researcher trae data de Tavily + scraper de homepage + Apollo en paralelo. 4 agentes secuenciales.",
    },
  },
  {
    slug: "code-review-orchestrator",
    track: "b",
    name: "Code Review Orchestrator",
    status: "live",
    stack: "Next 16 · Octokit · Vercel AI SDK · shadcn/ui",
    liveUrl: "https://code-review-orchestrator.vercel.app",
    githubUrl: "https://github.com/martin-minghetti/code-review-orchestrator",
    cost: "~$0.10-0.20 / run",
    summary: {
      en: "Paste a GitHub PR URL. 4 agents review in parallel (security, impact, test gaps, docs). Every finding pinned to file + line with evidence and concrete fix.",
      es: "Pegás una URL de PR de GitHub. 4 agentes hacen review en paralelo (security, impact, test gaps, docs). Cada hallazgo apunta a archivo + línea con evidencia y fix concreto.",
    },
  },
  {
    slug: "gtm-briefing-copilot",
    track: "b",
    name: "GTM Briefing Copilot",
    status: "live",
    stack: "Next 16 · Vercel AI SDK · cheerio · shadcn/ui",
    liveUrl: "https://gtm-briefing-copilot.vercel.app",
    githubUrl: "https://github.com/martin-minghetti/gtm-briefing-copilot",
    cost: "~$0.06-0.12 / run",
    summary: {
      en: "Paste a company URL. Verified GTM brief in 30s. Sequential pipeline: scrape → extract → analyze → messaging → verify. Evidence grounding with fact IDs.",
      es: "Pegás una URL de empresa. Brief de GTM verificado en 30s. Pipeline secuencial: scrape → extract → analyze → messaging → verify. Grounding de evidencia con fact IDs.",
    },
  },
  {
    slug: "rivalsight",
    track: "b",
    name: "RivalSight",
    status: "demo",
    stack: "Next 16 · Playwright · Drizzle · SQLite",
    githubUrl: "https://github.com/martin-minghetti/rivalsight",
    summary: {
      en: "Competitive intelligence monitor. Snapshots pages with Playwright, extracts structured data via Claude, diffs against previous snapshots, scores threats. Webhooks fire above threshold.",
      es: "Monitor de inteligencia competitiva. Saca snapshots de páginas con Playwright, extrae data estructurada via Claude, hace diff contra snapshots previos, scorea amenazas. Webhooks disparan above threshold.",
    },
  },
  {
    slug: "modelsentry",
    track: "b",
    name: "ModelSentry",
    status: "live",
    stack: "TypeScript · Gemini API · GitHub Actions · GH Pages",
    liveUrl: "https://martin-minghetti.github.io/modelsentry/",
    githubUrl: "https://github.com/martin-minghetti/modelsentry",
    cost: "$0.00 / run",
    summary: {
      en: "AI early-warning system for developers. Scrapes 8 RSS feeds + diffs 5 provider pages daily. Static dashboard with Lighthouse 100/94/96/100. Zero infra cost. 159 tests.",
      es: "Sistema de early-warning de IA para devs. Scrapea 8 RSS feeds + diff de 5 páginas de providers diariamente. Dashboard estático con Lighthouse 100/94/96/100. Cero costo de infra. 159 tests.",
    },
  },
  {
    slug: "skillcam",
    track: "b",
    name: "SkillCam",
    status: "npm",
    stack: "TypeScript · npm package",
    liveUrl: "https://www.npmjs.com/package/skillcam",
    githubUrl: "https://github.com/martin-minghetti/skillcam",
    summary: {
      en: "Open-source CLI. Reads native session logs from Claude Code and Codex CLI, distills them into reusable SKILL.md files. Works with any LLM or none (--no-llm mode).",
      es: "CLI open-source. Lee logs nativos de sesiones de Claude Code y Codex CLI, los destila en archivos SKILL.md reutilizables. Funciona con cualquier LLM o sin uno (--no-llm mode).",
    },
  },
];

export function getProjectsByTrack(track: ProjectTrack): Project[] {
  return projects.filter((p) => p.track === track);
}

export const airlstClients = [
  "MERCEDES BENZ",
  "AMAZON",
  "NETFLIX",
  "DISNEY",
  "ZALANDO",
  "DISCOVERY",
  "BASF",
  "AIDA",
  "ENGIE",
  "THE VOICE GERMANY",
] as const;
