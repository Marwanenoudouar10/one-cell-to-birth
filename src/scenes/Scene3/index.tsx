import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../theme/colors";
import { EASE, tween } from "../../lib/ease";
import { Embryo } from "./Embryo";
import { buildGeo } from "./embryoShape";
import { Environment, Foreground } from "./Environment";
import { Pt } from "./geometry";
import { Layer } from "./Layer";
import {
  EMBRYO,
  SAC,
  camera,
  embryoFloat,
  firstBeat,
  heartGlow,
  heartPulse,
  hold,
  ignite,
  reveal,
  rings,
} from "./motion";
import { Particles } from "./Particles";
import { HeartHalo, PulseRings } from "./Rings";
import { SacBack, SacFront, sacPath } from "./Sac";
import { YolkSac } from "./YolkSac";

// Scene3 — "Week six: a tiny heart starts to beat."
// Inside the womb: the week-6 embryo resolves in its sac, then its heart
// ignites and beats (lub-dub), sending soft pulse rings through the sac.
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = heartPulse(frame);
  const glow = heartGlow(frame);
  const lit = ignite(frame);
  const hd = hold(frame);
  const first = firstBeat(frame);
  const rv = reveal(frame);
  const fl = embryoFloat(frame);
  const geo = buildGeo(frame, fl.calm);

  // Embryo pose (local -> world).
  const s = EMBRYO.scale * rv.scale * (1 + 0.01 * pulse);
  const rot = rv.rot + fl.rot;
  const tx = EMBRYO.x + fl.dx;
  const ty = EMBRYO.y + fl.dy + rv.dy;
  const toWorld = (p: Pt): Pt => {
    const r = (rot * Math.PI) / 180;
    const x = p.x * s;
    const y = p.y * s;
    return { x: tx + x * Math.cos(r) - y * Math.sin(r), y: ty + x * Math.sin(r) + y * Math.cos(r) };
  };
  const heartW = toWorld(geo.heart);
  const bellyW = toWorld(geo.stalk);
  const target = { x: EMBRYO.x + geo.heart.x * EMBRYO.scale, y: EMBRYO.y + geo.heart.y * EMBRYO.scale };
  const cam = camera(frame, target);

  const rs = rings(frame);
  const sacD = sacPath(frame, heartW, rs);
  const dim = 1 - 0.3 * hd;
  const intro = tween(frame, 0, 40, [1, 0], EASE.out);

  return (
    <AbsoluteFill>
      <Layer cam={cam} depth={0.45} blur={22} opacity={dim}>
        <Environment frame={frame} />
      </Layer>
      <Layer cam={cam} depth={0.8} blur={1.5}>
        <Particles frame={frame} set="far" glow={glow} heart={heartW} rs={rs} />
      </Layer>
      <Layer cam={cam}>
        <SacBack frame={frame} d={sacD} heart={heartW} glow={glow} ignite={lit} dim={dim} />
      </Layer>
      <Layer cam={cam} blend="screen">
        <PulseRings heart={heartW} rs={rs} sacD={sacD} glow={glow} first={first} />
      </Layer>
      <Layer cam={cam} blur={rv.blur * 0.7}>
        <YolkSac frame={frame} belly={bellyW} reveal={rv.opacity} glow={glow} heart={heartW} rs={rs} />
      </Layer>
      <Layer cam={cam} blur={rv.blur} opacity={rv.opacity}>
        <g transform={`translate(${tx} ${ty}) rotate(${rot}) scale(${s})`}>
          <Embryo g={geo} pulse={pulse} glow={glow} ignite={lit} hold={hd} />
        </g>
      </Layer>
      <Layer cam={cam} blend="screen">
        <HeartHalo heart={heartW} glow={glow} pulse={pulse} ignite={lit} hold={hd} first={first} />
      </Layer>
      <Layer cam={cam}>
        <SacFront d={sacD} glow={glow} dim={dim} />
      </Layer>
      <Layer cam={cam} depth={1.25} blur={3}>
        <Particles frame={frame} set="near" glow={glow} heart={heartW} rs={rs} />
      </Layer>
      <Layer cam={cam} depth={1.7} blur={7}>
        <Foreground frame={frame} />
      </Layer>
      {/* keep the caption band calm */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, transparent 63%, ${C.bg0}70 73%, ${C.bg0}70 81%, transparent 88%)`,
        }}
      />
      {/* warm glow carried over from Scene2's implantation close-up */}
      <AbsoluteFill
        style={{
          opacity: intro,
          background: `radial-gradient(circle at ${SAC.x}px ${SAC.y}px, ${C.rose}aa 0%, ${C.womb}66 28%, transparent 60%)`,
        }}
      />
    </AbsoluteFill>
  );
};
