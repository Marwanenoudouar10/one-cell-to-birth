import { random } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { B, DUR, END } from "./beats";
import { scroll, warp } from "./camera";
import { CONTACT_ANGLE, HEAD, RING_V, ZONA } from "./constants";
import { REST_IN, gateY, liningX } from "./corridor";
import { Vec, add, bez, bezLen, bezTan, clamp, lerp, mul, norm, polar, v } from "./math";
import { SpermPose } from "./Sperm";
import { N_SURVIVORS, SURVIVOR_STREAMS, WINNER_STREAM } from "./streamSpecs";
import { StreamSpec, alivePos, heading } from "./stream";

// The few dozen that get through the throat. Each one: rides the stream to the
// gap -> swims to the nearest tube wall -> rests, head in the cilia -> lights
// up (one by one, a cascade) -> swims on with a whipping tail toward the egg,
// where it crowds the corona (Scene1's finalists) until the zona reaction
// throws it off. Three "rivals" light first and lead, but tire before the egg.
type Path = { p0: Vec; p1: Vec; p2: Vec; len: number; v: number; t0: number; fHit: number; push: number; spin: number };
export type Survivor = {
  st: StreamSpec;
  side: number;
  off: number; // rest height above the throat's final gate line
  fRest: number;
  fLit: number;
  fDepart: number;
  rival: boolean;
  tilt: number; // its own resting angle offset (radians), so the row is not a comb
  path: Path | null;
};

const G_END = gateY(DUR);
const SOFT = 150; // finalists decelerate over this distance (Scene1)
const BURST = 16;
const ramp = (tau: number) => tau + BURST * (1 - Math.exp(-tau / 12));
const softcap = (d: number, L: number, b: number) => (d < L - b ? d : L - b * Math.exp(-(d - L + b) / b));

// Rest spot (heads in the cilia), riding with the corridor while it settles.
export const restPt = (sv: Survivor, f: number): Vec => {
  const y = G_END - sv.off + (scroll(f) - scroll(DUR));
  return v(liningX(y - scroll(f), sv.side) - sv.side * REST_IN, y);
};
const restAng = (sv: Survivor) => (sv.side < 0 ? Math.PI + 0.35 - sv.tilt : -0.35 + sv.tilt);
const lerpAng = (a: number, b: number, t: number) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;

export type Pre = { pos: Vec; ang: number; amp: number; lit: number; clock: number };

// Everything before it leaves the wall (shared with the winner).
export const prePose = (sv: Survivor, f: number): Pre => {
  const st = sv.st;
  const T = warp(f);
  const Tr = warp(sv.fRest);
  const Tl = warp(sv.fLit);
  const clock = T - 0.55 * clamp(T - Tr, 0, Tl - Tr) + 0.45 * Math.max(0, T - Tl);
  const lit = tween(f, sv.fLit - 1, sv.fLit + 2) * (1 - 0.5 * tween(f, sv.fLit + 3, sv.fLit + 18));
  const amp = lerp(1, 0.5, tween(f, sv.fRest - 2, sv.fRest + 6)) + tween(f, sv.fLit, sv.fLit + 3, [0, 1]) * 0.95;
  const pass = alivePos(st, st.fPass);
  const swim = (g: number) => {
    if (g < st.fPass) return alivePos(st, g);
    const k = EASE.inOut(clamp((g - st.fPass) / (sv.fRest - st.fPass)));
    const end = restPt(sv, g);
    return bez(pass, v(lerp(pass.x, end.x, 0.25), pass.y - 120), end, k);
  };
  if (f < sv.fRest) {
    const ang = lerpAng(heading(swim, f, 1), restAng(sv), tween(f, sv.fRest - 7, sv.fRest, [0, 1], EASE.inOut));
    return { pos: swim(f), ang, amp, lit, clock };
  }
  const j = noise2D(`${st.key}r`, f * 0.05, 0) * 2.5;
  const pos = add(restPt(sv, f), v(sv.side * j, j * 0.6));
  return { pos, ang: restAng(sv) + noise2D(`${st.key}ra`, f * 0.04, 1) * 0.08, amp, lit, clock };
};

