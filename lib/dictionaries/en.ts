import type { Dictionary } from "./types";

export const en: Dictionary = {
  meta: {
    title: "Martin Minghetti — Senior Fullstack & AI Engineer",
    description:
      "Senior AI engineer and fullstack developer. 7.5 years at AirLST GmbH (Munich). 14 open-source projects, 4 commercial demos live. Available for full-time roles and contract work — May 2026.",
  },
  nav: {
    contact: "Contact",
    github: "GitHub",
    langSwitch: "ES",
  },
  hero: {
    h1Line1: "8 years shipping production software.",
    h1Line2: "6 months building AI systems solo.",
    h1Line3: "Two tracks below. Same engineer.",
    trackA: {
      label: "WEBSITES & FULLSTACK",
      tagline:
        "Full-stack delivery for businesses. Mercado Pago integration, tested, time-tracked, no surprises.",
      cta: "Hablemos por WhatsApp",
    },
    trackB: {
      label: "AI ENGINEERING",
      tagline:
        "Multi-agent systems in production. Direct SDK, transparent costs, demos you can run.",
      cta: "Book a 30min intro",
    },
    scrollHint: "Scroll for the receipts",
  },
  whoIAm: {
    lead: "A short version of how I got here.",
    timeline: [
      { year: "2018", label: "Joined AirLST GmbH (Munich, remote)" },
      { year: "2024", label: "AI tools as daily infra" },
      { year: "2025", label: "Independent" },
      { year: "2026", label: "14 OSS projects · 4 demos live" },
    ],
    stats: [
      "7.5 yrs",
      "1000+ pages shipped",
      "30K events served",
      "20M participants",
      "14 OSS projects",
      "4 commercial demos",
    ],
  },
  trackA: {
    sectionHeader: "TRACK A · WEBSITES & FULLSTACK",
    sectionLead:
      "For businesses, founders, and agencies who need a site that ships.",
    pitch: [
      "Mercado Pago integration done right.",
      "Fast. Tested. Tracked time.",
      "Not template-shop output.",
    ],
    cta: "Hablemos por WhatsApp",
    ctaSub: "Want one of these for your business? Quote in 24h, no commitment.",
  },
  trackB: {
    sectionHeader: "TRACK B · AI ENGINEERING",
    sectionLead:
      "For founders, CTOs, and recruiters hiring builders, not researchers.",
    pitch: [
      "Multi-agent systems in production.",
      "Direct SDK over frameworks.",
      "Transparent costs. Tests included.",
    ],
    cta: "Book a 30min intro",
    ctaSub:
      "Hiring a senior AI engineer? Contract, full-time, or a technical scoping call.",
  },
  cardLabels: {
    live: "LIVE",
    demo: "DEMO",
    npm: "NPM",
    seeLive: "See live",
    github: "GitHub",
    buildLog: "Build log",
    builtIn: "Built in",
  },
  airlst: {
    sectionHeader: "SHIPPED FOR",
    disclaimer:
      "As Frontend Developer at AirLST GmbH (event management SaaS, Munich) — Jun 2018 → Nov 2025.",
    metrics:
      "1000+ event pages and microsites delivered. Platform serving 30K+ events and 20M+ participants.",
  },
  howIThink: {
    sectionHeader: "HOW I THINK",
    sectionLead:
      "Four things I do differently from the average AI portfolio.",
    items: [
      {
        index: "01",
        heading: "Direct SDK over frameworks.",
        body: "No LangChain, no CrewAI. Every agent call is explicit, debuggable, and cheap to run.",
      },
      {
        index: "02",
        heading: "Demos you can actually click.",
        body: "Every commercial demo runs in simulated mode by default — complete a checkout, generate a brief, trigger a webhook. No clone, no API key. AI demos accept your key when you want the real model.",
      },
      {
        index: "03",
        heading: "Time-tracked builds.",
        body: "BUILD_LOG.md public on every repo. Honest wall-clock time, T-0 immutable. No 'shipped this in 2 hours' marketing fiction.",
      },
      {
        index: "04",
        heading: "Tests + security audits, even on demos.",
        body: "Vitest + Playwright + HMAC + rate limit + CSP + HSTS. Even on builds that cost $0.60 in Replicate credits.",
      },
    ],
  },
  stack: {
    sectionHeader: "STACK",
    sectionLead: "What I reach for, by category.",
    rows: [
      { label: "LANGUAGES", values: "TypeScript · Python · SQL" },
      {
        label: "FRAMEWORKS",
        values: "Next.js 16 · FastAPI · Vue 3 / Nuxt 3 · React",
      },
      {
        label: "AI",
        values:
          "Anthropic Claude (direct SDK) · Vercel AI SDK · Gemini API · Replicate (FLUX 1.1 Pro)",
      },
      {
        label: "DATA",
        values:
          "PostgreSQL · Supabase · Neon · Drizzle · SQLite · Redis · pgvector",
      },
      { label: "VALIDATION", values: "Zod" },
      {
        label: "PAYMENTS",
        values:
          "Mercado Pago Checkout Pro · MP Subscriptions (preapproval) · HMAC webhooks · Stripe",
      },
      {
        label: "INFRA",
        values: "Vercel · Railway · GitHub Actions / Pages · Docker · Cloudflare",
      },
      { label: "TESTING", values: "Vitest · Playwright · Pytest" },
      { label: "EMAIL", values: "Resend · react-email" },
      { label: "SCRAPING", values: "Playwright · BeautifulSoup · cheerio" },
      {
        label: "INTEGRATIONS",
        values:
          "WhatsApp Business API · Google Calendar · Slack · Discord · Linear · Notion · Apollo · Tavily · Octokit",
      },
    ],
  },
  about: {
    sectionHeader: "ABOUT",
    paragraphs: [
      "I started at AirLST GmbH in Munich in 2018 as a Frontend Developer, building event pages and microsites for brands like Mercedes Benz, Amazon, Netflix, Disney, and Zalando. Over 7.5 years I shipped 1000+ custom pages on a Vue/Nuxt platform that served 30K+ events and 20M+ participants. I learned what shipping at scale actually costs, and what it doesn't.",
      "By 2024 I was using AI dev tools (Claude Code, Codex) as daily infrastructure — not experiments. In November 2025 I left AirLST to go independent. In the six months since, I've shipped 14 open-source projects and 4 live commercial demos, all with public BUILD_LOG.md tracking honest wall-clock time. I ship multi-agent AI systems for production, and fullstack web apps that ship and stay shipped.",
      "I'm based in Bariloche, Argentine Patagonia. EU citizen (Iceland) — no sponsorship needed for European roles. 100% remote since 2018, overlapping US business hours (GMT-3). Available for contract AI engineering, full-time roles, and select fullstack project work.",
    ],
    facts: [
      { label: "LOCATION", value: "Bariloche, Argentina" },
      { label: "TIMEZONE", value: "GMT-3 (overlaps US business hours)" },
      { label: "CITIZENSHIP", value: "EU (Iceland) — no sponsorship for Europe" },
      {
        label: "LANGUAGES",
        value:
          "Spanish (native) · English (full professional) · Icelandic (basic) · German (basic)",
      },
      { label: "REMOTE SINCE", value: "2018" },
    ],
  },
  footer: {
    columnAbout: {
      heading: "MARTIN MINGHETTI",
      tagline: "Senior fullstack → AI engineer.",
      stats: "14 OSS repos. 4 demos live.",
      location: "Bariloche, AR · GMT-3",
      meta: "EU citizen · Remote since 2018",
    },
    columnWork: {
      heading: "WORK",
      links: [
        { label: "Track A — Websites", href: "/en#track-a" },
        { label: "Track B — AI Engineering", href: "/en#track-b" },
        { label: "Projects", href: "/en#track-a" },
        { label: "Build log", href: "/en#build-log" },
      ],
    },
    columnReach: {
      heading: "REACH",
      links: [
        { label: "WhatsApp", href: "https://wa.me/5492241622290" },
        { label: "Email", href: "mailto:martin.minghetti@gmail.com" },
        { label: "Cal.com", href: "https://cal.com/martin-minghetti" },
        { label: "GitHub", href: "https://github.com/martin-minghetti" },
        { label: "LinkedIn", href: "https://linkedin.com/in/martin-minghetti" },
      ],
    },
    legal: "© 2026 Martin Minghetti · Built with Next 16, Tailwind v4",
    sourceLink: "View source on GitHub",
  },
};
