// The close-up layer locked to the fetus: skin patch + macro eye + brow
// twitch, in the kit's rig / head-local spaces (same week, pose and size as
// the <Fetus> in World). Fades in as the camera closes in on the eye.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { WombLayer } from "../../../shared/womb";
import { EASE } from "../../../lib/ease";
import { BEATS } from "./beats";
import { Shot } from "./camera";
import { Eye, EyeDefs } from "./Eye";
import { BrowTwitch, EyePatch } from "./EyePatch";
import { SkinDetail } from "./Skin";
import { lidOpenAt } from "./eyeShape";
import { kitGeo } from "./kitGeo";
import { FX, FY, SIZE, kitWeek, poseAt } from "./rig";

const zr = (z: number, a: number, b: number) => Math.max(0, Math.min(1, (Math.log(z) - Math.log(a)) / (Math.log(b) - Math.log(a))));
const ramp = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.inOut });
const bump = (f: number, at: number, len: number) => (f <= at || f >= at + len ? 0 : Math.sin((Math.PI * (f - at)) / len) ** 2);

export const MacroEye: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const fade = EASE.inOut(zr(shot.zoom, 3.4, 5.6));
  const brow = bump(f, BEATS.browTwitch, 10) + 0.5 * bump(f, BEATS.browTwitch + 9, 7);
  if (fade <= 0.002 && brow <= 0.01) return null;
  const { geo, fr, headXf } = kitGeo(kitWeek(f), poseAt(f, 0), SIZE);
  const detail = EASE.inOut(zr(shot.zoom, 4.5, 13));
  const open = lidOpenAt(f);
  const seam =
    detail * (0.32 + 0.45 * bump(f, BEATS.w27 - 4, 24) + 0.55 * ramp(f, BEATS.seamWake, BEATS.lidCrack)) * (1 - ramp(f, BEATS.lidOpen, BEATS.lidOpenFull));
  const glint = f >= BEATS.seamGlint && f <= BEATS.seamGlint + 16 ? (f - BEATS.seamGlint) / 16 : -1;
  const rose = ramp(f, BEATS.lidOpen, BEATS.lidOpenFull + 10);
  const stir = bump(f, BEATS.seamWake, BEATS.lidOpen - BEATS.seamWake) * 0.6 + bump(f, BEATS.lidCrack, 16);
  return (
    <WombLayer>
      <EyeDefs />
      <g transform={`translate(${FX} ${FY})`}>
        <g transform={fr.css}>
          <EyePatch geo={geo} fr={fr} opacity={fade} headXf={headXf} />
          <g transform={headXf}>
            <SkinDetail eye={geo.lm.eye} amt={detail * fade} frame={f} />
            <Eye eye={geo.lm.eye} look={{ open, detail, seam, glint, rose, stir: Math.min(1, stir), frame: f }} opacity={fade} />
            <BrowTwitch eye={geo.lm.eye} amt={Math.min(1, brow)} />
          </g>
        </g>
      </g>
    </WombLayer>
  );
};
