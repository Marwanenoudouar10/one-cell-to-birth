// "they count from the last period": a row of 14 day dots under the zygote
// (a graphic, no labels). A hairline draws itself and the dots pop along it;
// dot 1 glows rose (the period); a light runs dot to dot, warming each day it
// counts; dot 14 flares gold (conception). Then the row dissolves left to
// right, dot 14 last. A spark then lifts off dot 14 into the zygote (Spark.tsx).
// World px (zygote plane).
import React from "react";
import { Easing, spring } from "remotion";
import { EASE, tween } from "../../../lib/ease";
import { C } from "../../../theme/colors";
import { FPS } from "../../../theme/layout";
import { BEATS as B } from "./beats";
import { mix } from "./palette";
import { CX, lerp, smooth } from "./motion";

export const DOTS = 14;
export const DOT_Y = 1170;
export const LAST = DOTS - 1;
// Two weeks of seven days: a wider gap after day 7 makes the row read as
// "week one | week two" (a calendar), not as an even row of page dots.
const GAP = 42;
const WEEK_GAP = 34; // row spans x 250..830 (zona 364..716)
const WEEKS: [number, number][] = [
  [0, 6],
  [7, LAST],
];
export const dotX = (i: number) => CX + (i - LAST / 2) * GAP + (i < 7 ? -WEEK_GAP / 2 : WEEK_GAP / 2);
// x of a fractional position along the row (dot units 0..13), dot to dot
const xAt = (u: number) => {
  const i = Math.max(0, Math.min(LAST - 1, Math.floor(u)));
  return lerp(dotX(i), dotX(i + 1), Math.max(0, Math.min(1, u - i)));
};
const TRAIL = GAP * 3.4; // px of warm trail behind the counting light
const R_DOT = 10.5; // day dot radius (about 2.6 px on a 270 px-wide phone)

// The hairline draws along the row (dot units) at a near-even pace with soft
// ends, so the dots pop like a count over "they count from" (about one a
// frame in the 14-frame window, never two at once), not in one burst.
const lineAt = (f: number) => tween(f, B.dotsDraw, B.dotsDone, [0, LAST], Easing.bezier(0.2, 0.1, 0.8, 0.9));
const POP_AT = Array.from({ length: DOTS }, (_, i) => {
  for (let t = B.dotsDraw; t < B.dotsDone; t += 0.25) if (lineAt(t) >= i - 0.25) return t;
  return B.dotsDone;
});
// the hairline up to dot position u, one segment per week (broken at the week gap)
const segs = (u: number) =>
  WEEKS.filter(([a]) => u > a).map(([a, b]) => [dotX(a), xAt(Math.min(u, b))] as const);

// Light position along the row, in dot units 0..13 (lands on dot 14 at conception).
const runAt = (f: number) => tween(f, B.runStart, B.conception, [0, LAST], Easing.bezier(0.45, 0, 0.4, 1));

const Defs: React.FC<{ rx: number }> = ({ rx }) => (
  <defs>
    {[
      ["c02-dglow", C.text, 0.75],
      ["c02-pglow", C.peach, 0.55],
      ["c02-rglow", C.rose, 0.85],
    ].map(([id, c, a]) => (
      <radialGradient key={id as string} id={id as string}>
        <stop offset={0} stopColor={c as string} stopOpacity={a as number} />
        <stop offset={0.35} stopColor={c as string} stopOpacity={(a as number) * 0.32} />
        <stop offset={1} stopColor={c as string} stopOpacity={0} />
      </radialGradient>
    ))}
    <radialGradient id="c02-gglow">
      <stop offset={0} stopColor={C.text} stopOpacity={1} />
      <stop offset={0.16} stopColor={C.gold} stopOpacity={0.8} />
      <stop offset={0.45} stopColor={C.gold} stopOpacity={0.24} />
      <stop offset={1} stopColor={C.gold} stopOpacity={0} />
    </radialGradient>
    <linearGradient id="c02-trail" gradientUnits="userSpaceOnUse" x1={rx - TRAIL} y1={0} x2={rx} y2={0}>
      <stop offset={0} stopColor={C.peach} stopOpacity={0} />
      <stop offset={0.65} stopColor={C.peach} stopOpacity={0.45} />
      <stop offset={1} stopColor={C.text} stopOpacity={1} />
    </linearGradient>
  </defs>
);

// four-point stylised sparkle (a graphic, like C01's)
const Sparkle: React.FC<{ x: number; y: number; s: number; rot: number; o: number }> = ({ x, y, s, rot, o }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
    {[0, 90].map((a) => (
      <ellipse key={a} rx={s} ry={s * 0.06} transform={`rotate(${a})`} fill={C.text} opacity={0.85} />
    ))}
    {[45, 135].map((a) => (
      <ellipse key={a} rx={s * 0.45} ry={s * 0.05} transform={`rotate(${a})`} fill={C.gold} opacity={0.8} />
    ))}
  </g>
);

