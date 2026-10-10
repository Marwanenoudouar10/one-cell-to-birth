/**
 * Week timeline of the long film, derived from CHAPTERS[].weekKeys.
 *
 *   WEEK_KEYS            [globalFrame, week][] sorted, strictly increasing frames
 *   weekAt(frame)        fractional week at a GLOBAL frame (eased between keys, clamped)
 *   weekAtLocal(id, f)   same, from a chapter-local frame (handy inside a chapter)
 *   dayNumber(w)         gestational day, round(w * 7) (day 14 = fertilisation); keys the stage chip
 *   isDayMode(w)         always false: the long film never shows "DAY nn"
 *   weekNumber(w)        COMPLETED gestational weeks the tracker shows: max(1, floor(w))
 *   weekLabel(w)         "WEEK 12" (the tracker's text)
 * Week convention (storyboard rule 2): "week N" = N completed weeks, as pregnancy apps count.
 * A weekKey [t, 13] therefore flips the label to 13 exactly at t; the odometer lands ~0.45 s later.
 *   chapterWeekRange(id) [minWeek, maxWeek] the tracker passes through during a chapter
 */
import { interpolate } from "remotion";
import { EASE } from "../../lib/ease";
import { CHAPTERS, ChapterId, chapterFrames, toGlobalFrame } from "../chapters";

export type WeekKey = [frame: number, week: number];

const buildKeys = (): WeekKey[] => {
  const raw: WeekKey[] = [];
  for (const c of CHAPTERS) {
    for (const [s, w] of c.weekKeys) raw.push([toGlobalFrame(c.id, s), w]);
  }
  raw.sort((a, b) => a[0] - b[0]);
  // Same frame twice (overlapping chapters): the later chapter wins.
  const out: WeekKey[] = [];
  for (const k of raw) {
    if (out.length && out[out.length - 1][0] === k[0]) out[out.length - 1] = k;
    else out.push(k);
  }
  if (out.length === 0) out.push([0, 0]);
  if (out.length === 1) out.push([out[0][0] + 1, out[0][1]]);
  return out;
};

export const WEEK_KEYS: WeekKey[] = buildKeys();

const KF = WEEK_KEYS.map(([f]) => f);
const KW = WEEK_KEYS.map(([, w]) => w);

export const weekAt = (frame: number) =>
  interpolate(frame, KF, KW, {
    easing: EASE.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const weekAtLocal = (id: ChapterId, localFrame: number) =>
  weekAt(toGlobalFrame(id, 0) + localFrame);

const EPS = 1e-6; // float slack, so 2 + 7/7 still counts as week 3

export const dayNumber = (w: number) => Math.max(0, Math.round(w * 7));
export const isDayMode = (_w: number) => false;
export const weekNumber = (w: number) => Math.max(1, Math.floor(w + EPS));

const pad = (n: number) => String(n).padStart(2, "0");
export const weekLabel = (w: number) => `WEEK ${pad(weekNumber(w))}`;

/** Weeks the tracker actually passes through while this chapter is on screen. */
const rangeCache = new Map<string, [number, number]>();
export const chapterWeekRange = (id: ChapterId): [number, number] => {
  const hit = rangeCache.get(id);
  if (hit) return hit;
  const start = toGlobalFrame(id, 0);
  const end = start + chapterFrames(id);
  let lo = Infinity;
  let hi = -Infinity;
  for (let f = start; f <= end; f += 2) {
    const w = weekAt(f);
    lo = Math.min(lo, w);
    hi = Math.max(hi, w);
  }
  rangeCache.set(id, [lo, hi]);
  return [lo, hi];
};
