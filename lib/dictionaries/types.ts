export type FooterLink = {
  label: string;
  href: string;
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
