/**
 * Left tracker label: "WEEK 12", in completed gestational weeks (lib/weeks weekNumber).
 * The long film has no DAY mode. The number rolls like an odometer (clipped, masked).
 *
 *   <TrackerLabel frame={globalFrame} weekAt={weekAt} />
 *     frame   GLOBAL film frame
 *     weekAt  global frame -> fractional week
 * The integer week is smoothed with the ROLL kernel, so fast ticks blend into one calm roll
 * and a single step lands ~0.45 s after its weekKey.
 */
import React from "react";
import { ROLL, smoothAt } from "../../lib/smooth";
import { weekNumber } from "../../lib/weeks";
import { Odometer } from "./Odometer";

export const LABEL_LINE = 40; // px, matches JetBrains Mono 30px "normal" line height
const LS = 4; // letter-spacing of the teaser tracker label
const MASK = "linear-gradient(to bottom, transparent 0%, #000 24%, #000 76%, transparent 100%)";

export const TrackerLabel: React.FC<{ frame: number; weekAt: (f: number) => number }> = ({
  frame,
  weekAt,
}) => {
  const week = smoothAt(frame, (f) => weekNumber(weekAt(f)), ROLL);
  return (
    <div
      style={{
        position: "relative",
        width: 300,
        height: LABEL_LINE,
        lineHeight: `${LABEL_LINE}px`,
        letterSpacing: LS,
        overflow: "hidden",
        maskImage: MASK,
        WebkitMaskImage: MASK,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, whiteSpace: "pre" }}>
        <span>WEEK </span>
        <Odometer value={week} digits={2} cellH={LABEL_LINE} gap={LS} />
      </div>
    </div>
  );
};
