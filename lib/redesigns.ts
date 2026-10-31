import type { Locale } from "./i18n";

export type Redesign = {
  slug: string;
  name: Record<Locale, string>;
  newUrl: string;
  oldUrl: string;
  stack: string;
  // Screens in public/projects/<slug>: antes-desktop and despues-desktop (first screen, for the slider)
  // plus antes-{mobile,tablet,desktop}-completa (the whole old page). The new site is seen live.
  intro: Record<Locale, string>;
  measuredOn: Record<Locale, string>;
  // Lighthouse scores, 0 to 100.
  scores: Record<Locale, { label: string; hint: string; before: number; after: number }[]>;
  facts: Record<Locale, { label: string; hint: string; before: string; after: string }[]>;
  features: Record<Locale, string[]>;
};

export const redesigns: Redesign[] = [
  {
    slug: "italia-inn",
    name: { es: "Italia Inn, hostel en Bariloche", en: "Italia Inn, a hostel in Bariloche" },
    newUrl: "https://italia-inn.vercel.app",
    oldUrl: "hostelbariloche.com.ar",
    stack: "HTML · CSS · JavaScript · Python · Vercel",
    intro: {
      es: "El sitio del hostel no se actualizaba hace tiempo: una promo de mayo en un carrusel automático, casi 4 MB de carga y, en el celular, una página que saltaba mientras cargaba. Propuse este rediseño. Todavía no está publicado: el sitio actual sigue en línea.",
      en: "The hostel's site hadn't been updated in a while: a May promo in an auto-rotating carousel, almost 4 MB to load and, on phones, a page that jumped around while loading. I proposed this redesign. It isn't live yet: the current site is still up.",
    },
    measuredOn: { es: "Medido el 22 de octubre de 2026, en la página de inicio.", en: "Measured on October 22, 2026, on the home page." },
    scores: {
      es: [
        { label: "Velocidad en el celular", hint: "Qué tan rápido abre en un teléfono.", before: 44, after: 100 },
        { label: "Velocidad en computadora", hint: "Qué tan rápido abre en una computadora.", before: 77, after: 100 },
        { label: "Fácil de usar para todos", hint: "Se lee bien y funciona con teclado y con lectores de pantalla.", before: 92, after: 100 },
        { label: "Bien hecho por dentro", hint: "Seguro y sin errores técnicos.", before: 79, after: 100 },
      ],
      en: [
        { label: "Speed on phones", hint: "How fast it opens on a phone.", before: 44, after: 100 },
        { label: "Speed on computers", hint: "How fast it opens on a computer.", before: 77, after: 100 },
        { label: "Easy for everyone", hint: "Readable, and works with a keyboard and screen readers.", before: 92, after: 100 },
        { label: "Well built inside", hint: "Secure and free of technical errors.", before: 79, after: 100 },
      ],
    },
    facts: {
      es: [
        { label: "Tarda en aparecer en el celular", hint: "Hasta que se ve lo principal.", before: "6,1 segundos", after: "1,5 segundos" },
        { label: "Datos que descarga para abrir", hint: "Menos datos del plan del huésped.", before: "3,9 MB", after: "0,4 MB" },
      ],
      en: [
        { label: "Time to show up on a phone", hint: "Until the main content is visible.", before: "6.1 seconds", after: "1.5 seconds" },
        { label: "Data downloaded to open it", hint: "Less of the guest's data plan.", before: "3.9 MB", after: "0.4 MB" },
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

export const shot = (slug: string, name: string) => `/projects/${slug}/${name}.jpg`;