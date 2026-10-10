// C07 · First move (W07). "Week seven: its very first move. A tiny wiggle, months
// before anyone can feel it."
// It opens on C06's END exactly (Scene3's world, copied with C06's clocks: world/), the
// beating week-6 embryo. On "Week seven" its arm buds lengthen into paddles and the head
// swells (kit 6.0 -> 6.85); the pulse rings die away and the womb wall eases to a dead
// stop. On "first" a glint runs down the spinal cord, and on "move" the embryo makes
// one sideways bend of head and rump with soft motion arcs; on "wiggle" a second,
// smaller one. On "months" the camera eases back: the sac is small inside the dark
// womb, whose wall (kit backdrop + fold rings) stays perfectly still, even when the
// embryo flicks once more on "feel" (set-up for C11's first felt flutter). After "it",
// a slow push-in begins (C08 lands it).
import React from "react";
import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { embryoAnchors } from "../../../shared/embryo";
import { Camera, CaptionShade, WOMB_LOOKS, WombBackdrop } from "../../../shared/womb";
import { PaddleGlow } from "./Accents";
import { BEATS as B, C06_END } from "./beats";
import { BendEmbryo } from "./BendEmbryo";
import { cameraAt } from "./camera";
import { MotionArcs, arcParts } from "./MotionArcs";
import {
  WALL_FROZEN,
  beatClock,
  bendSpeed,
  bokehAt,
  exitAt,
  fluidClock,
  foldsAt,
  haloAmount,
  heartAt,
  kitWallAt,
  paddleGlow,
  ringsFor,
  sacClock,
  sacWob,
  sparkAt,
  topShadeAt,
  wallClock,
} from "./motion";
import { rigAt } from "./rig";
import { firstBeat } from "./world/beat";
import { Environment, Foreground } from "./world/Environment";
import { SAC } from "./world/geometry";
import { Layer } from "./world/Layer";
import { Particles } from "./world/Particles";
import { HeartHalo, PulseRings } from "./world/Rings";
import { SacBack, SacFront, sacPath } from "./world/Sac";
import { Yolk } from "./Yolk";

const L = WOMB_LOOKS.early;
const ARC_LAG = 6; // frames the motion arcs look back
// the womb cavity the fold rings wrap: a little below the sac (it sits up in the wall)
const WALL = { warmth: 0.04, depth: 0.75, r: 410, cx: 540, cy: 960, aspect: 1.12, pear: 0.3 };

export const C07: React.FC = () => {
  const f = useCurrentFrame();
  const rig = rigAt(f);
  const then = rigAt(Math.max(0, f - ARC_LAG)).a;
  const heart = rig.a.heart;
  const { pulse, glow } = heartAt(f);
  const first = firstBeat(beatClock(f));
  const rs = ringsFor(f);
  const out = exitAt(f);
  const cam = cameraAt(f);
  const sc = sacClock(f);
  const sacD = sacPath(sc, heart, rs, SAC.r, sacWob(f));
  const kitWall = kitWallAt(f);
  const speed = bendSpeed(f);
  const rest = embryoAnchors(rig.week, rig.size, rig.place);

  return (
    <AbsoluteFill>
      <Camera zoom={cam.zoom} x={cam.x} y={cam.y} drift={0}>
        {/* the womb wall for the wide shot: kit backdrop, frozen still (C11 pay-off) */}
        <AbsoluteFill style={{ opacity: kitWall * out }}>
          <Freeze frame={WALL_FROZEN}>
            <WombBackdrop {...L.backdrop} {...WALL} folds={foldsAt(f)} breathe={0} opaque={false} seed="s3" />
          </Freeze>
        </AbsoluteFill>
        <Layer depth={0.45} blur={22} opacity={(1 - kitWall) * out}>
          <Environment frame={wallClock(f)} />
        </Layer>
        <Layer depth={0.8} blur={1.5}>
          <Particles frame={fluidClock(f)} set="far" glow={glow} heart={heart} rs={rs} R={SAC.r} opacity={out} />
        </Layer>
        <Layer>
          <SacBack frame={sc} d={sacD} heart={heart} glow={glow} ignite={1} dim={1} R={SAC.r} vis={out} />
        </Layer>
        <Layer blend="screen">
          <PulseRings heart={heart} rs={rs} sacD={sacD} glow={glow} first={first} vis={out} />
        </Layer>
        <Layer>
          <Yolk f={f} rig={rig} glow={glow} heart={heart} rs={rs} sway={0} />
          <BendEmbryo
            week={rig.week}
            size={rig.size}
            x={rig.place.x}
            y={rig.place.y}
            rotate={rig.place.rotate}
            pose={rig.pose}
            heartBeat={pulse}
            heartGlow={glow + C06_END.glowAdd}
            spark={sparkAt(f)}
            id="emb"
            wobble={{ seed: C06_END.embryo.wobbleSeed, offset: 240 }}
          />
        </Layer>
        <Layer blend="screen">
          <HeartHalo heart={heart} glow={glow} pulse={pulse} ignite={1} hold={0} first={first} fill={1} vis={haloAmount(f) * out} flare={1} />
          <PaddleGlow at={rest.hand} v={paddleGlow(f, B.paddle)} id="arm" />
          <PaddleGlow at={rest.foot} v={0.8 * paddleGlow(f, B.legPaddle)} id="leg" r={58} />
        </Layer>
        {speed > 0.02 && (
          <>
            <Layer blend="screen" blur={9}>
              <MotionArcs pivot={rig.a.pivot} parts={arcParts(rig.a, then)} speed={speed} zoom={cam.zoom} soft />
            </Layer>
            <Layer blend="screen" blur={0.6}>
              <MotionArcs pivot={rig.a.pivot} parts={arcParts(rig.a, then)} speed={speed} zoom={cam.zoom} />
            </Layer>
          </>
        )}
        <Layer>
          <SacFront d={sacD} glow={glow} dim={1} R={SAC.r} vis={out} />
        </Layer>
        <Layer depth={1.25} blur={3}>
          <Particles frame={fluidClock(f)} set="near" glow={glow} heart={heart} rs={rs} R={SAC.r} opacity={out} />
        </Layer>
        <Layer depth={1.7} blur={7} opacity={bokehAt(f) * out}>
          <Foreground frame={fluidClock(f)} />
        </Layer>
      </Camera>
      <CaptionShade strength={out} top={topShadeAt(f) * out} />
    </AbsoluteFill>
  );
};
