// Fine (tertiary) folds that crinkle across the brain during "folding as it
// grows": short sulci branching off the main grooves, plus a few sinuous
// S-folds in the open gyri. Head-local units, deterministic (seeded random).
import { random } from "remotion";
import { BRAIN_C, Groove, INNER, INSULA_ZONE, PRIMARY, SECONDARY, V2, inside, polyDist } from "./brainShape";
import { Sampled, sampleOpen } from "./ribbon";

export type Fold = { g: Sampled; w: number; order: number };

const withSamples = (gs: Groove[]) => gs.map((g) => ({ ...g, sm: sampleOpen(g.pts) }));
export const PRIMARY_S = withSamples(PRIMARY);
export const SECONDARY_S = withSamples(SECONDARY);

const pointAt = (sm: Sampled, t: number) => {
  const target = sm.len * t;
  let i = 1;
  while (i < sm.p.length - 1 && sm.s[i] < target) i++;
  const a = sm.p[i - 1];
  const b = sm.p[i];
  const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return { p: a, tan: { x: (b.x - a.x) / l, y: (b.y - a.y) / l } };
};
const rotV = (v: V2, deg: number): V2 => {
  const r = (deg * Math.PI) / 180;
  return { x: v.x * Math.cos(r) - v.y * Math.sin(r), y: v.x * Math.sin(r) + v.y * Math.cos(r) };
};
const along = (p: V2, d: V2, k: number): V2 => ({ x: p.x + d.x * k, y: p.y + d.y * k });

const fits = (q: V2, lines: V2[][], min: number) =>
  inside(q, INNER) && !inside(q, INSULA_ZONE) && lines.every((l) => polyDist(q, l) > min);

export const TERTIARY: Fold[] = (() => {
  const src = [...PRIMARY_S, ...SECONDARY_S];
  const lines: V2[][] = src.map((g) => g.sm.p);
  const out: Fold[] = [];
  // 1) branches off the existing grooves
  for (let k = 0; k < 500 && out.length < 22; k++) {
    const r = (s: string) => random(`c13-br-${k}-${s}`);
    const gi = Math.floor(r("g") * src.length);
    const g = src[gi];
    const { p, tan } = pointAt(g.sm, 0.12 + 0.76 * r("t"));
    const side = r("s") > 0.5 ? 1 : -1;
    const d = rotV({ x: -tan.y * side, y: tan.x * side }, (r("a") - 0.5) * 70);
    const L = 11 + 13 * r("l");
    const perp = { x: -d.y, y: d.x };
    const p1 = along(along(p, d, L * 0.5), perp, (r("b") > 0.5 ? 1 : -1) * (0.18 + 0.2 * r("c")) * L);
    const p2 = along(p, d, L);
    const others = lines.filter((_, i) => i !== gi);
    if (!fits(p1, others, 6) || !fits(p2, lines, 6.5)) continue;
    const pts = [along(p, d, 0.5), p1, p2];
    lines.push(sampleOpen(pts).p);
    const order = Math.hypot(p.x - BRAIN_C.x, p.y - BRAIN_C.y) / 115 + 0.2 * r("o");
    out.push({ g: sampleOpen(pts), w: 1.7 + 0.9 * r("w"), order });
  }
  // 2) free sinuous folds in the larger open gyri
  let free = 0;
  for (let k = 0; k < 600 && free < 20; k++) {
    const r = (s: string) => random(`c13-fr-${k}-${s}`);
    const c = { x: -112 + 212 * r("x"), y: -108 + 150 * r("y") };
    if (!fits(c, lines, 10)) continue;
    const a = r("a") * 180;
    const d = rotV({ x: 1, y: 0 }, a);
    const n = { x: -d.y, y: d.x };
    const L = 13 + 12 * r("l");
    const b = (r("b") > 0.5 ? 1 : -1) * (3 + 4 * r("c"));
    const pts = [along(c, d, -L / 2), along(along(c, d, -L / 6), n, b), along(along(c, d, L / 6), n, -b), along(c, d, L / 2)];
    if (!pts.every((q) => fits(q, lines, 5))) continue;
    lines.push(sampleOpen(pts).p);
    free++;
    const order = Math.hypot(c.x - BRAIN_C.x, c.y - BRAIN_C.y) / 115 + 0.25 * r("o");
    out.push({ g: sampleOpen(pts), w: 1.6 + 0.7 * r("w"), order });
  }
  return out;
})();
