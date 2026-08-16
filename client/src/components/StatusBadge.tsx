import { STATUS_COLORS, STATUS_LABELS } from "../lib/format";

export default function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "var(--text-dim)";
  return (
    <span
      className="badge badge-status"
      style={{
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        color,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
