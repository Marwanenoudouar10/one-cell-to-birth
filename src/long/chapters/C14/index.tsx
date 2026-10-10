// C14 "Practice breaths" (W32 -> W36). The turn from C13 completes head-down,
// the baby practises breathing (chest + diaphragm, no air), pauses, then a lung
// inset shows the tree, its grape-like sacs and the golden surfactant film.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { heartbeat } from "../../../lib/ease";
import { Fetus } from "../../../shared/fetus";
import {
  AmnioticSac, Camera, CaptionShade, CordShape, FluidSpecks, LightShafts, Placenta, WOMB_LOOKS, WombBackdrop, WombLayer, placentaPort,
} from "../../../shared/womb";
import { BABY, babyAt } from "./baby";
import { CHEST_TREE } from "./lungTree";
import { LENS, LungLens } from "./LungLens";
import { bloomAt, breatheAt, cameraAt } from "./motion";
import { BreathGlow } from "./BreathGlow";
import { HeadGlow } from "./HeadGlow";
import { RhythmLine } from "./Rhythm";
import { MouthSwirls } from "./Swirls";
import { XRayChest } from "./XRayChest";

const L = WOMB_LOOKS.late;
const SAC = { ...L.sac, cx: 540, cy: 860, r: 405 };
const BACK = { ...L.backdrop, cx: 540, cy: 860, r: 414 };
const PORT = placentaPort(SAC, L.placenta.at, L.placenta.size);

export const C14: React.FC = () => {
  const f = useCurrentFrame();
  const b = babyAt(f);
  const cam = cameraAt(f);
  const portLocal = { x: PORT.x - BABY.x, y: PORT.y - BABY.y };
  const src = CHEST_TREE.tips
    .map((t) => b.w(b.chest(t.p)))
    .reduce((best, p) => (Math.hypot(p.x - LENS.x, p.y - LENS.y) < Math.hypot(best.x - LENS.x, best.y - LENS.y) ? p : best));
  // the whole body swells a hair with each practice breath (about the chest)
  const cc = b.chest({ x: 0, y: -0.4 });
  const k = 1 + 0.014 * breatheAt(f);
  const breathScale = `translate(${cc.x.toFixed(1)} ${cc.y.toFixed(1)}) scale(${k.toFixed(4)}) translate(${(-cc.x).toFixed(1)} ${(-cc.y).toFixed(1)})`;
  const cord = (
    <CordShape from={b.a.navel} to={portLocal} slack={0.45} side={1} twist={1} pulse={0.6} bpm={140} width={L.cordWidth} sway={0.6} seed="c14-cord" frame={f} />
  );
  return (
    <AbsoluteFill>
      <Camera zoom={cam.zoom} y={cam.y} seed="c14-cam">
        <WombBackdrop {...BACK} seed="c14-bd" />
        <AmnioticSac {...SAC} seed="c14-sac">
          <LightShafts {...L.shafts} seed="c14-sh" />
          <FluidSpecks seed="c14-far" count={22} />
          <Placenta {...L.placenta} />
          <HeadGlow f={f} b={b} />
          <WombLayer>
            <g transform={`translate(${BABY.x} ${BABY.y}) ${breathScale}`}>
              <Fetus week={b.week} size={BABY.size} pose={b.pose} heartbeat={heartbeat(f, 140)} cord={cord} bloom={bloomAt(f)} uid="c14b" />
              <BreathGlow f={f} b={b} />
              <XRayChest f={f} b={b} />
              <RhythmLine f={f} b={b} />
              <MouthSwirls f={f} b={b} />
            </g>
          </WombLayer>
          <FluidSpecks seed="c14-near" layer="near" count={9} />
        </AmnioticSac>
        <WombLayer>
          <LungLens f={f} source={src} />
        </WombLayer>
        <FluidSpecks layer="lens" count={4} seed="c14-lens" />
        <CaptionShade mode="multiply" />
      </Camera>
    </AbsoluteFill>
  );
};
