import type { Dictionary } from "./types";

export const en: Dictionary = {
  meta: {
    title: "Martín Minghetti, web developer",
    description:
      "Web developer based in Bariloche, Argentina. Seven and a half years building event sites at AirLST (Munich). Now I make my own projects with the help of AI agents. Get in touch.",
  },
  nav: {
    contact: "Contact",
    github: "GitHub",
    langSwitch: "ES",
    blog: "Blog",
  },
  blog: {
    title: "Blog",
    lead: "Learning notes on building with language models.",
    back: "Back to the blog",
    read: "Read the post",
    empty: "There are no posts in this language yet.",
    comments: "Comments",
    commentsHint: "You need a GitHub account to comment.",
  },
  hero: {
    h1Line1: "I'm Martín.",
    h1Line2: "I make websites.",
    h1Line3: "And apps, with AI's help.",
    trackA: {
      label: "Websites and online stores",
      tagline:
        "For businesses and founders. Design, code and Mercado Pago payments, with a clear quote.",
      cta: "Message me on WhatsApp",
    },
    trackB: {
      label: "AI apps and automations",
      tagline:
        "Things that save you hours: reading emails, putting reports together, answering questions. There are demos you can try.",
      cta: "Book 30 minutes",
    },
    scrollHint: "Scroll to see the projects",
  },
  whoIAm: {
    lead: "How I got here, in four lines.",
    timeline: [
      { year: "2018", label: "Joined AirLST, in Munich, as a frontend developer" },
      { year: "2021", label: "Stayed at AirLST, remote from Argentina" },
      { year: "2024", label: "Started building with AI agents" },
      { year: "2025", label: "Finished at AirLST and went out on my own" },
    ],
    stats: [
      "7.5 years of frontend",
      "1000+ event pages",
      "Own projects with a live demo",
    ],
  },
  trackA: {
    sectionHeader: "Websites and online stores",
    sectionLead:
      "For businesses, founders and agencies who need a site that works.",
    pitch: [
      "Mercado Pago payments wired in.",
      "Fast sites, made to measure.",
      "A clear quote, no surprises.",
    ],
    cta: "Message me on WhatsApp",
    ctaSub:
      "If you want something like this for your business, the quote arrives in 24 hours, no commitment.",
  },
  trackB: {
    sectionHeader: "AI apps and automations",
    sectionLead: "For anyone who wants to see things running before deciding.",
    pitch: [
      "Demos you can open and try.",
      "What each run costs, out in the open.",
      "Public code on GitHub.",
    ],
    cta: "Book 30 minutes",
    ctaSub:
      "If you want to talk about a project or a job, message me or book a 30 minute call.",
  },
  cardLabels: {
    live: "Live",
    demo: "Demo",
    npm: "npm",
    wip: "In development",
    support: "Support",
    seeLive: "See demo",
    github: "GitHub",
    buildLog: "Build log",
    login: "login",
    builtIn: "Built in",
  },
  airlst: {
    sectionHeader: "Where I worked",
    disclaimer:
      "Frontend developer at AirLST (event technology, Munich), from June 2018 to November 2025. I built each event's site to order: registration form, agenda, hotel, speakers and venue.",
    metrics:
      "1000+ event pages for AirLST clients such as Mercedes-Benz, Netflix and BioNTech.",
  },
  howIThink: {
    sectionHeader: "How I work",
    sectionLead: "Four things I do differently.",
    items: [
      {
        index: "01",
        heading: "Demos you can try.",
        body: "Every commercial demo runs in simulated mode: you complete a checkout, generate a report, trigger a webhook. Nothing to clone, no keys to set. The AI demos accept your own key if you want the real model.",
      },
      {
        index: "02",
        heading: "The real time, written down.",
        body: "Every repo has a public BUILD_LOG.md with how long it really took. No \"made it in two hours\".",
      },
      {
        index: "03",
        heading: "I build with agents, and I say so.",
        body: "I direct the AI to write the code: I decide what gets done and I test it. In the bigger projects, like Cumbre, there are automated tests with Vitest and Playwright.",
      },
      {
        index: "04",
        heading: "Public code.",
        body: "The projects are on GitHub, with their history. You can see how each thing was put together.",
      },
    ],
  },
  stack: {
    sectionHeader: "What I work with",
    sectionLead: "What my projects use.",
    rows: [
      { label: "Languages", values: "TypeScript, Python, SQL" },
      {
        label: "Frameworks",
        values: "Next.js 16, FastAPI, Vue 3 and Nuxt 3, React",
      },
      {
        label: "AI",
        values:
          "Anthropic Claude, Vercel AI SDK, Gemini API, Replicate (FLUX 1.1 Pro)",
      },
      {
        label: "Data",
        values:
          "PostgreSQL, Supabase, Neon, Drizzle, SQLite, Redis, pgvector",
      },
      { label: "Validation", values: "Zod" },
      {
        label: "Payments",
        values:
          "Mercado Pago Checkout Pro, Mercado Pago subscriptions, HMAC webhooks, Stripe",
      },
      {
        label: "Infrastructure",
        values: "Vercel, Railway, GitHub Actions and Pages, Docker, Cloudflare",
      },
      { label: "Testing", values: "Vitest, Playwright, Pytest" },
      { label: "Email", values: "Resend, react-email" },
      { label: "Scraping", values: "Playwright, BeautifulSoup, cheerio" },
      {
        label: "Integrations",
        values:
          "WhatsApp Business API, Google Calendar, Slack, Discord, Linear, Notion, Apollo, Tavily, Octokit",
      },
    ],
  },
  about: {
    sectionHeader: "About me",
    paragraphs: [
      "I started in 2018 as a frontend developer at AirLST, an event technology company based in Munich. I built each event's site to order: the registration form and the pages with the agenda, the hotel, the speakers and the venue. That came to more than 1000 pages over seven and a half years, with Vue and Nuxt. I lived in Germany until 2021 and then kept working remotely from Argentina.",
      "In 2024 I started using AI to build, and that is how I work today: I direct Claude Code, which writes the code, and I decide what gets done and test it. I finished at AirLST in November 2025 and since then I have been making my own projects, with demos you can open.",
      "I live in Bariloche, in Argentine Patagonia. I have European citizenship (Iceland). I speak Spanish and English, and a little German and Icelandic. If you want us to work together, message me.",
    ],
    facts: [
      { label: "Location", value: "Bariloche, Argentina" },
      { label: "Time zone", value: "GMT-3, overlaps US office hours" },
      { label: "Citizenship", value: "European (Iceland), no visa needed for Europe" },
      {
        label: "Languages",
        value: "Spanish (native), English (fluent), German and Icelandic (basic)",
      },
      { label: "Remote since", value: "2021" },
    ],
  },
  footer: {
    columnAbout: {
      heading: "Martín Minghetti",
      tagline: "Web developer. I build with AI's help.",
      stats: "Own projects, with a live demo.",
      location: "Bariloche, Argentina",
      meta: "European citizen (Iceland)",
    },
    columnWork: {
      heading: "Work",
      links: [
        { label: "Websites and online stores", href: "/en#track-a" },
        { label: "AI apps", href: "/en#track-b" },
        { label: "Projects", href: "/en#track-a" },
        { label: "Build log", href: "/en#build-log" },
        { label: "Blog", href: "/en/blog" },
      ],
    },
    columnReach: {
      heading: "Contact",
      links: [
        { label: "WhatsApp", href: "https://wa.me/5492241622290" },
        { label: "Email", href: "mailto:martin.minghetti@gmail.com" },
        { label: "Cal.com", href: "https://cal.com/martin-minghetti" },
        { label: "GitHub", href: "https://github.com/martin-minghetti" },
        { label: "LinkedIn", href: "https://linkedin.com/in/martin-minghetti" },
      ],
    },
    legal: "© 2026 Martín Minghetti. Built with Next 16 and Tailwind v4",
    sourceLink: "View the code on GitHub",
  },
};
