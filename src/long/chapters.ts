/**
 * CHAPTER CONFIG for the long film (composition "Long"). Timeline, week tracker,
 * placeholder cards and per-chapter previews are all derived from CHAPTERS, so
 * re-timing / re-ordering the film means editing this list only.
 *
 * ChapterSpec
 *   id          "C01".. Also the folder (src/long/chapters/<id>/) and the export name.
 *   title       Working title. Shown on the placeholder card only, never in the film.
 *   durationSec Chapter length in seconds, INCLUDING its transition overlaps.
 *   transition  How this chapter ENTERS from the previous one (ignored for the first):
 *                 "cut"   hard cut, no overlap
 *                 "fade"  LONG_TRANSITION-frame crossfade (match cut: same subject both sides)
 *                 "focus" LONG_TRANSITION-frame focus pull (old shot defocuses, new pulls in)
 *               "fade" and "focus" overlap the two chapters by LONG_TRANSITION frames.
 *   weekKeys    [chapterLocalSec, week][] keyframes for the week tracker. Week is
 *               fractional: 0..1 = days (1/7 = day 1), 4 = week 4 .. 40 = birth.
 *               Between keys the week eases (EASE.inOut), before/after it holds.
 *   trackerHide Optional [fromSec, toSec][] chapter-local windows where the tracker fades out.
 *
 * Derived (all frames are GLOBAL film frames @30fps):
 *   LONG_TRANSITION, LONG_START[id], LONG_TOTAL, chapterFrames(id), chapterSpec(id),
 *   overlapIn(id), toGlobalFrame(id, localSec), toGlobalSec(id, localSec)
 */
import { FPS } from "../theme/layout";

export type TransitionKind = "cut" | "fade" | "focus";

export type ChapterSpec = {
  id: string;
  title: string;
  durationSec: number;
  transition: TransitionKind;
  weekKeys: readonly (readonly [number, number])[];
  trackerHide?: readonly (readonly [number, number])[];
};

export const LONG_TRANSITION = 15;

const D = 1 / 7; // one day, in weeks

// Final chapter list from briefs/long/storyboard.md (C00 intro + 16 chapters, 147 s).
export const CHAPTERS = [
  { id: "C00", title: "The question", durationSec: 8.6, transition: "cut", weekKeys: [[0, 1]], trackerHide: [[0, 8.6]] },
  { id: "C01", title: "The obstacle course", durationSec: 8.5, transition: "cut", weekKeys: [[0, 1]], trackerHide: [[0, 8.6]] },
  { id: "C02", title: "Week two already", durationSec: 6.0, transition: "fade", weekKeys: [[1.45, 1], [1.7, 2]] },
  { id: "C03", title: "Split without growing", durationSec: 8.5, transition: "fade", weekKeys: [[2.3, 2], [2.6, 2 + D], [6.9, 2 + 3 * D], [7.2, 2 + 4 * D]] },
  { id: "C04", title: "A message to mum", durationSec: 8.5, transition: "fade", weekKeys: [[0.3, 2 + 4 * D], [0.6, 2 + 5 * D], [2.45, 2 + 5 * D], [2.75, 3], [6.85, 4]] },
  { id: "C05", title: "Three layers", durationSec: 9.2, transition: "focus", weekKeys: [] },
  { id: "C06", title: "First heartbeats", durationSec: 8.5, transition: "fade", weekKeys: [[0.35, 5], [5.6, 6]] },
  { id: "C07", title: "First move", durationSec: 8.2, transition: "fade", weekKeys: [[0.58, 7]] },
  { id: "C08", title: "Webbing and tail", durationSec: 7.5, transition: "fade", weekKeys: [[0.05, 8], [4.55, 9]] },
  { id: "C09", title: "Fetus", durationSec: 9.5, transition: "focus", weekKeys: [[0.15, 10], [4.45, 11], [6.05, 12]] },
  { id: "C10", title: "Hands of its own", durationSec: 10.5, transition: "fade", weekKeys: [[0, 13], [1.5, 14], [3.0, 15], [4.5, 16], [6.0, 17]] },
  { id: "C11", title: "The first kick she feels", durationSec: 9.5, transition: "focus", weekKeys: [[0, 18], [1.5, 19], [3.0, 20]] },
  { id: "C12", title: "The senses wake", durationSec: 13.0, transition: "focus", weekKeys: [[0, 21], [1.3, 22], [2.7, 23], [4.1, 24], [5.5, 25], [6.9, 26], [8.3, 27]] },
  { id: "C13", title: "Brain spurt", durationSec: 8.5, transition: "focus", weekKeys: [[0, 28], [1.5, 29], [3.0, 30], [4.5, 31]] },
  { id: "C14", title: "Practice breaths", durationSec: 9.0, transition: "fade", weekKeys: [[0, 32], [1.4, 33], [2.8, 34], [4.2, 35], [5.6, 36]] },
  { id: "C15", title: "Her voice", durationSec: 7.0, transition: "fade", weekKeys: [[0, 37], [2.0, 38], [4.0, 39]] },
  { id: "C16", title: "Hello, world", durationSec: 16.0, transition: "focus", weekKeys: [[0.75, 40]], trackerHide: [[4.0, 99]] },
] as const satisfies readonly ChapterSpec[];

export type ChapterId = (typeof CHAPTERS)[number]["id"];

export const CHAPTER_IDS: ChapterId[] = CHAPTERS.map((c) => c.id);

const BY_ID = new Map<string, ChapterSpec>(CHAPTERS.map((c) => [c.id, c]));

export const chapterSpec = (id: ChapterId | string): ChapterSpec => {
  const c = BY_ID.get(id);
  if (!c) throw new Error(`Unknown chapter "${id}". Known: ${CHAPTER_IDS.join(", ")}`);
  return c;
};

export const chapterFrames = (id: ChapterId | string) => Math.round(chapterSpec(id).durationSec * FPS);

/** Frames this chapter overlaps the previous one (0 for "cut" and for the first chapter). */
export const overlapIn = (id: ChapterId | string) => {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return i > 0 && chapterSpec(id).transition !== "cut" ? LONG_TRANSITION : 0;
};

/** Global start frame of every chapter, accounting for transition overlaps. */
export const LONG_START: Record<ChapterId, number> = (() => {
  const out = {} as Record<ChapterId, number>;
  let t = 0;
  for (const c of CHAPTERS) {
    const frames = chapterFrames(c.id);
    if (frames < 2 * LONG_TRANSITION + 1) throw new Error(`${c.id} is too short for its transitions`);
    t -= overlapIn(c.id);
    out[c.id] = t;
    t += frames;
  }
  return out;
})();

const last = CHAPTERS[CHAPTERS.length - 1];

/** Length of the whole long film in frames. */
export const LONG_TOTAL = LONG_START[last.id] + chapterFrames(last.id);

export const toGlobalFrame = (id: ChapterId, localSec: number) =>
  LONG_START[id] + Math.round(localSec * FPS);

export const toGlobalSec = (id: ChapterId, localSec: number) => LONG_START[id] / FPS + localSec;
