import type { ProjectStatus } from "@/lib/projects";

type Props = {
  status: ProjectStatus;
  label: string;
};

const baseClass =
  "inline-block whitespace-nowrap border px-3 py-1 text-xs font-bold uppercase tracking-[var(--tracking-widest)]";

export default function StatusBadge({ status: _status, label }: Props) {
  return (
    <span
      className={baseClass}
      style={{ borderColor: "#A8A8A0", color: "#A8A8A0" }}
    >
      [ {label} ]
    </span>
  );
}
