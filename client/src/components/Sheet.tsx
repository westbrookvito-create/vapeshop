import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "./Icons";

export default function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(4,4,10,0.6)", zIndex: 200, backdropFilter: "blur(2px)" }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="glass"
            style={{
              position: "fixed",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 0,
              width: "100%",
              maxWidth: 480,
              zIndex: 201,
              borderRadius: "24px 24px 0 0",
              padding: "10px 20px calc(20px + var(--safe-bottom))",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "var(--border-strong)", margin: "6px auto 14px" }} />
            {title && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 17, fontWeight: 800 }}>{title}</div>
                <button
                  onClick={onClose}
                  className="glass"
                  style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "none" }}
                >
                  <XIcon size={15} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
