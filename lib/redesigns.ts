import type { Locale } from "./i18n";

export type Redesign = {
  slug: string;
  name: Record<Locale, string>;
  newUrl: string;
  stack: string;
  // Screens in public/projects/<slug>: antes-desktop, despues-desktop, antes-mobile, despues-mobile (.jpg).
  intro: Record<Locale, string>;
  metricsNote: Record<Locale, string>;
  metrics: Record<Locale, { label: string; before: string; after: string }[]>;
  features: Record<Locale, string[]>;
};

export const redesigns: Redesign[] = [
  {
    slug: "italia-inn",
    name: { es: "Italia Inn, hostel en Bariloche", en: "Italia Inn, a hostel in Bariloche" },
    newUrl: "https://italia-inn.vercel.app",
    stack: "HTML · CSS · JavaScript · Python · Vercel",
    intro: {
      es: "El sitio del hostel no se actualizaba hace tiempo: una promo de mayo en un carrusel automático, casi 4 MB de carga y, en el celular, una página que saltaba mientras cargaba. Propuse este rediseño. Todavía no está publicado: el sitio actual sigue en línea.",
      en: "The hostel's site hadn't been updated in a while: a May promo in an auto-rotating carousel, almost 4 MB to load and, on phones, a page that jumped around while loading. I proposed this redesign. It isn't live yet: the current site is still up.",
    },
    metricsNote: { es: "Página de inicio, 22 de octubre de 2026.", en: "Home page, October 22, 2026." },
    metrics: {
      es: [
        { label: "Velocidad en celular", before: "44", after: "100" },
        { label: "Peso de la página", before: "3,9 MB", after: "0,4 MB" },
        { label: "Carga en celular", before: "6,1 s", after: "1,5 s" },
        { label: "Accesibilidad", before: "92", after: "100" },
      ],
      en: [
        { label: "Mobile performance", before: "44", after: "100" },
        { label: "Page weight", before: "3.9 MB", after: "0.4 MB" },
        { label: "Mobile load (LCP)", before: "6.1 s", after: "1.5 s" },
        { label: "Accessibility", before: "92", after: "100" },
      ],
    },
    features: {
      es: [
        "Consulta por WhatsApp: un formulario con calendario propio arma el mensaje con fechas, huéspedes y habitación. Sin reservas online, a propósito: el hostel vende directo y no paga comisión.",
        "Tres idiomas: español, portugués e inglés.",
        "Las seis habitaciones con fotos, los espacios comunes, la ubicación y los departamentos, en una sola página.",
        "Calificación y opiniones de Google a la vista.",
        "Fotos optimizadas, texto alternativo en todas las imágenes y un solo título por página.",
      ],
      en: [
        "WhatsApp inquiries: a form with its own calendar writes the message with dates, guests and room. No online booking, on purpose: the hostel sells direct and pays no commission.",
        "Three languages: Spanish, Portuguese and English.",
        "All six rooms with photos, the common areas, the location and the apartments, on one page.",
        "Google rating and reviews in plain sight.",
        "Optimized photos, alt text on every image and a single heading per page.",
      ],
    },
  },
];

export const getRedesign = (slug: string) => redesigns.find((r) => r.slug === slug);

export const shot = (slug: string, name: "antes-desktop" | "despues-desktop" | "antes-mobile" | "despues-mobile") =>
  `/projects/${slug}/${name}.jpg`;
