import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, tween } from "../../../lib/ease";
import { Embryo } from "../../../shared/embryo";
import { CaptionShade } from "../../../shared/womb";
import { BEATS as B, C05_END, OVERLAP } from "./beats";
import { SAC, aliveAt, camera } from "./camera";
import { Environment, Foreground } from "./Environment";
import { BudPop, Sparkle } from "./Glints";
import { C05World, EntryBase } from "./Handoff";
import { HeartTube } from "./HeartTube";
import { Layer } from "./Layer";
import {
  budPop,
  dimAt,
  exitAt,
  fillAt,
  firstBeat,
  handoverAt,
  heartGlow,
  heartPulse,
  hold,
  ignite,
  resolveAt,
  rings,
  squeezeAt,
  worldAt,
  zipAt,
} from "./motion";
import { Particles } from "./Particles";
import { HeartHalo, PulseRings } from "./Rings";
import { embryoRig } from "./rig";
import { SacBack, SacFront, sacPath } from "./Sac";
import { Yolk } from "./Yolk";

// C06 · First heartbeats (W05 -> W06). Scene3's week-6 heartbeat scene
// (src/scenes/Scene3: same layer stack, camera, womb, sac, pulse rings, halo,
// yolk sac, lub-dub), with the storyboard's additions: it opens on C05's END
// (the grooved disc + dim tube), the neural folds zip shut and the disc curls
// into a small C while Scene3's sac resolves around it; the camera pushes in
// as warm light fills the curved heart TUBE, the world holds its breath, the
// first beat lands as a squeeze wave + ring flash on "squeeze", then it beats
// steadily (110/min) while the camera eases back so the rings cross the sac;
// on "By week six" the embryo grows into Scene3's week-6 form (eye spot, arm
// then leg buds, the tube swells into the heart bulge on a lub) as the camera
// pushes in again (END_ZOOM, camera.ts); the lub on "heart" beats a little harder.
// The embryo is the shared kit (its week 6 IS Scene3's embryo), so it can
// morph from C05's week-4 disc and hand on to C07 unchanged.

// The kit seeds its wobble from `id`: C05 draws this same embryo as id "c05" on
// a clock that equals our frame, so we keep its id and the hand-off matches.
const WOBBLE_ID = "c05";

export const C06: React.FC = () => {
  const f = useCurrentFrame();
  const rig = embryoRig(f);
  const heart = rig.a.heart;
  const pulse = heartPulse(f);
  const glow = heartGlow(f);
  const first = firstBeat(f);
  const hd = hold(f);
  const fill = fillAt(f);
  const lit = ignite(f);
  const dim = dimAt(f);
  const world = worldAt(f);
  const res = resolveAt(f);
  const out = exitAt(f);
  const alive = aliveAt(f);
  const cam = camera(f, rig.rest.heart);
  const rs = rings(f);
  const R = SAC.r * (1 + 0.1 * (1 - res));
  const sacD = sacPath(f, heart, rs, R);
  // the tube is the hero of week 5; as the embryo grows into week 6 it swells into
  // the kit's (Scene3's) heart bulge on a lub (BEATS.heartSwap); the bulge stays a
  // dim rose under the tube until then
  const grow = tween(f, B.curlStart, B.curlEnd, [0, 1], EASE.inOut);
  const handover = handoverAt(f);
  const tubeVis = (C05_END.tube.vis + (1 - C05_END.tube.vis) * grow) * (1 - handover);
  const kitLit = lit * (0.2 + 0.8 * handover); // a dark bulge behind the red loop until the swap

  return (
    <AbsoluteFill>
      {f < OVERLAP + 1 && <EntryBase />}
      {world < 0.999 && <C05World cam={cam} vis={1 - world} />}
      <Layer cam={cam} depth={0.45} blur={22} opacity={dim * world * out}>
        <Environment frame={f} />
      </Layer>
      <Layer cam={cam} depth={0.8} blur={1.5}>
        <Particles frame={f} set="far" glow={glow} heart={heart} rs={rs} R={R} opacity={res * out} />
      </Layer>
      <Layer cam={cam}>
        <SacBack frame={f} d={sacD} heart={heart} glow={glow} ignite={lit} dim={dim} R={R} vis={res * out} />
      </Layer>
      <Layer cam={cam} blend="screen">
        <PulseRings heart={heart} rs={rs} sacD={sacD} glow={glow} first={first} vis={out} />
      </Layer>
      <Layer cam={cam}>
        <Yolk frame={f} rig={rig} glow={glow} heart={heart} rs={rs} alive={alive} />
        <Embryo
          week={rig.w}
          size={rig.size}
          x={rig.place.x}
          y={rig.place.y}
          rotate={rig.place.rotate}
          zip={zipAt(f)}
          heartBeat={pulse}
          heartGlow={glow + 0.4 * fill * (1 - 0.5 * lit)}
          heartLit={kitLit}
          hold={hd}
          alive={1 - 0.7 * hd}
          id={WOBBLE_ID}
        />
      </Layer>
      <Layer cam={cam} blend="screen">
        <HeartHalo heart={heart} glow={glow} pulse={pulse} ignite={lit} hold={hd} first={first} fill={fill} vis={out} flare={0.35 + 0.65 * handover} />
        <Sparkle at={rig.a.crown} t={f - B.zipHead} id="head" size={1.4} />
        <Sparkle at={rig.a.tail} t={f - B.zipTail} id="tail" size={1.15} />
        <BudPop at={rig.a.hand} v={budPop(f, B.armBuds)} id="arm" />
        <BudPop at={rig.a.foot} v={budPop(f, B.legBuds)} id="leg" r={44} />
      </Layer>
      {/* the tube is drawn AFTER the screen-blended halo (lesson 4): the halo's bright
          ring sits right on it and would wash its red to pink */}
      <Layer cam={cam} opacity={tubeVis}>
        {tubeVis > 0.001 && (
          <HeartTube rig={rig} fill={fill} ignite={lit} pulse={pulse} glow={glow} hold={hd} squeeze={squeezeAt(f)} grow={grow} swell={handover} />
        )}
      </Layer>
      <Layer cam={cam}>
        <SacFront d={sacD} glow={glow} dim={dim} R={R} vis={res * out} />
      </Layer>
      <Layer cam={cam} depth={1.25} blur={3}>
        <Particles frame={f} set="near" glow={glow} heart={heart} rs={rs} R={R} opacity={res * out} />
      </Layer>
      <Layer cam={cam} depth={1.7} blur={7} opacity={world * out}>
        <Foreground frame={f} />
      </Layer>
      {/* the tracker band shade follows the camera: only the first-beat push-in
          (zoom 1.6) brings the sac's villi and chorion glow up under the tracker */}
      <CaptionShade strength={out} top={tween(cam.scale, 1.4, 1.58, [0, 0.85], EASE.inOut)} />
    </AbsoluteFill>
  );
};
