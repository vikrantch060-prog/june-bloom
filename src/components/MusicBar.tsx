import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause } from "lucide-react";

interface Props {
  title: string;
  artist: string;
  visible: boolean;
}

export function MusicBar({ title, artist, visible }: Props) {
  const [playing, setPlaying] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[min(92vw,440px)]"
        >
          <div className="glass rounded-full pl-2 pr-4 py-2 flex items-center gap-3">
            <button
              onClick={() => setPlaying(p => !p)}
              className="h-10 w-10 rounded-full flex items-center justify-center bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md active:scale-95 transition"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 overflow-hidden">
                <motion.div
                  key={title}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-baseline gap-2 min-w-0"
                >
                  <span className="font-display text-[15px] truncate">{title}</span>
                  <span className="text-xs text-[var(--muted-foreground)] truncate">{artist}</span>
                </motion.div>
              </div>
              <div className="mt-1 h-[2px] rounded-full bg-[var(--muted)] overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--primary)]"
                  initial={{ width: "0%" }}
                  animate={{ width: playing ? "100%" : "30%" }}
                  transition={{ duration: 180, ease: "linear" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
