/**
 * Captions / VO lines of the long film (C00 intro hook + C01..C16): one line per sentence
 * of briefs/long/script.md (exact text, British spelling), the chapter's accent word as `emphasis`, and PLANNED
 * chapter-local times from briefs/long/storyboard.md (per-phrase windows; words inside a
 * phrase are spread by length). Re-time from the voice take's word timings once it exists.
 *
 *   CHAPTER_LINES[id]  lines in CHAPTER-LOCAL seconds (move with their chapter when re-timed)
 *   LONG_LINES         the same lines in GLOBAL seconds -> <CaptionsLong lines={LONG_LINES} />
 *
 * line(phrases, emphasis?) builds a line from storyboard phrases [text, from, to?]:
 *   text  = the phrases joined by spaces; start = first `from`; end = last `to` (or `from`)
 *   words = per-word start times; phrases = word index of each phrase start (page breaks)
 * A one-word phrase without `to` is a word cue: the word appears exactly at `from`.
 */
import { CHAPTERS, ChapterId, toGlobalSec } from "../chapters";
import type { CaptionLine } from "../overlays/CaptionsLong";
import { VO_TIMING } from "./voTiming";

type LocalLine = Omit<CaptionLine, "id">;
type Phrase = readonly [text: string, from: number, to?: number];

const r2 = (t: number) => Math.round(t * 100) / 100;

const line = (phrases: readonly Phrase[], emphasis?: string[]): LocalLine => {
  const words: number[] = [];
  const starts: number[] = [];
  for (const [text, from, to = from] of phrases) {
    const toks = text.split(" ");
    const weights = toks.map((w) => w.length + 2);
    const total = weights.reduce((a, b) => a + b, 0);
    starts.push(words.length);
    let acc = 0;
    toks.forEach((_, i) => {
      words.push(r2(from + ((to - from) * acc) / total));
      acc += weights[i];
    });
  }
  const last = phrases[phrases.length - 1];
  return {
    text: phrases.map(([t]) => t).join(" "),
    start: phrases[0][1],
    end: last[2] ?? last[1],
    ...(emphasis ? { emphasis } : {}),
    words,
    phrases: starts,
  };
};

