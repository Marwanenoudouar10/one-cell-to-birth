import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, tween } from "../../../lib/ease";
import { Camera, CaptionShade, FluidSpecks, WOMB_LOOKS, WombBackdrop, WombLayer } from "../../../shared/womb";
import { BEATS as B, GHOSTS } from "./beats";
import { Disc } from "./Disc";
import { discGeo } from "./geo";
import { Dome } from "./Dome";
import { FinaleDefs, KitEmbryo, KitStalk } from "./Finale";
import { Ghosts, Sparks, ghostState } from "./Ghosts";
import { GhostGlow, LayerGlow } from "./Glow";
import { Yolk } from "./Yolk";
import { cameraAt, discOutAt, glowAt, glowPhaseAt, kitInAt, swoopBlurAt, viewAt, worldAt, yolkAt } from "./view";

// C05 · Three layers (W04). "Week four: the embryo forms three layers. One
// builds brain and skin. One, heart and bone. One, lungs and gut."
// A two-tone germ disc floats between the amnion (above) and the yolk sac
// (below). The primitive streak draws itself, cells pour through it and a rose
// middle layer slides in; the view tilts down to a side cut so the three
// stacked layers read (cool, rose, gold). Each layer glows in turn and ghost
// glyphs of what it builds bloom above. After "bone." the view tilts back and
// pushes in onto the embryo kit: the gold layer glows on through the yolk sac
// while the disc stretches into a slipper (kit 3.3 -> 4.0), a groove draws
// down its centre, the folds rise, and a dim, unlit heart tube waits.
// END = C06's frame 0 (see the END contract in beats.ts).
const L = WOMB_LOOKS.early;

export const C05: React.FC = () => {
  const f = useCurrentFrame();
  const v = viewAt(f);
  const g = discGeo(v);
  const glow = glowAt(f);
  const phase = glowPhaseAt(f);
  const cam = cameraAt(f);
  const world = worldAt(f);
  const yolk = yolkAt(f, v);
  const kitIn = kitInAt(f);
  const disc = discOutAt(f);
  // the amnion swells away and fades as the view pulls back (C06 grows its own sac)
  const burst = tween(f, B.release, B.swap + 10, [0, 1], EASE.inOut);
  const dome = 0.9 * (1 - tween(f, B.release + 4, B.swap + 10, [0, 1], EASE.inOut));
  const anyGlow = Math.max(...glow);
  const anyGhost = Math.max(...GHOSTS.map((gh) => ghostState(f, gh).o));

  return (
    <Camera zoom={cam.zoom} drift={cam.drift} seed="c05cam">
      <AbsoluteFill style={{ opacity: world.opacity }}>
        <WombBackdrop {...L.backdrop} warmth={world.warmth} folds={world.folds} r={390} seed="c05wall" />
      </AbsoluteFill>
      <FluidSpecks seed="c05far" count={24} r={470} opacity={0.75 * world.specks} />
      <WombLayer blur={Math.max(0.06, swoopBlurAt(f))}>
        <FinaleDefs />
        <KitStalk f={f} yolk={yolk} />
        <Yolk y={yolk} shade={(0.35 + 0.65 * v.side) * (1 - yolk.swapT)} glow={glow[0]} opacity={0.42 + 0.58 * Math.max(yolk.swapT, 0.55 * glow[0])} />
        <Disc v={v} g={g} f={f} glow={glow} phase={phase} opacity={disc} />
        {kitIn > 0.001 && <KitEmbryo f={f} opacity={kitIn} />}
        <Dome v={v} burst={burst} opacity={dome} />
      </WombLayer>
      <WombLayer blur={18} blend="screen" opacity={anyGlow > 0.001 ? 1 : 0}>
        <LayerGlow f={f} v={v} g={g} glow={glow} disc={disc} yolk={yolk} />
      </WombLayer>
      <WombLayer depth={0} blur={18} blend="screen" opacity={anyGhost > 0.01 ? 1 : 0}>
        <GhostGlow f={f} />
      </WombLayer>
      <WombLayer depth={0} blend="screen">
        <Sparks f={f} v={v} yolk={yolk} />
      </WombLayer>
      <Ghosts f={f} />
      <FluidSpecks layer="lens" count={4} seed="c05lens" opacity={world.specks} />
      <CaptionShade />
    </Camera>
  );
};
