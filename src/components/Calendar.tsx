import { motion, AnimatePresence } from "motion/react";
import { Lock, X } from "lucide-react";
import type { DaySlot } from "@/lib/memory-types";

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (date: string) => void;
  slots: DaySlot[];
}

export function Calendar({ open, onClose, onPick, slots }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 230, damping: 26 }}
            className="relative glass rounded-3xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div>
                <div className="font-display text-xl">The Archive</div>
                <div className="text-xs text-[var(--muted-foreground)]">every day, kept</div>
              </div>
              <button onClick={onClose} className="h-9 w-9 rounded-full grid place-items-center hover:bg-[var(--muted)]">
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar p-3 space-y-2">
              {slots.map((d) => {
                const title = d.memory?.title ?? (d.locked ? "soon" : "a quiet day");
                return (
                  <button
                    key={d.date}
                    onClick={() => !d.locked && onPick(d.date)}
                    disabled={d.locked}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl transition
                      ${d.locked
                        ? "opacity-50 cursor-not-allowed bg-[var(--muted)]"
                        : "bg-[var(--card)] hover:scale-[1.01] active:scale-[0.99]"}
                      ${d.isToday ? "ring-1 ring-[var(--primary)]" : ""}`}
                  >
                    <div className="font-mono text-xs tabular-nums text-[var(--muted-foreground)] w-20">
                      {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                    </div>
                    <div className="flex-1 truncate font-display text-[15px]">{title}</div>
                    {d.locked
                      ? <Lock size={14} className="opacity-70" />
                      : d.isToday && <span className="text-[10px] uppercase tracking-widest text-[var(--primary)]">today</span>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
