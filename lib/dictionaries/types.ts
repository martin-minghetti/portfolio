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
  };
  hero: {
    h1Line1: string;
    h1Line2: string;
    h1Line3: string;
    trackA: {
      label: string;
      tagline: string;
      cta: string;
    };
    trackB: {
      label: string;
      tagline: string;
      cta: string;
    };
    scrollHint: string;
  };
  whoIAm: {
    lead: string;
    timeline: {
      year: string;
      label: string;
    }[];
    stats: string[];
  };
  trackA: {
    sectionHeader: string;
    sectionLead: string;
    pitch: string[];
    cta: string;
    ctaSub: string;
  };
  trackB: {
    sectionHeader: string;
    sectionLead: string;
    pitch: string[];
    cta: string;
    ctaSub: string;
  };
  cardLabels: {
    live: string;
    demo: string;
    npm: string;
    seeLive: string;
    github: string;
    buildLog: string;
    builtIn: string;
  };
  airlst: {
    sectionHeader: string;
    disclaimer: string;
    metrics: string;
  };
  howIThink: {
    sectionHeader: string;
    sectionLead: string;
    items: Manifesto[];
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
