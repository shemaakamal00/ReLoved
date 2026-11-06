import type { StatusLabel } from "../../utils/statusLabels";

function StatusBadge({ label }: { label: StatusLabel | undefined }) {
  if (!label) return null;
  return (
    <span className={`status-badge ${label.className}`}>{label.text}</span>
  );
}

export default StatusBadge;
