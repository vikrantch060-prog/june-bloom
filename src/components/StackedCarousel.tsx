import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate, PanInfo } from "motion/react";
import { Play, Sparkles, Music2 } from "lucide-react";

export type StackItem =
  | { id: string; kind: "photo"; date: string; title: string; gradient: string; caption?: string }
  | { id: string; kind: "note"; date: string; title: string; text: string; gradient: string }
  | { id: string; kind: "video"; date: string; title: string; gradient: string; caption?: string }
  | { id: string; kind: "secret"; date: string; title: string; text: string; gradient: string };

interface Props {
  items: StackItem[];
}

// shortest signed distance on a ring of length n
function ringOffset(i: number, active: number, n: number) {
  let d = (i - active) % n;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}

export function StackedCarousel({ items }: Props) {
  const n = items.length;
  const [active, setActive] = useState(0);
  const x = useMotionValue(0);
  const stepRef = useRef(220); // px per card step, recalculated
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const calc = () => {
      const w = containerRef.current?.clientWidth ?? window.innerWidth;
      const cardW = Math.min(w * 0.72, 320);
      stepRef.current = cardW * 0.78;
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  function snapTo(next: number) {
    setActive(((next % n) + n) % n);
    animate(x, 0, { type: "spring", stiffness: 160, damping: 22, mass: 0.9 });
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    const step = stepRef.current;
    const totalOffset = info.offset.x + info.velocity.x * 0.18;
    const moved = Math.round(-totalOffset / step);
    const clamped = Math.max(-2, Math.min(2, moved));
    snapTo(active + clamped);
  }

  if (n === 0) return null;

  // render a window of cards around active for perf
  const visible = Array.from({ length: n }, (_, i) => i)
    .map((i) => ({ i, off: ringOffset(i, active, n) }))
    .filter(({ off }) => Math.abs(off) <= 3);

  return (
    <div
      ref={containerRef}
      className="relative h-[480px] w-full select-none touch-pan-y"
      style={{ perspective: 1200 }}
    >
      <motion.div
        className="absolute inset-0"
        drag="x"
        dragElastic={0.18}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        style={{ x }}
      >
        {window.map(({ i, off }) => {
          const item = items[i];
          const step = stepRef.current;
          const isActive = off === 0;
          return (
            <Card
              key={`${item.id}-${i}`}
              item={item}
              off={off}
              step={step}
              dragX={x}
              isActive={isActive}
              revealed={!!revealed[item.id]}
              onReveal={() => setRevealed((r) => ({ ...r, [item.id]: true }))}
            />
          );
        })}
      </motion.div>

      {/* progress dots */}
      <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-1.5">
        {items.map((_, i) => {
          const off = ringOffset(i, active, n);
          const on = off === 0;
          return (
            <span
              key={i}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: on ? 18 : 5,
                background: on ? "var(--foreground)" : "var(--muted-foreground)",
                opacity: on ? 0.9 : 0.35,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function Card({
  item,
  off,
  step,
  dragX,
  isActive,
  revealed,
  onReveal,
}: {
  item: StackItem;
  off: number;
  step: number;
  dragX: ReturnType<typeof useMotionValue<number>>;
  isActive: boolean;
  revealed: boolean;
  onReveal: () => void;
}) {
  // visual offset incl. live drag (so neighbors move with finger)
  // use transform composed via style with motion's useTransform-like update
  const [drag, setDrag] = useState(0);
  useEffect(() => {
    const unsub = dragX.on("change", (v) => setDrag(v));
    return () => unsub();
  }, [dragX]);

  const liveOff = off + -drag / step; // shift in card units; negative drag => content moves left
  // Actually: when user drags right (+x), content should move right too; active=0 should be at translate=drag.
  // Use simple: translateX = off*step + drag
  const tx = off * step + drag;
  const abs = Math.min(Math.abs(liveOff), 3);
  const scale = 1 - abs * 0.08;
  const opacity = 1 - abs * 0.28;
  const blur = abs * 2.4;
  const rotateY = liveOff * -6;
  const z = -abs * 60;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{
        x: tx,
        y: "-50%",
        translateX: "-50%",
        scale,
        opacity,
        filter: `blur(${blur}px)`,
        zIndex: 100 - Math.round(abs * 10),
        transformStyle: "preserve-3d",
        rotateY,
        translateZ: z,
        transition: "filter 240ms ease",
      }}
    >
      <CardBody item={item} isActive={isActive} revealed={revealed} onReveal={onReveal} />
    </motion.div>
  );
}

function CardBody({
  item,
  isActive,
  revealed,
  onReveal,
}: {
  item: StackItem;
  isActive: boolean;
  revealed: boolean;
  onReveal: () => void;
}) {
  const dateLabel = new Date(item.date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
  const weekday = new Date(item.date).toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div
      className="relative w-[72vw] max-w-[320px] h-[440px] rounded-[28px] overflow-hidden glass"
      style={{
        background: item.gradient,
        boxShadow:
          "0 30px 60px -30px rgba(0,0,0,0.65), 0 12px 28px -14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* atmospheric overlays */}
      <div className="absolute inset-0 grain" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* meta */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between text-white/85">
        <div>
          <div className="text-[9px] uppercase tracking-[0.3em] opacity-75">{weekday}</div>
          <div className="font-mono text-[10px] opacity-90">{dateLabel}</div>
        </div>
        <KindBadge kind={item.kind} />
      </div>

      {/* body */}
      {item.kind === "note" && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <p className="font-display italic text-[19px] leading-snug text-pretty text-white/95 text-center">
            “{item.text}”
          </p>
        </div>
      )}

      {item.kind === "video" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: isActive ? [1, 1.06, 1] : 1 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-14 w-14 rounded-full bg-white/15 backdrop-blur flex items-center justify-center border border-white/25"
          >
            <Play className="text-white" size={20} fill="white" />
          </motion.div>
        </div>
      )}

      {item.kind === "secret" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-3">
          {!revealed ? (
            <button
              onClick={onReveal}
              className="flex items-center gap-2 rounded-full px-4 py-2 bg-white/15 border border-white/25 text-white text-sm backdrop-blur active:scale-[0.97] transition"
            >
              <Sparkles size={14} /> a little something
            </button>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9 }}
              className="font-display italic text-[17px] leading-snug text-pretty text-white/95 text-center"
            >
              {item.text}
            </motion.p>
          )}
        </div>
      )}

      {/* bottom caption / title */}
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <div className="font-display text-[20px] leading-tight text-balance">
          {item.title}
        </div>
        {"caption" in item && item.caption && (
          <div className="font-mono text-[10px] mt-1 opacity-80 truncate">{item.caption}</div>
        )}
      </div>
    </div>
  );
}

function KindBadge({ kind }: { kind: StackItem["kind"] }) {
  const map = {
    photo: { label: "frame", icon: null },
    note: { label: "note", icon: null },
    video: { label: "reel", icon: null },
    secret: { label: "secret", icon: <Sparkles size={10} /> },
  } as const;
  const m = map[kind];
  return (
    <div className="flex items-center gap-1 rounded-full px-2 py-1 bg-white/12 border border-white/20 backdrop-blur text-[9px] uppercase tracking-[0.2em]">
      {m.icon}
      {m.label}
    </div>
  );
}
