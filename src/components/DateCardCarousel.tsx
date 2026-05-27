import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate, type PanInfo } from "motion/react";
import { Play, Sparkles, Lock } from "lucide-react";
import type { Memory } from "@/lib/memory-types";
import { placeholderGradient } from "@/lib/memory-types";

type Slide =
  | { kind: "photo"; url?: string; gradient: string; caption?: string }
  | { kind: "video"; url?: string; gradient: string; caption?: string }
  | { kind: "note"; gradient: string; text: string };

interface Props {
  memories: Memory[];
  initialIndex?: number;
  activeIndex?: number;
  onActiveChange?: (i: number) => void;
}

export function DateCardCarousel({ memories, initialIndex, activeIndex, onActiveChange }: Props) {
  const start = typeof initialIndex === "number" ? initialIndex : memories.length - 1;
  const [internalActive, setInternalActive] = useState(Math.max(0, start));
  const isControlled = typeof activeIndex === "number";
  const activeDate = isControlled ? activeIndex! : internalActive;
  const xOuter = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    const calc = () => {
      const w = containerRef.current?.clientWidth ?? window.innerWidth;
      stepRef.current = Math.min(w * 0.86, 380) + 16; // card width + gap
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  function snap(next: number) {
    const clamped = Math.max(0, Math.min(memories.length - 1, next));
    if (!isControlled) setInternalActive(clamped);
    onActiveChange?.(clamped);
    animate(xOuter, -clamped * stepRef.current, {
      type: "spring",
      stiffness: 180,
      damping: 26,
    });
  }

  // Re-snap whenever the active index changes (including from external controllers).
  useEffect(() => {
    animate(xOuter, -activeDate * stepRef.current, {
      type: "spring",
      stiffness: 180,
      damping: 26,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDate]);

  function onOuterDragEnd(_: unknown, info: PanInfo) {
    const step = stepRef.current || 1;
    const delta = info.offset.x + info.velocity.x * 0.2;
    const moved = Math.round(-delta / step);
    snap(activeDate + moved);
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <motion.div
        className="flex items-stretch gap-4 pl-[7vw]"
        drag="x"
        dragElastic={0.12}
        dragMomentum={false}
        onDragEnd={onOuterDragEnd}
        style={{ x: xOuter }}
      >
        {memories.map((m, i) => (
          <DateCard key={m.date} memory={m} isActive={i === activeDate} />
        ))}
      </motion.div>

      {/* outer pagination */}
      <div className="mt-5 flex justify-center gap-1.5">
        {memories.map((_, i) => {
          const on = i === activeDate;
          return (
            <button
              key={i}
              onClick={() => snap(i)}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: on ? 20 : 5,
                background: on ? "var(--foreground)" : "var(--muted-foreground)",
                opacity: on ? 0.9 : 0.3,
              }}
              aria-label={`Day ${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function DateCard({ memory, isActive }: { memory: Memory; isActive: boolean }) {
  const [revealed, setRevealed] = useState(false);

  // Build viewport: prefer real media URLs; fall back to gradient placeholders; append note slide.
  const media = useMemo<Slide[]>(() => {
    const items: Slide[] = [];
    if (memory.media.length > 0) {
      memory.media.forEach((m, i) => {
        items.push({
          kind: m.kind,
          url: m.url,
          gradient: placeholderGradient(memory.date, i),
          caption: m.caption,
        });
      });
    } else {
      memory.photos.forEach((p, i) => {
        items.push({
          kind: i === 1 && memory.song.youtubeId ? "video" : "photo",
          gradient: p.gradient,
          caption: p.caption,
        });
      });
    }
    if (memory.note) {
      items.push({
        kind: "note",
        gradient: placeholderGradient(memory.date, items.length),
        text: memory.note,
      });
    }
    return items;
  }, [memory]);

  const [idx, setIdx] = useState(0);
  const xInner = useMotionValue(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(0);

  useEffect(() => {
    const calc = () => {
      widthRef.current = viewportRef.current?.clientWidth ?? 0;
      xInner.set(-idx * widthRef.current);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function snapInner(next: number) {
    const clamped = Math.max(0, Math.min(media.length - 1, next));
    setIdx(clamped);
    animate(xInner, -clamped * widthRef.current, {
      type: "spring",
      stiffness: 220,
      damping: 28,
    });
  }

  function onInnerDragEnd(_: unknown, info: PanInfo) {
    const w = widthRef.current || 1;
    const delta = info.offset.x + info.velocity.x * 0.2;
    const moved = Math.round(-delta / w);
    snapInner(idx + moved);
  }

  const weekday = formatDateLabel(memory.date, { weekday: "long" });
  const dateLabel = formatDateLabel(memory.date, { month: "short", day: "2-digit" });

  return (
    <motion.article
      animate={{
        scale: isActive ? 1 : 0.96,
        opacity: isActive ? 1 : 0.7,
      }}
      transition={{ type: "spring", stiffness: 160, damping: 22 }}
      className="shrink-0 w-[86vw] max-w-[380px] glass rounded-[28px] p-5 relative"
      style={{
        boxShadow:
          "0 30px 60px -30px rgba(0,0,0,0.65), 0 12px 28px -14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <header className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
            {weekday}
          </div>
          <h2 className="font-display text-[26px] leading-tight text-balance mt-0.5">
            {memory.title}
          </h2>
        </div>
        <div className="font-mono text-[10px] text-[var(--muted-foreground)] pt-1">
          {dateLabel}
        </div>
      </header>

      {/* Single-memory media viewport (Instagram-style swipe) */}
      <div
        ref={viewportRef}
        className="relative h-64 mb-3 rounded-2xl overflow-hidden bg-black/20"
        style={{
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.25)",
        }}
      >
        <motion.div
          className="absolute inset-0 flex"
          drag="x"
          dragElastic={0.1}
          dragMomentum={false}
          onDragEnd={onInnerDragEnd}
          style={{ x: xInner }}
        >
          {media.map((item, i) => (
            <MediaSlide key={i} item={item} />
          ))}
        </motion.div>
      </div>

      {/* inner pagination dots */}
      {media.length > 1 && (
        <div className="flex justify-center gap-1.5 mb-3">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={() => snapInner(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 16 : 5,
                background: i === idx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.32)",
              }}
              aria-label={`Memory ${i + 1}`}
            />
          ))}
        </div>
      )}

      <p className="font-display italic text-[16px] leading-snug text-pretty text-[var(--foreground)]/90">
        “{memory.note}”
      </p>

      <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
        <span className="truncate">
          <span className="text-[var(--foreground)]">{memory.song.title}</span> · {memory.song.artist}
        </span>
      </div>

      {memory.surprise && (
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.button
                key="cta"
                onClick={() => setRevealed(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
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

function MediaSlide({ item }: { item: Slide }) {
  if (item.kind === "note") {
    return (
      <div
        className="relative w-full h-full flex-shrink-0 flex items-center justify-center px-6"
        style={{ background: item.gradient }}
      >
        <div className="absolute inset-0 grain opacity-30 mix-blend-overlay" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)",
          }}
        />
        <p className="relative font-display italic text-[18px] leading-snug text-center text-white/95 text-pretty">
          “{item.text}”
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full flex-shrink-0"
      style={{ background: item.gradient }}
    >
      {item.kind === "photo" && item.url && (
        <img
          src={item.url}
          alt={item.caption ?? ""}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {item.kind === "video" && item.url && (
        <video
          src={item.url}
          muted
          loop
          playsInline
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 grain opacity-30 mix-blend-overlay" />
      <div
        className="absolute inset-0"
        style={{
          boxShadow:
            "inset 0 0 40px rgba(0,0,0,0.18), inset 0 0 80px rgba(0,0,0,0.1)",
        }}
      />
      {item.kind === "video" && !item.url && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-14 w-14 rounded-full bg-white/15 backdrop-blur flex items-center justify-center border border-white/25"
          >
            <Play className="text-white" size={20} fill="white" />
          </motion.div>
        </div>
      )}
      {item.caption && (
        <div className="absolute bottom-3 left-4 right-4 font-mono text-[11px] text-white/90">
          {item.caption}
        </div>
      )}
    </div>
  );
}

// Locked future-day card with chain/lock visual.
export function LockedDayCard({ date, title }: { date: string; title?: string }) {
  const weekday = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  return (
    <article
      className="shrink-0 w-[86vw] max-w-[380px] glass rounded-[28px] p-5 relative opacity-70"
      style={{
        boxShadow:
          "0 30px 60px -30px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <header className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">{weekday}</div>
          <h2 className="font-display text-[24px] leading-tight mt-0.5 text-[var(--muted-foreground)]">{title ?? "soon"}</h2>
        </div>
        <div className="font-mono text-[10px] text-[var(--muted-foreground)] pt-1">{dateLabel}</div>
      </header>
      <div
        className="relative h-64 rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ background: placeholderGradient(date) }}
      >
        <div className="absolute inset-0 grain opacity-30 mix-blend-overlay" />
        <div className="relative flex flex-col items-center gap-2 text-white/85">
          <Lock size={20} />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">locked</span>
        </div>
      </div>
      <p className="mt-4 font-display italic text-sm text-[var(--muted-foreground)] text-center">
        comes alive on {dateLabel}
      </p>
    </article>
  );
}

