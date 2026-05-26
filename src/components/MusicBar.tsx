import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp } from "lucide-react";

interface Props {
  title: string;
  artist: string;
  visible: boolean;
  spotifyId?: string;
}

export function MusicBar({ title, artist, visible, spotifyId }: Props) {
  const [expanded, setExpanded] = useState(false);

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
          <AnimatePresence>
            {expanded && spotifyId && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: 10 }}
                animate={{ height: 152, opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                className="overflow-hidden mb-2 rounded-2xl glass"
              >
                <iframe
                  src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder={0}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="Spotify player"
                  style={{ border: 0, display: "block" }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="glass rounded-full pl-2 pr-4 py-2 flex items-center gap-3">
            <button
              onClick={() => spotifyId && setExpanded((v) => !v)}
              className="h-10 w-10 rounded-full flex items-center justify-center bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md active:scale-95 transition disabled:opacity-60"
              aria-label={expanded ? "Hide player" : "Show player"}
              disabled={!spotifyId}
            >
              <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronUp size={16} />
              </motion.span>
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
              {!spotifyId && (
                <div className="mt-1 flex items-end gap-[3px] h-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="w-[2px] rounded-full bg-[var(--primary)]"
                      animate={{ height: ["20%", "100%", "40%", "80%", "20%"] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.12,
                        ease: "easeInOut",
                      }}
                      style={{ height: "40%" }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
