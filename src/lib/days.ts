// Sample memory archive. Replace photos/songs/notes with real content.
// Each day is keyed by ISO date (YYYY-MM-DD).

export interface Memory {
  date: string;            // YYYY-MM-DD
  title: string;
  note: string;
  song: { title: string; artist: string; youtubeId?: string };
  photos: { caption?: string; gradient: string }[]; // placeholder gradients
  surprise?: { kind: "message" | "link"; content: string };
}

const G = {
  dusk:   "linear-gradient(135deg, #622B14 0%, #995F2F 60%, #E4D6A9 100%)",
  cream:  "linear-gradient(135deg, #FFFDF2 0%, #F1E6CF 100%)",
  navy:   "linear-gradient(160deg, #0D1B2A 0%, #1B263B 55%, #415A77 100%)",
  rose:   "linear-gradient(135deg, #978F66 0%, #E4D6A9 100%)",
  ink:    "linear-gradient(160deg, #1B263B 0%, #415A77 70%, #778DA9 100%)",
  warm:   "linear-gradient(135deg, #995F2F 0%, #E4D6A9 100%)",
};

const start = new Date();
start.setHours(0,0,0,0);
start.setDate(start.getDate() - 6); // seed 7 days back so user has unlocked content

function iso(d: Date) {
  return d.toISOString().slice(0,10);
}

function build(offset: number, m: Omit<Memory, "date">): Memory {
  const d = new Date(start);
  d.setDate(start.getDate() + offset);
  return { date: iso(d), ...m };
}

export const MEMORIES: Memory[] = [
  build(0, {
    title: "The first morning",
    note: "Half-asleep, half-laughing. You stole the blanket again.",
    song: { title: "From The Start", artist: "Laufey", youtubeId: "qbF2X9_immY" },
    photos: [
      { gradient: G.cream, caption: "soft light, soft you" },
      { gradient: G.rose },
      { gradient: G.warm, caption: "coffee, two cups" },
      { gradient: G.cream },
    ],
  }),
  build(1, {
    title: "Bookstore on a Tuesday",
    note: "You read aloud from a book I didn't understand. I just watched your mouth move.",
    song: { title: "Paris", artist: "The 1975", youtubeId: "kAvtPbu0lGM" },
    photos: [
      { gradient: G.dusk, caption: "rue de something" },
      { gradient: G.warm },
      { gradient: G.dusk, caption: "shelf 4, row 2" },
      { gradient: G.rose },
      { gradient: G.dusk },
    ],
  }),
  build(2, {
    title: "Stars over the terrace",
    note: "You said the moon looked like a fingerprint. I didn't disagree.",
    song: { title: "Sweet", artist: "Cigarettes After Sex", youtubeId: "9MOhztzC_tM" },
    photos: [
      { gradient: G.navy, caption: "11:47pm" },
      { gradient: G.ink },
      { gradient: G.navy, caption: "your hand, my hand" },
      { gradient: G.ink },
    ],
    surprise: { kind: "message", content: "every third day I leave you a small thing. this is it: I love how you laugh at your own jokes before finishing them." },
  }),
  build(3, {
    title: "Lazy Sunday",
    note: "Nothing happened. Best day of the week.",
    song: { title: "Sunday", artist: "The Cranberries", youtubeId: "AdpEbZ7DurI" },
    photos: [
      { gradient: G.cream }, { gradient: G.rose, caption: "toes, sunlight" }, { gradient: G.cream }, { gradient: G.warm },
    ],
  }),
  build(4, {
    title: "Rain in Bandra",
    note: "We waited under the awning for an hour. You said you wished it never stopped.",
    song: { title: "Rivers and Roads", artist: "The Head and the Heart", youtubeId: "vqRQwx-i1mU" },
    photos: [
      { gradient: G.ink, caption: "puddles, neon" }, { gradient: G.navy }, { gradient: G.dusk }, { gradient: G.ink, caption: "your jacket, my shoulders" },
    ],
  }),
  build(5, {
    title: "Small kitchen, big nothing",
    note: "Burnt the eggs. Didn't care. Ate them anyway.",
    song: { title: "Saturn", artist: "Sleeping at Last", youtubeId: "dzNvk80XY9s" },
    photos: [
      { gradient: G.warm }, { gradient: G.cream, caption: "yolk, almost" }, { gradient: G.rose }, { gradient: G.warm }, { gradient: G.cream },
    ],
    surprise: { kind: "message", content: "you make ordinary mornings feel like a film I keep rewatching." },
  }),
  build(6, {
    title: "Tonight",
    note: "I'm writing this with you asleep next to me. Don't tell.",
    song: { title: "Nightcall", artist: "Kavinsky", youtubeId: "MV_3Dpw-BRY" },
    photos: [
      { gradient: G.navy, caption: "blue hour" }, { gradient: G.ink }, { gradient: G.navy }, { gradient: G.ink, caption: "softly" },
    ],
  }),
];

// Future locked entries — placeholders shown chained.
const FUTURE_TITLES = [
  "A small surprise", "Walk we didn't plan", "Letter, sealed", "Window seat",
  "Late afternoon", "Something blue", "Quiet hour", "A song you'll know",
  "Wait for it", "The last sunset",
];

export const FUTURE: { date: string; title: string }[] = FUTURE_TITLES.map((title, i) => {
  const d = new Date(start);
  d.setDate(start.getDate() + 7 + i);
  return { date: iso(d), title };
});

export function getUnlockedToday(now = new Date()): Memory[] {
  const today = iso(now);
  return MEMORIES.filter(m => m.date <= today);
}

export function getMemory(date: string): Memory | undefined {
  return MEMORIES.find(m => m.date === date);
}