export const DayDots: React.FC<{ f: number }> = ({ f }) => {
  if (f < B.dotsDraw - 1 || f > B.endHold + 2) return null;
  const line = lineAt(f);
  const u = runAt(f);
  const running = f >= B.runStart && f <= B.conception + 1;
  // inOut, not out: half rose on "the", full on "last" (out put 58 % in one frame, on "from")
  const rose = tween(f, B.periodDot - 5, B.periodDot + 3, [0, 1], EASE.inOut);
  const rosePulse = Math.exp(-(((f - B.periodDot) / 7) ** 2));
  // the counting light kindles on dot 1 over 6 frames (no 1-frame pop), as it leaves
  const lightIn = tween(f, B.runStart, B.runStart + 6, [0, 1], Easing.out(Easing.quad));
  const flare = tween(f, B.conception - 1, B.conception + 2);
  const peak = Math.exp(-Math.max(0, f - B.conception) / 10) * flare;
  const ring = tween(f, B.conception, B.conception + 28, [0, 1], EASE.out);
  const fadeOf = (i: number) =>
    i === LAST
      ? 1 - tween(f, B.dotsFade + 7, B.endHold, [0, 1], EASE.inOut)
      : 1 - tween(f, B.dotsFade + i * 0.7, B.dotsFade + i * 0.7 + 9, [0, 1], EASE.inOut);
  const lineFade = 1 - tween(f, B.dotsFade, B.dotsFade + 12, [0, 1], EASE.inOut);
  const x0 = dotX(0);
  const rx = xAt(u);

  return (
    <g>
      <Defs rx={rx} />
      {segs(line).map(([a, b]) => (
        <line key={a} x1={a} y1={DOT_Y} x2={b} y2={DOT_Y} stroke={C.text} strokeOpacity={0.2 * lineFade} strokeWidth={2.2} strokeLinecap="round" />
      ))}
      {/* the counted stretch of the line warms behind the light */}
      {f >= B.runStart &&
        segs(u).map(([a, b]) => (
          <line key={a} x1={a} y1={DOT_Y} x2={b} y2={DOT_Y} stroke={C.peach} strokeOpacity={0.42 * lineFade} strokeWidth={2.4} strokeLinecap="round" />
        ))}
      {running && u > 0.02 && (
        <g opacity={lightIn * (1 - flare)}>
          <line x1={Math.max(x0, rx - TRAIL)} y1={DOT_Y} x2={rx} y2={DOT_Y} stroke="url(#c02-trail)" strokeWidth={4.6} strokeLinecap="round" />
          <circle cx={rx} cy={DOT_Y} r={50} fill="url(#c02-dglow)" />
          <circle cx={rx} cy={DOT_Y} r={7} fill={C.text} />
        </g>
      )}

      {Array.from({ length: DOTS }, (_, i) => {
        const pop = spring({ frame: f - POP_AT[i], fps: FPS, config: { damping: 9, stiffness: 210, mass: 0.5 } });
        const op = fadeOf(i);
        if (pop <= 0.001 || op <= 0.005) return null;
        const pass = running ? Math.exp(-(((u - i) / 0.6) ** 2)) : 0;
        const counted = f >= B.runStart ? smooth((u - i + 0.3) / 0.5) : 0;
        const x = dotX(i);
        if (i === 0) {
          // the last period: a plain day dot until "last", then rose, lit while the count runs
          return (
            <g key={i} opacity={op}>
              {rose > 0.005 && <circle cx={x} cy={DOT_Y} r={(40 + 34 * rosePulse) * pop} fill="url(#c02-rglow)" opacity={rose} />}
              <circle cx={x} cy={DOT_Y} r={(R_DOT + 2.5 * rose + 3.5 * rosePulse) * pop} fill={mix(C.cell, C.rose, rose)} opacity={0.6 + 0.4 * rose} />
              <circle cx={x - 3} cy={DOT_Y - 3} r={3 * pop} fill={C.text} opacity={0.55 * rose} />
            </g>
          );
        }
        if (i === LAST) {
          // conception: the gold flare (glow radius <= 120, so it ends by y 1290,
          // clear of the caption band)
          const r = (R_DOT + 1 + 6 * peak + 2.5 * flare) * pop;
          return (
            <g key={i} opacity={op}>
              {ring > 0.001 && ring < 1 && (
                <circle cx={x} cy={DOT_Y} r={16 + 96 * ring} fill="none" stroke={C.gold} strokeOpacity={0.8 * (1 - ring)} strokeWidth={3.4 * (1 - ring) + 0.8} />
              )}
              <circle cx={x} cy={DOT_Y} r={(28 + 78 * peak + 14 * flare) * pop} fill="url(#c02-gglow)" opacity={0.22 + 0.78 * flare} />
              <circle cx={x} cy={DOT_Y} r={r} fill={mix(C.cell, C.gold, flare)} opacity={0.6 + 0.4 * Math.max(flare, pass)} />
              {peak > 0.02 && <Sparkle x={x} y={DOT_Y} s={34 * peak + 12} rot={8 + 24 * ring} o={0.75 * peak} />}
            </g>
          );
        }
        const col = mix(C.cell, C.peach, counted);
        return (
          <g key={i} opacity={op}>
            {counted > 0.02 && <circle cx={x} cy={DOT_Y} r={26} fill="url(#c02-pglow)" opacity={0.7 * counted} />}
            {pass > 0.02 && <circle cx={x} cy={DOT_Y} r={26 + 16 * pass} fill="url(#c02-dglow)" opacity={pass} />}
            <circle cx={x} cy={DOT_Y} r={(R_DOT + 2.6 * pass) * pop} fill={col} opacity={0.6 + 0.32 * counted + 0.08 * pass} />
          </g>
        );
      })}
    </g>
  );
};
