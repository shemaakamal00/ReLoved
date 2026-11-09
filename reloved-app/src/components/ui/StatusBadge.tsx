import type { StatusLabel } from "../../utils/statusLabels";

function StatusBadge({ label }: { label: StatusLabel | undefined }) {
  if (!label) return null;
  // key: när statusen byts byggs brickan om och tonas in (motion.css)
  return (
    <span className={`status-badge ${label.className}`} key={label.text}>
      {label.text}
    </span>
  );
}

export default StatusBadge;
