import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Atmosphere } from "@/components/Atmosphere";
import { BeginScreen } from "@/components/BeginScreen";
import { TopBar } from "@/components/TopBar";
import { Calendar } from "@/components/Calendar";
import { DateCardCarousel } from "@/components/DateCardCarousel";
import { MusicBar } from "@/components/MusicBar";
import { MemoryDialog } from "@/components/MemoryDialog";
import { NightWhisper } from "@/components/NightWhisper";
import { FinalReveal } from "@/components/FinalReveal";
import { getMode, isFinalDate } from "@/lib/time";
import { getMemoryArchive } from "@/lib/memories.functions";
import { buildSlots, todayIso, type Memory } from "@/lib/memory-types";

const archiveQueryOptions = queryOptions({
  queryKey: ["memory-archive"],
  queryFn: () => getMemoryArchive(),
  staleTime: 5 * 60 * 1000,
});

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
  loader: ({ context }) => context.queryClient.ensureQueryData(archiveQueryOptions),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(archiveQueryOptions);
  const { meta, memories, error } = data;

  const [mode, setMode] = useState(getMode());
  const [started, setStarted] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [openMemory, setOpenMemory] = useState<Memory | null>(null);

  useEffect(() => {
    const t = setInterval(() => setMode(getMode()), 60_000);
    return () => clearInterval(t);
  }, []);

  const today = todayIso();
  const slots = useMemo(() => buildSlots(meta, memories, today), [meta, memories, today]);
  const unlocked = useMemo(
    () => slots.filter((s) => !s.locked && s.memory && !s.isFinal).map((s) => s.memory!),
    [slots],
  );
  const current = unlocked[unlocked.length - 1];
  const finalCardText = meta.finalCardText ?? "every day was a love letter. this was the last page.";

  const handleBegin = () => {
    setStarted(true);
    if (isFinalDate()) {
      setTimeout(() => setShowFinal(true), 600);
    }
  };

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
              {unlocked.length === 0
                ? "the very beginning"
                : meta.heroTitle ?? "today, & every day before it."}
            </h1>
            <p className="mt-3 text-[14px] text-[var(--muted-foreground)] text-pretty">
              swipe through the stack. every hidden message arrives in its own time.
            </p>
            {error && (
              <p className="mt-3 text-[11px] font-mono text-[var(--muted-foreground)] opacity-70">
                · waiting for the archive to sync ({error}) ·
              </p>
            )}
          </section>

          <section className="mt-10">
            {unlocked.length > 0 ? (
              <DateCardCarousel memories={unlocked} />
            ) : (
              <div className="px-6 max-w-md mx-auto text-center">
                <p className="font-display italic text-lg text-[var(--muted-foreground)]">
                  the first memory unlocks today. add a row to the archive to begin.
                </p>
              </div>
            )}
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
        onPick={(d) => {
          setCalendarOpen(false);
          const m = memories.find((mm) => mm.date === d);
          if (m) setOpenMemory(m);
        }}
        slots={slots}
      />

      <MemoryDialog memory={openMemory} onClose={() => setOpenMemory(null)} />

      <NightWhisper />
    </div>
  );
}
