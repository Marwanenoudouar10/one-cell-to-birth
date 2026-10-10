// The macro shot (~6.4 s .. end): deep in the warm fluid, one fingertip fills
// the frame and its ridges ripple into a whorl; then the twin's fingertip
// slides in beside it and settles into a visibly different pattern.
import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../../theme/colors";
import { CaptionShade, FluidSpecks, LightShafts } from "../../../../shared/womb";
import { BEATS } from "../beats";
import { WombTL } from "../womb/timeline";
import { Fingertip, GhostFinger } from "./Fingertip";
import { PRINT_A, PRINT_B } from "./prints";
import { macroTimeline } from "./timeline";

// soft out-of-focus motes drifting in the fluid behind the fingers
const MOTES = Array.from({ length: 11 }, (_, i) => ({
  x: random(`c10-mx${i}`) * 1080,
  y: 380 + random(`c10-my${i}`) * 1000,
  r: 10 + random(`c10-mr${i}`) * 34,
  c: [C.peach, C.rose, C.cell, C.gold][i % 4],
  a: 0.08 + random(`c10-ma${i}`) * 0.14,
}));

const Backdrop: React.FC<{ f: number; bloom: number }> = ({ f, bloom }) => (
  <AbsoluteFill>
    <AbsoluteFill
      style={{
        background: `radial-gradient(95% 62% at 50% 44%, ${C.wombDeep} 0%, ${C.bg2} 52%, ${C.bg1} 84%, ${C.bg0} 100%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(48% 30% at 50% 42%, ${C.womb}${Math.round((0.4 + bloom) * 255).toString(16).padStart(2, "0")} 0%, transparent 100%)`,
      }}
    />
    <svg width={1080} height={1920} style={{ position: "absolute", filter: "blur(10px)" }}>
      {MOTES.map((m, i) => (
        <circle
          key={i}
          cx={m.x + 30 * noise2D(`c10-mdx${i}`, f * 0.006, 0)}
          cy={m.y - f * 0.25 + 30 * noise2D(`c10-mdy${i}`, 0, f * 0.006)}
          r={m.r}
          fill={m.c}
          opacity={m.a}
        />
      ))}
    </svg>
  </AbsoluteFill>
);

export const MacroShot: React.FC<{ womb: WombTL }> = ({ womb }) => {
  const f = useCurrentFrame();
  if (f < BEATS.macroIn - 1) return null;
  const t = macroTimeline(f, womb.tipS, womb.tipAngle, womb.tipWidth);
  const w = t.world;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: w.opacity }}>
        <Backdrop f={f} bloom={w.bloom} />
        <LightShafts from={{ x: 60, y: 470 }} angle={52} intensity={0.32} clip="none" seed="c10-mshafts" />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${w.push.toFixed(5)})`, transformOrigin: "540px 820px" }}>
        <GhostFinger place={t.ghost} />
        {t.showB && <Fingertip id="b" spec={PRINT_B} st={t.b} frame={f} />}
        <Fingertip id="a" spec={PRINT_A} st={t.a} frame={f} />
      </AbsoluteFill>
      {w.flare > 0.002 && (
        <AbsoluteFill
          style={{
            opacity: w.flare,
            background: `radial-gradient(circle 420px at ${w.flareAt.x.toFixed(1)}px ${w.flareAt.y.toFixed(1)}px, ${C.skin}e6 0%, ${C.peach}80 38%, transparent 100%)`,
          }}
        />
      )}
      <AbsoluteFill style={{ opacity: w.opacity }}>
        <FluidSpecks layer="lens" count={4} seed="c10-mlens" />
        <CaptionShade top={0.4} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
