// Light for the close-up (screen space):
//   RedGlow   dim rose-red light filtering through the womb wall, BEHIND the
//             head (only seen beyond the face's profile), swelling as the lids open
//   EdgeLight the same light kissing the profile edge (on top, screen blend)
//   Vignette / SafeShade  warm wine-dark falloff (see below)
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../../../theme/colors";
import { EASE } from "../../../lib/ease";
import { BEATS } from "./beats";
import { EYE_ECU, Shot } from "./camera";

const hex = (a: number) =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0");

export const roseAt = (f: number) =>
  interpolate(f, [BEATS.lidOpen - 6, BEATS.lidOpenFull + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });

export const RedGlow: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const breathe = 0.92 + 0.08 * Math.sin(f * 0.07);
  const a = shot.ecu * (0.18 + 0.82 * roseAt(f)) * breathe;
  if (a < 0.01) return null;
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: a,
        background: `radial-gradient(ellipse 700px 1000px at 1060px 470px, ${C.heart}88 0%, ${C.womb}55 38%, ${C.wombDeep}22 70%, transparent 100%)`,
      }}
    />
  );
};

export const EdgeLight: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const a = shot.ecu * roseAt(f);
  if (a < 0.01) return null;
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: a * 0.75,
        background: `radial-gradient(ellipse 520px 900px at 1120px 560px, ${C.rose}55 0%, ${C.womb}22 50%, transparent 100%)`,
      }}
    />
  );
};

// Warm shade, never grey: wine-dark multiply.
//   Vignette  close-up only: the frame falls off around the eye
//   SafeShade always: tracker band and caption zone (the torso and later the
//             cheek sit under the captions), plus the kit's dark shade, lighter
export const Vignette: React.FC<{ shot: Shot }> = ({ shot }) => {
  const a = shot.ecu;
  if (a < 0.01) return null;
  return (
    <AbsoluteFill
      style={{
        opacity: a,
        mixBlendMode: "multiply",
        // + a top band (rule 8): bright brow skin fills the tracker band up close
        background: `linear-gradient(180deg, ${C.wombDeep}66 0px, ${C.wombDeep}40 250px, transparent 430px), radial-gradient(ellipse 760px 900px at ${EYE_ECU.x + 70}px ${EYE_ECU.y - 30}px, transparent 0%, transparent 46%, ${C.wombDeep}40 72%, ${C.wombDeep}a0 100%)`,
      }}
    />
  );
};

export const SafeShade: React.FC = () => (
  <AbsoluteFill
    style={{
      mixBlendMode: "multiply",
      background: `linear-gradient(180deg, ${C.wombDeep}b0 0px, ${C.wombDeep}70 230px, transparent 400px, transparent 1120px, ${C.wombDeep}66 1290px, ${C.wombDeep}a6 1430px, ${C.wombDeep}80 1640px, ${C.wombDeep}40 1920px)`,
    }}
  />
);