export const CHAPTER_LINES: Partial<Record<ChapterId, LocalLine[]>> = {
  C00: [
    line([["Have you ever wondered how you began?", 0.4, 2.6]]),
    // Accent "you" sits on "you were a single cell" (one gold word, as the gold zygote resolves).
    line([["Long before your first breath,", 3.2, 4.8], ["you were a single cell,", 5.0, 6.2], ["smaller than a grain of salt.", 6.2, 7.6]], ["you"]),
  ],
  C01: [
    line([["It starts with a race.", 0.5, 2.1]]),
    line([["Hundreds of millions set off on an obstacle course.", 2.5, 5.4]]),
    line([["Only one gets in.", 5.9, 7.1]], ["one"]),
  ],
  C02: [
    line([["Doctors already call this week", 0.8, 2.3], ["two:", 2.4], ["they count from the last period.", 3.0, 4.8]], ["two"]),
  ],
  C03: [
    line([["One cell becomes", 0.5, 1.2], ["two…", 1.3], ["four…", 2.2], ["eight.", 3.2, 4.0]]),
    line([["But it doesn't grow:", 4.5, 5.5], ["each cell just gets smaller.", 5.7, 7.0]], ["smaller"]),
  ],
  C04: [
    line(
      [
        ["Now a hollow ball,", 0.4, 1.6],
        ["it burrows into the womb wall", 2.0, 3.8],
        ["and sends a message:", 4.0, 5.0],
        ["the hormone a pregnancy test detects.", 5.2, 7.0],
      ],
      ["message"],
    ),
  ],
  C05: [
    line([["Week four:", 0.5, 1.1], ["the embryo forms three layers.", 1.2, 2.8]], ["three"]),
    line([["One builds brain and skin.", 3.2, 4.6]]),
    line([["One, heart and bone.", 4.9, 6.1]]),
    line([["One, lungs and gut.", 6.4, 7.6]]),
  ],
  C06: [
    line([["Week five:", 0.5, 1.1], ["a tube of heart cells starts to squeeze,", 1.2, 3.0], ["all by itself.", 3.2, 4.1]]),
    line([["By week six,", 4.8, 5.6], ["a tiny heart is beating.", 5.7, 7.1]], ["heart"]),
  ],
  C07: [
    line([["Week seven:", 0.5, 1.1], ["its very first move.", 1.2, 2.4]], ["move"]),
    line([["A tiny wiggle,", 2.8, 3.6], ["months before anyone can feel it.", 3.8, 5.4]]),
  ],
  C08: [
    line([["Week eight:", 0.5, 1.1], ["its fingers are webbed,", 1.2, 2.2], ["and it even has a little tail.", 2.4, 3.8]], ["tail"]),
    line([["Both fade away,", 4.3, 5.2], ["right on cue.", 5.3, 6.1]]),
  ],
  C09: [
    line([["Week ten:", 0.5, 1.1], ["every major organ is in place.", 1.2, 2.8]]),
    line([["The embryo becomes a fetus.", 3.2, 4.7]], ["fetus"]),
    line([["Week twelve:", 6.0, 6.6], ["fingers,", 6.8], ["toes,", 7.4], ["a face.", 7.95, 8.6]]),
  ],
  C10: [
    line([["Week fifteen:", 3.2, 3.9], ["it sucks its thumb.", 4.0, 5.0]]),
    line(
      [
        ["Week seventeen:", 6.1, 6.8],
        ["fingerprints, set for life,", 6.9, 8.3],
        ["different even from an identical twin's.", 8.5, 10.2],
      ],
      ["fingerprints"],
    ),
  ],
  C11: [
    line([["Around week twenty,", 3.0, 4.0], ["its mother feels it move for the first time.", 4.1, 6.1]]),
    line([["A flutter…", 6.5, 7.2], ["then, a kick.", 7.6, 8.5]], ["kick"]),
  ],
  C12: [
    line([["Week twenty-two:", 1.4, 2.1], ["it can hear its mother's heartbeat,", 2.2, 3.8], ["even her tummy rumbling.", 4.0, 5.3]]),
    line([["Around week twenty-seven,", 8.3, 9.3], ["its eyelids, sealed for months, open.", 9.5, 11.4]]),
    line([["And it blinks.", 11.8, 12.4]], ["blinks"]),
  ],
  C13: [
    line(
      [
        ["Week thirty:", 3.1, 3.7],
        ["its brain adds about four teaspoons a week,", 3.8, 5.9],
        ["folding as it grows.", 6.1, 7.1],
      ],
      ["brain"],
    ),
  ],
  C14: [
    line([["It practises breathing,", 0.6, 1.8], ["though there's no air.", 2.0, 3.1]], ["breathing"]),
    line([["Not yet.", 3.6, 4.3]]),
    line([["By week thirty-six,", 5.7, 6.6], ["its lungs are probably ready.", 6.7, 8.2]]),
  ],
  C15: [
    line(
      [
        ["Now it can tell its mother's voice", 0.5, 2.2],
        ["from a stranger's,", 2.3, 3.4],
        ["and after birth, it prefers hers.", 3.7, 5.4],
      ],
      ["voice"],
    ),
  ],
  C16: [
    line([["Week forty:", 0.9, 1.5], ["full term.", 1.6, 2.3]]),
    line([["Then…", 3.2, 3.7], ["light.", 4.1, 4.6]]),
    line([["A first breath of air.", 5.2, 6.5]]),
    line([["A finger in its palm,", 7.0, 8.1], ["and it holds on tight.", 8.3, 9.5]]),
    line([["One cell has become a whole new human.", 10.0, 12.9]], ["human"]),
    // The film's last line = the end title (CaptionsLong): 112 px, gold "world.", never fades.
    line([["Hello, world.", 13.6, 14.6]], ["world"]),
  ],
};

// Real timing from the voice take (voTiming.ts, generated) overrides the planned times
// line by line, as long as the word counts match.
const timed = (id: ChapterId, i: number, l: LocalLine): LocalLine => {
  const v = VO_TIMING[id]?.lines[i];
  if (!v || !l.words || v.words.length !== l.words.length) return l;
  return { ...l, start: v.start, end: v.end, words: v.words };
};

export const LONG_LINES: CaptionLine[] = CHAPTERS.flatMap((c) =>
  (CHAPTER_LINES[c.id] ?? []).map((raw, i) => {
    const l = timed(c.id, i, raw);
    return {
      ...l,
      id: `${c.id}-${i + 1}`,
      start: toGlobalSec(c.id, l.start),
      end: toGlobalSec(c.id, l.end),
      words: l.words?.map((w) => toGlobalSec(c.id, w)),
    };
  }),
).sort((a, b) => a.start - b.start);
