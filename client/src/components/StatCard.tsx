import type { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  delta,
  deltaPositive = true,
  icon,
  accent,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          {icon}
        </div>
        {delta && (
          <span style={{ fontSize: 11.5, fontWeight: 800, color: deltaPositive ? "var(--green)" : "var(--red)" }}>
            {deltaPositive ? "↑" : "↓"} {delta}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.01em" }}>{value}</div>
        <div className="text-faint" style={{ fontSize: 12, marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  );
}
