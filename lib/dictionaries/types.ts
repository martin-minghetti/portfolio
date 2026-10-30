export type FooterLink = {
  label: string;
  href: string;
};

export type SectionHeader = {
  title: string;
  lead?: string;
};

export type Manifesto = {
  index: string;
  heading: string;
  body: string;
};

export type Dictionary = {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    contact: string;
    github: string;
    langSwitch: string;
    blog: string;
  };
  blog: {
    title: string;
    lead: string;
    back: string;
    read: string;
    empty: string;
    comments: string;
    commentsHint: string;
    minutes: string;
    rss: string;
  };
  hero: {
    h1Line1: string;
    h1Line2: string;
    h1Line3: string;
    trackA: {
      tagline: string;
      cta: string;
    };
    seeProjects: string;
  };
  trackA: {
    sectionHeader: string;
    cta: string;
    ctaSub: string;
  };
  cardLabels: {
    live: string;
    demo: string;
    npm: string;
    wip: string;
    support: string;
    seeLive: string;
    github: string;
    buildLog: string;
    login: string;
    builtIn: string;
  };
  airlst: {
    sectionHeader: string;
    disclaimer: string;
    metrics: string;
  };
  stack: {
    sectionHeader: string;
    sectionLead: string;
    rows: { label: string; values: string }[];
  };
  about: {
    sectionHeader: string;
    paragraphs: string[];
    facts: { label: string; value: string }[];
  };
  footer: {
    columnAbout: {
      heading: string;
      tagline: string;
      stats: string;
      location: string;
      meta: string;
    };
    columnWork: {
      heading: string;
      links: readonly FooterLink[];
    };
    columnReach: {
      heading: string;
      links: readonly FooterLink[];
    };
    legal: string;
    sourceLink: string;
  };
};
