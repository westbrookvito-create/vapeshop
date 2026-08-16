import { MinusIcon, PlusIcon } from "./Icons";
import { haptic } from "../lib/telegram";

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? 26 : 32;
  return (
    <div
      className="glass"
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "var(--radius-pill)",
        padding: 3,
        gap: 2,
      }}
    >
      <button
        onClick={() => {
          if (value > min) {
            onChange(value - 1);
            haptic("light");
          }
        }}
        disabled={value <= min}
        style={{
          width: dim,
          height: dim,
          borderRadius: "50%",
          border: "none",
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MinusIcon size={size === "sm" ? 13 : 15} strokeWidth={2.4} />
      </button>
      <span style={{ minWidth: 22, textAlign: "center", fontWeight: 800, fontSize: size === "sm" ? 13 : 14 }}>{value}</span>
      <button
        onClick={() => {
          if (value < max) {
            onChange(value + 1);
            haptic("light");
          }
        }}
        disabled={value >= max}
        style={{
          width: dim,
          height: dim,
          borderRadius: "50%",
          border: "none",
          background: "var(--accent-grad)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PlusIcon size={size === "sm" ? 13 : 15} strokeWidth={2.4} />
      </button>
    </div>
  );
}
