import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface Props {
  text: string;
}

type Phase = "dark" | "glow" | "text" | "full";

export function FinalReveal({ text }: Props) {
  const [phase, setPhase] = useState<Phase>("dark");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("glow"), 800);
    const t2 = setTimeout(() => setPhase("text"), 2200);
    const t3 = setTimeout(() => setPhase("full"), 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const showGlow = phase !== "dark";
  const showText = phase === "text" || phase === "full";
  const showFull = phase === "full";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="fixed inset-0 z-[60] overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 120% 100% at 50% 60%, #1a0a0f 0%, #0d0508 60%, #020102 100%)",
      }}
    >
      {/* Ambient rose glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: showGlow ? 0.55 : 0, scale: showGlow ? 1 : 0.6 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "120vmax",
          height: "120vmax",
          background:
            "radial-gradient(circle, rgba(190, 60, 80, 0.45) 0%, rgba(120, 30, 50, 0.2) 35%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />

      {/* Secondary gold glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showGlow ? 0.25 : 0 }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2"
        style={{
          width: "100vw",
          height: "60vh",
          background:
            "radial-gradient(ellipse at bottom, rgba(220, 170, 110, 0.4) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Floating particles */}
      {showGlow &&
        Array.from({ length: 28 }).map((_, i) => (
          <motion.div
            key={`p${i}`}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              background: "rgba(255, 220, 200, 0.7)",
              boxShadow: "0 0 6px rgba(255, 200, 180, 0.8)",
            }}
            animate={{
              opacity: [0.2, 0.9, 0.2],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4 + (i % 4),
              repeat: Infinity,
              delay: (i % 10) * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* Falling petals */}
      {showFull &&
        Array.from({ length: 14 }).map((_, i) => (
          <motion.div
            key={`petal${i}`}
            className="absolute"
            style={{
              width: 12 + (i % 5),
              height: 12 + (i % 5),
              left: `${(i * 71) % 100}%`,
              top: "-5%",
              background:
                "linear-gradient(135deg, rgba(220, 90, 110, 0.85), rgba(160, 50, 70, 0.6))",
              borderRadius: "50% 0 50% 0",
              filter: "blur(0.5px)",
            }}
            animate={{
              y: ["0vh", "110vh"],
              x: [0, (i % 2 ? 1 : -1) * 80],
              rotate: [0, 360 + (i % 3) * 120],
              opacity: [0, 0.85, 0.85, 0],
            }}
            transition={{
              duration: 9 + (i % 5),
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeIn",
            }}
          />
        ))}

      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.04,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          mixBlendMode: "overlay",
        }}
      />

      {/* Text content */}
      <div className="relative z-10 h-full w-full flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
          animate={{
            opacity: showText ? 1 : 0,
            y: showText ? 0 : 20,
            filter: showText ? "blur(0px)" : "blur(12px)",
          }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="max-w-xl text-center"
        >
          <div
            className="font-mono text-[10px] uppercase tracking-[0.4em] mb-6"
            style={{ color: "rgba(230, 190, 170, 0.7)" }}
          >
            23 · june · 2026
          </div>

          <div className="flex items-center justify-center gap-3 mb-8">
            <span
              className="h-px w-16"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(220, 160, 150, 0.6), transparent)",
              }}
            />
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: "rgba(230, 180, 160, 0.9)" }}
            />
            <span
              className="h-px w-16"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(220, 160, 150, 0.6), transparent)",
              }}
            />
          </div>

          <p
            className="font-display italic leading-[1.45] text-balance"
            style={{
              color: "rgba(248, 232, 215, 0.95)",
              fontSize: "clamp(20px, 5vw, 28px)",
              textShadow: "0 0 30px rgba(220, 140, 130, 0.4)",
            }}
          >
            {text}
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showFull ? 1 : 0 }}
            transition={{ duration: 1.6, delay: 0.4 }}
            className="mt-12 flex flex-col items-center gap-3"
          >
            <span
              className="block w-px h-10"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(220, 160, 150, 0.5))",
              }}
            />
            <span
              className="font-display italic text-sm"
              style={{ color: "rgba(220, 180, 170, 0.7)" }}
            >
              with all of it
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </motion.div>
  );
}
