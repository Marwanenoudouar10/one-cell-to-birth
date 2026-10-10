import React from "react";
import { noise2D } from "@remotion/noise";
import { C } from "../../../../theme/colors";
import { Pt, SAC, arc, smoothPath } from "./geometry";
import { Ring, ringAlpha, ringRadius } from "./beat";

// Copied from src/long/chapters/C06/Sac.tsx (= Scene3's + C06's `R`/`vis`; ids -> c07).
// Added for C07: `wob` scales the membrane's living wobble (the sac calms in the wide shot).

const N = 128;

// Membrane outline: a soft living wobble, plus a ripple wherever a heartbeat
// pulse ring is passing through the wall.
export const sacPath = (frame: number, heart: Pt, rs: Ring[], R0: number = SAC.r, wob = 1) => {
  const pts: Pt[] = [];
  const t = frame * 0.01;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    let r = R0 + noise2D("s3sac", ca * 1.1 + t, sa * 1.1 - t) * 4.5 * wob;
    const d = Math.hypot(SAC.x + ca * r - heart.x, SAC.y + sa * r - heart.y);
    for (const ring of rs) {
      const rr = ringRadius(ring);
      r += 8 * ring.strength * ringAlpha(ring) * Math.exp(-((d - rr) ** 2) / (2 * 22 * 22));
    }
    pts.push({ x: SAC.x + ca * r, y: SAC.y + sa * r });
  }
  return smoothPath(pts, true);
};

// Chorionic villi: a soft, fuzzy fringe hugging the outside of the sac.
const fringe = (frame: number, R0: number) => {
  const pts: Pt[] = [];
  const t = frame * 0.006;
  const M = 220;
  for (let i = 0; i < M; i++) {
    const a = (i / M) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const bump = 0.5 + 0.5 * noise2D("s3vil", ca * 6 + t, sa * 6);
    const r = R0 + 8 + 20 * bump * (0.65 + 0.35 * noise2D("s3vil2", ca * 2, sa * 2 + t));
    pts.push({ x: SAC.x + ca * r, y: SAC.y + sa * r });
  }
  return smoothPath(pts, true);
};

const RAYS = [
  { a: 58, w0: 26, w1: 120, o: 0.75, seed: 1 },
  { a: 66, w0: 18, w1: 80, o: 0.55, seed: 2 },
  { a: 49, w0: 14, w1: 70, o: 0.45, seed: 3 },
];
const SRC = { x: 210, y: 330 };

type BackProps = { frame: number; d: string; heart: Pt; glow: number; ignite: number; dim: number; R: number; vis: number };

