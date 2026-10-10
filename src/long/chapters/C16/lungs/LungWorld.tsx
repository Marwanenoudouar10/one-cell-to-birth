import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../../../../theme/colors";
import { EASE, tween } from "../../../../lib/ease";
import { T } from "../timeline";
import { Lungs } from "./Lungs";
import { HEART, TRACHEA } from "./lungTree";
import { airAll, inflate } from "./breath";

const CRY = { x: TRACHEA.top[0], y: TRACHEA.top[1] + 90 };

// One soft gold glow in the chest between the lungs: the heart switching to
// its new route after the first breaths (shown only as light, no diagram).
const HeartGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const g = tween(frame, T.heartGlow - 2, T.heartGlow + 6, [0, 1], EASE.out) * tween(frame, T.heartGlow + 8, T.heartGlow + 26, [1, 0], EASE.inOut);
  if (g <= 0.01) return null;
  const r = 170 + 110 * g;
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: g,
        background: `radial-gradient(circle ${r}px at ${HEART[0]}px ${HEART[1]}px, ${C.gold}cc 0%, ${C.gold}99 16%, ${C.gold}55 40%, ${C.peach}22 70%, ${C.gold}00 100%)`,
      }}
    />
  );
};

// The first cry: a soft burst of light from the top of the airway. The bloom
// carries the dissolve; the wide blurred rings (like the film's sound rings)
// roll out through the lungs shot and leave with it.
const cryBloom = (frame: number) =>
  tween(frame, T.cry - 2, T.cry + 8, [0, 1], EASE.out) * tween(frame, T.cry + 9, T.cry + 44, [1, 0], EASE.inOut);

const CryBloom: React.FC<{ frame: number }> = ({ frame }) => {
  const b = cryBloom(frame);
  if (b <= 0.005) return null;
  const br = tween(frame, T.cry - 2, T.cry + 30, [220, 1250], EASE.out);
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: b * 0.9,
        background: `radial-gradient(circle ${br}px at ${CRY.x}px ${CRY.y}px, ${C.text} 0%, ${C.gold}dd 14%, ${C.peach}88 40%, ${C.rose}33 70%, ${C.rose}00 100%)`,
      }}
    />
  );
};

const CryRings: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < T.cry || frame > T.cry + 40) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", filter: "blur(18px)", mixBlendMode: "screen" }}>
      {[0, 5, 10].map((d, i) => {
        const p = tween(frame, T.cry + d, T.cry + d + 26, [0, 1], EASE.out);
        if (p <= 0 || p >= 1) return null;
        const o = Math.sin(Math.PI * Math.min(1, p * 1.5)) * (1 - p) * 0.9;
        return <circle key={i} cx={CRY.x} cy={CRY.y} r={60 + p * (820 - i * 130)} fill="none" stroke={[C.gold, C.peach, C.rose][i]} strokeOpacity={Math.min(0.6, o)} strokeWidth={80 - p * 50} />;
      })}
    </svg>
  );
};

// The lungs insert, out of the birth flash: liquid-filled trees take their
// first breaths of air, one heart glow, the first cry, then it dissolves into
// the warm room where the grip happens.
export const LungWorld: React.FC<{ frame: number }> = ({ frame }) => {
  const settle = tween(frame, T.swap, T.breath1 + 6, [1.07, 1], EASE.out);
  const out = tween(frame, T.cry + 3, T.lungsOut, [0, 1], EASE.inOut);
  const vol = inflate(frame);
  const chest = 0.22 + 0.3 * airAll(frame) + 0.14 * vol;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: 1 - out,
          transform: `scale(${settle * (1 + 0.1 * out)})`,
          transformOrigin: "540px 820px",
          filter: out > 0.02 ? `blur(${out * 14}px)` : undefined,
        }}
      >
        {/* dim the room so the lungs carry the frame */}
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 760px 900px at 540px 820px, ${C.bg1}55 0%, ${C.bg1}bb 70%, ${C.bg0}dd 100%)` }} />
        {/* warm glow of the little chest around the lungs */}
        <AbsoluteFill
          style={{
            opacity: chest,
            background: `radial-gradient(ellipse 470px 540px at 540px 850px, ${C.rose}88 0%, ${C.womb}55 55%, ${C.womb}00 100%)`,
          }}
        />
        <Lungs frame={frame} />
        <HeartGlow frame={frame} />
        <CryRings frame={frame} />
      </AbsoluteFill>
      <CryBloom frame={frame} />
    </AbsoluteFill>
  );
};
