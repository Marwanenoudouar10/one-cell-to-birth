import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../../theme/colors";
import { EASE, tween } from "../../../../lib/ease";
import { T } from "../timeline";
import { AdultFinger } from "./AdultFinger";
import { Specks } from "./Backdrop";
import { BabyHandBack, BabyHandFront, GripDefs } from "./BabyHand";
import { GoldSpeck, goldGlow, VoiceRing } from "./GoldSpeck";
import { TIP_REST } from "./gripGeom";

export const GRIP = { x: 572, y: 742, rot: -18, scale: 1.18 };

// Gaussian bump around frame `c` (width w), 0..1.
const bump = (frame: number, c: number, w: number) => Math.exp(-((frame - c) ** 2) / (2 * w * w));

// "A finger in its palm, and it holds on tight": the newborn's hand closes
// around a grown-up's finger (copied from Scene5's HandWorld, re-timed). The
// room backdrop is drawn by the chapter root, under the lungs insert too.
export const HandWorld: React.FC<{ frame: number }> = ({ frame }) => {
  // camera: barely drifting, then the slow push-in on "One cell has become…"
  const push =
    tween(frame, T.handIn, T.pushA, [1.0, 1.02], EASE.inOut) +
    tween(frame, T.pushA, T.pushB, [0, 0.1], Easing.bezier(0.45, 0, 0.35, 1)) +
    tween(frame, T.pushB, T.last, [0, 0.025], EASE.out);

  // finger slides in, settles; later eases back a touch (the grip follows it)
  const slide = tween(frame, T.fingerIn, T.fingerRest, [900, TIP_REST], Easing.bezier(0.3, 0, 0.15, 1));
  const back = tween(frame, T.easeBack, T.tighten + 4, [0, 30], EASE.inOut);
  const tipX = slide + back;
  const follow = back * 0.45; // the hand is pulled along a little
  const contact = bump(frame, T.fingerRest - 4, 4);

  // squeeze pulse on "holds", the grip tightens on "tight", a last one on "Hello"
  const sq = bump(frame, T.squeeze + 3, 5) + 0.8 * bump(frame, T.tighten + 3, 6) + 0.4 * bump(frame, T.hello + 5, 7);
  const tight = tween(frame, T.easeBack + 2, T.tighten + 6, [0, 1], EASE.out);
  const life = noise2D("c16-life", frame * 0.04, 0) * 0.015;

  // the tiny fingers close one by one (index first), then the thumb
  const st = T.curlStagger;
  const dur = Math.max(8, T.curlB - T.curlA - 3 * st);
  const c = [0, 1, 2, 3].map(
    (i) => tween(frame, T.curlA + i * st, T.curlA + i * st + dur, [0, 1], EASE.inOut) + 0.1 * sq + 0.07 * tight + life * (frame > T.curlB ? 1 : 0),
  );
  const thumb = tween(frame, T.curlA + st * 2, T.curlB + 2, [0, 1], EASE.inOut) + 0.08 * sq + 0.05 * tight;
  const handLift = -contact * 8 + sq * 3;
  const handScale = 1 - 0.022 * sq - 0.012 * tight;

  // breathing warm light, a lift on "Hello"
  const helloLift = tween(frame, T.hello - 4, T.world + 6, [0, 1], EASE.inOut);
  const glow = 0.8 + 0.15 * Math.sin((frame / 75) * Math.PI * 2) + 0.4 * sq + 0.18 * helloLift;
  const specks = (tween(frame, T.handIn, T.curlB, [0.3, 0.55]) + tween(frame, T.pushA, T.pushA + 40, [0, 0.45])) * (1 - 0.4 * goldGlow(frame));
  const driftX = noise2D("c16-gx", frame * 0.006, 0) * 6;
  const driftY = noise2D("c16-gy", 0, frame * 0.006) * 6;
  const enter = tween(frame, T.handIn + 1, T.handIn + 15, [0, 1], EASE.out);

  return (
    <AbsoluteFill>
      <Specks frame={frame} opacity={specks} front={false} />
      <VoiceRing frame={frame} />
      <AbsoluteFill
        style={{
          opacity: enter,
          transform: `scale(${push * (1.04 - 0.04 * enter)})`,
          transformOrigin: `${GRIP.x}px ${GRIP.y}px`,
          filter: enter < 0.98 ? `blur(${(1 - enter) * 10}px)` : undefined,
        }}
      >
        <AbsoluteFill
          style={{
            opacity: glow,
            background: `radial-gradient(circle 250px at ${GRIP.x - 30}px ${GRIP.y - 50}px, ${C.gold}70 0%, ${C.gold}00 100%), radial-gradient(circle 520px at ${GRIP.x - 20}px ${GRIP.y - 40}px, ${C.gold}55 0%, ${C.peach}22 45%, ${C.peach}00 100%)`,
          }}
        />
        <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
          <GripDefs />
          <g transform={`translate(${GRIP.x + driftX} ${GRIP.y + driftY}) rotate(${GRIP.rot}) scale(${GRIP.scale})`}>
            <g transform={`translate(${follow} ${handLift}) scale(${handScale})`}>
              <BabyHandBack c={Math.min(1, c[1])} />
            </g>
            <g transform={`translate(0 ${sq * 4})`}>
              <AdultFinger tipX={tipX} />
            </g>
            <g transform={`translate(${follow} ${handLift}) scale(${handScale})`}>
              <BabyHandFront c={c} thumb={thumb} />
            </g>
          </g>
        </svg>
        <GoldSpeck frame={frame} />
      </AbsoluteFill>
      <Specks frame={frame} opacity={specks} front />
    </AbsoluteFill>
  );
};
