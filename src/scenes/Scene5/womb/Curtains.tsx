import React from "react";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { EASE, tween } from "../../../lib/ease";
import { Pt, smoothOpen } from "../geometry";
import { T } from "../timeline";

const CX = 540;
const CY = 860;

// Concentric folds of womb wall around the sac. Each fold is split into a
// left and a right half that part like curtains at the birth beat.
type Ring = { r: number; next: number; base: string; lift: number; open: number };
const RINGS: Ring[] = [
  { r: 422, next: 560, base: C.wombDeep, lift: 0.95, open: 1.0 },
  { r: 560, next: 720, base: C.wombDeep, lift: 0.62, open: 0.95 },
  { r: 720, next: 920, base: C.bg2, lift: 0.5, open: 0.9 },
  { r: 920, next: 1300, base: C.bg2, lift: 0.3, open: 0.85 },
];

const smooth01 = (a: number, b: number, v: number) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Shared wavy seam (same for both halves and all folds, so closed curtains
// are seamless and the parted edge reads as one soft curtain edge).
const seamX = (y: number) => {
  const away = smooth01(430, 700, Math.abs(y - CY));
  return CX + away * (noise2D("s5-seam", y * 0.0035, 0) * 46 + Math.sin(y * 0.011) * 10);
};

// each half reaches a few px past the shared seam so closed curtains never gap
const seamPts = (y0: number, y1: number, r: number, side: -1 | 1, n = 9): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const y = y0 + ((y1 - y0) * i) / n;
    return [seamX(y) - side * 5, y] as Pt;
  });

const arcPts = (r: number, side: -1 | 1, seed: string, t: number, n = 24): Pt[] => {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const th = -Math.PI / 2 + (i / n) * Math.PI;
    const c = Math.cos(th);
    const w = noise2D(seed, Math.cos(th) * 1.6 + t, Math.sin(th) * 1.6 - t) * Math.sqrt(Math.max(0, c));
    const rr = r * (1 + 0.04 * w);
    pts.push([CX + side * rr * c, CY + rr * Math.sin(th)]);
  }
  return pts;
};

const Half: React.FC<{ side: -1 | 1; i: number; frame: number; open: number; light: number }> = ({ side, i, frame, open, light }) => {
  const t = frame * 0.006;
  const key = side < 0 ? "L" : "R";
  const ring = RINGS[i];
  const breathe = 1 + 0.012 * Math.sin((frame / 84) * Math.PI * 2 - i * 0.7);
  const r = ring.r * breathe;
  // parted from the bottom like a stage curtain: closed above the sac,
  // opening wider toward the bottom of the frame (non-linear, so no top gap)
  const D = (p: Pt): Pt => {
    const k = Math.max(0, Math.min(1.4, (p[1] - 380) / 1540));
    return [p[0] + side * open * ring.open * 760 * Math.pow(k, 1.6), p[1]];
  };
  const arc = arcPts(r, side, `s5-${key}${i}`, t + i * 3.1).map(D);
  const top = seamPts(-800, CY - r - 30, r, side).map(D);
  const bot = seamPts(CY + r + 30, 2800, r, side).map(D);
  const edge = [...top, ...arc, ...bot];
  const far = CX + side * 1500;
  const region = `${smoothOpen(edge)} L${far + side * 1600},2800 L${far},-800Z`;
  const lower = [...arc.slice(12), ...bot.slice(0, 5)];
  const s = 1 + open * 0.12 * ring.open;
  const fibres = [0.3, 0.62].map((k, j) =>
    smoothOpen(arcPts(r + (ring.next * breathe - r) * k, side, `s5-f${key}${i}${j}`, t * 0.7 + j, 14).slice(3 + j * 2, 19 - j).map(D)),
  );
  return (
    <g transform={`translate(${CX} 1300) scale(${s}) translate(${-CX} -1300)`}>
      <path d={region} fill={ring.base} />
      <path d={region} fill={`url(#s5-ringLift${i})`} />
      {fibres.map((d, j) => (
        <path key={j} d={d} fill="none" stroke={j ? C.wombDeep : C.rose} strokeOpacity={j ? 0.45 : 0.1} strokeWidth={j ? 10 : 4} strokeLinecap="round" />
      ))}
      {/* soft lit lip of the fold, facing the glowing sac */}
      <path d={smoothOpen(arc)} fill="none" stroke={C.rose} strokeOpacity={0.16 * ring.lift} strokeWidth={26} style={{ filter: "blur(10px)" }} />
      <path d={smoothOpen(arc)} fill="none" stroke={C.rose} strokeOpacity={0.55 * ring.lift} strokeWidth={3} />
      {/* birth light catching the lower lips and parted edges */}
      {light > 0.01 && (
        <>
          <path d={smoothOpen(lower)} fill="none" stroke={C.gold} strokeOpacity={0.55 * light * ring.lift} strokeWidth={34} style={{ filter: "blur(16px)" }} />
          <path d={smoothOpen(lower)} fill="none" stroke={C.peach} strokeOpacity={0.9 * light * ring.lift} strokeWidth={4} />
        </>
      )}
    </g>
  );
};

export const Curtains: React.FC<{ frame: number }> = ({ frame }) => {
  const open = tween(frame, T.curtainA, T.curtainB, [0, 1], EASE.inOut);
  const light = tween(frame, T.bloom, T.bloom + 16, [0, 1], EASE.out);
  const blur = tween(frame, T.curtainA + 8, T.curtainB, [0, 16], EASE.in);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", overflow: "hidden", filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      <defs>
        {RINGS.map((ring, i) => (
          <radialGradient key={i} id={`s5-ringLift${i}`} gradientUnits="userSpaceOnUse" cx={CX} cy={CY} r={ring.next}>
            <stop offset={ring.r / ring.next} stopColor={C.womb} stopOpacity={ring.lift} />
            <stop offset={(ring.r / ring.next + 1) / 2} stopColor={C.womb} stopOpacity={ring.lift * 0.35} />
            <stop offset={1} stopColor={C.womb} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
      {RINGS.map((_, i) => (
        <g key={i}>
          <Half side={-1} i={i} frame={frame} open={open} light={light} />
          <Half side={1} i={i} frame={frame} open={open} light={light} />
        </g>
      ))}
    </svg>
  );
};
