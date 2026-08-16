import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "./Icons";
import { haptic } from "../lib/telegram";
import type { ReactNode } from "react";

export default function Header({
  title,
  subtitle,
  back,
  right,
  sticky = true,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  sticky?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <header
      style={{
        position: sticky ? "sticky" : "static",
        top: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "calc(var(--safe-top) + 14px) 20px 14px",
        background: "linear-gradient(180deg, var(--bg) 70%, transparent)",
        backdropFilter: sticky ? "blur(10px)" : undefined,
      }}
    >
      {back && (
        <button
          onClick={() => {
            haptic("light");
            navigate(-1);
          }}
          className="glass"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "1px solid var(--border)",
          }}
        >
          <ChevronLeftIcon size={20} />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {title}
        </div>
        {subtitle && (
          <div className="text-faint" style={{ fontSize: 12.5, marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </header>
  );
}
