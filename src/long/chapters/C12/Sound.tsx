// Mum's heartbeat as slow, wide, low sound rings (womb kit <SoundWaves>, in
// screen space, all muffled) rolling in from her side (upper left), about 70
// a minute; each lub-dub reaches the ear exactly on its beat, and the ear
// glows. The ear glow also answers the tummy rumble.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../../theme/colors";
import { SoundWaves, WombLayer, soundProgress } from "../../../shared/womb";
import { fetusAnchors } from "../../../shared/fetus";
import { BEATS, HEART_PERIOD, HEART_RINGS } from "./beats";
import { shotAt, toScreen } from "./camera";
import { P2, SIZE, camAnchors, kitWeek, poseAt, toWorld } from "./rig";

const SRC: P2 = { x: -300, y: 60 }; // mum's heart, off-screen upper left (screen px)
const SPEED = 34; // px per frame: slow (ring 1 enters the frame ~2.0 s)
const LEN = 1750;
const SPACING = 64; // lub ... dub
const STRENGTH = [1, 0.92, 0.62, 0.34];
const ALL_IN = { cx: 540, cy: 960, r: 6000 }; // everything is inside the womb: all arcs muffled

export const heartHits = Array.from({ length: HEART_RINGS }, (_, k) => Math.round(BEATS.heart1 + k * HEART_PERIOD));

// ear screen position at a frame (camera pose, no startle)
const earScreen = (f: number) => toScreen(shotAt(f), camAnchors(f).ear);

const TRAINS = heartHits.map((hit, k) => {
  const ear = earScreen(hit);
  const d = Math.hypot(ear.x - SRC.x, ear.y - SRC.y);
  const dir = (Math.atan2(ear.y - SRC.y, ear.x - SRC.x) * 180) / Math.PI;
  const start = hit - d / SPEED;
  return { start, end: start + (LEN + SPACING) / SPEED, dir, strength: STRENGTH[k] ?? 0.3 };
});

// `front`: a fainter screen-blended pass of the same arcs over the baby, so
// the rings visibly wash across the head and reach the ear
export const HeartRings: React.FC<{ front?: boolean }> = ({ front }) => {
  const f = useCurrentFrame();
  const live = TRAINS.filter((t) => f > t.start && f < t.end);
  const out = 1 - Math.max(0, Math.min(1, (f - (BEATS.heartOut - 18)) / 18)); // all gone by heartOut
  if (live.length === 0) return null;
  const arcs = live.map((t) => (
    <SoundWaves key={t.start} from={SRC} dir={t.dir} progress={soundProgress(f, t.start, t.end)} count={2} spacing={SPACING}
      length={LEN} spread={42} width={40} color={C.rose} depth={0} sac={ALL_IN} opacity={t.strength * out} seed={`c12-hb${Math.round(t.start)}`} />
  ));
  return front ? <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.5 }}>{arcs}</AbsoluteFill> : <>{arcs}</>;
};

const env = (f: number, at: number, decay: number) => (f < at ? 0 : Math.min(1, (f - at + 1) / 3) * Math.exp(-Math.max(0, f - at - 2) / decay));

// 0..1 ear glow, summed over heartbeat hits and the rumble
export const earGlowAt = (f: number) => {
  let a = 0;
  heartHits.forEach((h, k) => {
    a += (STRENGTH[k] ?? 0.3) * env(f, h, 9);
  });
  a += 0.75 * env(f, BEATS.startle - 2, 8);
  return Math.min(1, a);
};

// each beat also breathes a faint warm wash into the fluid from mum's side
// (behind the baby), so the rhythm is felt, not only seen
export const HeartPulse: React.FC = () => {
  const f = useCurrentFrame();
  let a = 0;
  heartHits.forEach((h, k) => {
    a += (STRENGTH[k] ?? 0.3) * env(f, h - 3, 11);
  });
  if (a < 0.01) return null;
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: Math.min(1, a) * 0.5,
        background: `radial-gradient(ellipse 900px 1100px at 120px 380px, ${C.rose}55 0%, ${C.womb}22 45%, transparent 100%)`,
      }}
    />
  );
};

// world-space glow on the ear (follows the real pose, startle included)
export const EarGlow: React.FC = () => {
  const f = useCurrentFrame();
  const a = earGlowAt(f);
  if (a < 0.01) return null;
  const ear = toWorld(fetusAnchors(kitWeek(f), poseAt(f, 0), SIZE).ear);
  const last = [...heartHits, BEATS.startle - 2].filter((h) => h <= f).pop() ?? f;
  const ringT = (f - last) / 20;
  return (
    <WombLayer blend="screen">
      <defs>
        <filter id="c12-earB" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={2.5} />
        </filter>
        <radialGradient id="c12-earG">
          <stop offset={0} stopColor={C.gold} stopOpacity={0.75} />
          <stop offset={0.45} stopColor={C.peach} stopOpacity={0.3} />
          <stop offset={1} stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={ear.x} cy={ear.y} r={24 + 6 * a} fill="url(#c12-earG)" opacity={a} />
      {ringT < 1 && (
        <circle cx={ear.x} cy={ear.y} r={12 + 26 * Math.sqrt(ringT)} fill="none" stroke={C.gold} strokeWidth={4} filter="url(#c12-earB)"
          opacity={0.6 * (1 - ringT) * Math.min(1, a * 1.6)} />
      )}
    </WombLayer>
  );
};
