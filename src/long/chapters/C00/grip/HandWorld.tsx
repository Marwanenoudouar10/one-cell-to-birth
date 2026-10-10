// The film's opening image (adapted from src/scenes/Scene5/grip/HandWorld.tsx):
// the newborn's hand already closed around a grown-up's finger, the same shot
// the film ends on. A slow push toward the gold speck in the palm, then the
// plunge: the room scales past, blurs and drains away into the dark (its
// bright skin fades out of the caption zone first, so no band is needed there).
import React from "react";
import { AbsoluteFill } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../../theme/colors";
import { captionMask } from "../dive/mask";
import { T } from "../timeline";
import { AdultFinger } from "./AdultFinger";
import { Backdrop, Specks } from "./Backdrop";
import { BabyHandBack, BabyHandFront, GripDefs } from "./BabyHand";
import { TIP_REST } from "./gripGeom";
import { GRIP, S0, handCamAt } from "./handCam";

// Gaussian bump around frame `c` (width w), 0..1.
const bump = (frame: number, c: number, w: number) => Math.exp(-((frame - c) ** 2) / (2 * w * w));

export const HandWorld: React.FC<{ frame: number }> = ({ frame }) => {
  const cam = handCamAt(frame);
  const u = cam.u;
  // the grip is alive: a tiny squeeze on "wondered", micro-curl noise
  const sq = 0.7 * bump(frame, T.wondered + 6, 6) + 0.35 * bump(frame, T.began + 4, 6);
  const life = noise2D("c00-life", frame * 0.04, 0) * 0.015;
  const c = [0, 1, 2, 3].map((i) => 1 + 0.1 * sq + life * (1 - 0.3 * i));
  const thumb = 1 + 0.08 * sq;
  const handLift = sq * 3;
  const handScale = 1 - 0.022 * sq;
  const glow = 0.8 + 0.15 * Math.sin((frame / 75) * Math.PI * 2) + 0.3 * sq;

  // the plunge: motion blur, the warm colours drain, the room fades out
  const blur = 26 * Math.pow(u, 1.4);
  const drain = Math.min(1, u * 1.3);
  // dissolves over the last frames of the plunge (u climbs fast there), so
  // nothing is left to vanish in a single frame at the flash peak
  const g = Math.max(0, Math.min(1, (u - 0.45) / 0.42));
  const gone = g * g * (3 - 2 * g);
  const filter = u > 0.01 ? `blur(${blur.toFixed(2)}px) saturate(${(1 - 0.55 * drain).toFixed(3)}) brightness(${(1 - 0.4 * drain).toFixed(3)})` : undefined;
  if (frame > T.handGone + 1) return null;

  const xf = (k: number) => ({
    transform: `translate(${cam.tx * k}px, ${cam.ty * k}px) scale(${1 + (cam.s - 1) * k})`,
    transformOrigin: `${S0[0]}px ${S0[1]}px`,
  });

  return (
    <AbsoluteFill style={{ opacity: 1 - gone, filter, overflow: "hidden", ...captionMask(1 - 0.85 * Math.min(1, u * 1.8)) }}>
      {/* the room: a slower parallax plane */}
      <AbsoluteFill style={xf(0.45)}>
        <Backdrop frame={frame} />
        <Specks frame={frame} opacity={0.55} front={false} />
      </AbsoluteFill>
      <AbsoluteFill style={xf(1)}>
        <AbsoluteFill
          style={{
            opacity: glow,
            background: `radial-gradient(circle 250px at ${GRIP.x - 30}px ${GRIP.y - 50}px, ${C.gold}70 0%, ${C.gold}00 100%), radial-gradient(circle 520px at ${GRIP.x - 20}px ${GRIP.y - 40}px, ${C.gold}55 0%, ${C.peach}22 45%, ${C.peach}00 100%)`,
          }}
        />
        <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
          <GripDefs />
          <g transform={`translate(${GRIP.x + cam.dx} ${GRIP.y + cam.dy}) rotate(${GRIP.rot}) scale(${GRIP.scale})`}>
            <g transform={`translate(0 ${handLift}) scale(${handScale})`}>
              <BabyHandBack c={1} />
            </g>
            <g transform={`translate(0 ${sq * 4})`}>
              <AdultFinger tipX={TIP_REST} />
            </g>
            <g transform={`translate(0 ${handLift}) scale(${handScale})`}>
              <BabyHandFront c={c} thumb={thumb} />
            </g>
          </g>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={xf(1.6)}>
        <Specks frame={frame} opacity={0.5} front />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
