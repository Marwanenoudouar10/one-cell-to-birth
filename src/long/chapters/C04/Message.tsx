import React from "react";
import { random } from "remotion";
import { getPointAtLength } from "@remotion/paths";
import { C } from "../../../theme/colors";
import { EASE } from "../../../lib/ease";
import { Pt, clamp01, deg, lerp } from "./geometry";
import { mix } from "./palette";
import { B } from "./timeline";
import { MAIN } from "./wallShape";

// "sends a message": tiny glowing hormone particles leave the outer cells,
// flow around the buried ball to the nearby vessel, gather at its mouth and
// stream away along it (world px).
const N = 34;
const S_ENTRY = 0.1; // where the vessel mouth sits along MAIN (fraction)

const P = Array.from({ length: N }, (_, i) => {
  const rnd = (k: string) => random(`c04p-${k}${i}`);
  return {
    born: B.message + (i / N) * 15 + rnd("b") * 3,
    a: deg(-35 + rnd("a") * 190),
    rOut: 22 + rnd("r") * 20,
    size: 5.6 + rnd("s") * 3.8, // core radius: still a visible spark at phone size
    lane: (rnd("l") - 0.5) * 10,
    go: B.stream - 5 + i * 0.75 + rnd("g") * 2,
    speed: 34 + rnd("v") * 12,
  };
});

const entryAngle = (c: Pt) => Math.atan2(MAIN.entry[1] - c[1], MAIN.entry[0] - c[0]);
const angLerp = (a: number, b: number, t: number) => {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

// Position of particle i at frame f (or null before birth / after it left).
const posAt = (i: number, f: number, c: Pt, R: number): { p: Pt; fast: boolean } | null => {
  const q = P[i];
  const u = f - q.born;
  if (u < 0) return null;
  const aE = entryAngle(c);
  const rE = Math.hypot(MAIN.entry[0] - c[0], MAIN.entry[1] - c[1]);
  // A: drift straight out of the shell.
  const tA = EASE.out(clamp01(u / 9));
  let r = lerp(R * 0.97, R + q.rOut, tA);
  let a = q.a;
  // B: flow around the ball to the vessel mouth.
  const dA = Math.abs(angLerp(q.a, aE, 1) - q.a);
  const durB = 8 + (dA * 180) / Math.PI / 6;
  const tB = EASE.inOut(clamp01((u - 7) / durB));
  if (u > 7) {
    a = angLerp(q.a, aE, tB);
    r = lerp(R + q.rOut, rE - 18 + q.lane, tB);
  }
  const arrive = q.born + 7 + durB;
  const start = Math.max(arrive, q.go);
  if (f < start) {
    const wob = 3 * Math.sin(f * 0.3 + i);
    return { p: [c[0] + Math.cos(a) * (r + wob), c[1] + Math.sin(a) * (r + wob)], fast: false };
  }
  // C: into the vessel and away, accelerating.
  const v = (f - start) / q.speed;
  if (v >= 1) return null;
  const s = S_ENTRY + (1 - S_ENTRY) * EASE.in(Math.min(1, v * 1.05)) ** 0.85;
  const pt = getPointAtLength(MAIN.d, s * MAIN.len) ?? { x: MAIN.entry[0], y: MAIN.entry[1] };
  const mouth: Pt = [c[0] + Math.cos(aE) * (rE - 18 + q.lane), c[1] + Math.sin(aE) * (rE - 18 + q.lane)];
  const k = clamp01(v * 6);
  return { p: [lerp(mouth[0], pt.x, k), lerp(mouth[1], pt.y + q.lane * 0.5, k)], fast: v > 0.05 };
};

export const messageFlow = (f: number) => {
  const on = clamp01((f - B.stream + 6) / 10);
  const off = 1 - clamp01((f - (B.stream + 60)) / 30);
  return on * off;
};

export const Message: React.FC<{ f: number; c: Pt; R: number }> = ({ f, c, R }) => {
  if (f < B.message - 1 || f > B.stream + 120) return null;
  const col = mix(C.gold, C.text, 0.35);
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id="c04m-halo">
          <stop offset={0} stopColor={C.gold} stopOpacity={0.9} />
          <stop offset={0.35} stopColor={C.gold} stopOpacity={0.35} />
          <stop offset={1} stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
      </defs>
      {P.map((q, i) => {
        const now = posAt(i, f, c, R);
        if (!now) return null;
        const fadeIn = clamp01((f - q.born) / 5);
        const [x, y] = now.p;
        const prev = now.fast ? posAt(i, f - 2.5, c, R) : null;
        return (
          <g key={i} opacity={fadeIn}>
            {prev && (
              <line x1={prev.p[0]} y1={prev.p[1]} x2={x} y2={y} stroke={C.gold} strokeOpacity={0.55} strokeWidth={q.size * 1.3} strokeLinecap="round" />
            )}
            <circle cx={x} cy={y} r={q.size * 3.8} fill="url(#c04m-halo)" opacity={0.85} />
            <circle cx={x} cy={y} r={q.size} fill={col} />
          </g>
        );
      })}
    </g>
  );
};
