// C11 staging: deterministic set-up solved once at load (where the kick lands,
// where the shot starts, the sound ring's path), plus the camera, the effect
// envelopes and the sac ripples, all as pure functions of the local frame.
import { random } from "remotion";
import { C } from "../../../theme/colors";
import { EASE, tween } from "../../../lib/ease";
import { fetusAnchors } from "../../../shared/fetus";
import { Ripple, kickShake, sacEntry } from "../../../shared/womb";
import { BEATS as B } from "./beats";
import { Core, EAR_HIT, IMPACT, P2, SAC_C, core, lerp } from "./timeline";

const add = (a: P2, b: P2): P2 => ({ x: a.x + b.x, y: a.y + b.y });
const mean = (ps: P2[]): P2 => ({ x: ps.reduce((s, p) => s + p.x, 0) / ps.length, y: ps.reduce((s, p) => s + p.y, 0) / ps.length });
const polar = (deg: number, r: number): P2 => ({ x: SAC_C.x + Math.cos((deg * Math.PI) / 180) * r, y: SAC_C.y + Math.sin((deg * Math.PI) / 180) * r });

// --- the kick lands exactly on the wall: solve the sideways placement ---
const reachAt = (dx: number) => {
  const c = core(IMPACT, dx);
  const a = fetusAnchors(c.week, c.pose, c.size);
  let best = { d: -1, p: c.pos };
  for (const q of a.footReach) {
    const p = add(c.pos, q);
    const d = Math.hypot(p.x - SAC_C.x, p.y - SAC_C.y);
    if (d > best.d) best = { d, p };
  }
  return { ...best, r: c.sacR };
};
const solveDx = () => {
  let lo = -160;
  let hi = 160;
  for (let i = 0; i < 26; i++) {
    const mid = (lo + hi) / 2;
    const r = reachAt(mid);
    if (r.d > r.r - 5) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
};
export const DX = solveDx();
export const KICK_AT = reachAt(DX).p;
export const KICK_ANG = (Math.atan2(KICK_AT.y - SAC_C.y, KICK_AT.x - SAC_C.x) * 180) / Math.PI;

export const state = (f: number) => core(f, DX);

// --- the shot starts on C10's fingertips ---
const c0 = state(0);
export const HAND0 = add(c0.pos, mean(fetusAnchors(c0.week, c0.pose, c0.size).fingertips));

// --- one slow, wide, low sound ring from the mother's side (left) ---
const ce = state(EAR_HIT);
export const EAR = add(ce.pos, fetusAnchors(ce.week, ce.pose, ce.size).ear);
const WAVE_DIR = -6;
const WAVE_D = 620; // source -> ear (px): close enough that the arc reads as a ring
const WAVE_LEN = 1100; // fades out before it reaches the far wall
const from = { x: EAR.x - Math.cos((WAVE_DIR * Math.PI) / 180) * WAVE_D, y: EAR.y - Math.sin((WAVE_DIR * Math.PI) / 180) * WAVE_D };
const entry = sacEntry({ from, dir: WAVE_DIR }, { cx: SAC_C.x, cy: SAC_C.y, r: state(B.sound).sacR }).d;
const speed = (WAVE_D - entry) / (EAR_HIT - B.sound); // px / frame: meets the wall at W19, the ear at the startle
// a low sound heard from inside: drawn muffled (soft and wide) all the way,
// so it reads as a slow pressure wave rather than a crisp voice arc
const MUFFLE = { cx: SAC_C.x, cy: SAC_C.y, r: 1600 };
export const WAVE = { from, dir: WAVE_DIR, count: 1, length: WAVE_LEN, spread: 58, width: 54, color: C.peach, sac: MUFFLE, seed: "c11-snd" };
export const WAVE_START = B.sound - entry / speed;
export const WAVE_END = WAVE_START + WAVE_LEN / speed;
const WAVE_ENTRY = { x: from.x + Math.cos((WAVE_DIR * Math.PI) / 180) * entry, y: from.y + Math.sin((WAVE_DIR * Math.PI) / 180) * entry };

// --- the flutter: bubble-like ripples spreading across the lower-right wall,
// around the spot the kick will strike (kept clear of the placenta) ---
const FL_ANG = KICK_ANG - 8;
const FL_N = 17;
export const FLUTTER = Array.from({ length: FL_N }, (_, i) => {
  // spread outward from the centre, alternating sides
  const side = i % 2 === 0 ? 1 : -1;
  const reach = Math.ceil(i / 2) / Math.ceil((FL_N - 1) / 2);
  const r = (k: string) => random(`c11-fl-${k}-${i}`);
  return {
    ang: FL_ANG + side * reach * (side > 0 ? 34 : 30) + (r("a") - 0.5) * 6,
    t: B.flutter + Math.round(i * 1.1 + r("t") * 2),
    out: -16 + 46 * r("o"), // px from the membrane: just inside the fluid .. into the wall
    size: (1.35 - 0.5 * reach) * (0.8 + 0.4 * r("s")),
  };
});
export const FLUTTER_LIFE = 26;
export const FLUTTER_SPAN = [FL_ANG - 30, FL_ANG + 40];

// --- every sac ripple of the chapter (the kit keeps only the live ones) ---
export const RIPPLES: Ripple[] = [
  { ...WAVE_ENTRY, t: B.sound, kind: "sound", strength: 0.9, life: 70 },
  ...FLUTTER.filter((_, i) => i % 2 === 0).map((b): Ripple => ({ ...polar(b.ang, 400), t: b.t, kind: "sound", strength: 2.1, life: 40 })),
  { ...KICK_AT, t: IMPACT, kind: "kick", strength: 0.85 },
  { ...KICK_AT, t: IMPACT + 1, kind: "beat", strength: 0.75 },
  { ...KICK_AT, t: IMPACT + 9, kind: "beat", strength: 0.35 },
];

// --- camera: pull back from the fingertips, breathe, hold while the week-20
// spurt pops (so the growth reads), make room, then lean in to the wall ---
export const camera = (f: number) => {
  const T = B.weekTwenty;
  const pull = tween(f, 0, B.pullEnd, [0, 1], EASE.inOut);
  const punch = tween(f, IMPACT - 1, IMPACT + 1) * Math.exp(-Math.max(0, f - IMPACT) / 6);
  const wide =
    lerp(1.1, 1.14, tween(f, B.pullEnd, T, [0, 1], EASE.inOut)) *
    lerp(1, 0.9, tween(f, T + 12, T + 50, [0, 1], EASE.inOut)) *
    lerp(1, 1.025, tween(f, T + 50, B.flutter - 24, [0, 1], EASE.inOut)) *
    lerp(1, 1.06, tween(f, B.flutter - 24, B.flutter + 12, [0, 1], EASE.inOut)) *
    lerp(1, 1.02, tween(f, IMPACT + 8, B.end, [0, 1], EASE.inOut)) *
    (1 + 0.02 * punch);
  const earLook = tween(f, B.sound - 20, B.sound + 6, [0, 1], EASE.inOut) * (1 - tween(f, B.startle + 10, T, [0, 1], EASE.inOut));
  const wallLook = tween(f, B.flutter - 24, B.flutter + 12, [0, 1], EASE.inOut) * (1 - tween(f, IMPACT + 14, B.end, [0, 1], EASE.inOut));
  const look = { x: SAC_C.x - 10 * earLook + 44 * wallLook, y: SAC_C.y + 14 - 22 * earLook + 30 * wallLook };
  const zoom = Math.exp(lerp(Math.log(6.2), Math.log(wide), pull));
  return { zoom, x: lerp(HAND0.x, look.x, pull), y: lerp(HAND0.y, look.y, pull), shake: kickShake(f, IMPACT, 3) };
};

// --- effect envelopes ---
export const effects = (f: number, c: Core) => ({
  // lanugo glint running crown -> rump, then a vernix sheen across the body
  shimmerP: tween(f, B.w18, B.w18 + 40, [0, 1], EASE.inOut),
  shimmerA: tween(f, B.w18 - 2, B.w18 + 6) * (1 - tween(f, B.w18 + 36, B.w18 + 48, [0, 1], EASE.inOut)),
  sheenP: tween(f, B.w18 + 14, B.w18 + 46, [0, 1], EASE.inOut),
  sheenA: tween(f, B.w18 + 12, B.w18 + 20) * (1 - tween(f, B.w18 + 38, B.w18 + 50, [0, 1], EASE.inOut)),
  ear: tween(f, EAR_HIT - 5, EAR_HIT + 1) * (1 - tween(f, EAR_HIT + 6, EAR_HIT + 42, [0, 1], EASE.inOut)),
  earAge: f - EAR_HIT,
  // measuring line: crown -> rump, then on to the heel
  cr: tween(f, B.measureCR, B.measureCR + 12, [0, 1], EASE.inOut),
  heel: tween(f, B.measureHeel, B.measureHeel + 15, [0, 1], EASE.inOut),
  measureA: tween(f, B.measureCR - 3, B.measureCR + 3) * (1 - tween(f, B.measureOff, B.measureOff + 12, [0, 1], EASE.inOut)),
  // one glint along the whole line, crown -> heel, once it is complete
  sweepP: tween(f, B.measureHeel + 15, B.measureHeel + 33, [0, 1], EASE.inOut),
  // C10's glowing fingertips fade as the focus pulls back
  tips: tween(f, 0, 26, [1, 0], EASE.inOut),
  // extra calm behind the captions while the close-up start fills the frame
  capShade: tween(f, 0, B.pullEnd - 8, [1, 0], EASE.inOut),
  // the flutter: light catches the moving wall
  wall: tween(f, B.flutter - 2, B.flutter + 4) * (1 - tween(f, B.flutter + 14, B.flutter + 40, [0, 1], EASE.inOut)),
  flash: f >= IMPACT ? Math.exp(-(f - IMPACT) / 6) : 0,
  bloom: c.bloom,
});
export type Fx = ReturnType<typeof effects>;
