import { random } from "remotion";
import { LONG_TRANSITION, chapterFrames } from "../../chapters";
import { V3 } from "./geometry";
import { LAST, R_STAGE, STAGES } from "./c03lineage";
import { pitchAt, yawAt } from "./c03clock";

// C03's END, COPIED (chapters render in isolation, so never imported). During
// the fade C04 frame f is C03 frame f + C03_OFF: the morula's packing, its slow
// tumble, its membrane wobble, nucleus spots and the tube motes all carry on
// exactly where C03 leaves them. c03lineage.ts and c03clock.ts are verbatim
// copies of C03's files: re-copy them whenever C03 changes.
export const C03_OFF = chapterFrames("C03") - LONG_TRANSITION;
export const at03 = (f: number) => f + C03_OFF;

// C03 timeline.ts: slow 3D tumble (C03-local frames).
export const yaw3 = yawAt;
export const pitch3 = pitchAt;

// The cells C03's lineage packs into its final 64-cell morula.
export const CELL_R = R_STAGE[LAST];

// The 64 morula cells (cluster-local 3D px), in C03's lineage order.
export const MORULA3: V3[] = STAGES[LAST].map((c) => c.p);

// C03's cell key for lineage index i ("c" + one a/b per division).
export const key3 = (i: number) =>
  `c${i.toString(2).padStart(6, "0").replace(/0/g, "a").replace(/1/g, "b")}`;

// C03 cells.ts: seeded nucleus spot (fraction of the cell radius).
export const nucOff3 = (key: string): [number, number] => {
  const a = random(`c03nu-a-${key}`) * Math.PI * 2;
  const d = 0.06 + random(`c03nu-d-${key}`) * 0.1;
  return [Math.cos(a) * d, Math.sin(a) * d];
};

// C03 timeline.ts: the tube flow the motes ride on.
export const wallScroll3 = (f3: number, speed: number, n: (a: number, b: number) => number) =>
  speed * f3 + 30 * speed * n(f3 * 0.006, 1.3);
