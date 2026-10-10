// The soft rhythm line beside the chest (a graphic, not text): a fixed,
// softly tapered wave line in the fluid just off the baby's back at chest
// level. It lies level until the breathing starts; each practice breath then
// rises out of the chest end as a soft hump and drifts away along the line,
// so the two breaths read as two travelling humps. On "Not yet." the line
// relaxes level (a normal pause), holds, then fades. No head bead, so it
// never reads as a swimming shape. LOCAL px (inside the translate(BABY) group).
import React from "react";
import { C } from "../../../theme/colors";
import { BabyState, Pt } from "./baby";
import { BEATS as B } from "./beats";
import { rhythmAt, rhythmEnv } from "./motion";

const N = 48; // samples along the line
const U = 0.3; // spine position of the chest
const GAP = 22; // px out from the back surface to the chest end
const LEN = 210; // px of line
const SPEED = 2.7; // px per frame a breath hump drifts away from the chest
const AMP = 32; // px a full inhale lifts the line

// smooth open curve through points (midpoint quadratic chain)
const smoothLine = (p: Pt[]) => {
  let d = `M${p[0].x.toFixed(1)},${p[0].y.toFixed(1)}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i].x + p[i + 1].x) / 2;
    const my = (p[i].y + p[i + 1].y) / 2;
    d += ` Q${p[i].x.toFixed(1)},${p[i].y.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  const l = p[p.length - 1];
  return `${d} L${l.x.toFixed(1)},${l.y.toFixed(1)}`;
};

export const RhythmLine: React.FC<{ f: number; b: BabyState }> = ({ f, b }) => {
  const env = rhythmEnv(f);
  if (env <= 0.002) return null;
  const sp = b.geo.sp;
  const o = b.fr.toOut;
  const back = o(sp.pos(U, -1));
  const front = o(sp.pos(U, 1));
  const nl = Math.hypot(back.x - front.x, back.y - front.y) || 1;
  // outward from the back, levelled toward the horizontal so it reads as a line
  const nx = (back.x - front.x) / nl;
  const ny = ((back.y - front.y) / nl) * 0.35;
  const ll = Math.hypot(nx, ny) || 1;
  const n = { x: nx / ll, y: ny / ll };
  const up = { x: n.y * Math.sign(n.x || 1), y: -Math.abs(n.x) };
  const now = { x: back.x + n.x * GAP, y: back.y + n.y * GAP };
  const pts: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const along = (LEN * i) / N;
    const v = Math.max(0, rhythmAt(f - along / SPEED));
    pts.push({ x: now.x + n.x * along + up.x * AMP * v, y: now.y + n.y * along + up.y * AMP * v });
  }
  const head = pts[0];
  const tail = pts[pts.length - 1];
  const d = smoothLine(pts);
  return (
    <g opacity={env}>
      <defs>
        <filter id="c14-rglow" filterUnits="userSpaceOnUse" x={-700} y={-700} width={1400} height={1400}>
          <feGaussianBlur stdDeviation={6} />
        </filter>
        <linearGradient id="c14-rgrad" gradientUnits="userSpaceOnUse" x1={head.x} y1={head.y} x2={tail.x} y2={tail.y}>
          <stop offset="0%" stopColor={C.text} stopOpacity={0} />
          <stop offset="16%" stopColor={C.text} stopOpacity={0.95} />
          <stop offset="55%" stopColor={C.skin} stopOpacity={0.85} />
          <stop offset="100%" stopColor={C.peach} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={d} stroke="url(#c14-rgrad)" strokeWidth={16} strokeLinecap="round" fill="none" filter="url(#c14-rglow)" opacity={0.7} />
      <path d={d} stroke="url(#c14-rgrad)" strokeWidth={4.5} strokeLinecap="round" fill="none" />
    </g>
  );
};
