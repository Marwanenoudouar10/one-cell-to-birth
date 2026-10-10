import React from "react";
import { AbsoluteFill, random } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { EASE, soft, tween } from "../../../lib/ease";
import { T } from "../timeline";
import { Baby } from "./Baby";
import { Bloom } from "./BirthLight";
import { Curtains } from "./Curtains";
import { Cavity, SacBack, SacFront } from "./Sac";

const MOTES = Array.from({ length: 16 }, (_, i) => {
  const a = random(`s5-ma${i}`) * Math.PI * 2;
  const d = Math.sqrt(random(`s5-md${i}`)) * 360;
  return { x: 540 + Math.cos(a) * d, y: 860 + Math.sin(a) * d, r: 2 + random(`s5-mr${i}`) * 4, o: 0.25 + random(`s5-mo${i}`) * 0.4 };
});

// Tiny particles suspended in the amniotic fluid.
const Motes: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    {MOTES.map((m, i) => (
      <circle
        key={i}
        cx={m.x + noise2D(`s5-mx${i}`, frame * 0.01, 0) * 18}
        cy={m.y + noise2D(`s5-my${i}`, 0, frame * 0.01) * 18 - frame * 0.15}
        r={m.r}
        fill={i % 4 === 0 ? C.gold : C.peach}
        opacity={m.o}
      />
    ))}
  </svg>
);

// Week 40: the cramped full-term baby in the womb, then the birth light.
export const WombWorld: React.FC<{ frame: number }> = ({ frame }) => {
  const settle = tween(frame, 0, T.weekForty + 30, [1.045, 1], EASE.out);
  const drift = tween(frame, T.weekForty, T.birth, [0, 0.045], EASE.inOut);
  const push = tween(frame, T.birth, T.flashPeak, [1, 1.45], EASE.in);
  const cam = (settle + drift) * push;
  const camY = tween(frame, T.birth, T.flashPeak, [0, -120], EASE.in);

  const go = tween(frame, T.babyGoA, T.flashPeak, [0, 1], EASE.in);
  const nod = Math.sin((frame / 70) * Math.PI * 2) * 1.2;
  // at term the head "engages": a soft downward settle on the weekForty beat
  const settleDown = soft(frame, T.weekForty - 4);
  const breathe = 1 + 0.006 * Math.sin((frame / 84) * Math.PI * 2);
  const pose = {
    dx: noise2D("s5-bx", frame * 0.008, 0) * 6 - go * 20,
    dy: noise2D("s5-by", 0, frame * 0.008) * 6 + settleDown * 16 + go * 130,
    rot: nod + settleDown * 2.5 - go * 7,
    scale: breathe * (1 + go * 0.1),
    glow: tween(frame, T.bloom + 6, T.flashPeak, [0, 1], EASE.in),
    womb: 1 - tween(frame, T.babyGoA, T.babyGoA + 14, [0, 1], EASE.inOut),
  };
  const melt = tween(frame, T.flashUpA, T.flashPeak, [0, 1], EASE.in);
  const sacOut = tween(frame, T.babyGoA + 4, T.flashPeak - 4, [0, 1], EASE.in);
  const reveal = tween(frame, T.weekForty - 6, T.weekForty + 26, [0, 1], EASE.out);
  const sweep = tween(frame, T.weekForty - 4, T.weekForty + 34, [0, 1], EASE.inOut);
  const band = 22 + sweep * 56;
  const pulse = Math.sin(Math.min(1, Math.max(0, (frame - T.weekForty + 6) / 40)) * Math.PI);

  return (
    <AbsoluteFill>
      <Bloom frame={frame} />
      <AbsoluteFill style={{ transform: `translateY(${camY}px) scale(${cam})`, transformOrigin: "540px 1200px" }}>
        <Cavity opacity={1 - tween(frame, T.curtainA, T.curtainA + 24, [0, 1], EASE.inOut)} />
        <Curtains frame={frame} />
        <AbsoluteFill style={{ opacity: 1 - sacOut, transform: `scale(${1 + sacOut * 0.35})`, transformOrigin: "540px 860px" }}>
          <SacBack frame={frame} />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle 360px at 520px 800px, ${C.gold}55, ${C.gold}00)`,
            opacity: 0.25 + 0.5 * pulse + 0.1 * reveal,
            mixBlendMode: "screen",
          }}
        />
        {/* as it nears the light the baby overexposes and softens into it */}
        <AbsoluteFill style={{ filter: melt > 0.01 ? `brightness(${1 + melt * 0.6}) blur(${melt * 7}px)` : undefined }}>
          <Baby pose={pose} frame={frame} />
        </AbsoluteFill>
        {/* weekForty reveal: one soft band of warm light sweeps across the sac */}
        {sweep > 0 && sweep < 1 && (
          <AbsoluteFill
            style={{
              clipPath: "circle(404px at 540px 860px)",
              mixBlendMode: "screen",
              opacity: Math.sin(sweep * Math.PI) * 0.9,
              background: `linear-gradient(120deg, ${C.gold}00 ${band - 9}%, ${C.gold}5c ${band - 2.5}%, ${C.text}80 ${band}%, ${C.gold}5c ${band + 2.5}%, ${C.gold}00 ${band + 9}%)`,
            }}
          />
        )}
        <AbsoluteFill style={{ opacity: 1 - sacOut, transform: `scale(${1 + sacOut * 0.35})`, transformOrigin: "540px 860px" }}>
          <SacFront frame={frame} />
          <Motes frame={frame} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
