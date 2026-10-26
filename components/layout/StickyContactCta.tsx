import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import CTAButton from "@/components/ui/CTAButton";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

export default function StickyContactCta({ locale, dict }: Props) {
  return (
    <CTAButton href={`/${locale}/contact`} className="!min-h-11 !px-4">
      {dict.nav.contact}
    </CTAButton>
  );
}
