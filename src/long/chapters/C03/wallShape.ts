import { noise2D } from "@remotion/noise";
import { random } from "remotion";
import { WIDTH } from "../../../theme/layout";

// Geometry of the tube walls (screen px; world y scrolls with the wall).
// A wall edge is a row of rounded folds (semi-elliptic lobes merged by a soft
// max, so crevices stay soft), offset in from the screen edge. Cilia sprout
// along it, beating in a metachronal wave whose power stroke points down.
export type Lobe = { y: number; h: number; w: number };
export type Row = { key: string; inset: number; base: number; sway: number; lobes: Lobe[][]; phase: number[] };

const lobeChain = (key: string, side: number, hMin: number, hVar: number, wMin: number, wVar: number): Lobe[] => {
  const out: Lobe[] = [];
  let y = -800;
  let i = 0;
  while (y < 2900) {
    const r = (q: string) => random(`c03w-${key}${side}-${i}-${q}`);
    const w = wMin + wVar * r("w") ** 1.5;
    const h = (hMin + hVar * r("h")) * (0.6 + 0.4 * (w - wMin) / (wVar || 1));
    out.push({ y: y + w, h, w });
    y += w * (1.55 + 0.35 * r("g"));
    i++;
  }
  return out;
};

// sway: amplitude (px) of the slow meander of the whole wall, so the folds
// never line up in a straight column.
export const row = (key: string, inset: number, base: number, h: [number, number], w: [number, number], sway: number): Row => ({
  key,
  inset,
  base,
  sway,
  lobes: [-1, 1].map((s) => lobeChain(key, s, h[0], h[1], w[0], w[1])),
  phase: [-1, 1].map((s) => random(`c03w-ph-${key}${s}`) * Math.PI * 2),
});

const K = 0.07; // soft-max sharpness (crevice softness)
export const offAt = (r: Row, si: number, wy: number) => {
  let acc = 1;
  for (const l of r.lobes[si]) {
    const u = (wy - l.y) / l.w;
    if (u <= -1 || u >= 1) continue;
    acc += Math.exp(K * l.h * Math.sqrt(1 - u * u)) - 1;
  }
  return r.base + Math.log(acc) / K;
};

// Screen x of a wall edge at world y (side -1 = left, +1 = right).
export const edgeX = (r: Row, side: number, wy: number, f: number) => {
  const si = side < 0 ? 0 : 1;
  const sway = r.sway * (0.5 + 0.5 * Math.sin(wy / 520 + r.phase[si])) + 0.4 * r.sway * Math.sin(wy / 190 + 2 * r.phase[si]);
  const o = r.inset + sway + offAt(r, si, wy) + 5 * noise2D(`c03wx${r.key}${side}`, wy * 0.004, f * 0.01);
  return side < 0 ? o : WIDTH - o;
};

// Crevices: midpoints between neighbouring lobes (world y).
export const crevices = (r: Row, side: number) => {
  const ls = r.lobes[side < 0 ? 0 : 1];
  return ls.slice(1).map((l, i) => (ls[i].y + ls[i].w + l.y - l.w) / 2);
};

const n1 = (v: number) => v.toFixed(1);

// Edge polyline + closed body (edge to just past the screen side).
export const edgePaths = (r: Row, side: number, scroll: number, f: number, top: number, bot: number) => {
  const pts: string[] = [];
  for (let sy = top; sy <= bot; sy += 7) pts.push(`${n1(edgeX(r, side, sy + scroll, f))} ${n1(sy)}`);
  const line = `M${pts.join("L")}`;
  const outX = side < 0 ? -40 : WIDTH + 40;
  return { line, body: `${line}L${outX} ${bot}L${outX} ${top}Z` };
};

// Cilia fringe as two path strings: whole hairs and their bright outer tips.
export const ciliaPaths = (r: Row, side: number, scroll: number, f: number, top: number, bot: number, step: number, len: number) => {
  let hairs = "";
  let tips = "";
  const k0 = Math.ceil((top + scroll) / step);
  const k1 = Math.floor((bot + scroll) / step);
  const dir = side < 0 ? 1 : -1;
  for (let k = k0; k <= k1; k++) {
    const wy = k * step;
    const sy = wy - scroll;
    const x = edgeX(r, side, wy, f);
    const d = (edgeX(r, side, wy + 2, f) - edgeX(r, side, wy - 2, f)) / 4;
    const L = Math.hypot(1, d);
    const nx = dir / L;
    const ny = (side < 0 ? -d : d) / L;
    const aN = Math.atan2(ny, nx);
    const rnd = random(`c03cl-${r.key}${side}-${k}`);
    // metachronal wave travelling down the wall; fast power stroke, slow recovery
    const ph = f * ((Math.PI * 2) / 26) - wy * ((Math.PI * 2) / 230) + rnd * 0.8;
    const th = 0.3 + 0.5 * (Math.sin(ph) + 0.3 * Math.sin(2 * ph));
    const ln = len * (0.78 + 0.44 * rnd);
    const a = aN + dir * th;
    const ab = aN + dir * (th * 0.3 + 0.08);
    const rx = x - nx * 2;
    const ry = sy - ny * 2;
    const cx = rx + Math.cos(ab) * ln * 0.55;
    const cy = ry + Math.sin(ab) * ln * 0.55;
    const tx = rx + Math.cos(a) * ln;
    const ty = ry + Math.sin(a) * ln;
    hairs += `M${n1(rx)} ${n1(ry)}Q${n1(cx)} ${n1(cy)} ${n1(tx)} ${n1(ty)}`;
    const mx = 0.25 * rx + 0.5 * cx + 0.25 * tx;
    const my = 0.25 * ry + 0.5 * cy + 0.25 * ty;
    tips += `M${n1(mx)} ${n1(my)}L${n1(tx)} ${n1(ty)}`;
  }
  return { hairs, tips };
};

// Dark fold seams running from the crevices back into the tissue.
export const creasePaths = (r: Row, side: number, scroll: number, f: number, top: number, bot: number) => {
  let d = "";
  for (const wy of crevices(r, side)) {
    const sy = wy - scroll;
    if (sy < top - 40 || sy > bot + 40) continue;
    const x = edgeX(r, side, wy, f);
    const back = side < 0 ? -1 : 1;
    d += `M${n1(x + back * 4)} ${n1(sy)}Q${n1(x + back * 40)} ${n1(sy + 6)} ${n1(x + back * 95)} ${n1(sy + 26)}`;
  }
  return d;
};

// Fold flanks: runs of the edge that face up (catch the upper key light) or
// face down (fall into shadow), as open polylines.
export const flankPaths = (r: Row, side: number, scroll: number, f: number, top: number, bot: number) => {
  let lit = "";
  let shade = "";
  let runL = false;
  let runS = false;
  for (let sy = top; sy <= bot; sy += 6) {
    const wy = sy + scroll;
    const x = edgeX(r, side, wy, f);
    const d = (edgeX(r, side, wy + 3, f) - edgeX(r, side, wy - 3, f)) / 6;
    const ny = (side < 0 ? -d : d) / Math.hypot(1, d);
    const p = `${n1(x)} ${n1(sy)}`;
    if (ny < -0.18) {
      lit += `${runL ? "L" : "M"}${p}`;
      runL = true;
    } else runL = false;
    if (ny > 0.22) {
      shade += `${runS ? "L" : "M"}${p}`;
      runS = true;
    } else runS = false;
  }
  return { lit, shade };
};