// Once the winner pulls clear, the rest of the field dims so the eye follows it.
export const packDim = (f: number) => 1 - 0.45 * tween(f, B.oneOut - 12, B.oneOut + 4, [0, 1], EASE.inOut);

const finalAt = (p: Path, T: number) => {
  const d = softcap(p.v * ramp(Math.max(0, T - p.t0)), p.len, SOFT);
  const u = d / p.len;
  return { pos: bez(p.p0, p.p1, p.p2, u), tan: norm(bezTan(p.p0, p.p1, p.p2, Math.min(u, 0.999))), near: clamp((d - (p.len - SOFT)) / SOFT) };
};

export const survivorPose = (sv: Survivor, f: number): SpermPose | null => {
  const st = sv.st;
  const p = sv.path!;
  const pre = prePose(sv, f);
  const T = warp(f);
  let pos = pre.pos;
  let ang = pre.ang;
  let near = 0;
  if (f > sv.fDepart) {
    const c = finalAt(p, T);
    near = c.near;
    pos = add(c.pos, mul(c.tan, noise2D(`${st.key}j`, T * 0.07, 2) * 9 * near));
    ang = lerpAng(pre.ang, Math.atan2(c.tan.y, c.tan.x), tween(f, sv.fDepart, sv.fDepart + 7, [0, 1], EASE.inOut));
    ang += noise2D(`${st.key}a`, T * 0.035, 1) * (0.08 + 0.12 * near);
  }
  const hit = tween(f, p.fHit, p.fHit + 24, [0, 1], EASE.out);
  if (hit > 0) {
    pos = add(pos, mul(norm(pos), p.push * hit));
    ang += p.spin * hit;
  }
  const whip = 1 - tween(f, sv.fDepart + 10, sv.fDepart + 34);
  let op = packDim(f) * (1 - tween(f, p.fHit + 2, p.fHit + 22, [0, 1], EASE.in));
  op *= 1 - tween(f, B.fuse + 4, END - 6, [0, 1], EASE.inOut);
  if (op < 0.01) return null;
  return {
    x: pos.x,
    y: pos.y,
    ang: (ang * 180) / Math.PI,
    size: st.size,
    phase: st.omega * pre.clock + st.phi,
    amp: st.amp * (f > sv.fLit ? lerp(1, pre.amp, whip) : pre.amp) * (1 - 0.6 * hit),
    op: 0.92 * op,
    thick: st.thick,
    glow: 0.65,
    lit: pre.lit * (1 - hit),
  };
};

// ---- build ---------------------------------------------------------------
const byPass = [...SURVIVOR_STREAMS].sort((a, b) => a.fPass - b.fPass);
const sideOf = byPass.map((_, i) => (i % 2 === 0 ? -1 : 1));
const leftIdx = byPass.map((_, i) => i).filter((i) => sideOf[i] < 0);
const rivalSet = new Set(leftIdx.slice(0, 3));
const WIN_OFF = G_END - 250; // the winner rests at egg-plane y ~250, its lane start

// rest heights: rows along each wall, all above the funnel of the throat
// (Throat.tsx bends the walls in below ~260); the winner and rivals share the middle
const rows = (n: number) => Array.from({ length: n }, (_, k) => 680 - (k * 400) / Math.max(1, n - 1));
const leftRows = rows(leftIdx.length + 1).sort((a, b) => Math.abs(a - WIN_OFF) - Math.abs(b - WIN_OFF));
const winRow = leftRows.shift()!;
const rivalRows = leftRows.splice(0, 3);
const otherLeft = leftRows.sort((a, b) => b - a);
const rightRows = rows(byPass.length - leftIdx.length);

