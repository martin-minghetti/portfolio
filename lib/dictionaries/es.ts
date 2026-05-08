import type { Dictionary } from "./types";

export const es: Dictionary = {
  meta: {
    title: "Martín Minghetti — Senior Fullstack & AI Engineer",
    description:
      "AI engineer senior y desarrollador fullstack. 7.5 años en AirLST GmbH (Munich). 14 proyectos open-source, 4 demos comerciales live. Disponible para roles full-time y contract work — mayo 2026.",
  },
  nav: {
    contact: "Contacto",
    github: "GitHub",
    langSwitch: "EN",
  },
  hero: {
    h1Line1: "Construyo sitios web que funcionan.",
    h1Line2: "Y sistemas con IA que ahorran horas.",
    h1Line3: "Mismo desarrollador, dos pistas.",
    trackA: {
      label: "SITIOS WEB & FULLSTACK",
      tagline:
        "Sitios para negocios y founders. Diseño, código y pagos integrados. Tiempo trackeado, sin sorpresas.",
      cta: "Hablemos por WhatsApp",
    },
    trackB: {
      label: "SISTEMAS CON IA",
      tagline:
        "Automatizo tareas que te comen tiempo: leer mails, generar reportes, atender consultas. Demos que podés probar.",
      cta: "Reservá 30 minutos",
    },
    scrollHint: "Bajá para ver el trabajo",
  },
  whoIAm: {
    lead: "Versión corta de cómo llegué hasta acá.",
    timeline: [
      { year: "2018", label: "Empecé en AirLST (Munich, remoto)" },
      { year: "2024", label: "AI tools como infra diaria" },
      { year: "2025", label: "Independiente" },
      { year: "2026", label: "14 proyectos OSS · 4 demos live" },
    ],
    stats: [
      "7.5 años",
      "1000+ páginas entregadas",
      "30K eventos",
      "20M participantes",
      "14 proyectos OSS",
      "4 demos comerciales",
    ],
  },
  trackA: {
    sectionHeader: "TRACK A · SITIOS WEB & FULLSTACK",
    sectionLead:
      "Para negocios, founders y agencias que necesitan un sitio que funcione.",
    pitch: [
      "Integración con Mercado Pago hecha bien.",
      "Rápido. Con tests. Tiempo trackeado.",
      "Sin onda agencia uruguaya 2019.",
    ],
    cta: "Hablemos por WhatsApp",
    ctaSub:
      "¿Querés uno de estos para tu negocio? Presupuesto en 24h, sin compromiso.",
  },
  trackB: {
    sectionHeader: "TRACK B · AI ENGINEERING",
    sectionLead:
      "Para founders, CTOs y recruiters que contratan builders, no investigadores.",
    pitch: [
      "Sistemas multi-agente en producción.",
      "Direct SDK por sobre frameworks.",
      "Costos transparentes. Tests incluidos.",
    ],
    cta: "Reservá 30 minutos",
    ctaSub:
      "¿Buscás un AI engineer senior? Contract, full-time, o una call técnica de scoping.",
  },
  cardLabels: {
    live: "LIVE",
    demo: "DEMO",
    npm: "NPM",
    seeLive: "Ver demo",
    github: "GitHub",
    buildLog: "Build log",
    builtIn: "Built en",
  },
  airlst: {
    sectionHeader: "TRABAJÉ PARA",
    disclaimer:
      "Como Frontend Developer en AirLST GmbH (event management SaaS, Munich) — Jun 2018 → Nov 2025.",
    metrics:
      "1000+ páginas de eventos y micrositios entregados. Plataforma sirviendo 30K+ eventos y 20M+ participantes.",
  },
  howIThink: {
    sectionHeader: "CÓMO PIENSO",
    sectionLead:
      "Cuatro cosas que hago distinto al portfolio de IA promedio.",
    items: [
      {
        index: "01",
        heading: "Direct SDK por sobre frameworks.",
        body: "Sin LangChain, sin CrewAI. Cada call de agente es explícita, debuggable, y barata de correr.",
      },
      {
        index: "02",
        heading: "Demos que podés clickear de verdad.",
        body: "Cada demo comercial corre en modo simulado por default — completás un checkout, generás un brief, disparás un webhook. Sin clonar, sin API key. Las demos AI aceptan tu key cuando querés el modelo real.",
      },
      {
        index: "03",
        heading: "Builds con tiempo trackeado.",
        body: "BUILD_LOG.md público en cada repo. Tiempo wall-clock honesto, T-0 inmutable. Sin la ficción marketing de 'hecho en 2 horas'.",
      },
      {
        index: "04",
        heading: "Tests + security audits, incluso en demos.",
        body: "Vitest + Playwright + HMAC + rate limit + CSP + HSTS. Incluso en builds que costaron $0.60 en créditos de Replicate.",
      },
    ],
  },
  stack: {
    sectionHeader: "STACK",
    sectionLead: "A qué herramientas voy, por categoría.",
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
    sectionHeader: "SOBRE MÍ",
    paragraphs: [
      "Empecé en AirLST GmbH en Munich en 2018 como Frontend Developer, construyendo páginas de eventos y micrositios para marcas como Mercedes Benz, Amazon, Netflix, Disney, y Zalando. Durante 7.5 años entregué 1000+ páginas custom sobre una plataforma Vue/Nuxt que sirvió 30K+ eventos y 20M+ participantes. Aprendí cuánto cuesta realmente shippear a escala, y cuánto no.",
      "Para 2024 ya usaba herramientas de AI dev (Claude Code, Codex) como infraestructura diaria — no como experimento. En noviembre 2025 dejé AirLST para irme independiente. En los seis meses desde, shippé 14 proyectos open-source y 4 demos comerciales live, todos con BUILD_LOG.md público que trackea tiempo wall-clock honesto. Construyo sistemas multi-agente de IA para producción, y aplicaciones web fullstack para negocios que las necesitan en producción, no en staging eterno.",
      "Vivo en Bariloche, Patagonia argentina. Ciudadano EU (Islandia) — sin necesidad de sponsorship para roles europeos. 100% remoto desde 2018, con overlap de horario de oficina US (GMT-3). Disponible para contract de AI engineering, roles full-time, y proyectos puntuales de fullstack.",
    ],
    facts: [
      { label: "UBICACIÓN", value: "Bariloche, Argentina" },
      { label: "HUSO HORARIO", value: "GMT-3 (overlap con horario US)" },
      { label: "CIUDADANÍA", value: "EU (Islandia) — sin sponsorship para Europa" },
      {
        label: "IDIOMAS",
        value:
          "Español (nativo) · Inglés (full professional) · Islandés (básico) · Alemán (básico)",
      },
      { label: "REMOTO DESDE", value: "2018" },
    ],
  },
  footer: {
    columnAbout: {
      heading: "MARTÍN MINGHETTI",
      tagline: "Senior fullstack → AI engineer.",
      stats: "14 repos OSS. 4 demos live.",
      location: "Bariloche, AR · GMT-3",
      meta: "Ciudadano EU · Remoto desde 2018",
    },
    columnWork: {
      heading: "WORK",
      links: [
        { label: "Track A — Sitios web", href: "/es#track-a" },
        { label: "Track B — AI Engineering", href: "/es#track-b" },
        { label: "Proyectos", href: "/es#track-a" },
        { label: "Build log", href: "/es#build-log" },
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
    legal: "© 2026 Martín Minghetti · Construido con Next 16, Tailwind v4",
    sourceLink: "Ver source en GitHub",
  },
};
