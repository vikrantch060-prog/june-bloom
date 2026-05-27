import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import type { Memory } from "@/lib/memory-types";

interface Props {
  memory: Memory | null;
  onClose: () => void;
}

export function MemoryDialog({ memory, onClose }: Props) {
  return (
    <AnimatePresence>
      {memory && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-lg" onClick={onClose} />
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="relative glass rounded-3xl w-full max-w-md max-h-[88vh] overflow-y-auto no-scrollbar p-5"
          >
            <button onClick={onClose} className="absolute top-3 right-3 h-9 w-9 rounded-full grid place-items-center bg-[var(--muted)]">
              <X size={16} />
            </button>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
              {new Date(memory.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h2 className="font-display text-3xl mt-1 mb-4 text-balance">{memory.title}</h2>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {memory.photos.map((p, i) => (
                <div key={i} className="aspect-[4/5] rounded-2xl overflow-hidden relative" style={{ background: p.gradient }}>
                  {p.url && (
                    <img src={p.url} alt={p.caption ?? memory.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="grain absolute inset-0 opacity-40" />
                  {p.caption && <div className="absolute bottom-2 left-2 right-2 text-[10px] font-mono text-white/85">{p.caption}</div>}
                </div>
              ))}
            </div>

            {memory.note && (
              <p className="font-display italic text-lg text-pretty mb-5">“{memory.note}”</p>
            )}

            {memory.extraNotes.length > 0 && (
              <div className="space-y-2 mb-5">
                {memory.extraNotes.map((n, i) => (
                  <p key={i} className="text-sm text-[var(--muted-foreground)] text-pretty">{n}</p>
                ))}
              </div>
            )}

            {memory.song.title && (
              <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] border-t border-[var(--border)] pt-4">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                <span><span className="text-[var(--foreground)]">{memory.song.title}</span> · {memory.song.artist}</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
