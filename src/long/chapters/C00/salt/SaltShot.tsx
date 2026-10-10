// "smaller than a grain of salt.": the grain slides in beside the cell while the
// camera pulls back, tumbles to rest, floats, glints on "salt" and slides away.
// It lives in the cell's world: edge = 3x the cell's diameter (salt ~0.3 mm,
// zygote ~0.1 mm), placed beside it, scaled by the same camera.
import React from "react";
import { EASE, tween } from "../../../../lib/ease";
import { R } from "../s1/constants";
import { T, crystalAt, eggXfAt } from "../timeline";
import { Crystal } from "./Crystal";

const EDGE = 3 * 2 * R; // egg units: three cell diameters
const OFF = { x: 590, y: -27 }; // crystal centre relative to the cell, egg units (pair centred, ~120 px margins)

export const SaltShot: React.FC<{ frame: number }> = ({ frame }) => {
  const st = crystalAt(frame);
  if (!st.on) return null;
  // after "away" the cell heads off to C01's spot; the grain keeps its place
  const cam = eggXfAt(Math.min(frame, T.away));
  const slideIn = (1 - st.inn) * 900;
  const slideOut = st.out * 1150;
  const settle = 1 - st.inn;
  const float = tween(frame, T.land, T.land + 20, [0, 1], EASE.inOut);
  const yaw = -22 - 16 * settle + 2.5 * Math.sin(frame * 0.035) * float - 28 * st.out;
  const pitch = -21 - 8 * settle + 1.5 * Math.sin(frame * 0.027 + 1) * float;
  const roll = 7 * settle + 1.2 * Math.sin(frame * 0.022 + 2) * float - 9 * st.out;
  const x = cam.x + cam.z * OFF.x + slideIn + slideOut;
  const y = cam.y + cam.z * OFF.y + 4 * Math.sin(frame * 0.05) * float - 30 * settle - 60 * st.out;
  const glint = tween(frame, T.salt - 4, T.salt + 18, [0, 1], EASE.inOut);
  return (
    <Crystal
      frame={frame}
      x={x}
      y={y}
      e={EDGE * cam.z}
      yaw={yaw}
      pitch={pitch}
      roll={roll}
      opacity={Math.min(1, st.inn * 3)}
      glint={glint}
      warm={0.55}
    />
  );
};
