// C07's END state, COMPUTED from the live functions at C08's frame 0 (our BEATS.exit)
// and at our last frame. The numbers are copied as literals into beats.ts's END contract
// (C08 must not import C07); this object keeps them honest.
import { BEATS as B, DURATION } from "./beats";
import { cameraAt, pushU } from "./camera";
import {
  FOLDS_END,
  HALO_END,
  SIZE_END,
  WALL_FROZEN,
  beatClock,
  calmAt,
  headWeek,
  kitWeek,
  sacClock,
  sacWob,
  topShadeAt,
} from "./motion";

const at = (f: number) => ({
  frame: f,
  camera: cameraAt(f),
  pushU: pushU(f),
  kitWeek: kitWeek(f),
  headWeek: headWeek(f),
  size: SIZE_END,
  calm: calmAt(f),
  beatClock: beatClock(f),
  bpm: 110 * (beatClock(f + 0.5) - beatClock(f - 0.5)),
  sacClock: sacClock(f),
  sacWob: sacWob(f),
  wallFrozen: WALL_FROZEN,
  folds: FOLDS_END,
  halo: HALO_END,
  topShade: topShadeAt(f),
});

export const C07_END = { handoff: at(B.exit), last: at(DURATION - 1) };
