import React from "react";
import { C } from "../../../theme/colors";

// The signal that runs down the spinal cord just before a move (the first movements
// are made by spinal circuits). A comet, not a capsule: stacked dashes that share one
// leading point, so it is brightest at the head and fades along a tail behind it.
// Drawn inside the body clip, in the embryo's design units (BendEmbryo scales them).
// `at` 0 (neck) .. 1 (past the tail tip); `amount` 0..1.
const MAX_TAIL = 0.26; // longest dash, as a fraction of the spine length
const STEPS = [0.06, 0.12, 0.19, MAX_TAIL];
const PASSES = [
  { w: 22, o: 0.09, color: C.cellCyan }, // soft halo
  { w: 11, o: 0.2, color: C.cellCyan },
  { w: 5.5, o: 0.42, color: C.cell }, // core (~10 px on screen at the close-up)
];

export const SpinalSpark: React.FC<{ d: string; at: number; amount: number }> = ({ d, at, amount }) => {
  const head = at * (1 + MAX_TAIL);
  return (
    <g style={{ mixBlendMode: "screen" }}>
      {PASSES.map((p, i) =>
        STEPS.map((len, j) => (
          <path
            key={`${i}-${j}`}
            d={d}
            pathLength={1}
            fill="none"
            stroke={p.color}
            strokeOpacity={p.o * amount}
            strokeWidth={p.w}
            strokeLinecap="round"
            strokeDasharray={`${len} 3`}
            strokeDashoffset={-(head - len)}
          />
        )),
      )}
    </g>
  );
};
