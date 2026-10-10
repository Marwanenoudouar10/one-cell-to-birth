// WOMB KIT - one shared world for every chapter set inside the uterus.
// import { Camera, WombBackdrop, AmnioticSac, ... } from "../../shared/womb";
//
// COORDINATES: world px on the 1080x1920 canvas. With <Camera> defaults
// (zoom 1, x 540, y 860) world == screen. Angles in degrees, SVG convention
// (0 = right, 90 = down, -90 = up). Frames = useCurrentFrame() of wherever
// the component renders (your chapter's local frame inside its Sequence).
//
// LAYERING: every component is a full-frame layer (AbsoluteFill + SVG) that
// reads the camera from context; DOM order = paint order. Typical shot:
//
//   const f = useCurrentFrame();
//   const L = WOMB_LOOKS.mid;
//   const heart = { x: 520, y: 840 };
//   const ripples = [
//     ...heartbeatRipples(f, { ...heart, start: 0, bpm: 150, strength: 0.6 }),
//     { x: 760, y: 1080, t: 40, kind: "kick" },
//   ];
//   <Camera zoom={tween(f, 0, 180, [1, 1.08], EASE.inOut)} shake={kickShake(f, 40)}>
//     <WombBackdrop {...L.backdrop} />
//     <AmnioticSac {...L.sac} ripples={ripples}>
//       <LightShafts {...L.shafts} />              // clipped to the fluid
//       <FluidSpecks seed="c7far" />                // behind the baby
//       <Placenta {...L.placenta} />                // direct child!
//       <Cord from={bellyPt} width={L.cordWidth} /> // `to` = placenta port
//       <WombLayer blur={focusBlur}><MyFetus /></WombLayer>
//       <FluidSpecks seed="c7near" layer="near" count={12} />
//     </AmnioticSac>
//     <SoundWaves from={{ x: -60, y: 300 }} dir={35} progress={p} sac={L.sac} />
//     <FluidSpecks layer="lens" count={5} seed="c7lens" />
//     <CaptionShade />
//   </Camera>
//
// COMPONENTS (all props optional unless noted; full docs atop each file)
//   Camera        zoom x y rot shake drift anchor seed       - Camera.tsx
//   WombLayer     depth blur opacity blend                   - Camera.tsx
//   WombBackdrop  warmth depth parallax folds cx cy r aspect pear breathe opaque
//   AmnioticSac   cx cy r aspect pear wobble ripples warmth villi sheen opacity part seed
//   Placenta      at spread size opacity (cx cy r standalone)
//   Cord          from* to slack side twist pulse bpm width sway opacity depth blur seed
//   FluidSpecks   count seed layer("far"|"near"|"lens") size opacity drift
//   LightShafts   from angle fan count intensity length width color clip depth blend
//   SoundWaves    from* dir* progress* count spacing length spread width color sac
//   CaptionShade  strength top mode("dark"|"multiply") from to
// RIPPLES: Ripple = { x, y, t(start frame), kind?: "beat"|"kick"|"sound",
//   strength?, life? }; helpers heartbeatRipples(), soundRipples(),
//   soundProgress(); camera helper kickShake().
// RAW SVG for your own layers: PlacentaShape, CordShape, placentaPort(),
//   useSac() (live membrane: d, rAt(theta), shape, ripples), SacClip,
//   insetPath(), membraneArc(), camTransform(), worldToScreen().
// PALETTE C only. Every SVG id is "wb-<name>-<reactId>", so many instances
// (and other kits) never collide.
export { Camera, WombLayer, useWombCamera, camTransform, worldToScreen, kickShake } from "./Camera";
export type { CamState } from "./Camera";
export { WombBackdrop } from "./WombBackdrop";
export type { WombBackdropProps } from "./WombBackdrop";
export { AmnioticSac, makeSac } from "./AmnioticSac";
export type { AmnioticSacProps } from "./AmnioticSac";
export { Placenta, PlacentaShape, placentaPort } from "./Placenta";
export type { PlacentaProps } from "./Placenta";
export { Cord, CordShape } from "./Cord";
export type { CordProps } from "./Cord";
export { FluidSpecks } from "./FluidSpecks";
export type { FluidSpecksProps } from "./FluidSpecks";
export { LightShafts } from "./LightShafts";
export type { LightShaftsProps } from "./LightShafts";
export { SoundWaves } from "./SoundWaves";
export type { SoundWavesProps } from "./SoundWaves";
export { CaptionShade } from "./CaptionShade";
export type { CaptionShadeProps } from "./CaptionShade";
export { heartbeatRipples, liveRipples, RIPPLE_LIFE } from "./ripples";
export type { Ripple, RippleKind, LiveRipple } from "./ripples";
export { soundRipples, soundProgress, sacEntry } from "./sound";
export type { WaveTrain } from "./sound";
export { useSac, SacClip, insetPath, membraneArc, shapeArc } from "./sacContext";
export type { SacState } from "./sacContext";
export { WOMB_LOOKS, mixLook } from "./presets";
export type { WombLook } from "./presets";
export type { Pt, SacShape } from "./geom";
