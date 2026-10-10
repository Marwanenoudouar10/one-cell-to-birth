// The plunge into the speck: warm light streaks rush outward past the lens
// (carrying the room's colours off the frame), the speck's light floods the
// centre and recedes, and a few motes drift outward and settle in the dark.
import React from "react";
import { AbsoluteFill, Easing, random } from "remotion";
import { C } from "../../../../theme/colors";
import { EASE, tween } from "../../../../lib/ease";
import { handCamAt, TARGET } from "../grip/handCam";
import { T } from "../timeline";
import { captionMask } from "./mask";

const COLS = [C.gold, C.peach, C.skin, C.rose, C.gold, C.peach];

// Light rushing past the lens: born out at mid-radius (never fanning out of
// the speck like a sparkler), accelerating outward, each with a soft tail that
// fades to nothing and a bright head, widening as it nears the frame edge.
// Two depths: near streaks (wider, faster, softer) and far ones (thin, crisp).
const mkStreaks = (n: number, tag: string, near: boolean) =>
  Array.from({ length: n }, (_, i) => {
    const r = (k: string) => random(`c00-st${tag}-${i}-${k}`);
    return {
      // evenly spread around the dial (golden angle) with a little jitter
      a: i * 2.39996 + (near ? 1.1 : 0) + (r("a") - 0.5) * 0.45,
      r0: (near ? 220 : 140) + r("r") * 320,
      delay: r("d") * 9,
      dur: (near ? 7 : 9) + r("u") * 5,
      w: near ? 4 + r("w") * 3 : 2 + r("w") * 2.2,
      col: COLS[i % COLS.length],
      o: near ? 0.55 + r("o") * 0.3 : 0.6 + r("o") * 0.35,
    };
  });
const FAR = mkStreaks(22, "f", false);
const NEAR = mkStreaks(12, "n", true);
type StreakSpec = (typeof FAR)[number];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const StreakSet: React.FC<{ frame: number; set: StreakSpec[]; tag: string; cx: number; cy: number; blur: number }> = ({ frame, set, tag, cx, cy, blur }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", filter: `blur(${blur}px)` }}>
    {set.map((s, i) => {
      const p = (frame - T.streaksIn - s.delay) / s.dur;
      if (p <= 0 || p >= 1) return null;
      const ca = Math.cos(s.a);
      const sa = Math.sin(s.a);
      const rh = s.r0 + 1700 * Math.pow(p, 2.2);
      // the tail lags behind the head: longer the faster it goes
      const rt = s.r0 + (rh - s.r0) * 0.22;
      const w = s.w * (0.6 + Math.min(2.6, rh / 420));
      const op = s.o * clamp01(p / 0.18) * clamp01((1 - p) / 0.35);
      const [tx, ty, hx, hy] = [cx + ca * rt, cy + sa * rt, cx + ca * rh, cy + sa * rh];
      const nx = -sa * (w / 2);
      const ny = ca * (w / 2);
      const id = `c00-st${tag}-${i}`;
      const d = `M${tx},${ty} L${hx + nx},${hy + ny} Q${hx + ca * w * 1.4},${hy + sa * w * 1.4} ${hx - nx},${hy - ny} Z`;
      return (
        <g key={i}>
          <defs>
            <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={tx} y1={ty} x2={hx} y2={hy}>
              <stop offset="0" stopColor={s.col} stopOpacity={0} />
              <stop offset="0.55" stopColor={s.col} stopOpacity={0.8} />
              <stop offset="1" stopColor={C.text} stopOpacity={1} />
            </linearGradient>
          </defs>
          <path d={d} fill={`url(#${id})`} opacity={op} />
        </g>
      );
    })}
  </svg>
);

export const Streaks: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < T.streaksIn || frame > T.through + 12) return null;
  const [cx, cy] = handCamAt(Math.min(frame, T.dive + 1)).speck;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", ...captionMask(0.45) }}>
      <StreakSet frame={frame} set={NEAR} tag="n" cx={cx} cy={cy} blur={3} />
      <StreakSet frame={frame} set={FAR} tag="f" cx={cx} cy={cy} blur={1.2} />
    </AbsoluteFill>
  );
};

// The speck's light floods the frame at the moment we pass through it.
export const Bloom: React.FC<{ frame: number }> = ({ frame }) => {
  // the light eases INTO its peak (the camera may hit it at full speed, the
  // light must not snap), then recedes into the dark
  const up = tween(frame, T.dive + 4, T.through + 1, [0, 1], Easing.bezier(0.6, 0, 0.5, 1));
  const down = tween(frame, T.through + 1, T.bloomOut, [0, 1], Easing.bezier(0.3, 0, 0.25, 1));
  const b = up * (1 - down);
  if (b <= 0.003) return null;
  const [x, y] = TARGET;
  const r = 240 + 1000 * up - 640 * down;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      <AbsoluteFill
        style={{
          opacity: b,
          ...captionMask(0.28),
          background: `radial-gradient(circle ${r}px at ${x}px ${y}px, ${C.text} 0%, ${C.text}ee 9%, ${C.gold}f0 22%, ${C.gold}99 40%, ${C.rose}2e 64%, ${C.rose}00 86%)`,
        }}
      />
      <AbsoluteFill style={{ opacity: 0.3 * up * (1 - down) ** 3, ...captionMask(0.28), background: `radial-gradient(130% 90% at 50% 45%, ${C.gold} 0%, ${C.rose}99 50%, ${C.womb}00 100%)` }} />
    </AbsoluteFill>
  );
};

const MOTES = Array.from({ length: 26 }, (_, i) => {
  const r = (k: string) => random(`c00-mo-${i}-${k}`);
  return { a: r("a") * Math.PI * 2, r0: 90 + r("r") * 520, go: 120 + r("g") * 260, s: 2 + r("s") * 5, warm: r("w") < 0.6, ph: r("p") * 6.28 };
});

// After the light: motes keep drifting outward, slowing as the dive settles.
export const Wake: React.FC<{ frame: number }> = ({ frame }) => {
  const on = tween(frame, T.through - 2, T.dark, [0, 1], EASE.out) * (1 - tween(frame, T.resolved - 10, T.you + 18, [0, 1], EASE.inOut));
  if (on <= 0.01) return null;
  const k = 1 - Math.exp(-Math.max(0, frame - T.through + 2) / 14);
  const [x, y] = TARGET;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", opacity: on }}>
      <defs>
        <radialGradient id="c00-mote-w">
          <stop offset="0" stopColor={C.gold} stopOpacity={0.9} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c00-mote-c">
          <stop offset="0" stopColor={C.cell} stopOpacity={0.7} />
          <stop offset="1" stopColor={C.cell} stopOpacity={0} />
        </radialGradient>
      </defs>
      {MOTES.map((m, i) => {
        const rr = m.r0 + m.go * k;
        const tw = 0.6 + 0.4 * Math.sin(frame * 0.12 + m.ph);
        return (
          <circle key={i} cx={x + Math.cos(m.a) * rr} cy={y + Math.sin(m.a) * rr * 1.1} r={m.s * 3} fill={`url(#c00-mote-${m.warm ? "w" : "c"})`} opacity={0.5 * tw} />
        );
      })}
    </svg>
  );
};
