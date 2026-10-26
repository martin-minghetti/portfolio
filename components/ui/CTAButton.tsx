import Link from "next/link";

type Variant = "primary" | "outline" | "secondary";

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

const variantClasses: Record<Variant, string> = {
  primary: "btn btn--primary",
  outline: "btn",
  secondary: "tlink",
};

export default function CTAButton(props: Props) {
  const { children, className = "", variant = "primary" } = props;
  const merged = `${variantClasses[variant]} ${className}`.trim();

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noreferrer noopener"
          className={merged}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={merged}>
        {children}
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
      {children}
    </button>
  );
}