export const SacBack: React.FC<BackProps> = ({ frame, d, heart, glow, ignite, dim, R, vis }) => {
  return (
    <g opacity={vis}>
      <defs>
        <radialGradient id="c07-sac-chorion" gradientUnits="userSpaceOnUse" cx={SAC.x} cy={SAC.y} r={R + 110}>
          <stop offset={(R - 20) / (R + 110)} stopColor={C.rose} stopOpacity={0} />
          <stop offset={(R + 8) / (R + 110)} stopColor={C.rose} stopOpacity={0.26} />
          <stop offset="1" stopColor={C.womb} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c07-sac-villi" gradientUnits="userSpaceOnUse" cx={SAC.x} cy={SAC.y} r={R + 40}>
          <stop offset={R / (R + 40)} stopColor={C.rose} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.womb} stopOpacity={0.05} />
        </radialGradient>
        <radialGradient id="c07-sac-fluid" gradientUnits="userSpaceOnUse" cx={SAC.x - 40} cy={SAC.y - 60} r={R + 40}>
          <stop offset="0" stopColor={C.rose} stopOpacity={0.1} />
          <stop offset="0.55" stopColor={C.womb} stopOpacity={0.12} />
          <stop offset="0.86" stopColor={C.rose} stopOpacity={0.22} />
          <stop offset="0.96" stopColor={C.peach} stopOpacity={0.42} />
          <stop offset="1" stopColor={C.peach} stopOpacity={0.55} />
        </radialGradient>
        <radialGradient id="c07-sac-fluid-heart" gradientUnits="userSpaceOnUse" cx={heart.x} cy={heart.y} r={340}>
          <stop offset="0" stopColor={C.heart} stopOpacity={0.5} />
          <stop offset="0.5" stopColor={C.rose} stopOpacity={0.14} />
          <stop offset="1" stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c07-sac-fluid-shade" gradientUnits="userSpaceOnUse" cx={SAC.x + 70} cy={SAC.y + 300} r={380}>
          <stop offset="0" stopColor={C.bg0} stopOpacity={0.42} />
          <stop offset="1" stopColor={C.bg0} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="c07-sac-ray" gradientUnits="userSpaceOnUse" x1={SRC.x} y1={SRC.y} x2={SRC.x + 520} y2={SRC.y + 900}>
          <stop offset="0" stopColor={C.skin} stopOpacity={0.32} />
          <stop offset="1" stopColor={C.skin} stopOpacity={0} />
        </linearGradient>
        <clipPath id="c07-sac-sac-clip">
          <path d={d} />
        </clipPath>
        <filter id="c07-sac-ray-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <circle cx={SAC.x} cy={SAC.y} r={R + 110} fill="url(#c07-sac-chorion)" opacity={dim} />
      <path d={fringe(frame, R)} fill="url(#c07-sac-villi)" opacity={0.75 * dim} />
      <path d={d} fill={C.bg1} opacity={0.72} />
      <path d={d} fill="url(#c07-sac-fluid)" opacity={dim} />
      <g clipPath="url(#c07-sac-sac-clip)">
        <circle cx={SAC.x + 70} cy={SAC.y + 300} r={380} fill="url(#c07-sac-fluid-shade)" />
        <circle cx={heart.x} cy={heart.y} r={340} fill="url(#c07-sac-fluid-heart)" opacity={0.12 * ignite + 0.45 * glow} />
        <g filter="url(#c07-sac-ray-blur)" opacity={dim}>
          {RAYS.map((r) => {
            const sway = noise2D("s3ray", frame * 0.008, r.seed) * 4;
            const a = ((r.a + sway) * Math.PI) / 180;
            const dir = { x: Math.cos(a), y: Math.sin(a) };
            const nx = -dir.y;
            const ny = dir.x;
            const L = 1000;
            const op = r.o * (0.75 + 0.25 * noise2D("s3rayo", frame * 0.02, r.seed));
            const pts = [
              [SRC.x + nx * r.w0, SRC.y + ny * r.w0],
              [SRC.x + dir.x * L + nx * r.w1, SRC.y + dir.y * L + ny * r.w1],
              [SRC.x + dir.x * L - nx * r.w1, SRC.y + dir.y * L - ny * r.w1],
              [SRC.x - nx * r.w0, SRC.y - ny * r.w0],
            ];
            return <polygon key={r.seed} points={pts.map((p) => p.join(",")).join(" ")} fill="url(#c07-sac-ray)" opacity={op} />;
          })}
        </g>
      </g>
    </g>
  );
};

// Membrane rim + glassy highlights (drawn over the embryo).
export const SacFront: React.FC<{ d: string; glow: number; dim: number; R: number; vis: number }> = ({ d, glow, dim, R, vis }) => {
  const { x, y } = SAC;
  const r = R;
  return (
    <g opacity={dim * vis}>
      <defs>
        <filter id="c07-sac-spec-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <path d={d} fill="none" stroke={C.rose} strokeOpacity={0.14 + 0.1 * glow} strokeWidth={22} />
      <path d={d} fill="none" stroke={C.peach} strokeOpacity={0.6 + 0.25 * glow} strokeWidth={2.4} />
      <path d={arc(x, y, r - 22, 196, 250)} fill="none" stroke={C.text} strokeOpacity={0.3} strokeWidth={16} strokeLinecap="round" filter="url(#c07-sac-spec-blur)" />
      <path d={arc(x, y, r - 14, 204, 238)} fill="none" stroke={C.text} strokeOpacity={0.55} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={x + (r - 16) * Math.cos((248 * Math.PI) / 180)} cy={y + (r - 16) * Math.sin((248 * Math.PI) / 180)} r={3.5} fill={C.text} opacity={0.65} />
      <path d={arc(x, y, r - 10, 18, 72)} fill="none" stroke={C.rose} strokeOpacity={0.4} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};
