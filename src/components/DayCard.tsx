import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, animate, PanInfo } from "motion/react";
import { Sparkles, Play } from "lucide-react";
import type { Memory } from "@/lib/days";

interface Props { memory: Memory; index: number; isThird: boolean }

export function DayCard({ memory, index, isThird }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [activeMemoryIndex, setActiveMemoryIndex] = useState(0);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build media items array from memory
  const mediaItems = memory.photos.map((p, i) => ({
    id: `photo-${i}`,
    type: "photo" as const,
    gradient: p.gradient,
    caption: p.caption,
  }));

  const totalMemories = mediaItems.length;

  const handleDragEnd = (info: PanInfo) => {
    const swipeThreshold = 50;
    const velocityThreshold = 300;
    const dragDistance = info.offset.x;
    const velocity = info.velocity.x;

    let newIndex = activeMemoryIndex;

    if (Math.abs(velocity) > velocityThreshold) {
      if (velocity > 0 && activeMemoryIndex > 0) newIndex = activeMemoryIndex - 1;
      else if (velocity < 0 && activeMemoryIndex < totalMemories - 1) newIndex = activeMemoryIndex + 1;
    } else if (Math.abs(dragDistance) > swipeThreshold) {
      if (dragDistance > 0 && activeMemoryIndex > 0) newIndex = activeMemoryIndex - 1;
      else if (dragDistance < 0 && activeMemoryIndex < totalMemories - 1) newIndex = activeMemoryIndex + 1;
    }

    setActiveMemoryIndex(newIndex);
    animate(x, -newIndex * 100, { type: "spring", stiffness: 200, damping: 28 });
  };

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

      {/* Instagram-style single-memory swipeable carousel */}
      <div className="relative h-56 mb-4 rounded-2xl overflow-hidden" ref={containerRef}>
        <motion.div
          drag="x"
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={(_, info) => handleDragEnd(info)}
          style={{ x }}
          className="absolute inset-0 flex"
        >
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="relative w-full h-full flex-shrink-0"
              style={{
                background: item.gradient,
              }}
            >
              <div className="absolute inset-0 mix-blend-overlay opacity-30 grain" />
              <div className="absolute inset-0"
                style={{
                  boxShadow: "inset 0 0 40px rgba(0,0,0,0.15), inset 0 0 80px rgba(0,0,0,0.08)",
                }}
              />
              {item.caption && (
                <div className="absolute bottom-3 left-4 right-4 text-[12px] font-mono text-white/90">
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination dots */}
      {totalMemories > 1 && (
        <div className="flex justify-center gap-1.5 mb-3">
          {mediaItems.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveMemoryIndex(i);
                animate(x, -i * 100, { type: "spring", stiffness: 200, damping: 28 });
              }}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === activeMemoryIndex ? 16 : 5,
                background: i === activeMemoryIndex
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.35)",
              }}
              aria-label={`Memory ${i + 1}`}
            />
          ))}
        </div>
      )}

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
