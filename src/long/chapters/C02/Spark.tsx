// "Day 14 is this cell": when the count lands, a gold spark lifts off dot 14
// and arcs up into the zygote's zona, leaving a faint thread that ties the
// day row to the cell for a moment. Arrival (BEATS.cellLit) lights the cell
// (motion.ts: echoAt / echoRing / zonaGlint). A graphic, no labels.
// World px (zygote plane, inside the camera group).
import React from "react";
import { EASE, tween } from "../../../lib/ease";
import { C } from "../../../theme/colors";
import { BEATS as B } from "./beats";
import { DOT_Y, LAST, dotX } from "./DayDots";
import { CX, CY, ENTRY_DEG, P2, ZR, breathAt, polar } from "./motion";

// [path length behind the head, width px, colour, opacity]
const STREAK: [number, number, string, number][] = [
  [0.34, 2, C.gold, 0.4],
  [0.2, 4.5, C.gold, 0.5],
  [0.1, 8, C.text, 0.75],
];
const THREAD = 28;

// cubic bezier: straight up off the dot, then a curve that meets the zona
// head-on (radially), so it reads as "into the cell"
const pathAt = (f: number) => {
  const p0 = { x: dotX(LAST), y: DOT_Y - 6 };
  const e = polar(ZR * breathAt(f) - 1, ENTRY_DEG);
  const p3 = { x: CX + e.x, y: CY + e.y };
  const out = polar(1, ENTRY_DEG);
  const c1 = { x: p0.x + 4, y: p0.y - 105 };
  const c2 = { x: p3.x + out.x * 95, y: p3.y + out.y * 95 };
  return (t: number): P2 => {
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    return { x: a * p0.x + b * c1.x + c * c2.x + d * p3.x, y: a * p0.y + b * c1.y + c * c2.y + d * p3.y };
  };
};

const fmt = (p: P2) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;

export const Spark: React.FC<{ f: number }> = ({ f }) => {
  const leave = B.conception + 1;
  if (f < leave || f > B.endHold + 2) return null;
  const at = pathAt(f);
  const t = tween(f, leave, B.cellLit, [0, 1], EASE.inOut);
  const head = at(t);
  // the head is born from the flare, then sinks into the zona on arrival
  const headOp = tween(f, leave, leave + 2) * (1 - tween(f, B.cellLit - 1, B.cellLit + 2));
  const threadOp = 0.34 * tween(f, leave, leave + 3) * (1 - tween(f, B.dotsFade + 4, B.endHold, [0, 1], EASE.inOut));
  const thread = Array.from({ length: THREAD + 1 }, (_, k) => at((k / THREAD) * t));
  return (
    <g>
      <defs>
        <radialGradient id="c02-spark">
          <stop offset={0} stopColor={C.text} stopOpacity={1} />
          <stop offset={0.2} stopColor={C.gold} stopOpacity={0.75} />
          <stop offset={0.55} stopColor={C.gold} stopOpacity={0.18} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      {threadOp > 0.005 && t > 0.01 && (
        <path
          d={`M${thread.map(fmt).join("L")}`}
          fill="none"
          stroke={C.gold}
          strokeOpacity={threadOp}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {headOp > 0.01 && (
        <g opacity={headOp}>
          {/* tapered streak: nested strokes (long thin gold -> short thick white),
              each one path, so no beading where segments overlap */}
          {STREAK.map(([len, w, col, o], k) => {
            const pts = Array.from({ length: 9 }, (_, j) => at(Math.max(0, t - (j / 8) * len * Math.min(1, t * 4))));
            return <path key={k} d={`M${pts.map(fmt).join("L")}`} fill="none" stroke={col} strokeOpacity={o} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
          })}
          <circle cx={head.x} cy={head.y} r={46} fill="url(#c02-spark)" />
          <circle cx={head.x} cy={head.y} r={7} fill={C.text} />
        </g>
      )}
    </g>
  );
};
