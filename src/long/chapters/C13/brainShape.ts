// C13 brain geometry, in the fetus kit's HEAD-LOCAL units (cranium centre at
// 0,0, face looking +x, head ~234 units tall; see shared/fetus/headShapes.ts).
// A stylised lateral view at ~28 weeks: frontal lobe toward the face, the
// open Sylvian (side) fissure with the insula still showing, a few shallow
// primary grooves. Secondary + tertiary grooves draw in during "folding".
// Pure + deterministic (seeded `random` only).
import { random } from "remotion";
import { smooth } from "../../../shared/fetus/geom";

export type V2 = { x: number; y: number };
const pts = (a: number[][]): V2[] => a.map(([x, y]) => ({ x, y }));

// Cerebrum outline at full (31 wk) size, starting at the frontal pole.
const CEREBRUM = pts([
  [100, -30], [92, -62], [62, -92], [20, -110], [-28, -108], [-72, -88], [-102, -56], [-114, -18],
  [-108, 8], [-84, 22], [-48, 34], [-6, 44], [34, 40], [58, 28], [70, 12], [63, 1], [78, -8], [94, -14],
]);
export const BRAIN_C: V2 = { x: -8, y: -34 }; // scaling centre

// Cerebellum (tucked under the occipital lobe) and brainstem toward the neck.
export const CEREBELLUM = { cx: -70, cy: 40, rx: 31, ry: 19, rot: -12 };
export const BRAINSTEM = "M-26,22 C-18,40 -24,70 -34,106 L-50,106 C-46,76 -48,50 -58,30 Z";
// Cerebellar folia: parallel arcs in cerebellum-local coords (centre 0,0).
export const FOLIA = [-9, -3, 3, 9].map((y, i) => `M${-30 + Math.abs(y)},${y} Q0,${y + 7 - i} ${30 - Math.abs(y)},${y}`);

// Insula (the open floor of the Sylvian fissure): open shape at 28 wk, and
// the thin lens it narrows to as the lips (opercula) fold over it.
const INSULA_OPEN = pts([[60, 5], [36, -10], [10, -22], [-12, -30], [-22, -26], [-8, -10], [18, 0], [42, 8]]);
const INSULA_SHUT = pts([[60, 3], [36, -5], [10, -14], [-12, -23], [-20, -25], [-10, -18], [16, -8], [42, -1]]);

export type Groove = { pts: V2[]; w: number; order: number };
const G = (w: number, order: number, a: number[][]): Groove => ({ pts: pts(a), w, order });

// Present from the start (shallow, deepen with growth). Width in head units.
export const PRIMARY: Groove[] = [
  G(5.2, 0, [[66, 3], [36, -5], [8, -15], [-16, -25], [-30, -40]]), // Sylvian (side) fissure
  G(3.4, 0, [[-14, -109], [-9, -86], [-7, -64], [1, -44], [10, -27]]), // central
  G(3.0, 0, [[56, 20], [30, 15], [0, 6], [-30, -6], [-52, -20], [-64, -40]]), // superior temporal
  G(2.8, 0, [[-72, -92], [-82, -76], [-98, -64]]), // parieto-occipital
  G(2.6, 0, [[33, -76], [31, -58], [35, -40], [37, -24]]), // precentral (lower half)
];

// Drawn in during "folding as it grows" (order = stagger rank).
export const SECONDARY: Groove[] = [
  G(2.5, 0, [[-34, -104], [-28, -82], [-34, -62], [-22, -44]]), // postcentral
  G(2.4, 1, [[30, -104], [33, -88], [34, -74]]), // precentral (upper half)
  G(2.3, 2, [[36, -88], [58, -82], [78, -64], [90, -50]]), // superior frontal
  G(2.3, 3, [[40, -46], [60, -44], [76, -34], [92, -26]]), // inferior frontal
  G(2.3, 1, [[-26, -60], [-48, -64], [-72, -54], [-94, -38]]), // intraparietal
  G(2.2, 2, [[46, 31], [16, 30], [-18, 24], [-50, 16], [-78, 10]]), // inferior temporal
  G(2.0, 4, [[-96, -26], [-104, -8]]), // lateral occipital
  G(2.0, 3, [[46, -5], [50, -22]]), // ascending ramus
  G(1.9, 4, [[28, -9], [22, -26]]), // anterior ramus
  G(1.9, 5, [[-40, -40], [-56, -52], [-62, -70]]), // supramarginal
  G(1.9, 5, [[66, -66], [64, -50], [70, -40]]), // middle frontal dimple
];