const mk = (st: StreamSpec, side: number, off: number, rival: boolean): Survivor => {
  const pass = alivePos(st, st.fPass);
  const dist = Math.hypot(Math.abs(liningX(0, side)) - REST_IN - Math.abs(pass.x), off);
  const tilt = (random(`${st.key}-tilt`) - 0.5) * 0.6;
  return { st, side, off, fRest: st.fPass + 4 + dist / 56, fLit: 0, fDepart: 0, rival, tilt, path: null };
};

const list: Survivor[] = [];
let li = 0;
let ri = 0;
byPass.forEach((st, i) => {
  const side = sideOf[i];
  if (rivalSet.has(i)) list.push(mk(st, side, rivalRows[ri++] + (random(`${st.key}-ro`) - 0.5) * 10, true));
  // irregular spacing along the wall: nature does not use a ruler
  else if (side < 0) list.push(mk(st, side, otherLeft[li++] + (random(`${st.key}-ro`) - 0.5) * 22, false));
  else list.push(mk(st, side, rightRows.shift()! + (random(`${st.key}-ro`) - 0.5) * 22, false));
});
export const WINNER_SV: Survivor = { ...mk(WINNER_STREAM, -1, winRow, false), path: null };

// the light cascade: rivals first, the winner a beat later, the rest in order
const order = [...list].sort((a, b) => Number(b.rival) - Number(a.rival) || a.fRest - b.fRest);
order.forEach((sv, k) => {
  const slot = lerp(B.rest + 2, B.restEnd, k / Math.max(1, order.length - 1));
  sv.fLit = Math.max(sv.fRest + 2, slot, k > 0 ? order[k - 1].fLit + 0.7 : 0);
  sv.fDepart = sv.fLit + 3;
});
const rivalsLit = Math.max(...list.filter((sv) => sv.rival).map((sv) => sv.fLit));
WINNER_SV.fLit = Math.max(WINNER_SV.fRest + 2, rivalsLit + 2);
WINNER_SV.fDepart = WINNER_SV.fLit + 3;

// paths to the corona, avoiding the winner's entry sector
const DEG = Math.PI / 180;
list.forEach((sv) => {
  const rnd = (k: string) => random(`${sv.st.key}-f${k}`);
  const p0 = restPt(sv, sv.fDepart);
  let th = Math.atan2(p0.y, p0.x) + (rnd("t") - 0.5) * 70 * DEG;
  let d = 168 + rnd("d") ** 1.6 * 100;
  if (sv.rival) {
    th = CONTACT_ANGLE + (rnd("s") < 0.5 ? -1 : 1) * (14 + rnd("t") * 14) * DEG;
    d = ZONA + HEAD + 40 + rnd("d") * 60;
  } else if (Math.abs(Math.atan2(Math.sin(th - CONTACT_ANGLE), Math.cos(th - CONTACT_ANGLE))) < 26 * DEG) {
    th = CONTACT_ANGLE + Math.sign(th - CONTACT_ANGLE || 1) * 28 * DEG;
  }
  const p2 = polar(d, th);
  const p1 = add(p2, polar(Math.min(240, 0.55 * Math.hypot(p0.x - p2.x, p0.y - p2.y)), Math.atan2(p0.y - p2.y, p0.x - p2.x) + (rnd("o") - 0.5) * 0.9));
  const len = bezLen(p0, p1, p2);
  const t0 = warp(sv.fDepart);
  const arrive = sv.rival ? B.oneOut - 6 + rnd("a") * 6 : B.oneOut - 4 + rnd("a") * (B.touch - B.oneOut);
  const vel = clamp((len - 40) / ramp(Math.max(4, warp(arrive) - t0)), 6, 34);
  const path: Path = { p0, p1, p2, len, v: vel, t0, fHit: 0, push: 110 + rnd("p") * 120, spin: (rnd("sp") - 0.5) * 1.4 };
  const dHit = Math.hypot(finalAt(path, warp(B.fuse)).pos.x, finalAt(path, warp(B.fuse)).pos.y);
  sv.path = { ...path, fHit: B.fuse + Math.max(0, dHit - ZONA) / RING_V };
});

export const SURVIVORS = list;
export const N_LIT = N_SURVIVORS + 1;
