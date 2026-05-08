import Link from "next/link";

type Variant = "primary" | "secondary";

type Props = {
  href: string;
  variant?: Variant;
  external?: boolean;
  children: React.ReactNode;
};

export default function CTAButton({
  href,
  variant = "primary",
  external,
  children,
}: Props) {
  const baseClasses =
    "inline-block px-[var(--spacing-6)] py-[var(--spacing-3)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--text-xs)] transition-all duration-[var(--duration-instant)] ease-[var(--ease-snap)]";

  const variantClasses =
    variant === "primary"
      ? "border-2 border-[var(--color-fg)] text-[var(--color-fg)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] hover:text-[var(--color-accent)]"
      : "border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-fg-muted)] hover:text-[var(--color-fg)]";

  const className = `${baseClasses} ${variantClasses}`;
  const label = (
    <>
      [ {children} <span aria-hidden>→</span> ]
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
