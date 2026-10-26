import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";
import CTAButton from "@/components/ui/CTAButton";

type Props = {
  dict: Dictionary;
};

export default function Footer({ dict }: Props) {
  const { columnAbout, columnWork, columnReach, legal, sourceLink } = dict.footer;

  return (
    <footer className="mt-(--section-gap-s) border-t border-ink">
      <div className="container grid gap-(--space-2xl) py-(--space-3xl) md:grid-cols-12 md:gap-(--gap-columns)">
        <section className="md:col-span-12 lg:col-span-4">
          <h3 className="font-display text-(length:--text-display-s) leading-none">{columnAbout.heading}</h3>
          <p className="mt-(--space-lg) text-ink">{columnAbout.tagline}</p>
          <p className="mt-(--space-xs)">{columnAbout.stats}</p>
          <p className="label mt-(--space-lg)">{columnAbout.location}</p>
          <p className="label">{columnAbout.meta}</p>
        </section>

        <section className="md:col-span-6 lg:col-span-4">
          <h3 className="label">{columnWork.heading}</h3>
          <ul className="mt-(--space-xs)">
            {columnWork.links.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <Link href={link.href} className="tlink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="md:col-span-6 lg:col-span-4">
          <h3 className="label">{columnReach.heading}</h3>
          <ul className="mt-(--space-xs)">
            {columnReach.links.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                  className="tlink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="border-t border-rule">
        <div className="container flex flex-col gap-2 py-(--space-lg) md:flex-row md:items-center md:justify-between">
          <p className="label">{legal}</p>
          <CTAButton
            href="https://github.com/martin-minghetti/portfolio"
            external
            variant="secondary"
          >
            {sourceLink}
          </CTAButton>
        </div>
      </div>
    </footer>
  );
}
