import type { ProjectStatus } from "@/lib/projects";

type Props = {
  status: ProjectStatus;
  label: string;
};

const baseClass =
  "inline-block px-2 py-[2px] text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)]";

export default function StatusBadge({ status, label }: Props) {
  if (status === "live") {
    return (
      <span
        className={baseClass}
        style={{ backgroundColor: "#7CFF50", color: "#0A0A0A" }}
      >
        [ {label} ]
      </span>
    );
  }
  if (status === "npm") {
    return (
      <span
        className={`${baseClass} border`}
        style={{ borderColor: "#7CFF50", color: "#7CFF50" }}
      >
        [ {label} ]
      </span>
    );
  }
  return (
    <span
      className={`${baseClass} border`}
      style={{ borderColor: "#A8A8A0", color: "#A8A8A0" }}
    >
      [ {label} ]
    </span>
  );
}
