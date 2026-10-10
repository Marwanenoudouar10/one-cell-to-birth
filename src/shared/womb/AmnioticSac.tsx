// <AmnioticSac>: the living, glassy fluid bubble the baby floats in.
//
// Props (all animatable, world px / degrees):
//   cx, cy     centre (default 540, 860 = HERO centre)
//   r          radius (early ~300, mid ~360, late/cramped ~450)
//   aspect     ry / rx (default 1; 1.06 = a touch taller)
//   pear       0..1 broader top, narrower bottom (full-term womb shape)
//   wobble     0 still, 1 default organic wobble, 2 restless
//   ripples    Ripple[] (see ripples.ts): beats, kicks, sounds deform the
//              membrane and draw their own rings/flashes
//   warmth     fluid look, blending the teaser's three sacs: 0 = dark glassy
//              (Scene3, week 6), 0.4 = wine-rose (Scene4, weeks 12-20),
//              1 = glowing rose-peach (Scene5, week 40)
//   villi      0..1 fuzzy chorionic fringe outside the membrane (early weeks)
//   sheen      0..1 glassy specular highlights (default 1)
//   opacity    the sac's own layers (children keep theirs: wrap everything in
//              an AbsoluteFill with opacity to fade the whole sac world)
//   part       "all" (default) | "back" | "front": render only one half if
//              you need to slot several of your own layers in between
//   seed       noise seed (two sacs on screen = two seeds)
//   children   rendered BETWEEN the back (fluid) and the front (membrane):
//              <Placenta>, <Cord>, <FluidSpecks>, <LightShafts>, your own
//              <WombLayer> art. They can read the sac via useSac().
// A <Placenta> placed as a DIRECT child also hides the membrane line where
// it sits (the amnion line hands over to the placenta surface).
import React from "react";
import { useCurrentFrame } from "remotion";
import { WombLayer } from "./Camera";
import { SacShape, smooth } from "./geom";
import { Placenta, PlacentaProps } from "./Placenta";
import { KickFx, RingFx, SoundFx } from "./RippleFx";
import { Ripple, liveRipples, membranePoints, membraneR } from "./ripples";
import { SacBack } from "./SacBack";
import { SacFront, SacGap } from "./SacFront";
import { SacProvider, SacState } from "./sacContext";

export type AmnioticSacProps = {
  cx?: number;
  cy?: number;
  r?: number;
  aspect?: number;
  pear?: number;
  wobble?: number;
  ripples?: Ripple[];
  warmth?: number;
  villi?: number;
  sheen?: number;
  opacity?: number;
  part?: "all" | "back" | "front";
  seed?: string;
  children?: React.ReactNode;
};

// Build the sac state for a frame (exported for advanced use / custom layers).
export const makeSac = (
  frame: number,
  o: { shape: SacShape; wobble?: number; ripples?: Ripple[]; warmth?: number; seed?: string },
): SacState => {
  const shape: Required<SacShape> = { aspect: 1, pear: 0, ...o.shape };
  const rs = liveRipples(o.ripples, frame);
  const mo = { ...shape, frame, wobble: o.wobble ?? 1, seed: o.seed ?? "wb-sac" };
  return {
    shape,
    frame,
    ripples: rs,
    warmth: o.warmth ?? 0,
    placentas: [],
    d: smooth(membranePoints(mo, rs)),
    rAt: (th: number) => membraneR(th, mo, rs),
  };
};

const gapsOf = (children: React.ReactNode): SacGap[] =>
  React.Children.toArray(children)
    .filter((c): c is React.ReactElement<PlacentaProps> => React.isValidElement(c) && c.type === Placenta)
    .map((c) => ({ at: c.props.at ?? -38, spread: c.props.spread ?? 32, size: c.props.size ?? 1 }));

export const AmnioticSac: React.FC<AmnioticSacProps> = ({
  cx = 540,
  cy = 860,
  r = 360,
  aspect = 1,
  pear = 0,
  wobble = 1,
  ripples,
  warmth = 0,
  villi = 0,
  sheen = 1,
  opacity = 1,
  part = "all",
  seed = "wb-sac",
  children,
}) => {
  const frame = useCurrentFrame();
  const gaps = gapsOf(children);
  const sac = { ...makeSac(frame, { shape: { cx, cy, r, aspect, pear }, wobble, ripples, warmth, seed }), placentas: gaps };
  const hasRings = sac.ripples.some((k) => k.kind === "beat");
  const flash = Math.max(0, ...sac.ripples.filter((k) => k.kind === "kick").map((k) => Math.exp(-k.age / 6)));
  const back = part !== "front";
  const front = part !== "back";
  return (
    <SacProvider value={sac}>
      {back && (
        <WombLayer opacity={opacity}>
          <SacBack sac={sac} villi={villi} seed={seed} />
        </WombLayer>
      )}
      {back && hasRings && (
        <WombLayer opacity={opacity} blend="screen">
          <RingFx sac={sac} />
        </WombLayer>
      )}
      {children}
      {front && (
        <WombLayer opacity={opacity}>
          <SacFront sac={sac} sheen={sheen} gaps={gaps} flash={flash} />
          <SoundFx sac={sac} />
          <KickFx sac={sac} />
        </WombLayer>
      )}
    </SacProvider>
  );
};
