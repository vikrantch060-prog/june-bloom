export type AtmosphereMode = "morning" | "evening" | "night";

export const FINAL_DATE = new Date("2026-06-23T00:00:00");
export const FINAL_DATE_ISO = "2026-06-23";

export function getMode(date = new Date()): AtmosphereMode {
  const h = date.getHours();
  if (h >= 6 && h < 14) return "morning";
  if (h >= 14 && h < 20) return "evening";
  return "night";
}

export function isDeepNight(date = new Date()): boolean {
  const h = date.getHours();
  return h >= 22 || h < 6;
}

export function sunsetsRemaining(now = new Date()): number {
  const ms = FINAL_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function formatDay(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
}

export function daysBetween(a: Date, b: Date): number {
  const ms = b.setHours(0,0,0,0) - a.setHours(0,0,0,0);
  return Math.round(ms / 86400000);
}

/** Returns today's date string in YYYY-MM-DD using IST (UTC+5:30) */
export function todayIST(now = new Date()): string {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().slice(0, 10);
}

/** Is today (IST) the final date (23rd June 2026)? */
export function isFinalDate(now = new Date()): boolean {
  return todayIST(now) === FINAL_DATE_ISO;
}
