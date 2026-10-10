// Faint fluid swirls at the mouth during the practice breaths: soft, blurred
// currents fanning out from the lips, drawn in on each inhale (they shorten
// toward the mouth while a brighter sheen slides inward) and eased back out on
// the exhale, with one slow eddy curling at the far end. Liquid only: soft
// streams, never bubbles, dots or crisp squiggles. LOCAL px (translate(BABY)).
import React from "react";
import { C } from "../../../theme/colors";
import { tween } from "../../../lib/ease";
import { BabyState, Pt } from "./baby";
import { BEATS as B } from "./beats";
import { breatheAt } from "./motion";

// streams: angle off the outflow direction, length, bend, opacity
const LINES = [
  { ang: -9, len: 120, bend: -0.12, o: 0.5 },
  { ang: 4, len: 150, bend: 0.08, o: 0.42 },
  { ang: 17, len: 112, bend: 0.17, o: 0.34 },
];

const rot = (v: Pt, deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  return { x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) };
};
const f1 = (n: number) => n.toFixed(1);

const stream = (o: Pt, dir: Pt, len: number, bend: number, wob: number) => {
  const n = { x: -dir.y, y: dir.x };
  const pts: Pt[] = [];
  for (let k = 0; k <= 14; k++) {
    const t = k / 14;
    const side = len * (bend * Math.sin(Math.PI * t * 0.9) + 0.035 * wob * Math.sin(t * 5));
    pts.push({ x: o.x + dir.x * len * t + n.x * side, y: o.y + dir.y * len * t + n.y * side });
  }
  return pts.map((p, k) => `${k ? "L" : "M"}${f1(p.x)},${f1(p.y)}`).join(" ");
};

export const MouthSwirls: React.FC<{ f: number; b: BabyState }> = ({ f, b }) => {
  const env = tween(f, B.breatheIn - 4, B.breatheIn + 12) * (1 - tween(f, B.breathePause - 4, B.pauseHold));
  if (env <= 0.002) return null;
  const { a } = b;
  // outflow: from the ear through the lips, turned to pass under the hand
  const dx = a.mouth.x - a.ear.x;
  const dy = a.mouth.y - a.ear.y;
  const dl = Math.hypot(dx, dy) || 1;
  const out = rot({ x: dx / dl, y: dy / dl }, 56);
  const lips: Pt = { x: a.mouth.x + out.x * 4, y: a.mouth.y + out.y * 4 };
  const br = breatheAt(f);
  const reach = 0.62 + 0.38 * (1 - br); // drawn in toward the mouth on the inhale
  // the sheen slides inward while breathing in, outward while breathing out
  const sheen = 0.78 - 0.62 * br;
  const mid = rot(out, 4);
  const ed = { x: lips.x + mid.x * 150 * reach, y: lips.y + mid.y * 150 * reach };
  const er = 24 + 8 * (1 - br);
  const spin = f * 0.045;
  const eddy = Array.from({ length: 19 }, (_, k) => {
    const t = k / 18;
    const th = spin + t * Math.PI * 1.7;
    const rr = er * (1 - 0.55 * t);
    return `${k ? "L" : "M"}${f1(ed.x + Math.cos(th) * rr)},${f1(ed.y + Math.sin(th) * rr)}`;
  }).join(" ");
  return (
    <g opacity={env} fill="none" strokeLinecap="round">
      <defs>
        <filter id="c14-swsoft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={2.6} />
        </filter>
      </defs>
      <g filter="url(#c14-swsoft)">
        {LINES.map((l, i) => {
          const d = stream(lips, rot(out, l.ang), l.len * reach, l.bend, Math.sin(f * 0.05 + i * 1.7));
          return (
            <g key={i}>
              <path d={d} stroke={C.skin} strokeOpacity={l.o * 0.55} strokeWidth={7} />
              <path d={d} pathLength={1} strokeDasharray="0.3 1.4" strokeDashoffset={-(sheen - 0.15 + 0.05 * i)} stroke={C.text} strokeOpacity={l.o * 1.3} strokeWidth={4.5} />
            </g>
          );
        })}
        <path d={eddy} stroke={C.skin} strokeOpacity={0.3} strokeWidth={6} />
      </g>
    </g>
  );
};
