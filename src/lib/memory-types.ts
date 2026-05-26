// Shared types for the dynamic memory archive (Google Sheets backed).

export interface MediaItem {
  kind: "photo" | "video";
  url: string;
  caption?: string;
}

export interface Memory {
  date: string; // YYYY-MM-DD
  title: string;
  note: string; // primary quote / text memory
  extraNotes: string[]; // additional text memories
  song: { title: string; artist: string; youtubeId?: string; spotifyId?: string };
  media: MediaItem[];
  // legacy compatibility for existing components expecting `photos` w/ gradient
  photos: { caption?: string; gradient: string; url?: string }[];
  surprise?: { kind: "message"; content: string };
}

export interface MetaConfig {
  launchDate: string; // YYYY-MM-DD
  finalDate: string; // YYYY-MM-DD
  heroTitle?: string;
  finalCardText?: string;
}

export interface DaySlot {
  date: string;
  locked: boolean;
  isToday: boolean;
  isFinal: boolean;
  memory?: Memory;
}

export const FINAL_DATE_ISO = "2026-06-23";

// Soft fallback gradients used when a row has no media URLs yet.
const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg, #622B14 0%, #995F2F 60%, #E4D6A9 100%)",
  "linear-gradient(135deg, #FFFDF2 0%, #F1E6CF 100%)",
  "linear-gradient(160deg, #0D1B2A 0%, #1B263B 55%, #415A77 100%)",
  "linear-gradient(135deg, #978F66 0%, #E4D6A9 100%)",
  "linear-gradient(160deg, #1B263B 0%, #415A77 70%, #778DA9 100%)",
  "linear-gradient(135deg, #995F2F 0%, #E4D6A9 100%)",
];

export function placeholderGradient(seed: string, i = 0): string {
  let h = 0;
  for (let k = 0; k < seed.length; k++) h = (h * 31 + seed.charCodeAt(k)) >>> 0;
  return PLACEHOLDER_GRADIENTS[(h + i) % PLACEHOLDER_GRADIENTS.length];
}

/** Today's date string in YYYY-MM-DD using IST (UTC+5:30) */
export function todayIso(now = new Date()): string {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().slice(0, 10);
}

export function isUnlocked(date: string, today = todayIso()): boolean {
  return date <= today;
}

export function buildSlots(meta: MetaConfig, memories: Memory[], today = todayIso()): DaySlot[] {
  const byDate = new Map(memories.map((m) => [m.date, m]));
  const slots: DaySlot[] = [];
  const start = new Date(meta.launchDate + "T00:00:00");
  const end = new Date(meta.finalDate + "T00:00:00");
  const cursor = new Date(start);
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10);
    slots.push({
      date: iso,
      locked: iso > today,
      isToday: iso === today,
      isFinal: iso === FINAL_DATE_ISO,
      memory: byDate.get(iso),
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return slots;
}

