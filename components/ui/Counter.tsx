type Props = {
  value: string;
  className?: string;
};

const NUMBER_REGEX = /(\d+(?:\.\d+)?)/;

// Shows the figure as written, no count-up: the real number is in the HTML without scripting.
export default function Counter({ value, className }: Props) {
  const match = value.match(NUMBER_REGEX);
  if (!match) return <span className={className}>{value}</span>;
  const start = match.index ?? 0;
  const prefix = value.slice(0, start);
  const suffix = value.slice(start + match[1].length);
  return (
    <span className={className}>
      {prefix}
      <span className="num font-display text-(length:--text-display-s) leading-none text-ink">{match[1]}</span>
      {suffix}
    </span>
  );
}
