// C11 staging: deterministic set-up solved once at load (where the kick lands,
// where the shot starts, the sound ring's path), plus the camera, the effect
// envelopes and the sac ripples, all as pure functions of the local frame.
import { random } from "remotion";
import { C } from "../../../theme/colors";
import { EASE, tween } from "../../../lib/ease";
import { fetusAnchors } from "../../../shared/fetus";
import { Ripple, kickShake, sacEntry } from "../../../shared/womb";
import { BEATS as B } from "./beats";
import { Core, EAR_HIT, IMPACT, P2, SAC_C, TAPS, core, lerp } from "./timeline";

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

// --- the flutter: each light flick of the foot is felt by the wall right by
// the toes (the direction the foot points at that frame); the wall answers
// with a quiver and a few small bubble-like ripples that spread along it,
// working up the wall toward the spot the kick will strike ---
const footAngle = (f: number) => {
  const c = state(f);
  const a = fetusAnchors(c.week, c.pose, c.size);
  const far = a.footReach.map((q) => add(c.pos, q)).sort((p, q) => Math.hypot(q.x - SAC_C.x, q.y - SAC_C.y) - Math.hypot(p.x - SAC_C.x, p.y - SAC_C.y))[0];
  return (Math.atan2(far.y - SAC_C.y, far.x - SAC_C.x) * 180) / Math.PI;
};
const SPREAD = [0, -8, 5, -14]; // where each tap's ripples centre, relative to the toes (deg)
export const TAP_AT = TAPS.map((t, k) => ({ t, ang: footAngle(t) + SPREAD[k] }));
export const BUBBLES = TAP_AT.flatMap((tap, k) =>
  [0, 1, 2, 3].map((j) => {
    const r = (s: string) => random(`c11-bub-${s}-${k}-${j}`);
    return {
      ang: tap.ang + (j - 1.4) * 6.2 + (r("a") - 0.5) * 4,
      t: tap.t + (j === 0 ? 0 : 1 + Math.round(r("t") * 3)),
      out: -10 + 46 * r("o"), // px from the membrane: just inside the fluid .. into the wall
      R: (j === 0 ? 31 : 15 + 17 * r("s")) * (1 - 0.06 * k), // final radius (px), uneven: >= 8 px at phone size
      life: 13 + Math.round(5 * r("l")),
      rise: 0.5 + 0.6 * r("d"), // px per frame, drifting up
    };
  }),
);

// --- every sac ripple of the chapter (the kit keeps only the live ones) ---
const RIPPLES: Ripple[] = [
  { ...WAVE_ENTRY, t: B.sound, kind: "sound", strength: 0.9, life: 70 },
  // each flick makes the membrane quiver by the toes (the wall moves)
  ...TAP_AT.map((p, i): Ripple => ({ ...polar(p.ang, 404), t: p.t, kind: "sound", strength: 2.6 - 0.3 * i, life: 40 })),
  { ...KICK_AT, t: IMPACT, kind: "kick", strength: 0.85 },
  { ...KICK_AT, t: IMPACT + 1, kind: "beat", strength: 0.75 },
  { ...KICK_AT, t: IMPACT + 9, kind: "beat", strength: 0.35 },
];
// Under C12's focus pull the fluid rings fade (their strength is an alpha).
// A kick's strength also sets its ring RADIUS, so scaling it would shrink the
// rings back into a small target: instead its clock runs ahead, and the rings
// keep spreading (faster) and fade out by the last frame.
const KICK_WARP = 22; // extra frames of kick age by B.end
export const ripplesAt = (f: number): Ripple[] => {
  const k = exitFade(f);
  if (k > 0.999) return RIPPLES;
  const warp = KICK_WARP * tween(f, B.exit, B.end, [0, 1], EASE.in);
  return RIPPLES.map((r) => (r.kind === "kick" ? { ...r, t: r.t - warp } : { ...r, strength: (r.strength ?? 1) * k }));
};

