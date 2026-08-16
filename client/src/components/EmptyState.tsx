import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 12,
        padding: "56px 32px",
      }}
    >
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: 22,
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-faint)",
        }}
      >
        {icon}
      </div>
      <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
      {subtitle && (
        <div className="text-faint" style={{ fontSize: 13.5, lineHeight: 1.5, maxWidth: 260 }}>
          {subtitle}
        </div>
      )}
      {action}
    </div>
  );
}
