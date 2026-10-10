// The torso is "skinned" on a curved spine: a centre line from the neck
// (u = 0) to the rump (u = 1) whose bend is the `curl`, plus a back and a
// front (belly) half-width profile. Curl, fat, breathing and hiccups all
// deform this one shape, so the body never shows seams.
import { Pt, add, dir, lerp, mul, smooth } from "./geom";
import { blendNum, keyWeights } from "./curve";
import { Growth } from "./growth";

const U = [0, 0.12, 0.3, 0.5, 0.7, 0.88, 1];
// half-widths (x L) at the baseline width wf = 0.33
const BACK = [0.2, 0.28, 0.32, 0.335, 0.335, 0.31, 0.28];
const FRONT = [0.16, 0.27, 0.31, 0.33, 0.31, 0.24, 0.18];
const N = 40;

const bump = (u: number, c: number, w: number) => Math.exp(-((u - c) ** 2) / (2 * w * w));

export type Spine = {
  L: number;
  turn: number;
  theta: (u: number) => number; // heading in degrees (90 = straight down)
  centre: (u: number) => Pt;
  half: (u: number, side: 1 | -1) => number; // +1 front, -1 back
  // point at spine u, w across: +1 on the belly surface, -1 on the back surface
  pos: (u: number, w: number) => Pt;
  outline: Pt[];
  torso: string;
  backLine: Pt[]; // just inside the back surface, neck -> rump
};

export type SpineIn = { curl: number; breathe: number; hiccup: number };

// Heading of the spine at u for a given total turn (exposed so limbs can
// measure how far the body has bent away from its natural pose).
export const spineTheta = (turn: number, u: number) => 90 + turn * 0.55 - turn * u;
export const spineTurn = (g: Growth, curl: number) => lerp(14, 100, curl) + g.curlBias;

export const buildSpine = (g: Growth, p: SpineIn): Spine => {
  const L = g.L;
  const turn = spineTurn(g, p.curl);
  const theta = (u: number) => spineTheta(turn, u);
  const cs: Pt[] = [{ x: 0, y: 0 }];
  for (let i = 0; i < N; i++) {
    const th = theta((i + 0.5) / N);
    cs.push(add(cs[i], mul(dir(th), L / N)));
  }
  const centre = (u: number) => {
    const t = Math.max(0, Math.min(1, u)) * N;
    const i = Math.min(N - 1, Math.floor(t));
    const k = t - i;
    return { x: lerp(cs[i].x, cs[i + 1].x, k), y: lerp(cs[i].y, cs[i + 1].y, k) };
  };
  const kw = (g.wf / 0.33) * L;
  const half = (u: number, side: 1 | -1) => {
    const w = keyWeights(u, U);
    if (side < 0) return blendNum(w, BACK) * kw * (1 + 0.04 * g.fat) * (1 - 0.02 * p.breathe * bump(u, 0.3, 0.15));
    return (
      blendNum(w, FRONT) * kw +
      L * (g.belly * bump(u, 0.64, 0.2) + 0.04 * p.breathe * bump(u, 0.26, 0.13) - 0.014 * p.breathe * bump(u, 0.64, 0.12) +
        0.035 * p.hiccup * bump(u, 0.5, 0.12))
    );
  };
  const pos = (u: number, w: number) => {
    const th = theta(u);
    const n = w >= 0 ? dir(th - 90) : dir(th + 90);
    return add(centre(u), mul(n, Math.abs(w) * half(u, w >= 0 ? 1 : -1)));
  };

  const backU = [0, 0.07, 0.17, 0.32, 0.47, 0.62, 0.76, 0.88];
  const frontU = [0.88, 0.76, 0.62, 0.47, 0.32, 0.17, 0.07, 0];
  // rump cap: half ellipse around the end of the spine
  const end = centre(1);
  const th1 = theta(1);
  const rb = half(1, -1);
  const rf = half(1, 1);
  const cap = [62, 28, -8, -44].map((phi) => {
    const a = (phi * Math.PI) / 180;
    const r = phi > 0 ? rb : rf;
    return add(end, add(mul(dir(th1), Math.cos(a) * r * 0.95), mul(dir(th1 + 90), Math.sin(a) * r)));
  });
  // the neck runs up behind the head so head and back read as one C-curve
  const neckTop = add(centre(0), mul(dir(theta(0)), -0.12 * L));
  const outline = [neckTop, ...backU.map((u) => pos(u, -1)), ...cap, ...frontU.map((u) => pos(u, 1))];
  const backLine = [0.12, 0.25, 0.4, 0.55, 0.7, 0.84].map((u) => pos(u, -0.74));
  return { L, turn, theta, centre, half, pos, outline, torso: smooth(outline), backLine };
};
