// C07's END world, continued on C07's own clocks (handoff.ts): the kit womb wall frozen
// dead still (C11's first felt flutter is the first time it stirs), Scene3's sac and
// fluid specks (copied in world/), the heart halo. Back layers go under the embryo,
// front layers (membrane rim, near specks) over it.
import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import { WOMB_LOOKS, WombBackdrop } from "../../../shared/womb";
import { SAC_SPEED, SAC_WOB, WALL, WALL_FROZEN, fluidClock0, sacClock0 } from "./handoff";
import { Layer } from "./world/Layer";
import { Particles } from "./world/Particles";
import { SacBack, SacFront, sacPath } from "./world/Sac";
import { Pt, SAC } from "./world/geometry";

const L = WOMB_LOOKS.early;

export const sacD = (f: number, heart: Pt) => sacPath(sacClock0 + SAC_SPEED * f, heart, [], SAC.r, SAC_WOB);

type P = { f: number; heart: Pt; glow: number; d: string };

export const WorldBack: React.FC<P> = ({ f, heart, glow, d }) => (
  <>
    <AbsoluteFill>
      <Freeze frame={WALL_FROZEN}>
        <WombBackdrop {...L.backdrop} {...WALL} breathe={0} opaque={false} />
      </Freeze>
    </AbsoluteFill>
    <Layer depth={0.8} blur={1.5}>
      <Particles frame={fluidClock0 + f} set="far" glow={glow} heart={heart} rs={[]} R={SAC.r} opacity={1} />
    </Layer>
    <Layer>
      <SacBack frame={sacClock0 + SAC_SPEED * f} d={d} heart={heart} glow={glow} ignite={1} dim={1} R={SAC.r} vis={1} />
    </Layer>
  </>
);

export const WorldFront: React.FC<P> = ({ f, heart, glow, d }) => (
  <>
    <Layer>
      <SacFront d={d} glow={glow} dim={1} R={SAC.r} vis={1} />
    </Layer>
    <Layer depth={1.25} blur={3}>
      <Particles frame={fluidClock0 + f} set="near" glow={glow} heart={heart} rs={[]} R={SAC.r} opacity={1} />
    </Layer>
  </>
);
