import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, Music2, X } from "lucide-react";

interface Props {
  title: string;
  artist: string;
  visible: boolean;
  spotifyId?: string;
}

export function MusicBar({ title, artist, visible, spotifyId }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [tapped, setTapped] = useState(false);

  // Auto-open the player whenever a track is available and the bar is visible.
  useEffect(() => {
    if (spotifyId && visible) setExpanded(true);
  }, [spotifyId, visible]);

  // Reset the "tap to play" nudge whenever the track changes.
  const prevIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (spotifyId !== prevIdRef.current) {
      prevIdRef.current = spotifyId;
      setTapped(false);
    }
  }, [spotifyId]);

  const embedSrc = spotifyId
    ? `https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0&autoplay=1`
    : null;

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
            {expanded && embedSrc && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="mb-2 rounded-2xl overflow-hidden shadow-2xl relative glass"
                style={{ height: 152 }}
              >
                <iframe
                  key={spotifyId}
                  src={embedSrc}
                  width="100%"
                  height="152"
                  frameBorder={0}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="eager"
                  title="Spotify player"
                  style={{ border: 0, display: "block", borderRadius: 16 }}
                  onClick={() => setTapped(true)}
                />
                <AnimatePresence>
                  {!tapped && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 1.2, duration: 0.6 }}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none"
                    >
                      <motion.div
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                          background: "rgba(0,0,0,0.55)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            color: "rgba(255,255,255,0.85)",
                            fontFamily: "monospace",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                          }}
                        >
                          tap ▶ to play
                        </span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="glass rounded-full pl-2 pr-3 py-2 flex items-center gap-3">
            <button
              onClick={() => spotifyId && setExpanded((v) => !v)}
              className="h-10 w-10 rounded-full flex items-center justify-center bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md active:scale-95 transition shrink-0 disabled:opacity-60"
              aria-label={expanded ? "Collapse player" : "Open Spotify player"}
              disabled={!spotifyId}
            >
              {spotifyId ? (
                <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronUp size={18} />
                </motion.span>
              ) : (
                <Music2 size={16} />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <motion.div
                key={title}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-baseline gap-2 min-w-0"
              >
                <span className="font-display text-[15px] truncate">{title}</span>
                <span className="text-xs text-[var(--muted-foreground)] truncate">{artist}</span>
              </motion.div>

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

            {expanded && spotifyId && (
              <button
                onClick={() => setExpanded(false)}
                className="h-7 w-7 rounded-full grid place-items-center hover:bg-[var(--muted)] transition shrink-0"
                aria-label="Hide player"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
