import type { ReactNode } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="font-heading font-semibold text-[var(--color-heading)]">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 hover:bg-[var(--color-surface-secondary)]">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
