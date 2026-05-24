import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Atmosphere } from "@/components/Atmosphere";
import { BeginScreen } from "@/components/BeginScreen";
import { TopBar } from "@/components/TopBar";
import { Calendar } from "@/components/Calendar";
import { StackedCarousel, type StackItem } from "@/components/StackedCarousel";
import { MusicBar } from "@/components/MusicBar";
import { MemoryDialog } from "@/components/MemoryDialog";
import { NightWhisper } from "@/components/NightWhisper";
import { getMode } from "@/lib/time";
import { getUnlockedToday } from "@/lib/days";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "23rd June 2026 — a private universe" },
      { name: "description", content: "A slow cinematic diary, one day at a time, until 23rd June 2026." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0D1B2A" },
      { property: "og:title", content: "23rd June 2026" },
      { property: "og:description", content: "A private cinematic memory universe, evolving daily." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=JetBrains+Mono:wght@400&display=swap" },
    ],
  }),
  component: Home,
});

function Home() {
  const [mode, setMode] = useState(getMode());
  const [started, setStarted] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [openDate, setOpenDate] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setMode(getMode()), 60_000);
    return () => clearInterval(t);
  }, []);

  const memories = useMemo(() => getUnlockedToday(), []);
  const current = memories[memories.length - 1];
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="relative min-h-[100dvh] vignette overflow-x-hidden">
      <Atmosphere mode={mode} />

      <AnimatePresence mode="wait">
        {!started && <BeginScreen onBegin={() => setStarted(true)} />}
      </AnimatePresence>

      {started && (
        <motion.main
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 pb-44"
        >
          <TopBar onOpenCalendar={() => setCalendarOpen(true)} />

          <section className="pt-24 px-6 max-w-md mx-auto">
            <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted-foreground)] mb-2">
              {mode === "morning" ? "lazy romance" : mode === "evening" ? "cozy bookstore" : "stargazing"}
            </div>
            <h1 className="font-display text-4xl leading-[1.05] text-balance">
              {memories.length === 0
                ? "the very beginning"
                : "today, & every day before it."}
            </h1>
            <p className="mt-3 text-[14px] text-[var(--muted-foreground)] text-pretty">
              swipe through the stack. every third day hides a small thing.
            </p>
          </section>

          <section
            className="mt-8 flex gap-4 overflow-x-auto no-scrollbar scroll-x-snap px-[7vw] pb-4"
          >
            {memories.map((m, i) => (
              <DayCard key={m.date} memory={m} index={i} isThird={(i + 1) % 3 === 0} />
            ))}
          </section>

          <section className="px-6 max-w-md mx-auto mt-6 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
              tomorrow is locked. come back.
            </div>
          </section>
        </motion.main>
      )}

      <MusicBar
        visible={started && !!current}
        title={current?.song.title ?? ""}
        artist={current?.song.artist ?? ""}
      />

      <Calendar
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onPick={(d) => { setCalendarOpen(false); setOpenDate(d); }}
        todayIso={todayIso}
      />

      <MemoryDialog date={openDate} onClose={() => setOpenDate(null)} />

      <NightWhisper />
    </div>
  );
}
