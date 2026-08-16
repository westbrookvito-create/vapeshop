import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "../store/toast";

const ICONS: Record<string, string> = { success: "✅", error: "⚠️", info: "💬" };

export default function ToastHost() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div className="toast-wrap">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="glass"
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              fontWeight: 600,
              pointerEvents: "auto",
            }}
          >
            <span>{ICONS[t.kind]}</span>
            <span>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
