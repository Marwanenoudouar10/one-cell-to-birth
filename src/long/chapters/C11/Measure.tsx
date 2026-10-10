// The measuring line (a graphic, no numbers): a fine warm-white thread draws
// from the crown down the back to the bottom (crown-rump). At week 20 a gold
// caliper runs on from the bottom to the knee and down to the heel (crown-
// heel), then one glint sweeps the whole line crown -> heel. It explains the
// chip's jump in length without words. Fetus-local px (same as <Fetus>).
import React from "react";
import { C } from "../../../theme/colors";
import type { P2 } from "./timeline";
import { Guides, cut, lengths, segment, toD } from "./guides";

const TICK_GAP = 30;

// small perpendicular ruler ticks along a sampled curve
const tickMarks = (pts: P2[], half: number) => {
  const L = lengths(pts);
  const out: string[] = [];
  for (let s = TICK_GAP * 0.5; s < L[L.length - 1] - 6; s += TICK_GAP) {
    let i = 1;
    while (i < pts.length - 1 && L[i] < s) i++;
    const k = (s - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
    const a = pts[i - 1];
    const b = pts[i];
    const p = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const n = { x: -(b.y - a.y) / l, y: (b.x - a.x) / l };
    out.push(`M${(p.x - n.x * half).toFixed(1)},${(p.y - n.y * half).toFixed(1)}L${(p.x + n.x * half).toFixed(1)},${(p.y + n.y * half).toFixed(1)}`);
  }
  return out.join("");
};

type Props = { g: Guides; cr: number; heel: number; sweep: number; alpha: number };

export const Measure: React.FC<Props> = ({ g, cr, heel, sweep, alpha }) => {
  if (alpha < 0.01 || cr < 0.002) return null;
  const A = cut(g.backPts, cr);
  const H = heel > 0.002 ? cut(g.legPts, heel) : null;
  const tip = H ? H.tip : A.tip;
  const dA = toD(A.pts);
  const dH = H ? toD(H.pts) : "";
  // end bar across the crown
  const p0 = g.backPts[0];
  const p1 = g.backPts[2];
  const l = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1;
  const n = { x: -(p1.y - p0.y) / l, y: (p1.x - p0.x) / l };
  const bar = `M${p0.x - n.x * 11},${p0.y - n.y * 11}L${p0.x + n.x * 11},${p0.y + n.y * 11}`;
  // the knee joint lights once the caliper has passed it
  const legL = lengths(g.legPts);
  const kneeOn = H ? Math.max(0, Math.min(1, (heel * legL[2] - legL[1]) / 10)) : 0;
  const done = heel >= 0.999;
  // one glint over the full line, crown -> heel
  const all = [...g.backPts, ...g.legPts];
  const allL = lengths(all);
  const sw = sweep > 0 && sweep < 1 ? segment(all, sweep * allL[allL.length - 1] - 70, sweep * allL[allL.length - 1] + 40) : [];
  const lock = done ? Math.sin(Math.PI * Math.min(1, sweep * 1.15)) : 0;
  return (
    <g opacity={alpha} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <filter id="c11-mglow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {/* soft dark under-line so the thread reads over the bright skin */}
      <path d={dA} stroke={C.wombDeep} strokeOpacity={0.3} strokeWidth={7} />
      {H && <path d={dH} stroke={C.wombDeep} strokeOpacity={0.5} strokeWidth={9} />}
      <g filter="url(#c11-mglow)">
        <path d={dA} stroke={C.peach} strokeOpacity={0.55} strokeWidth={7} />
        {H && <path d={dH} stroke={C.gold} strokeOpacity={1} strokeWidth={14} />}
        <circle cx={tip.x} cy={tip.y} r={16 + 10 * lock} fill={H ? C.gold : C.peach} opacity={0.75 + 0.25 * lock} />
        {sw.length > 1 && <path d={toD(sw)} stroke={C.gold} strokeWidth={14} strokeOpacity={0.9} />}
      </g>
      <path d={dA} stroke={C.text} strokeOpacity={0.92} strokeWidth={2.6} />
      <path d={tickMarks(A.pts, 4)} stroke={C.text} strokeOpacity={0.55} strokeWidth={1.6} />
      <path d={bar} stroke={C.text} strokeOpacity={0.95} strokeWidth={2.6} />
      {H && (
        <>
          <path d={dH} stroke={C.gold} strokeWidth={4.2} />
          <path d={tickMarks(H.pts, 4.5)} stroke={C.gold} strokeOpacity={0.85} strokeWidth={1.8} />
        </>
      )}
      {sw.length > 1 && <path d={toD(sw)} stroke={C.text} strokeWidth={3} strokeOpacity={0.9} />}
      {kneeOn > 0 && <circle cx={g.knee.x} cy={g.knee.y} r={4.5 * kneeOn} fill={C.gold} stroke={C.text} strokeWidth={1.4} />}
      <circle cx={tip.x} cy={tip.y} r={5.5 + 1.5 * lock} fill={C.text} stroke="none" />
    </g>
  );
};
