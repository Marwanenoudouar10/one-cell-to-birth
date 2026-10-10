import { VO_TIMING } from "./voTiming";

// The voiceover, line by line, in GLOBAL seconds. Text and accent words live
// here; the timing comes from the real take (voTiming.ts, generated).
export type Line = {
  id: string;
  text: string;
  start: number; // seconds
  end: number; // seconds
  emphasis?: string[]; // words drawn in the accent colour
  words?: number[]; // start time of each word, if known
};

const TEXT: Omit<Line, "start" | "end">[] = [
  { id: "l1", text: "It starts with a race." },
  { id: "l2", text: "Millions run. Only one wins.", emphasis: ["one"] },
  { id: "l3", text: "One cell becomes two… four… hundreds." },
  { id: "l4", text: "Week six: a tiny heart starts to beat.", emphasis: ["heart"] },
  { id: "l5", text: "Week twelve: fingers, toes, a face." },
  { id: "l6", text: "Week twenty: the first kick.", emphasis: ["kick"] },
  { id: "l7", text: "Week forty: one cell has become a whole new human.", emphasis: ["human"] },
  { id: "l8", text: "Hello, world." },
];

export const LINES: Line[] = TEXT.map((l) => {
  const t = VO_TIMING[l.id];
  return { ...l, start: t.start, end: t.end, words: t.words };
});
