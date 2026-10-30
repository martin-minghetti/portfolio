import type { Dictionary } from "./types";

export const en: Dictionary = {
  meta: {
    title: "Martín Minghetti, frontend developer",
    description:
      "Frontend developer based in Bariloche, Argentina. Seven and a half years building event sites at AirLST (Munich). Now I build websites and online stores for businesses. Get in touch.",
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
    minutes: "min read",
    rss: "Follow via RSS",
  },
  hero: {
    h1Line1: "I'm Martín.",
    h1Line2: "I build websites",
    h1Line3: "and online stores.",
    trackA: {
      tagline: "For businesses and founders. Design, code and Mercado Pago payments.",
      cta: "Message me on WhatsApp",
    },
    seeProjects: "See {n} projects",
  },
  trackA: {
    sectionHeader: "Sample sites and stores",
    cta: "Message me on WhatsApp",
    ctaSub:
      "If you want something like this for your business, the quote arrives in 24 hours, no commitment.",
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
  redesign: {
    sectionHeader: "Proposed redesign",
    name: "Italia Inn, a hostel in Bariloche",
    status: "Proposal, not live",
    intro:
      "The hostel's site hadn't been updated in a while: a May promo in an auto-rotating carousel, almost 4 MB to load and, on phones, a page that jumped around while loading. I proposed this redesign. It isn't live yet: the current site is still up.",
    before: "Before",
    after: "After",
    slider: "Drag to compare the current site with the redesign",
    metricsHeading: "Measured with Lighthouse",
    metricsNote: "Home page, October 22, 2026.",
    metrics: [
      { label: "Mobile performance", before: "44", after: "100" },
      { label: "Page weight", before: "3.9 MB", after: "0.4 MB" },
      { label: "Mobile load (LCP)", before: "6.1 s", after: "1.5 s" },
      { label: "Accessibility", before: "92", after: "100" },
    ],
    featuresHeading: "What the new site has",
    features: [
      "WhatsApp inquiries: a form with its own calendar writes the message with dates, guests and room. No online booking, on purpose: the hostel sells direct and pays no commission.",
      "Three languages: Spanish, Portuguese and English.",
      "All six rooms with photos, the common areas, the location and the apartments, on one page.",
      "Google rating and reviews in plain sight.",
      "Optimized photos, alt text on every image and a single heading per page.",
    ],
    stack: "HTML · CSS · JavaScript · Python · Vercel",
    cta: "See the redesign",
  },
  airlst: {
    sectionHeader: "Career",
    disclaimer:
      "Frontend developer at AirLST (event technology, Munich), from June 2018 to November 2025. I built each event's site to order: registration form, agenda, hotel, speakers and venue.",
    clientsLabel: "Clients I worked for at AirLST",
  },
  stack: {
    sectionHeader: "What I work with",
    sectionLead: "What I use to work.",
    rows: [
      { label: "Frontend", values: "HTML, CSS, JavaScript, Vue 3 and Nuxt 3, Tailwind CSS" },
      { label: "Design", values: "From a Figma or Adobe XD design to the finished site" },
      { label: "Own projects", values: "Next.js 16 and Supabase, built with Claude Code" },
      { label: "Payments", values: "Mercado Pago: Checkout Pro and subscriptions" },
      { label: "Publishing", values: "Vercel, Hostinger, GitHub" },
      { label: "Integrations", values: "WhatsApp, Google Maps, Google Calendar" },
    ],
  },
  about: {
    sectionHeader: "About me",
    paragraphs: [
      "I started in 2018 as a frontend developer at AirLST, an event technology company based in Munich. I built each event's site to order: the registration form and the pages with the agenda, the hotel, the speakers and the venue. That came to hundreds of pages over seven and a half years, with Vue and Nuxt. I lived in Germany until 2021 and then kept working remotely from Argentina.",
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
      tagline: "Frontend developer. Custom websites and online stores.",
      stats: "Own projects, with a live demo.",
      location: "Bariloche, Argentina",
      meta: "European citizen (Iceland)",
    },
    columnWork: {
      heading: "Work",
      links: [
        { label: "Sample sites", href: "/en#track-a" },
        { label: "Career", href: "/en#experience" },
        { label: "About me", href: "/en#about" },
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
