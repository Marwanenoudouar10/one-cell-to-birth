/**
 * What the size chip says, and WHEN it changes, precomputed for the whole film.
 *
 *   chipFor(week, opts)            Chip for a fractional week, in COMPLETED weeks (floor, same as
 *                                  the label): stage text (by gestational day) before week 4,
 *                                  "size of a lime · 5.4 cm" from week 4 on.
 *   buildChipSchedule(weekAt, ...) ChipSeg[]: settled texts with [start, end) global frames.
 *
 * Calm rule: a text is only shown if the tracker rests on it for >= minHold frames.
 * During a fast multi-week tick the in-between texts are skipped; if the skipped stretch
 * is long (>= collapseGap) the chip folds away and returns with the destination text,
 * otherwise the old text simply hands over to the destination when the number lands.
 */
import { SizeRow, sizeForWeek, splitArticle } from "../../data/sizes";
import { StageRow, stageForDay } from "../../data/stages";
import { dayNumber, weekNumber } from "../../lib/weeks";

export type ChipTone = "dim" | "bright" | "num";
export type ChipPart = { text: string; tone: ChipTone };
export type Chip = { key: string; parts: ChipPart[] };
export type ChipSeg = { start: number; end: number; chip: Chip };

export type ChipOptions = {
  sizes: readonly SizeRow[];
  stages: readonly StageRow[];
  showWeight: boolean;
};

const trim = (s: string) => s.replace(/\.0$/, "");

export const formatLength = (cm: number) => {
  if (cm < 1) {
    const mm = cm * 10;
    return `${trim(mm.toFixed(mm < 10 ? 1 : 0))} mm`;
  }
  return `${trim(cm.toFixed(1))} cm`;
};

export const formatWeight = (g: number) =>
  g < 1000 ? `${trim(g < 10 ? g.toFixed(1) : String(Math.round(g)))} g` : `${trim((g / 1000).toFixed(1))} kg`;

/** Article + noun, never doubled: a row whose compare still starts with "a "/"an " is split here too. */
const nounOf = (row: SizeRow): [string, string] => {
  const [own, rest] = splitArticle(row.compare);
  const art = row.article ?? own ?? (/^[aeiou]/i.test(rest) ? "an" : "a");
  return [art, rest];
};

export const chipFor = (week: number, o: ChipOptions): Chip => {
  const shown = weekNumber(week); // floor(week + 1e-6): completed weeks
  if (shown < 4) {
    const st = stageForDay(dayNumber(week), o.stages);
    const parts: ChipPart[] = [{ text: st.stage, tone: "bright" }];
    if (st.detail) parts.push({ text: `  ·  ${st.detail}`, tone: "dim" });
    return { key: `stage:${st.day}`, parts };
  }
  const row = sizeForWeek(shown, o.sizes);
  const [art, noun] = nounOf(row);
  const parts: ChipPart[] = [
    { text: `size of ${art ? `${art} ` : ""}`, tone: "dim" },
    { text: noun, tone: "bright" },
    { text: "  ·  ", tone: "dim" },
    { text: formatLength(row.lengthCm), tone: "num" },
  ];
  if (o.showWeight && row.weightG > 0) {
    parts.push({ text: "  ·  ", tone: "dim" }, { text: formatWeight(row.weightG), tone: "num" });
  }
  return { key: `size:${row.week}`, parts };
};

export const buildChipSchedule = (
  weekAt: (frame: number) => number,
  totalFrames: number,
  o: ChipOptions,
  minHold = 22,
  collapseGap = 20,
): ChipSeg[] => {
  const runs: ChipSeg[] = [];
  for (let f = 0; f < totalFrames; f++) {
    const chip = chipFor(weekAt(f), o);
    const last = runs[runs.length - 1];
    if (last && last.chip.key === chip.key) last.end = f + 1;
    else runs.push({ start: f, end: f + 1, chip });
  }
  const shown = runs.filter((r, i) => i === 0 || i === runs.length - 1 || r.end - r.start >= minHold);
  const segs: ChipSeg[] = [];
  for (const r of shown) {
    const prev = segs[segs.length - 1];
    if (prev && prev.chip.key === r.chip.key) {
      prev.end = r.end;
      continue;
    }
    if (prev && r.start - prev.end < collapseGap) prev.end = r.start;
    segs.push({ ...r });
  }
  // The last text holds forever (previews and frames past the end).
  if (segs.length) segs[segs.length - 1].end = Number.POSITIVE_INFINITY;
  return segs;
};

/** The settled segment containing `frame`, or null while the chip is folded away. */
export const segAt = (segs: readonly ChipSeg[], frame: number): ChipSeg | null => {
  for (const s of segs) if (frame >= s.start && frame < s.end) return s;
  return null;
};
