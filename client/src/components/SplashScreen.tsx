import { LeafIcon } from "./Icons";

export default function SplashScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "var(--bg)",
      }}
    >
      <div className="app-bg" />
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          background: "var(--accent-grad)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <LeafIcon size={34} strokeWidth={1.6} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.01em" }}>CloudBar</div>
      <div className="text-faint" style={{ fontSize: 13 }}>
        Загружаем магазин…
      </div>
    </div>
  );
}