// ---------------------------------------------------------------- helpers
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPts = (a: V2[], b: V2[], t: number) => a.map((p, i) => ({ x: lerp(p.x, b[i].x, t), y: lerp(p.y, b[i].y, t) }));

// Uniform Catmull-Rom sampling of a closed point loop (perSeg samples per segment).
const sampleClosed = (p: V2[], perSeg: number): V2[] => {
  const N = p.length;
  const out: V2[] = [];
  for (let i = 0; i < N; i++) {
    const [p0, p1, p2, p3] = [p[(i - 1 + N) % N], p[i], p[(i + 1) % N], p[(i + 2) % N]];
    for (let k = 0; k < perSeg; k++) {
      const t = k / perSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  return out;
};

const DENSE = sampleClosed(CEREBRUM, 5); // 90 points
const NORMALS: V2[] = DENSE.map((q, i) => {
  const a = DENSE[(i - 1 + DENSE.length) % DENSE.length];
  const b = DENSE[(i + 1) % DENSE.length];
  let n = { x: b.y - a.y, y: -(b.x - a.x) };
  const l = Math.hypot(n.x, n.y) || 1;
  n = { x: n.x / l, y: n.y / l };
  return (q.x - BRAIN_C.x) * n.x + (q.y - BRAIN_C.y) * n.y < 0 ? { x: -n.x, y: -n.y } : n;
});
// fixed irregular "gyral" bulges along the rim (0..1 strength per point)
const BUMP = DENSE.map((_, i) => 0.55 * Math.sin(i * 1.07 + 0.6) + 0.45 * Math.sin(i * 2.41 + 1.9) + 0.35 * (random(`c13-bump-${i}`) - 0.5));

// Cerebrum outline: `fold` 0..1 adds the crinkled gyral edge.
export const cerebrumPath = (fold: number) =>
  smooth(DENSE.map((q, i) => ({ x: q.x + NORMALS[i].x * BUMP[i] * 2.6 * fold, y: q.y + NORMALS[i].y * BUMP[i] * 2.6 * fold })));

// Soft "window" outline used for the translucent head (dilated cerebrum).
export const windowPath = (grow: number) =>
  smooth(DENSE.map((q, i) => ({ x: q.x + NORMALS[i].x * grow, y: q.y + NORMALS[i].y * grow })));

export const insulaPath = (open: number) => smooth(lerpPts(INSULA_SHUT, INSULA_OPEN, open));
export const groovePath = (g: Groove) => smooth(g.pts, false);

// ------------------------------------------------------ geometry tests
export const inside = (p: V2, poly: V2[]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
};
const segDist = (p: V2, a: V2, b: V2) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t);
};
export const polyDist = (p: V2, line: V2[]) => Math.min(...line.slice(1).map((q, i) => segDist(p, line[i], q)));
// cerebrum shrunk toward its centre (keeps fine folds off the rim) + open insula
export const INNER = DENSE.map((q) => ({ x: lerp(BRAIN_C.x, q.x, 0.9), y: lerp(BRAIN_C.y, q.y, 0.9) }));
export const INSULA_ZONE = INSULA_OPEN;

// Where the drops land: top of the brain, slightly forward (head-local, full size).
export const DROP_AT: V2 = { x: 6, y: -109 };
// A point scaled about the brain centre (matches the <g> scale in Brain.tsx).
export const scaled = (p: V2, s: number): V2 => ({ x: BRAIN_C.x + (p.x - BRAIN_C.x) * s, y: BRAIN_C.y + (p.y - BRAIN_C.y) * s });
