import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { EASE, tween } from "../../../lib/ease";
import { T } from "../timeline";
import { AdultFinger } from "./AdultFinger";
import { Backdrop, Specks } from "./Backdrop";
import { BabyHandBack, BabyHandFront, GripDefs } from "./BabyHand";
import { TIP_REST } from "./gripGeom";

const GRIP = { x: 572, y: 742, rot: -18, scale: 1.18 };

// Gaussian bump around frame `c` (width w), 0..1.
const bump = (frame: number, c: number, w: number) => Math.exp(-((frame - c) ** 2) / (2 * w * w));

// "A whole new human": a newborn's hand closing around a grown-up's finger.
export const HandWorld: React.FC<{ frame: number }> = ({ frame }) => {
  const push = interpolate(frame, [T.flashPeak, T.last], [1.0, 1.09], {
    easing: Easing.bezier(0.3, 0.1, 0.45, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tipX = tween(frame, T.fingerA, T.fingerB, [900, TIP_REST], Easing.bezier(0.3, 0, 0.15, 1));
  const contact = bump(frame, T.fingerB - 4, 4);
  const sq = bump(frame, T.squeeze + 5, 5) + 0.45 * bump(frame, T.squeeze + 38, 7);
  const life = noise2D("s5-life", frame * 0.04, 0) * 0.015;
  const c = [0, 3, 6, 9].map(
    (d) => tween(frame, T.curlA + d, T.curlB + d * 0.6, [0, 1], EASE.inOut) + 0.1 * sq + life * (frame > T.curlB ? 1 : 0),
  );
  const thumb = tween(frame, T.curlA + 4, T.curlB + 4, [0, 1], EASE.inOut) + 0.08 * sq;
  const handLift = -contact * 8 + sq * 3;
  const handScale = 1 - 0.022 * sq;
  const glow = 0.8 + 0.15 * Math.sin((frame / 75) * Math.PI * 2) + 0.45 * sq;
  const specks = tween(frame, T.human, T.hello, [0.4, 1]);
  const driftX = noise2D("s5-gx", frame * 0.006, 0) * 6;
  const driftY = noise2D("s5-gy", 0, frame * 0.006) * 6;

  return (
    <AbsoluteFill>
      <Backdrop frame={frame} />
      <Specks frame={frame} opacity={specks} front={false} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${GRIP.x}px ${GRIP.y}px` }}>
        <AbsoluteFill
          style={{
            opacity: glow,
            background: `radial-gradient(circle 250px at ${GRIP.x - 30}px ${GRIP.y - 50}px, ${C.gold}70 0%, ${C.gold}00 100%), radial-gradient(circle 520px at ${GRIP.x - 20}px ${GRIP.y - 40}px, ${C.gold}55 0%, ${C.peach}22 45%, ${C.peach}00 100%)`,
          }}
        />
        <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
          <GripDefs />
          <g transform={`translate(${GRIP.x + driftX} ${GRIP.y + driftY}) rotate(${GRIP.rot}) scale(${GRIP.scale})`}>
            <g transform={`translate(0 ${handLift}) scale(${handScale})`}>
              <BabyHandBack c={Math.min(1, c[1])} />
            </g>
            <g transform={`translate(0 ${sq * 4})`}>
              <AdultFinger tipX={tipX} />
            </g>
            <g transform={`translate(0 ${handLift}) scale(${handScale})`}>
              <BabyHandFront c={c} thumb={thumb} />
            </g>
          </g>
        </svg>
      </AbsoluteFill>
      <Specks frame={frame} opacity={specks} front />
    </AbsoluteFill>
  );
};
