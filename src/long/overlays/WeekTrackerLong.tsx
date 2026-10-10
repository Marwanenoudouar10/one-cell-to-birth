/**
 * Week tracker for the long film. Same look as src/overlays/WeekTracker.tsx (mono week
 * label left, "40 WEEKS" right, thin rose->gold bar with a glowing dot) plus a size chip
 * under the bar ("size of a lime · 5.4 cm"; the stage before week 4).
 *
 *   <WeekTrackerLong />                       everything from CHAPTERS + data tables
 *   <WeekTrackerLong showWeight />            chip also shows weight ("· 14 g")
 * Props (all optional):
 *   weekAt(globalFrame) -> week   default: lib/weeks weekAt (CHAPTERS[].weekKeys)
 *   opacityAt(globalFrame) -> 0..1 default: start fade-in + CHAPTERS[].trackerHide windows
 *   sizes / stages                default: data/sizes SIZES, data/stages STAGES
 *   totalFrames                   frames to precompute the chip schedule for (LONG_TOTAL)
 *   showWeight                    default false
 * useCurrentFrame() must be the GLOBAL film frame: mount it at film level, or inside
 * <Sequence from={-LONG_START[id]}> in a chapter preview. Occupies y ~138..262.
 */
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../theme/colors";
import { MONO } from "../../theme/fonts";
import { TRACKER_Y } from "../../theme/layout";
import { LONG_TOTAL } from "../chapters";
import { SIZES, SizeRow } from "../data/sizes";
import { STAGES, StageRow } from "../data/stages";
import { weekAt as defaultWeekAt } from "../lib/weeks";
import { ChipSeg, buildChipSchedule } from "./tracker/chipSchedule";
import { TrackerLabel } from "./tracker/Label";
import { SizeChip } from "./tracker/SizeChip";
import { trackerOpacity } from "./tracker/visibility";

export type WeekTrackerLongProps = {
  weekAt?: (globalFrame: number) => number;
  opacityAt?: (globalFrame: number) => number;
  sizes?: readonly SizeRow[];
  stages?: readonly StageRow[];
  totalFrames?: number;
  showWeight?: boolean;
};

const L = 90;
const R = 990;
export const CHIP_TOP = TRACKER_Y + 26;

const cache = new Map<string, ChipSeg[]>();
const scheduleFor = (
  weekAt: (f: number) => number,
  total: number,
  sizes: readonly SizeRow[],
  stages: readonly StageRow[],
  showWeight: boolean,
) => {
  const isDefault = weekAt === defaultWeekAt && sizes === SIZES && stages === STAGES;
  const key = `${total}|${showWeight}`;
  if (isDefault && cache.has(key)) return cache.get(key)!;
  const segs = buildChipSchedule(weekAt, total, { sizes, stages, showWeight });
  if (isDefault) cache.set(key, segs);
  return segs;
};

export const WeekTrackerLong: React.FC<WeekTrackerLongProps> = ({
  weekAt = defaultWeekAt,
  opacityAt = trackerOpacity,
  sizes = SIZES,
  stages = STAGES,
  totalFrames = LONG_TOTAL,
  showWeight = false,
}) => {
  const frame = useCurrentFrame();
  const segs = useMemo(
    () => scheduleFor(weekAt, totalFrames, sizes, stages, showWeight),
    [weekAt, totalFrames, sizes, stages, showWeight],
  );
  const opacity = opacityAt(frame);
  if (opacity < 0.002) return null;

  const p = Math.min(1, Math.max(0, weekAt(frame) / 40));
  const x = L + (R - L) * p;

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: TRACKER_Y - 52,
          left: L,
          right: 1080 - R,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 4,
          lineHeight: "40px",
          color: C.text,
        }}
      >
        <TrackerLabel frame={frame} weekAt={weekAt} />
        <span style={{ color: C.textDim, fontWeight: 500 }}>40 WEEKS</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: TRACKER_Y,
          left: L,
          width: R - L,
          height: 4,
          borderRadius: 2,
          background: "rgba(255,255,255,0.14)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: TRACKER_Y,
          left: L,
          width: x - L,
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${C.rose}, ${C.gold})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: TRACKER_Y + 2 - 9,
          left: x - 9,
          width: 18,
          height: 18,
          borderRadius: 9,
          background: C.gold,
          boxShadow: `0 0 18px 6px ${C.gold}88`,
        }}
      />
      <SizeChip frame={frame} segs={segs} left={L} top={CHIP_TOP} />
    </AbsoluteFill>
  );
};
