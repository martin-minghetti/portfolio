import type { Dictionary } from "./types";

export const es: Dictionary = {
  meta: {
    title: "Martín Minghetti, desarrollador web",
    description:
      "Desarrollador web de Bariloche. Siete años y medio armando sitios de eventos en AirLST (Múnich). Hoy hago proyectos propios con ayuda de agentes de IA. Escribime.",
  },
  nav: {
    contact: "Contacto",
    github: "GitHub",
    langSwitch: "EN",
  },
  hero: {
    h1Line1: "Soy Martín.",
    h1Line2: "Hago sitios web.",
    h1Line3: "Y apps con ayuda de IA.",
    trackA: {
      label: "Sitios web y tiendas",
      tagline:
        "Para negocios y emprendedores. Diseño, código y pagos con Mercado Pago, con presupuesto claro.",
      cta: "Escribime por WhatsApp",
    },
    trackB: {
      label: "Apps y automatizaciones con IA",
      tagline:
        "Cosas que te ahorran horas: leer mails, armar informes, contestar consultas. Hay demos para probar.",
      cta: "Reservá 30 minutos",
    },
    scrollHint: "Bajá para ver los proyectos",
  },
  whoIAm: {
    lead: "Cómo llegué hasta acá, en cuatro líneas.",
    timeline: [
      { year: "2018", label: "Entré a AirLST, en Múnich, como desarrollador frontend" },
      { year: "2021", label: "Seguí en AirLST, remoto desde Argentina" },
      { year: "2024", label: "Empecé a construir con agentes de IA" },
      { year: "2025", label: "Terminé en AirLST y arranqué por mi cuenta" },
    ],
    stats: [
      "7 años y medio de frontend",
      "Más de 1000 páginas de eventos",
      "Proyectos propios con demo online",
    ],
  },
  trackA: {
    sectionHeader: "Sitios web y tiendas",
    sectionLead:
      "Para negocios, emprendedores y agencias que necesitan un sitio que funcione.",
    pitch: [
      "Pagos con Mercado Pago integrados.",
      "Sitios rápidos, hechos a medida.",
      "Presupuesto claro, sin sorpresas.",
    ],
    cta: "Escribime por WhatsApp",
    ctaSub:
      "Si querés algo así para tu negocio, el presupuesto llega en 24 horas y sin compromiso.",
  },
  trackB: {
    sectionHeader: "Apps y automatizaciones con IA",
    sectionLead: "Para quien quiere ver las cosas andando antes de decidir.",
    pitch: [
      "Demos que podés abrir y probar.",
      "Cuánto cuesta cada corrida, a la vista.",
      "Código público en GitHub.",
    ],
    cta: "Reservá 30 minutos",
    ctaSub:
      "Si querés hablar de un proyecto o de un trabajo, escribime o reservá una llamada de 30 minutos.",
  },
  cardLabels: {
    live: "En vivo",
    demo: "Demo",
    npm: "npm",
    wip: "En desarrollo",
    support: "Soporte",
    seeLive: "Ver demo",
    github: "GitHub",
    buildLog: "Bitácora de armado",
    login: "login",
    builtIn: "Armado en",
  },
  airlst: {
    sectionHeader: "Dónde trabajé",
    disclaimer:
      "Desarrollador frontend en AirLST (tecnología para eventos, Múnich), de junio de 2018 a noviembre de 2025. Hacía a medida el sitio de cada evento: formulario de registro, agenda, hotel, speakers y lugar.",
    metrics:
      "Más de 1000 páginas de eventos para clientes de AirLST como Mercedes-Benz, Netflix y BioNTech.",
  },
  howIThink: {
    sectionHeader: "Cómo trabajo",
    sectionLead: "Cuatro cosas que hago distinto.",
    items: [
      {
        index: "01",
        heading: "Demos que se pueden probar.",
        body: "Cada demo comercial funciona en modo simulado: completás un checkout, generás un informe, disparás un webhook. No hay que clonar nada ni poner claves. Las demos con IA aceptan tu propia clave si querés el modelo real.",
      },
      {
        index: "02",
        heading: "El tiempo real, anotado.",
        body: "Cada repo tiene un BUILD_LOG.md público con lo que realmente tardó. Nada de «lo hice en dos horas».",
      },
      {
        index: "03",
        heading: "Construyo con agentes, y lo digo.",
        body: "Dirijo a la IA para que escriba el código: yo decido qué se hace y lo pruebo. En los proyectos más grandes, como Cumbre, hay pruebas automáticas con Vitest y Playwright.",
      },
      {
        index: "04",
        heading: "Código público.",
        body: "Los proyectos están en GitHub, con su historial. Podés ver cómo se armó cada cosa.",
      },
    ],
  },
  stack: {
    sectionHeader: "Con qué trabajo",
    sectionLead: "Lo que usan mis proyectos.",
    rows: [
      { label: "Lenguajes", values: "TypeScript, Python, SQL" },
      {
        label: "Frameworks",
        values: "Next.js 16, FastAPI, Vue 3 y Nuxt 3, React",
      },
      {
        label: "IA",
        values:
          "Anthropic Claude, Vercel AI SDK, Gemini API, Replicate (FLUX 1.1 Pro)",
      },
      {
        label: "Datos",
        values:
          "PostgreSQL, Supabase, Neon, Drizzle, SQLite, Redis, pgvector",
      },
      { label: "Validación", values: "Zod" },
      {
        label: "Pagos",
        values:
          "Mercado Pago Checkout Pro, suscripciones de Mercado Pago, webhooks con HMAC, Stripe",
      },
      {
        label: "Infraestructura",
        values: "Vercel, Railway, GitHub Actions y Pages, Docker, Cloudflare",
      },
      { label: "Pruebas", values: "Vitest, Playwright, Pytest" },
      { label: "Email", values: "Resend, react-email" },
      { label: "Scraping", values: "Playwright, BeautifulSoup, cheerio" },
      {
        label: "Integraciones",
        values:
          "WhatsApp Business API, Google Calendar, Slack, Discord, Linear, Notion, Apollo, Tavily, Octokit",
      },
    ],
  },
  about: {
    sectionHeader: "Sobre mí",
    paragraphs: [
      "Empecé en 2018 como desarrollador frontend en AirLST, una empresa de tecnología para eventos con base en Múnich. Hacía a medida el sitio de cada evento: el formulario de registro y las páginas con la agenda, el hotel, los speakers y el lugar. Fueron más de 1000 páginas en siete años y medio, con Vue y Nuxt. Viví en Alemania hasta 2021 y después seguí trabajando remoto desde Argentina.",
      "En 2024 empecé a usar IA para construir, y hoy trabajo así: dirijo a Claude Code, que escribe el código, y yo decido qué se hace y lo pruebo. Terminé en AirLST en noviembre de 2025 y desde entonces armo proyectos propios, con demos que podés abrir.",
      "Vivo en Bariloche, en la Patagonia argentina. Tengo ciudadanía europea (Islandia). Hablo español e inglés, y un poco de alemán e islandés. Si querés que trabajemos juntos, escribime.",
    ],
    facts: [
      { label: "Ubicación", value: "Bariloche, Argentina" },
      { label: "Huso horario", value: "GMT-3, coincide con el horario de oficina de EE. UU." },
      { label: "Ciudadanía", value: "Europea (Islandia), sin necesidad de visa para Europa" },
      {
        label: "Idiomas",
        value: "Español (nativo), inglés (fluido), alemán e islandés (nociones)",
      },
      { label: "Remoto desde", value: "2021" },
    ],
  },
  footer: {
    columnAbout: {
      heading: "Martín Minghetti",
      tagline: "Desarrollador web. Construyo con ayuda de IA.",
      stats: "Proyectos propios, con demo online.",
      location: "Bariloche, Argentina",
      meta: "Ciudadano europeo (Islandia)",
    },
    columnWork: {
      heading: "Trabajo",
      links: [
        { label: "Sitios web y tiendas", href: "/es#track-a" },
        { label: "Apps con IA", href: "/es#track-b" },
        { label: "Proyectos", href: "/es#track-a" },
        { label: "Bitácora", href: "/es#build-log" },
      ],
    },
    columnReach: {
      heading: "Contacto",
      links: [
        { label: "WhatsApp", href: "https://wa.me/5492241622290" },
        { label: "Email", href: "mailto:martin.minghetti@gmail.com" },
        { label: "Cal.com", href: "https://cal.com/martin-minghetti" },
        { label: "GitHub", href: "https://github.com/martin-minghetti" },
        { label: "LinkedIn", href: "https://linkedin.com/in/martin-minghetti" },
      ],
    },
    legal: "© 2026 Martín Minghetti. Hecho con Next 16 y Tailwind v4",
    sourceLink: "Ver el código en GitHub",
  },
};
