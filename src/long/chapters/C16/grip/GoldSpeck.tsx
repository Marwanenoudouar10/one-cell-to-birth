import React from "react";
import { AbsoluteFill } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../../theme/colors";
import { EASE, tween } from "../../../../lib/ease";
import { T } from "../timeline";

// Where the speck floats: just above-left of the gripping fist, in the open
// warm dark (screen px, inside the push-in so it stays by the hand).
const AT = { x: 404, y: 548 };

// "One cell…": one tiny gold speck lights up among the warm specks by the
// gripping hand, echoing the single gold cell the film began with.
const peakOf = (frame: number) =>
  tween(frame, T.goldOn + 6, T.goldPeak, [0, 1], EASE.inOut) * tween(frame, T.goldPeak, T.goldOff + 10, [1, 0], EASE.inOut);

// 0..1 while the speck is lit (the other specks step back a little).
export const goldGlow = (frame: number) =>
  tween(frame, T.goldOn, T.goldOn + 14, [0, 1], EASE.out) * tween(frame, T.goldOff, T.goldOff + 30, [1, 0], EASE.inOut);

export const GoldSpeck: React.FC<{ frame: number }> = ({ frame }) => {
  const on = tween(frame, T.goldOn, T.goldOn + 14, [0, 1], EASE.back);
  if (on <= 0.001) return null;
  const peak = peakOf(frame);
  const rest = tween(frame, T.goldOff, T.goldOff + 30, [1, 0.38], EASE.inOut);
  const tw = 0.9 + 0.1 * Math.sin(frame * 0.21);
  const rise = (frame - T.goldOn) * 0.12;
  const x = AT.x + noise2D("c16-gsx", frame * 0.01, 0) * 7;
  const y = AT.y - rise + noise2D("c16-gsy", 0, frame * 0.01) * 6;
  const r = 8.5 * on * (1 + 0.2 * peak);
  const halo = (40 + 52 * peak) * on;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible", opacity: rest * tw }}>
      <defs>
        <radialGradient id="c16-gsHalo">
          <stop offset="0" stopColor={C.gold} stopOpacity={0.75} />
          <stop offset="0.35" stopColor={C.gold} stopOpacity={0.28} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c16-gsCore" cx="0.38" cy="0.34" r="0.7">
          <stop offset="0" stopColor={C.text} />
          <stop offset="0.45" stopColor={C.gold} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0.85} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={halo * 2.4} fill="url(#c16-gsHalo)" opacity={0.4 + 0.45 * peak} />
      <circle cx={x} cy={y} r={halo} fill="url(#c16-gsHalo)" />
      <circle cx={x} cy={y} r={r * 1.9} fill={C.gold} opacity={0.35} style={{ filter: "blur(4px)" }} />
      <circle cx={x} cy={y} r={r} fill="url(#c16-gsCore)" />
      <circle cx={x - r * 0.3} cy={y - r * 0.32} r={r * 0.32} fill={C.text} opacity={0.9} />
    </svg>
  );
};

// Optional pay-off of C15: one slow, soft warm ring passes across the frame
// from the grown-up's side (mum's voice), behind the hands.
export const VoiceRing: React.FC<{ frame: number }> = ({ frame }) => {
  const p = tween(frame, T.voiceRing, T.voiceRing + 84, [0, 1], EASE.out);
  if (p <= 0 || p >= 1) return null;
  const o = Math.sin(Math.PI * p) * 0.22;
  const r = 220 + p * 1300;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", filter: "blur(14px)" }}>
        <circle cx={1180} cy={330} r={r} fill="none" stroke={C.peach} strokeOpacity={o} strokeWidth={46} />
        <circle cx={1180} cy={330} r={r * 0.9} fill="none" stroke={C.rose} strokeOpacity={o * 0.6} strokeWidth={30} />
      </svg>
    </AbsoluteFill>
  );
};
