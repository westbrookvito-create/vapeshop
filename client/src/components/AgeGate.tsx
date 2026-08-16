import { motion } from "framer-motion";

export default function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="app-bg" />
      <div style={{ padding: "0 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 18 }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            background: "var(--accent-grad)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.02em",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          18+
        </motion.div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Подтвердите возраст</div>
          <div className="text-dim" style={{ fontSize: 15, lineHeight: 1.5, maxWidth: 320 }}>
            CloudBar продаёт никотинсодержащую продукцию. Вход на сайт разрешён только лицам старше 18 лет.
          </div>
        </div>
      </div>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="glass"
        style={{
          borderRadius: "28px 28px 0 0",
          padding: "24px 20px calc(24px + var(--safe-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <button className="btn btn-primary btn-block" onClick={onConfirm} style={{ fontSize: 16, padding: "16px 20px" }}>
          Мне есть 18 лет
        </button>
        <button
          className="btn btn-ghost btn-block"
          onClick={() => window.Telegram?.WebApp?.close()}
          style={{ color: "var(--text-faint)" }}
        >
          Мне нет 18 лет
        </button>
      </motion.div>
    </div>
  );
}
