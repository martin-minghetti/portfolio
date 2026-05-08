import type { ProjectStatus } from "@/lib/projects";

type Props = {
  status: ProjectStatus;
  label: string;
};

export default function StatusBadge({ status, label }: Props) {
  if (status === "live") {
    return (
      <span className="inline-block bg-[var(--color-accent)] px-2 py-[2px] text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-bg)]">
        [ {label} ]
      </span>
    );
  }
  if (status === "npm") {
    return (
      <span className="inline-block border border-[var(--color-accent)] px-2 py-[2px] text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent)]">
        [ {label} ]
      </span>
    );
  }
  return (
    <span className="inline-block border border-[var(--color-fg-muted)] px-2 py-[2px] text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-muted)]">
      [ {label} ]
    </span>
  );
}
