import { createServerFn } from "@tanstack/react-start";
import type { Memory, MetaConfig, MediaItem } from "./memory-types";
import { placeholderGradient } from "./memory-types";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

interface BatchGetResponse {
  valueRanges?: Array<{ range: string; values?: string[][] }>;
}

function splitList(v: string | undefined): string[] {
  if (!v) return [];
  return v
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normaliseCloudinaryUrl(url: string): string {
  if (!url || !url.includes("cloudinary.com")) return url;
  if (/\/upload\//.test(url) && !/f_auto/.test(url)) {
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  }
  return url;
}

function inferMediaKind(url: string): "photo" | "video" {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) ? "video" : "photo";
}


function rowsToObjects(values: string[][]): Record<string, string>[] {
  if (!values || values.length < 2) return [];
  const headers = values[0].map((h) => h.trim().toLowerCase());
  return values.slice(1).map((row) => {
    const o: Record<string, string> = {};
    headers.forEach((h, i) => (o[h] = (row[i] ?? "").trim()));
    return o;
  });
}

function parseMemories(rows: Record<string, string>[]): Memory[] {
  const out: Memory[] = [];
  for (const r of rows) {
    if (!r.date) continue;
    const photoUrls = splitList(r.photos);
    const videoUrls = splitList(r.videos);
    const notes = splitList(r.notes);
    const media: MediaItem[] = [
      ...photoUrls.map((url) => ({ kind: inferMediaKind(url), url })),
      ...videoUrls.map((url) => ({ kind: "video" as const, url })),
    ];
    const photos =
      media.length > 0
        ? media.map((m, i) => ({
            url: m.url,
            gradient: placeholderGradient(r.date, i),
            caption: m.caption,
          }))
        : // soft placeholder cells so the card still has visual presence
          Array.from({ length: 3 }).map((_, i) => ({
            gradient: placeholderGradient(r.date, i),
          }));
    out.push({
      date: r.date,
      title: r.title || "untitled day",
      note: r.quote || notes[0] || "",
      extraNotes: r.quote ? notes : notes.slice(1),
      song: {
        title: r.song_title || "",
        artist: r.song_artist || "",
        youtubeId: r.youtube_id || undefined,
      },
      media,
      photos,
      surprise: r.unlock_message
        ? { kind: "message", content: r.unlock_message }
        : undefined,
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

function parseMeta(rows: Record<string, string>[], fallback: MetaConfig): MetaConfig {
  const map = new Map<string, string>();
  for (const r of rows) {
    // meta sheet has columns: key | value
    const k = (r.key || "").toLowerCase();
    const v = r.value || "";
    if (k) map.set(k, v);
  }
  return {
    launchDate: map.get("launch_date") || fallback.launchDate,
    finalDate: map.get("final_date") || fallback.finalDate,
    heroTitle: map.get("hero_title") || fallback.heroTitle,
  };
}

export const getMemoryArchive = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ meta: MetaConfig; memories: Memory[]; error: string | null }> => {
    const today = new Date().toISOString().slice(0, 10);
    const fallbackMeta: MetaConfig = {
      launchDate: today,
      finalDate: "2026-06-23",
      heroTitle: "today, & every day before it.",
    };

    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    const MEMORIES_SHEET_ID = process.env.MEMORIES_SHEET_ID;

    if (!LOVABLE_API_KEY) {
      return { meta: fallbackMeta, memories: [], error: "LOVABLE_API_KEY not configured" };
    }
    if (!GOOGLE_SHEETS_API_KEY) {
      return { meta: fallbackMeta, memories: [], error: "Google Sheets connection missing" };
    }
    if (!MEMORIES_SHEET_ID) {
      return { meta: fallbackMeta, memories: [], error: "MEMORIES_SHEET_ID not configured" };
    }

    const url =
      `${GATEWAY_URL}/spreadsheets/${MEMORIES_SHEET_ID}/values:batchGet` +
      `?ranges=memories!A:Z&ranges=meta!A:B`;

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
        },
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`Sheets fetch failed [${res.status}]: ${body}`);
        return { meta: fallbackMeta, memories: [], error: `Sheets API ${res.status}` };
      }
      const data = (await res.json()) as BatchGetResponse;
      const memRange = data.valueRanges?.find((r) => r.range.toLowerCase().includes("memories"));
      const metaRange = data.valueRanges?.find((r) => r.range.toLowerCase().includes("meta"));
      const memories = parseMemories(rowsToObjects(memRange?.values ?? []));
      const meta = parseMeta(rowsToObjects(metaRange?.values ?? []), fallbackMeta);
      return { meta, memories, error: null };
    } catch (e) {
      console.error("getMemoryArchive failed:", e);
      return {
        meta: fallbackMeta,
        memories: [],
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  },
);
