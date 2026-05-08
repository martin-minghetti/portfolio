type Props = {
  width?: "narrow" | "wide";
};

export default function SectionDivider({ width = "wide" }: Props) {
  const cls = width === "narrow" ? "max-w-[120px]" : "w-full";
  return (
    <div
      aria-hidden
      className={`${cls} border-t border-[var(--color-border)] my-[var(--spacing-4)]`}
    />
  );
}
