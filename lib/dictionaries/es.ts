import type { Dictionary } from "./types";

export const es: Dictionary = {
  meta: {
    title: "Martín Minghetti, desarrollador frontend",
    description:
      "Desarrollador frontend de Bariloche. Siete años y medio armando sitios de eventos en AirLST (Múnich). Hoy hago sitios web y tiendas para negocios. Escribime.",
  },
  nav: {
    contact: "Contacto",
    github: "GitHub",
    langSwitch: "EN",
    blog: "Blog",
  },
  blog: {
    title: "Blog",
    lead: "Notas de aprendizaje sobre cómo construir con modelos de lenguaje.",
    back: "Volver al blog",
    read: "Leer el post",
    empty: "Todavía no hay posts en este idioma.",
    comments: "Comentarios",
    commentsHint: "Para comentar necesitás una cuenta de GitHub.",
    minutes: "min de lectura",
    rss: "Seguir por RSS",
  },
  hero: {
    h1Line1: "Soy Martín.",
    h1Line2: "Hago sitios web",
    h1Line3: "y tiendas online.",
    trackA: {
      tagline: "Para negocios y emprendedores. Diseño, código y pagos con Mercado Pago.",
      cta: "Escribime por WhatsApp",
    },
    seeProjects: "Ver {n} proyectos",
  },
  trackA: {
    sectionHeader: "Sitios y tiendas de muestra",
    cta: "Escribime por WhatsApp",
    ctaSub:
      "Si querés algo así para tu negocio, el presupuesto llega en 24 horas y sin compromiso.",
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
  redesign: {
    sectionHeader: "Rediseños propuestos",
    status: "Propuesta, sin publicar",
    before: "Antes",
    after: "Después",
    slider: "Deslizá para comparar el sitio actual con el rediseño",
    oldSiteHeading: "Cómo era el sitio anterior",
    oldSiteHint: "Elegí el aparato y bajá dentro del recuadro para recorrer la página entera.",
    oldSiteAlt: "Página completa del sitio anterior",
    devices: { mobile: "Celular", tablet: "Tablet", desktop: "Compu" },
    scoresHeading: "Cómo anda, según Google",
    scoresNote: "Puntaje de 0 a 100 de Lighthouse, la herramienta de Google para medir sitios.",
    legend: { bad: "0 a 49: malo", mid: "50 a 89: mejorable", good: "90 a 100: bueno" },
    featuresHeading: "Qué tiene el sitio nuevo",
    open: "Ver antes y después",
    cta: "Ver el rediseño",
    back: "← Volver al inicio",
  },
  airlst: {
    sectionHeader: "Trayectoria",
    disclaimer:
      "Desarrollador frontend en AirLST (tecnología para eventos, Múnich), de junio de 2018 a noviembre de 2025. Hacía a medida el sitio de cada evento: formulario de registro, agenda, hotel, speakers y lugar.",
    clientsLabel: "Clientes para los que trabajé en AirLST",
  },
  stack: {
    sectionHeader: "Con qué trabajo",
    sectionLead: "Lo que uso para trabajar.",
    rows: [
      { label: "Frontend", values: "HTML, CSS, JavaScript, Vue 3 y Nuxt 3, Tailwind CSS" },
      { label: "Diseño", values: "Del diseño en Figma o Adobe XD al sitio terminado" },
      { label: "Proyectos propios", values: "Next.js 16 y Supabase, hechos con Claude Code" },
      { label: "Pagos", values: "Mercado Pago: Checkout Pro y suscripciones" },
      { label: "Publicación", values: "Vercel, Hostinger, GitHub" },
      { label: "Integraciones", values: "WhatsApp, Google Maps, Google Calendar" },
    ],
  },
  about: {
    sectionHeader: "Sobre mí",
    paragraphs: [
      "Empecé en 2018 como desarrollador frontend en AirLST, una empresa de tecnología para eventos con base en Múnich. Hacía a medida el sitio de cada evento: el formulario de registro y las páginas con la agenda, el hotel, los speakers y el lugar. Fueron cientos de páginas en siete años y medio, con Vue y Nuxt. Viví en Alemania hasta 2021 y después seguí trabajando remoto desde Argentina.",
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
      tagline: "Desarrollador frontend. Sitios web y tiendas a medida.",
      stats: "Proyectos propios, con demo online.",
      location: "Bariloche, Argentina",
      meta: "Ciudadano europeo (Islandia)",
    },
    columnWork: {
      heading: "Trabajo",
      links: [
        { label: "Sitios de muestra", href: "/es#track-a" },
        { label: "Trayectoria", href: "/es#experience" },
        { label: "Sobre mí", href: "/es#about" },
        { label: "Blog", href: "/es/blog" },
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
