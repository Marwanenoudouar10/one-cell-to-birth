/**
 * What the size chip says before week 4 (no fruit comparison yet): the stage.
 * Fact-checked stage table from briefs/long/storyboard.md ("Stage chip, weeks 1 to 3").
 * Keyed by GESTATIONAL day = round(week * 7) (lib/weeks dayNumber), where day 0 is the
 * first day of the last period and day 14 is fertilisation. From week 4 on the chip reads
 * data/sizes.ts instead.
 *
 *   day     first gestational day this stage is shown
 *   stage   main words, bright           e.g. "morula"
 *   detail  optional dim suffix after ·  e.g. "0.1 mm"
 *
 * Week 1 must read "last period · the count starts", never "no baby yet" (storyboard rule 5).
 */
export type StageRow = { day: number; stage: string; detail?: string };

export const STAGES: StageRow[] = [
  { day: 0, stage: "last period", detail: "the count starts" }, // C02
  { day: 14, stage: "one cell", detail: "0.1 mm" }, // C02
  { day: 15, stage: "dividing", detail: "0.1 mm" }, // C03
  { day: 18, stage: "morula", detail: "0.1 mm" }, // C03, C04
  { day: 19, stage: "hollow ball", detail: "0.1–0.2 mm" }, // C04
  { day: 21, stage: "implanting", detail: "0.1–0.2 mm" }, // C04
];

/** Stage for a gestational day: the last row whose day <= day (the first row before it). */
export const stageForDay = (day: number, rows: readonly StageRow[] = STAGES): StageRow => {
  let best = rows[0];
  for (const r of rows) if (r.day <= day && r.day >= best.day) best = r;
  return best;
};