// --- camera: pull back from the fingertips, breathe, hold while the week-20
// spurt pops (so the growth reads), ease out a little for the stretch, lean
// down to the wall the foot flutters against, then push in on the kick and
// stay on it to the end (its rings are still spreading under C12's pull) ---
export const camera = (f: number) => {
  const T = B.weekTwenty;
  const pull = tween(f, 0, B.pullEnd, [0, 1], EASE.inOut);
  const punch = tween(f, IMPACT - 1, IMPACT + 1) * Math.exp(-Math.max(0, f - IMPACT) / 6);
  const lean = tween(f, B.stretchEnd, B.flutter, [0, 1], EASE.inOut);
  const push = tween(f, B.tuck, IMPACT, [0, 1], EASE.inOut);
  const wide =
    lerp(1.2, 1.24, tween(f, B.pullEnd, T, [0, 1], EASE.inOut)) *
    lerp(1, 0.88, tween(f, T + 12, T + 50, [0, 1], EASE.inOut)) *
    lerp(1, 1.025, tween(f, T + 50, B.stretchEnd, [0, 1], EASE.inOut)) *
    lerp(1, 1.08, lean) *
    lerp(1, 1.05, push) *
    lerp(1, 1.02, tween(f, IMPACT + 6, B.end, [0, 1], EASE.inOut)) *
    (1 + 0.02 * punch);
  const earLook = tween(f, B.sound - 20, B.sound + 6, [0, 1], EASE.inOut) * (1 - tween(f, B.startle + 10, T, [0, 1], EASE.inOut));
  const look = {
    x: SAC_C.x - 10 * earLook + 100 * lean + 25 * push,
    y: SAC_C.y + 30 - 22 * earLook + 95 * lean - 25 * push,
  };
  const zoom = Math.exp(lerp(Math.log(6.2), Math.log(wide), pull));
  return { zoom, x: lerp(HAND0.x, look.x, pull), y: lerp(HAND0.y, look.y, pull), shake: kickShake(f, IMPACT, 3) };
};

// --- the womb wall: dead still since C07 (frozen clock, no breathing) until
// the flutter, when it stirs for the first time and starts to breathe ---
export const WALL_CLOCK0 = 285;
export const wall = (f: number) => ({
  clock: WALL_CLOCK0 + Math.max(0, f - B.flutter) + 26 * tween(f, B.flutter - 1, B.flutter + 22, [0, 1], EASE.out),
  breathe: tween(f, B.flutter - 1, B.flutter + 30, [0, 1], EASE.inOut),
});

// C12's focus pull starts at B.exit: glows, rings and flashes fade out under it
export const exitFade = (f: number) => 1 - tween(f, B.exit, B.end, [0, 1], EASE.inOut);

// --- effect envelopes ---
export const effects = (f: number, c: Core) => ({
  // lanugo glint running crown -> bottom (the fuzz it reveals glows on behind it)
  shimmerP: tween(f, B.w18, B.w18 + 34, [0, 1], EASE.inOut),
  shimmerA: tween(f, B.w18 - 2, B.w18 + 5) * (1 - tween(f, B.w18 + 32, B.w18 + 46, [0, 1], EASE.inOut)),
  // then a thin waxy vernix sheen slides across the body
  sheenP: tween(f, B.w18 + 6, B.w18 + 34, [0, 1], EASE.inOut),
  sheenA: tween(f, B.w18 + 4, B.w18 + 10) * (1 - tween(f, B.w18 + 28, B.w18 + 40, [0, 1], EASE.inOut)),
  // the ear catches the low sound ring
  ear: tween(f, EAR_HIT - 4, EAR_HIT + 1) * (1 - tween(f, EAR_HIT + 5, EAR_HIT + 30, [0, 1], EASE.inOut)),
  earAge: f - EAR_HIT,
  earFrom: WAVE_DIR + 180, // direction from the ear back toward the sound (deg)
  // measuring line: crown -> rump, then on to the heel
  cr: tween(f, B.measureCR, B.measureCR + 12, [0, 1], EASE.inOut),
  heel: tween(f, B.measureHeel, B.measureHeel + 15, [0, 1], EASE.inOut),
  measureA: tween(f, B.measureCR - 3, B.measureCR + 3) * (1 - tween(f, B.measureOff, B.measureOff + 12, [0, 1], EASE.inOut)),
  // one glint along the whole line, crown -> heel, once it is complete
  sweepP: tween(f, B.measureHeel + 14, B.measureHeel + 28, [0, 1], EASE.inOut),
  // C10's glowing fingertips fade as the focus pulls back
  tips: tween(f, 0, 26, [1, 0], EASE.inOut),
  // extra calm behind the captions and the tracker while the close-up start
  // fills the frame: tied to the camera zoom (full at 2.5x, gone by 1.35x)
  capShade: EASE.inOut(Math.max(0, Math.min(1, (camera(f).zoom - 1.35) / 1.15))),
  flash: (f >= IMPACT ? Math.exp(-(f - IMPACT) / 6) : 0) * exitFade(f),
  bloom: c.bloom,
});
export type Fx = ReturnType<typeof effects>;
