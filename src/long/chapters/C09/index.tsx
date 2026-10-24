// C09 · Fetus (W10 -> W11 -> W12), 10.0 s, enters by focus pull from C08.
// "Week ten: every major organ is in place. The embryo becomes a fetus.
//  Week twelve: fingers, toes, a face."
// Reuses the teaser's Scene4 (sac world, gold rings + sparkles, face sweep, partial-follow
// camera, spotlight) with the shared fetus kit (kit week 10.6 -> 12) in the womb kit,
// blending C08's world (early wall, Scene3 sac) into the mid look.
//   0-0.5    focus pull: our fetus's head sits where C08's embryo head was (zoom 2.55)
//   "ten"    the camera breathes back to the whole week-10 fetus
//   2.2-3.6  six soft organ glows tick on (heart, brain, lungs, liver, kidneys, gut),
//            all pulse together on "place"
//   4.45-5.5 "embryo" -> "fetus": warm band head -> toe, curl 0.7 -> 0.55, gold halo
//   5.75-6.5 pull back to the sac: placenta fades in on the upper-right wall (W12 wide)
//   6.7-7.6  dive onto the hand (zoom 4): on "fingers" it springs open inside a gold ring
//   8.0-8.4  after a 12-frame hold, tilt down to the foot: on "toes" they curl in a wave
//   8.6-9.3  pull back to the whole week-12 fetus: light sweeps the profile on "face", a
//            glint runs along the sealed lid (plants C12); END = calm whole-body hold
//            between the tracker and caption bands, for C10's fade
// Timing lives in beats.ts (+ the END contract for C10); the fetus in rig.ts; the camera
// in camera.ts; every other animated number in timeline.ts.
import React from "react";
import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { AmnioticSac, Camera, FluidSpecks, LightShafts, Placenta, WombBackdrop, WombLayer } from "../../../shared/womb";
import { timeline } from "./timeline";
import { Baby } from "./Baby";
import { MembranePatch } from "./World";
import { ScreenFx } from "./ScreenFx";

// C08's womb wall, frozen dead still on the same frame (it first stirs in C11)
const WALL_FROZEN = 285;

export const C09: React.FC = () => {
  const f = useCurrentFrame();
  const t = timeline(f);
  const L = t.look;
  return (
    // an always-on (0 px) filter keeps our blend isolation constant, so the focus pull
    // releasing its own blur at frame 15 cannot change how the multiply layers composite
    <AbsoluteFill style={{ filter: "blur(0px)" }}>
      <Camera zoom={t.cam.zoom} x={t.cam.x} y={t.cam.y} drift={t.drift} seed="c09cam">
        <AbsoluteFill>
          <Freeze frame={WALL_FROZEN}>
            <WombBackdrop {...L.backdrop} breathe={0} opaque={false} seed="s3" />
          </Freeze>
        </AbsoluteFill>
        <AmnioticSac {...L.sac} seed="c09-sac">
          <LightShafts intensity={L.shafts.intensity * t.shafts} seed="c09-shafts" />
          <FluidSpecks seed="c09-far" />
          {t.placenta > 0.003 && <Placenta {...L.placenta} opacity={t.placenta} />}
          {t.placenta > 0.003 && t.placenta < 0.997 && (
            <MembranePatch at={L.placenta.at} spread={L.placenta.spread} opacity={1 - t.placenta} />
          )}
          <WombLayer>
            <Baby t={t} f={f} />
          </WombLayer>
          {/* near specks only in the wide: in the close-ups a bright dot on the face reads as an eye */}
          {t.nearSpecks > 0.003 && <FluidSpecks seed="c09-near" layer="near" count={10} opacity={t.nearSpecks} />}
        </AmnioticSac>
        <FluidSpecks layer="lens" count={5} seed="c09-lens" />
        <ScreenFx t={t} />
      </Camera>
    </AbsoluteFill>
  );
};
