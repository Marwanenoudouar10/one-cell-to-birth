// C08 · Webbing and tail (W08 -> W09, 7.5 s, enters by fade from C07).
// "Week eight: its fingers are webbed, and it even has a little tail.
//  Both fade away, right on cue."
// Opens on C07's END exactly (handoff.ts: its wide shot, push-in, world, clocks and
// embryo), then one continuous dive lands on a close-up of the webbed hand (shared embryo
// kit, kit week 7.0 -> 7.5 -> 8.99) inside C07's sac. The heart races ahead on "Week eight".
// A gold ring finds the webbed paddle (finger rays glow on "webbed"), then glides down to
// the tail as the camera follows; on "Both" the webbing and the tail tip are sculpted away
// into gold dust, the body lengthens and uncurls a little, the camera leans in and on "cue"
// the free stubby fingers flex once. Then it breathes back to the whole embryo (no tail)
// as the focus softens for C09's focus pull. All timing lives in beats.ts.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, tween } from "../../../lib/ease";
import { YolkSac, YolkStalk, embryoAnchors, sacEdge } from "../../../shared/embryo";
import { Camera, CaptionShade } from "../../../shared/womb";
import { BEATS as B } from "./beats";
import { cameraAt, driftAt, topShadeAt } from "./camera";
import { Dust, fronts, tailCut } from "./Dust";
import { RayGlow, Spotlight, TopShade } from "./Glow";
import { heartAt } from "./heart";
import { EMB0, HALO, TOP_SHADE, yolkAt } from "./handoff";
import { KitEmbryo } from "./KitEmbryo";
import { EMB, handMix, handToWorld, poseAt } from "./kit";
import { GoldRing, ringAt } from "./Ring";
import { tailGeo } from "./tail";
import { WorldBack, WorldFront, sacD } from "./World";
import { HeartHalo } from "./world/Halo";
import { Layer } from "./world/Layer";

// each free finger curls once, little finger first, the wave peaking on "cue"
const flexAt = (f: number, i: number) => {
  const t0 = B.flex - 6 + 2 * (4 - i) - 4;
  return tween(f, t0, t0 + 7, [0, 1], EASE.out) * (1 - tween(f, t0 + 9, t0 + 20, [0, 1], EASE.inOut));
};

// the heart halo: C07's 0.45, up while the heart races, dimmed while the ring points elsewhere
const haloAt = (f: number) =>
  HALO +
  tween(f, B.quicken, B.quicken + 14, [0, 0.25], EASE.inOut) -
  tween(f, B.ringOn - 6, B.ringOn + 10, [0, 0.42], EASE.inOut) +
  tween(f, B.dissolveEnd, B.toHand, [0, 0.1], EASE.inOut);

export const C08: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(f);
  const cam = cameraAt(f);
  const { pulse, glow } = heartAt(f);
  const heart = pose.heart;
  const a = embryoAnchors(pose.week, pose.size, EMB);
  const yolk = yolkAt(pose.week, pose.size);
  const tail = tailGeo(pose, tween(f, B.fadeEnd, B.pushEnd, [0, 1], EASE.inOut), tailCut(f));
  // rays light on "webbed", then settle to a soft glow until the dissolve
  const rays =
    tween(f, B.rays - 4, B.rays + 8, [0, 1], EASE.out) *
    (1 - 0.6 * tween(f, B.rays + 14, B.ringMove, [0, 1], EASE.inOut)) *
    (1 - tween(f, B.dissolve - 6, B.dissolve + 6, [0, 1], EASE.inOut));
  const ring = ringAt(f, pose, pose);
  const hand = { front: fronts(f), rays, flex: [0, 1, 2, 3, 4].map((i) => flexAt(f, i)) };
  const soften = tween(f, B.soften, B.end, [0, 2.4], EASE.in);
  // tracker band: C07's dark top shade hands over to a same-hue multiply while the
  // close-ups crop the head under the tracker (camera.ts topShadeAt)
  const headShade = topShadeAt(cam.zoom);
  const top = TOP_SHADE * (1 - 0.6 * headShade);
  // "right on cue": a soft spotlight opens on the free fingers, released for C09's pull
  // (the dimming ramps are slower than the ring's own draw, so no frame jumps > ~10/255)
  const handSpot = tween(f, B.toHand - 6, B.toHand + 12, [0, 0.75], EASE.inOut) * (1 - tween(f, B.flex + 4, B.exit + 6, [0, 1], EASE.inOut));
  const ringSpot = tween(f, B.ringOn - 4, B.ringOn + 16, [0, 1], EASE.inOut) * (1 - tween(f, B.ringOff - 4, B.ringOff + 12, [0, 1], EASE.inOut));
  const spot = ringSpot > handSpot ? { at: ring.c, r: ring.r, o: ringSpot } : { at: handToWorld(pose, { x: 0.55, y: 0 }), r: pose.hand.R * 1.9, o: handSpot };
  const d = sacD(f, heart);
  return (
    // the blur filter stays on (0 px most of the time) so the blend isolation never toggles
    <AbsoluteFill style={{ filter: `blur(${soften.toFixed(2)}px)` }}>
      <Camera zoom={cam.zoom} x={cam.x} y={cam.y} drift={driftAt(f)} seed="c08cam">
        <WorldBack f={f} heart={heart} glow={glow} d={d} />
        <Layer>
          {yolk.stalk > 0 && <YolkStalk from={a.yolkStalk} to={sacEdge(yolk, a.yolkStalk)} scale={yolk.stalk} glow={glow} />}
          <YolkSac x={yolk.x} y={yolk.y} r={yolk.r} glow={glow} id="c08" />
          <KitEmbryo pose={pose} heartBeat={pulse} heartGlow={glow + EMB0.glowAdd} hand={hand} handMix={handMix(f)} tail={tail} />
        </Layer>
        <Layer blend="screen">
          <HeartHalo heart={heart} glow={glow} pulse={pulse} vis={haloAt(f)} />
          <RayGlow pose={pose} o={rays * 0.9} />
          <Dust f={f} pose={pose} />
          <GoldRing s={ring} f={f} />
        </Layer>
        <WorldFront f={f} heart={heart} glow={glow} d={d} />
        <Spotlight {...spot} />
        <TopShade o={headShade} />
      </Camera>
      <CaptionShade top={top} />
    </AbsoluteFill>
  );
};
