import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { AtmosphereMode } from "@/lib/time";

interface Props { mode: AtmosphereMode }

// Deterministic-ish particle positions per mode
function seedPositions(n: number, seed: number) {
  const arr: { x: number; y: number; s: number; d: number }[] = [];
  let v = seed;
  for (let i = 0; i < n; i++) {
    v = (v * 9301 + 49297) % 233280;
    const r = v / 233280;
    arr.push({
      x: r * 100,
      y: ((r * 7) % 1) * 100,
      s: 0.4 + ((r * 13) % 1) * 1.4,
      d: 2 + ((r * 17) % 1) * 6,
    });
  }
  return arr;
}

export function Atmosphere({ mode }: Props) {
  const [stars] = useState(() => seedPositions(60, 42));
  const [clouds] = useState(() => seedPositions(8, 11));
  const [embers] = useState(() => seedPositions(24, 77));

  useEffect(() => {
    document.body.classList.remove("theme-morning", "theme-evening", "theme-night");
    document.body.classList.add(`theme-${mode}`);
  }, [mode]);

  return (
    <div aria-hidden className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* shared grain */}
      <div className="grain" />

      {mode === "morning" && (
        <>
          {clouds.map((p, i) => (
            <motion.div
              key={`c${i}`}
              className="absolute rounded-full blur-3xl"
              style={{
                left: `${p.x}%`, top: `${p.y * 0.6}%`,
                width: `${180 + p.s * 80}px`, height: `${120 + p.s * 50}px`,
                background: "var(--glow)",
                opacity: 0.5,
              }}
              animate={{ x: [0, 30, 0], y: [0, -10, 0] }}
              transition={{ duration: 18 + i, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          {stars.slice(0, 20).map((p, i) => (
            <div key={`s${i}`} className="absolute animate-twinkle"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: 2, height: 2,
                background: "var(--foreground)", borderRadius: 999,
                opacity: 0.35, animationDelay: `${p.d}s` }} />
          ))}
        </>
      )}

      {mode === "evening" && (
        <>
          {/* warm blurred shelves */}
          {[0,1,2,3].map(i => (
            <motion.div key={i}
              className="absolute blur-2xl"
              style={{
                left: `${-10 + i * 30}%`, top: `${20 + (i%2)*40}%`,
                width: 380, height: 220,
                background: "var(--haze)",
                borderRadius: 40,
                opacity: 0.7,
              }}
              animate={{ x: [0, 10, 0], opacity: [0.6, 0.85, 0.6] }}
              transition={{ duration: 14 + i*2, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          {embers.map((p, i) => (
            <motion.div key={`e${i}`} className="absolute rounded-full"
              style={{
                left: `${p.x}%`, top: `${p.y}%`,
                width: p.s * 3, height: p.s * 3,
                background: "var(--primary)", opacity: 0.7,
                boxShadow: "0 0 12px var(--glow)",
              }}
              animate={{ y: [-5, -40, -5], opacity: [0.2, 0.9, 0.2] }}
              transition={{ duration: 8 + p.d, repeat: Infinity, delay: p.d, ease: "easeInOut" }}
            />
          ))}
        </>
      )}

      {mode === "night" && (
        <>
          {/* moon glow */}
          <div className="absolute rounded-full blur-3xl"
            style={{ left: "70%", top: "12%", width: 260, height: 260,
              background: "var(--glow)", opacity: 0.4 }} />
          {stars.map((p, i) => (
            <div key={`n${i}`} className="absolute animate-twinkle"
              style={{
                left: `${p.x}%`, top: `${p.y}%`,
                width: p.s * 2, height: p.s * 2,
                background: "white", borderRadius: 999,
                opacity: 0.8,
                animationDelay: `${p.d}s`,
                boxShadow: "0 0 6px white",
              }} />
          ))}
        </>
      )}

      {/* vignette */}
      <div className="absolute inset-0" style={{ background: "var(--vignette)" }} />
    </div>
  );
}
