import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { isDeepNight } from "@/lib/time";

export function NightWhisper() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isDeepNight()) return;
    const t1 = setTimeout(() => setShow(true), 25_000);
    const t2 = setTimeout(() => setShow(false), 35_000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-40 font-display italic text-[15px] text-[var(--foreground)]/80 px-4 py-2 rounded-full glass"
        >
          still awake, my rabbit?
        </motion.div>
      )}
    </AnimatePresence>
  );
}
