// The hero hand, in HAND-LOCAL units: origin = palm centre, +x = along the
// fingers, 1 = palm radius. Drawn inside the embryo's rim-light group, so the
// kit's light recipe (top-left rim, warm bounce edge) wraps it for free.
//   front per-valley web progress 0 webbed .. 1 free (recedes tip -> base)
//   rays  0..1 the five finger rays brighten (the "webbed" beat)
//   flex  per-finger 0..1 curl
import React from "react";
import { C } from "../../../theme/colors";
import { Pt, lerp, mul, rot, smoothPath } from "../../../shared/embryo/math";

const SPREAD = 96;
const BASE = 0.34;
export const TIP = [1.42, 1.72, 1.82, 1.7, 1.48]; // finger-pad centres, thumb first
const FW = [0.22, 0.21, 0.21, 0.2, 0.19]; // half widths
const WEB_R = [1.3, 1.6, 1.6, 1.36]; // web edge between fingers while webbed (shallow scallops)
const FREE_R = 0.95; // web edge once free (short, stubby fingers)

const polar = (r: number, deg: number): Pt => rot({ x: r, y: 0 }, deg);

export const fingerAngle = (i: number, flex = 0) =>
  ((i / 4 - 0.5) * SPREAD + (i === 0 ? -11 : 0)) * (1 - 0.12 * flex);

export const fingerTip = (i: number, flex = 0): Pt => polar(BASE + (TIP[i] - BASE) * (1 - 0.28 * flex), fingerAngle(i, flex));

export const valleyAngle = (j: number, flex: number[]) => (fingerAngle(j, flex[j]) + fingerAngle(j + 1, flex[j + 1])) / 2;

export const valleyR = (j: number, t: number) => lerp(WEB_R[j], FREE_R, t);

// ray segment (hand-local) for the glow layer
export const rayEnds = (i: number): [Pt, Pt] => [polar(0.45, fingerAngle(i)), polar(TIP[i] - 0.12, fingerAngle(i))];

export type HandState = { front: number[]; rays: number; flex: number[]; ang: number; uid: string };

export const Hand: React.FC<HandState> = ({ front, rays, flex, ang, uid }) => {
  const id = `${uid}-hand`;
  const light = rot({ x: -0.6, y: -0.75 }, -ang); // screen top-left, in hand coords
  const free = front.reduce((a, b) => a + b, 0) / front.length;
  const veil = 1 - free; // webbed look strength
  const pts: Pt[] = [polar(0.55, fingerAngle(0, flex[0]) - 34)];
  for (let i = 0; i < 5; i++) {
    pts.push(mul(fingerTip(i, flex[i]), 1.02));
    if (i < 4) pts.push(polar(valleyR(i, front[i]), valleyAngle(i, flex)));
  }
  pts.push(polar(0.55, fingerAngle(4, flex[4]) + 34));
  const webD = smoothPath(pts, true);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-skin`} gradientUnits="userSpaceOnUse" cx={light.x} cy={light.y} r={2.6}>
          <stop offset="0" stopColor={C.skin} />
          <stop offset="0.5" stopColor={C.peach} />
          <stop offset="1" stopColor={C.skinShade} />
        </radialGradient>
        <radialGradient id={`${id}-edge`} gradientUnits="userSpaceOnUse" cx={0.1} cy={0} r={1.95}>
          <stop offset="0.62" stopColor={C.rose} stopOpacity={0} />
          <stop offset="1" stopColor={C.rose} stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <ellipse cx={-0.2} cy={0} rx={0.86} ry={0.74} fill={`url(#${id}-skin)`} />
      <path d={webD} fill={`url(#${id}-skin)`} />
      {[0, 1, 2, 3, 4].map((i) => {
        const b = polar(BASE, fingerAngle(i, flex[i]));
        const t = fingerTip(i, flex[i]);
        const w = FW[i] * (1 + 0.12 * flex[i]);
        return (
          <g key={i}>
            <line x1={b.x} y1={b.y} x2={t.x} y2={t.y} stroke={`url(#${id}-skin)`} strokeWidth={w * 2} strokeLinecap="round" />
            {/* rounded fingertip pad */}
            <circle cx={t.x} cy={t.y} r={w * 1.08} fill={`url(#${id}-skin)`} />
            {/* the pad turns away as the finger curls */}
            <circle cx={t.x} cy={t.y} r={w * 0.9} fill={C.skinShade} opacity={0.45 * flex[i]} />
          </g>
        );
      })}
      {/* thinner, rosier tissue at the paddle rim while it is still webbed */}
      <path d={webD} fill={`url(#${id}-edge)`} opacity={0.6 * veil} />
      {/* soft grooves between the rays, where the gaps will open */}
      {[0, 1, 2, 3].map((j) => {
        const a = valleyAngle(j, flex);
        const p0 = polar(0.62, a);
        const p1 = polar(valleyR(j, front[j]) - 0.1, a);
        return <line key={`g${j}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={C.skinShade} strokeWidth={0.11} strokeLinecap="round" opacity={0.5 * veil} />;
      })}
      {/* five finger rays: raised ridges inside the webbing */}
      {[0, 1, 2, 3, 4].map((i) => {
        const [p0, p1] = rayEnds(i);
        const hl = rot({ x: 0, y: -0.06 }, fingerAngle(i));
        return (
          <g key={`r${i}`} opacity={veil * (0.6 + 0.4 * rays)}>
            <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={C.skin} strokeWidth={0.3} strokeLinecap="round" opacity={0.5} />
            <line x1={p0.x + hl.x} y1={p0.y + hl.y} x2={p1.x + hl.x} y2={p1.y + hl.y} stroke={C.text} strokeWidth={0.06} strokeLinecap="round" opacity={0.22 + 0.2 * rays} />
          </g>
        );
      })}
      {/* key-light sheen on the back of the hand + knuckle crease once free */}
      <ellipse cx={light.x * 0.3 + 0.25} cy={light.y * 0.3} rx={0.62} ry={0.22} transform={`rotate(${-ang - 35} ${light.x * 0.3 + 0.25} ${light.y * 0.3})`} fill={C.text} opacity={0.08} />
      <path d={smoothPath([1, 2, 3, 4].map((i) => polar(0.8, fingerAngle(i, flex[i]))), false)} fill="none" stroke={C.skinShade} strokeWidth={0.06} strokeLinecap="round" opacity={0.35 * free} />
    </g>
  );
};
