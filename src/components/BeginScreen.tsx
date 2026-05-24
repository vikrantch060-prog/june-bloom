import { motion } from "motion/react";
import { sunsetsRemaining } from "@/lib/time";

interface Props { onBegin: () => void }

export function BeginScreen({ onBegin }: Props) {
  const sunsets = sunsetsRemaining();
  return (
    <motion.div
      key="begin"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 1.0, ease: "easeInOut" }}
      className="fixed inset-0 z-30 flex flex-col items-center justify-center text-center px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 1.2 }}
        className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted-foreground)] mb-5"
      >
        a private universe
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.4, ease: "easeOut" }}
        className="font-display text-5xl sm:text-6xl leading-[1.05] text-balance"
      >
        23<span className="italic">rd</span> June<br />2026
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 1.4 }}
        className="mt-5 max-w-[28ch] text-[14px] text-[var(--muted-foreground)] text-pretty"
      >
        a slow film we're making, one day at a time. {sunsets} sunsets left.
      </motion.p>

      <motion.button
        onClick={onBegin}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 1 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="mt-10 px-8 py-3.5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] font-medium tracking-wide shadow-[0_20px_50px_-20px_var(--glow)]"
      >
        Tap to Begin
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
        transition={{ delay: 2.2, duration: 2 }}
        className="mt-12 text-[10px] tracking-[0.3em] uppercase text-[var(--muted-foreground)]"
      >
        ↓ swipe gently
      </motion.div>
    </motion.div>
  );
}
