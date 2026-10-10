// Soft motion arcs: tapered light swooshes that trail the crown and the rump
// along the path they just swept (about the C's centre), only while they move.
// World px, drawn inside a <WombLayer>.
import React from "react";
import { C } from "../../../theme/colors";
import { Pt, smoothPath } from "./world/geometry";
import { PosedAnchors } from "./pose";

type Part = { now: Pt; then: Pt };
// `zoom` = the camera zoom: arcs live in world px, so they are thickened as the camera
// pulls back to keep the same on-screen weight (the wide-shot flick stays readable).
type Props = { pivot: Pt; parts: Part[]; speed: number; zoom: number; soft?: boolean };
const REF_ZOOM = 1.44; // the close-up the arcs were designed at

// 0 at the mount threshold (index.tsx mounts the arcs above speed 0.02), so they never pop
export const arcFade = (speed: number) => Math.min(1, Math.max(0, (speed - 0.03) / 0.6));

const ang = (p: Pt, c: Pt) => Math.atan2(p.y - c.y, p.x - c.x);
const unwrap = (a: number, ref: number) => {
  let x = a;
  while (x - ref > Math.PI) x -= 2 * Math.PI;
  while (x - ref < -Math.PI) x += 2 * Math.PI;
  return x;
};

// Crescent along a circle (centre c, radius r) from a0 to a1, thin at the
// trailing end and fattest just behind the leading end.
const crescent = (c: Pt, r: number, a0: number, a1: number, w: number) => {
  const n = 16;
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = a0 + (a1 - a0) * u;
    const hw = w * Math.pow(u, 1.4) * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.92 + 0.04)), 0.5);
    outer.push({ x: c.x + Math.cos(a) * (r + hw), y: c.y + Math.sin(a) * (r + hw) });
    inner.push({ x: c.x + Math.cos(a) * (r - hw), y: c.y + Math.sin(a) * (r - hw) });
  }
  return smoothPath([...outer, ...inner.reverse()], true);
};

const LINES = [
  { ofs: 22, w: 5.8, len: 1, o: 0.6, color: C.skin },
  { ofs: 44, w: 4, len: 0.7, o: 0.32, color: C.peach },
];

// `soft` draws the wide glow pass (put it in a blurred <WombLayer> under the crisp one).
export const MotionArcs: React.FC<Props> = ({ pivot, parts, speed, zoom, soft }) => {
  const fade = arcFade(speed);
  const k = Math.pow(REF_ZOOM / zoom, 0.65);
  return (
    <g style={{ mixBlendMode: "screen" }}>
      {parts.map((p, i) => {
        const a1 = ang(p.now, pivot);
        const a0 = unwrap(ang(p.then, pivot), a1);
        const sweep = a1 - a0;
        // each part's trail also fades with its own sweep, so a slowing part never pops off
        const own = Math.min(1, Math.max(0, (Math.abs(sweep) - 0.004) / 0.04));
        if (own <= 0) return null;
        const r = Math.hypot(p.now.x - pivot.x, p.now.y - pivot.y);
        // stylised: the swoosh is longer than the true path so it reads at phone size
        const span = Math.sign(sweep) * Math.min(0.7, Math.abs(sweep) * 2.6 + 0.14);
        const lead = a1 - Math.sign(sweep) * 0.05;
        return LINES.map((l, j) => (
          <path
            key={`${i}-${j}`}
            d={crescent(pivot, r + l.ofs * k, lead - span * l.len, lead - span * 0.08 * j, (soft ? l.w * 4.2 : l.w) * k)}
            fill={soft ? C.peach : l.color}
            opacity={(soft ? 0.62 : l.o) * fade * own}
          />
        ));
      })}
    </g>
  );
};

export const arcParts = (now: PosedAnchors, then: PosedAnchors): Part[] => [
  { now: now.crown, then: then.crown },
  { now: now.tail, then: then.tail },
];
