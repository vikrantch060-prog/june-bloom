import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import type { Memory } from "@/lib/days";

interface Props { memory: Memory; index: number; isThird: boolean }

export function DayCard({ memory, index, isThird }: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, rotate: index % 2 ? -1.2 : 1 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ type: "spring", stiffness: 110, damping: 18 }}
      className="snap-card shrink-0 w-[86vw] max-w-[420px] glass rounded-[28px] p-5 relative"
      style={{ scrollSnapAlign: "center" }}
    >
      <header className="flex items-baseline justify-between mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
            {new Date(memory.date).toLocaleDateString("en-US", { weekday: "long" })}
          </div>
          <h2 className="font-display text-2xl leading-tight text-balance">{memory.title}</h2>
        </div>
        <div className="font-mono text-[10px] text-[var(--muted-foreground)]">
          {new Date(memory.date).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
        </div>
      </header>

      {/* photo collage */}
      <div className="grid grid-cols-3 grid-rows-2 gap-2 h-56 mb-4">
        {memory.photos.slice(0, 5).map((p, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl ${
              i === 0 ? "col-span-2 row-span-2" : ""
            }`}
            style={{ background: p.gradient }}
          >
            <div className="absolute inset-0 mix-blend-overlay opacity-30 grain" />
            {p.caption && (
              <div className="absolute bottom-1.5 left-2 right-2 text-[10px] font-mono text-white/85 truncate">
                {p.caption}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <p className="font-display italic text-[17px] leading-snug text-pretty text-[var(--foreground)]/90">
        "{memory.note}"
      </p>

      <div className="mt-4 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
        <span className="truncate">
          <span className="text-[var(--foreground)]">{memory.song.title}</span> · {memory.song.artist}
        </span>
      </div>

      {isThird && memory.surprise && (
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.button
                key="cta"
                onClick={() => setRevealed(true)}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="w-full rounded-2xl py-3 px-4 flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] font-medium shadow-md active:scale-[0.98] transition"
              >
                <Sparkles size={14} /> Tap to Unlock
              </motion.button>
            ) : (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="rounded-2xl p-4 bg-[var(--muted)] border border-[var(--border)] font-display italic text-[15px] text-pretty"
              >
                {memory.surprise.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.article>
  );
}
