import type { ProjectStatus } from "@/lib/projects";

type Props = {
  status: ProjectStatus;
  label: string;
};

export default function StatusBadge({ status, label }: Props) {
  return (
    <span className="label whitespace-nowrap rounded-card border border-rule px-2 py-0.5" data-status={status}>
      {label}
    </span>
  );
}
