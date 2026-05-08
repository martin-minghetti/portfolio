import Link from "next/link";

type Variant = "primary" | "secondary";

type CommonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
};

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
  type?: never;
  onClick?: never;
  disabled?: never;
  form?: never;
};

type ButtonProps = CommonProps & {
  href?: never;
  external?: never;
  type: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  form?: string;
};

type Props = LinkProps | ButtonProps;

const primaryClasses =
  "group/cta relative inline-flex items-center justify-center overflow-hidden border-2 border-[var(--color-accent)] bg-transparent px-3 py-1.5 font-bold uppercase tracking-[var(--tracking-widest)] text-xs text-[var(--color-accent)] transition-colors duration-300 ease-out hover:text-[var(--color-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-glow)] disabled:opacity-60 disabled:hover:text-[var(--color-accent)]";

const secondaryClasses =
  "inline-flex items-center justify-center px-1 py-1.5 font-bold uppercase tracking-[var(--tracking-widest)] text-xs text-[var(--color-accent)] transition-opacity duration-200 ease-out hover:opacity-70 focus-visible:outline-none focus-visible:opacity-70 disabled:opacity-60";

const fillClass =
  "pointer-events-none absolute inset-0 origin-left scale-x-0 bg-[var(--color-accent)] transition-transform duration-300 ease-out group-hover/cta:scale-x-100 group-disabled/cta:scale-x-0";

export default function CTAButton(props: Props) {
  const { children, className = "", variant = "primary" } = props;
  const base = variant === "primary" ? primaryClasses : secondaryClasses;
  const merged = `${base} ${className}`.trim();

  const content =
    variant === "primary" ? (
      <>
        <span aria-hidden className={fillClass} />
        <span className="relative whitespace-nowrap">
          [ {children} <span aria-hidden>→</span> ]
        </span>
      </>
    ) : (
      <span className="whitespace-nowrap">
        [ {children} <span aria-hidden>→</span> ]
      </span>
    );

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noreferrer noopener"
          className={merged}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={props.href} className={merged}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}
      form={props.form}
      className={merged}
    >
      {content}
    </button>
  );
}
