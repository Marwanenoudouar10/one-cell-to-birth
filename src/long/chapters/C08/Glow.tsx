// Small lighting helpers:
//   <RayGlow>    gold light along the five finger rays inside the webbing
//   <Spotlight>  screen-space soft dimming round the gold ring while it shows (and
//                round the free fingers on "right on cue"), so the eye goes straight
//                to the hand / tail tip
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../../../theme/colors";
import { useWombCamera, worldToScreen } from "../../../shared/womb";
import { Pt } from "../../../shared/embryo/math";
import { rayEnds } from "./Hand";
import { Pose, handToWorld } from "./kit";

// `at` world point, `r` world radius of the lit hole, `o` 0..1: non-focal skin dims ~40%
export const Spotlight: React.FC<{ at: Pt; r: number; o: number }> = ({ at, r: rw, o }) => {
  const cam = useWombCamera();
  const p = worldToScreen(cam, at);
  const r = rw * cam.zoom;
  return (
    <AbsoluteFill
      style={{
        opacity: Math.max(0, Math.min(1, o)),
        // multiply with the womb's deep rose (rule 13: a dark normal overlay greys the skin)
        mixBlendMode: "multiply",
        background: `radial-gradient(circle at ${p.x.toFixed(1)}px ${p.y.toFixed(1)}px, ${C.wombDeep}00 0px, ${C.wombDeep}00 ${(r * 1.25).toFixed(0)}px, ${C.wombDeep}85 ${(r * 3.4).toFixed(0)}px)`,
        pointerEvents: "none",
      }}
    />
  );
};

export const RayGlow: React.FC<{ pose: Pose; o: number }> = ({ pose, o }) => {
  if (o <= 0.01) return null;
  const w = pose.hand.R * 0.2;
  return (
    <g opacity={o}>
      <defs>
        <filter id="c08-ray-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={w * 0.6} />
        </filter>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => {
        const [a, b] = rayEnds(i).map((q) => handToWorld(pose, q));
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.gold} strokeWidth={w * 2.2} strokeLinecap="round" opacity={0.32} filter="url(#c08-ray-blur)" />
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.gold} strokeWidth={w * 0.35} strokeLinecap="round" opacity={0.3} />
          </g>
        );
      })}
    </g>
  );
};
