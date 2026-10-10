// C13 · Brain spurt (W28 -> W31). "Week thirty: its brain adds about four
// teaspoons a week, folding as it grows."
// The focus pull lands on the open eye (C12's end), glides back to a side view
// of the head, which turns translucent: a glowing brain with a few shallow
// grooves and the open side fissure. A glowing teaspoon tips one bright drop
// into it on each week landing (it swells), the grown brain presses on the
// skull and crumples into finer folds, then the camera pulls back to the
// whole baby as it starts a slow half-somersault toward head-down.
// The baby is mirrored (faces left) from frame 0 so that its roll ends like
// Scene5 (C14 onward); the opening focus pull is the shot change that hides it.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../../theme/colors";
import { HERO } from "../../../theme/layout";
import { Fetus, buildFetus, fetusAnchors, outFrame } from "../../../shared/fetus";
import {
  AmnioticSac, Camera, CaptionShade, CordShape, FluidSpecks, LightShafts, Placenta, WOMB_LOOKS, WombBackdrop, WombLayer,
  placentaPort,
} from "../../../shared/womb";
import { HeadXray } from "./HeadXray";
import { Drop, Spoon } from "./Spoon";
import { DROP_AT, V2, scaled } from "./brainShape";
import { BABY, BACK, BLOOM, C14_AT, CORD, SAC, SEEDS, c14Drift } from "./handoff";
import { timeline } from "./motion";

const L = WOMB_LOOKS.late;
const PORT = placentaPort(SAC, L.placenta.at, L.placenta.size);
const EYE_SCREEN: V2 = { x: 402, y: 806 }; // frame 0: the open eye on C12's close-up spot
const HEAD_AIM: V2 = { x: -4, y: -26 }; // head-local point framed during the brain shot
const AIM_SCREEN: V2 = { x: 540, y: 840 };
const END_CAM: V2 = { x: HERO.cx, y: 860 }; // C14's camera at its frame 0

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpV = (a: V2, b: V2, t: number): V2 => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

export const C13: React.FC = () => {
  const f = useCurrentFrame();
  const tl = timeline(f);
  const geo = buildFetus(tl.week, tl.pose);
  const fr = outFrame(geo, BABY.size);
  const a = fetusAnchors(tl.week, tl.pose, BABY.size);
  const world = (q: V2): V2 => {
    const o = fr.toOut(geo.headPt(q));
    return { x: BABY.x + o.x, y: BABY.y + o.y };
  };

  // camera: eye close-up -> head (brain framed) -> whole baby (C14's framing)
  const wp = lerpV(world(geo.lm.eye), world(HEAD_AIM), tl.toHead);
  const sp = lerpV(EYE_SCREEN, AIM_SCREEN, tl.toHead);
  const headCam = { x: wp.x - (sp.x - HERO.cx) / tl.zoom, y: wp.y - (sp.y - HERO.cy) / tl.zoom };
  const look = lerpV(headCam, END_CAM, tl.back);
  const dr = c14Drift(f - C14_AT);

  // spoon hovers above the crown; its lip sits right over the landing point
  const hit = world(scaled(DROP_AT, tl.brain.scale));
  const lip = { x: hit.x + 6, y: hit.y - 54 + tl.spoon.lift };
  const d = tl.drop;
  const drop = d
    ? {
        x: lip.x,
        y: d.u > 0 ? lerp(lip.y + 5, hit.y, d.u * d.u) : lip.y + 5 * d.form,
        r: 6.4 * (0.5 + 0.5 * d.form),
        stretch: d.u > 0 ? 0.6 + 0.6 * d.u : 0.3 * d.form,
        alpha: tl.spoon.opacity > 0 ? 1 : 0,
      }
    : null;

  const cord = (
    <CordShape from={a.navel} to={{ x: PORT.x - BABY.x, y: PORT.y - BABY.y }} slack={CORD.slack} side={CORD.side} twist={1}
      pulse={CORD.pulse} bpm={140} width={L.cordWidth} sway={CORD.sway} seed={SEEDS.cord} frame={f - C14_AT} />
  );

  return (
    <AbsoluteFill>
      <Camera zoom={tl.zoom} x={look.x - dr.dx / tl.zoom} y={look.y - dr.dy / tl.zoom} rot={tl.roll + dr.rot} drift={0} seed={SEEDS.cam}>
        <WombBackdrop {...BACK} seed={SEEDS.bd} />
        <AmnioticSac {...SAC} seed={SEEDS.sac}>
          <LightShafts {...L.shafts} seed={SEEDS.sh} />
          <FluidSpecks seed={SEEDS.far} count={22} />
          <Placenta {...L.placenta} />
          <WombLayer>
            <g transform={`translate(${BABY.x} ${BABY.y})`}>
              <Fetus week={tl.week} size={BABY.size} pose={tl.pose} cord={cord} bloom={BLOOM * tl.toC14} uid="c13" />
            </g>
          </WombLayer>
          <FluidSpecks seed={SEEDS.near} layer="near" count={9} />
        </AmnioticSac>
        {/* isolate the head: the womb dims (plum multiply) while the brain is on show */}
        {tl.veil > 0.001 && (
          <AbsoluteFill
            style={{
              opacity: tl.veil,
              mixBlendMode: "multiply",
              background: `radial-gradient(ellipse 640px 720px at 540px 840px, ${C.bg2}66 0%, ${C.bg2}b0 55%, ${C.bg1}e6 100%)`,
            }}
          />
        )}
        <WombLayer>
          <HeadXray geo={geo} fr={fr} x={BABY.x} y={BABY.y} xray={tl.xray} press={tl.press} brain={tl.brain} />
          <Spoon x={lip.x} y={lip.y} {...tl.spoon} />
          <Drop d={drop} />
        </WombLayer>
        <FluidSpecks layer="lens" count={4} seed={SEEDS.lens} />
        <CaptionShade strength={1 - tl.back} top={0.8 * tl.xray} />
        <CaptionShade strength={tl.back} mode="multiply" />
      </Camera>
    </AbsoluteFill>
  );
};
