import React from "react";
import { C } from "../../theme/colors";
import { n2 } from "./math";

// One sperm cell, drawn in local units where the head is 1 long and points
// along +x. Head back sits at x=0, the midpiece + tail trail toward -x.
// Proportions: oval head, short thick midpiece, tail ~10 head lengths.
export const TAIL = 10.5;
const N = 22;
const K = (2 * Math.PI) / (TAIL * 0.8); // ~1.25 waves along the tail

const halfW = (u: number) =>
  u < 1 ? 0.15 - 0.04 * u : 0.11 - 0.078 * Math.pow((u - 1) / (TAIL - 1), 0.8);

// Travelling sine wave along the flagellum: small near the head, growing
// toward the tip, moving head -> tip (that is what pushes the cell forward).
const body = (phase: number, amp: number, thick: number) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let j = 0; j <= N; j++) {
    const u = (j / N) * TAIL;
    const A = amp * (0.16 + 1.0 * Math.pow(u / TAIL, 1.3));
    xs.push(-u * (1 - 0.04 * amp));
    ys.push(A * Math.sin(K * u - phase));
  }
  const L: string[] = [];
  const Rr: string[] = [];
  for (let j = 0; j <= N; j++) {
    const a = Math.max(0, j - 1);
    const b = Math.min(N, j + 1);
    const tx = xs[b] - xs[a];
    const ty = ys[b] - ys[a];
    const tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl;
    const ny = tx / tl;
    const w = halfW((j / N) * TAIL) * thick;
    L.push(`${n2(xs[j] + nx * w)},${n2(ys[j] + ny * w)}`);
    Rr.push(`${n2(xs[j] - nx * w)},${n2(ys[j] - ny * w)}`);
  }
  const d = `M${L.join("L")}L${Rr.reverse().join("L")}Z`;
  const slope = (ys[1] - ys[0]) / (xs[0] - xs[1]);
  return { d, y0: ys[0], yaw: (Math.atan(-slope) * 180) / Math.PI };
};

// Flattened oval head, a touch wider toward the front (acrosome cap).
const HEAD_D =
  "M0.02,-0.1C0.2,-0.33 0.62,-0.37 0.88,-0.22C1.03,-0.13 1.03,0.13 0.88,0.22C0.62,0.37 0.2,0.33 0.02,0.1Z";

export const SpermDefs: React.FC<{ prefix: string }> = ({ prefix }) => (
  <defs>
    <radialGradient id={`${prefix}head`} cx="0.64" cy="0.34" r="0.75">
      <stop offset="0" stopColor={C.cell} stopOpacity={1} />
      <stop offset="0.55" stopColor={C.cell} stopOpacity={0.92} />
      <stop offset="1" stopColor={C.cellCyan} stopOpacity={0.95} />
    </radialGradient>
    <linearGradient id={`${prefix}tail`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={-TAIL} y2="0">
      <stop offset="0" stopColor={C.cell} stopOpacity={0.95} />
      <stop offset="0.14" stopColor={C.cell} stopOpacity={0.8} />
      <stop offset="0.6" stopColor={C.cellCyan} stopOpacity={0.4} />
      <stop offset="1" stopColor={C.cellCyan} stopOpacity={0} />
    </linearGradient>
    <radialGradient id={`${prefix}glow`}>
      <stop offset="0" stopColor={C.cellCyan} stopOpacity={0.5} />
      <stop offset="1" stopColor={C.cellCyan} stopOpacity={0} />
    </radialGradient>
    <radialGradient id={`${prefix}gold`}>
      <stop offset="0" stopColor={C.gold} stopOpacity={0.85} />
      <stop offset="0.35" stopColor={C.gold} stopOpacity={0.32} />
      <stop offset="1" stopColor={C.gold} stopOpacity={0} />
    </radialGradient>
    <linearGradient id={`${prefix}goldtail`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={-TAIL} y2="0">
      <stop offset="0" stopColor={C.gold} stopOpacity={0.9} />
      <stop offset="0.35" stopColor={C.gold} stopOpacity={0.35} />
      <stop offset="1" stopColor={C.gold} stopOpacity={0} />
    </linearGradient>
  </defs>
);

export type SpermPose = {
  x: number;
  y: number;
  ang: number; // degrees
  size: number; // head length in layer units
  phase: number;
  amp: number;
  op: number;
  thick?: number;
  glow?: number; // 0..1 cyan halo strength
  rim?: number; // 0..1 gold rim light (the winner)
  headOp?: number;
  tailOp?: number;
};

export const SpermShape: React.FC<SpermPose & { prefix: string }> = (p) => {
  const { d, y0, yaw } = body(p.phase, p.amp, p.thick ?? 1);
  const rim = p.rim ?? 0;
  const glow = p.glow ?? 0.6;
  return (
    <g
      transform={`translate(${n2(p.x)} ${n2(p.y)}) rotate(${n2(p.ang)}) scale(${n2(p.size)})`}
      opacity={p.op}
    >
      <path d={d} fill={`url(#${p.prefix}tail)`} opacity={p.tailOp ?? 1} />
      {rim > 0 && <path d={d} fill={`url(#${p.prefix}goldtail)`} opacity={rim * 0.7 * (p.tailOp ?? 1)} />}
      <g transform={`translate(0 ${n2(y0)}) rotate(${n2(yaw * 1.7)})`} opacity={p.headOp ?? 1}>
        {rim > 0 && <ellipse cx={0.4} cy={0} rx={4.6} ry={3.6} fill={`url(#${p.prefix}gold)`} opacity={rim} />}
        {glow > 0 && <ellipse cx={0.5} cy={0} rx={1.15} ry={0.8} fill={`url(#${p.prefix}glow)`} opacity={glow} />}
        <path d={HEAD_D} fill={`url(#${p.prefix}head)`} />
        <ellipse cx={0.66} cy={-0.05} rx={0.24} ry={0.17} fill={C.cell} opacity={0.6} />
        {rim > 0 && (
          <path d={HEAD_D} fill="none" stroke={C.gold} strokeWidth={0.075} opacity={Math.min(1, rim * 1.2)} />
        )}
      </g>
    </g>
  );
};
