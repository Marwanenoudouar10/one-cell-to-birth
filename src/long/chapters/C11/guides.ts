// Guide curves on the fetus, in the same local px as <Fetus> / fetusAnchors:
// - back: crown -> back of the head -> down the back -> the bottom, just
//   outside the skin (the lanugo glint runs here, and the crown-rump line)
// - leg:  the bottom -> hip -> knee -> ankle -> heel (the line's extension
//   that turns crown-rump into crown-heel at week 20)
// - silhouette + css: the near-side body shapes, for clipping a sheen.
// Built from the shared kit's own geometry, so they follow every pose.
import { FetusPose, anchorsFromGeom, buildFetus, outFrame } from "../../../shared/fetus";
import type { P2 } from "./timeline";

const dir = (deg: number): P2 => ({ x: Math.cos((deg * Math.PI) / 180), y: Math.sin((deg * Math.PI) / 180) });
const add = (a: P2, b: P2): P2 => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (a: P2, k: number): P2 => ({ x: a.x * k, y: a.y * k });
const sub = (a: P2, b: P2): P2 => ({ x: a.x - b.x, y: a.y - b.y });
const len = (a: P2) => Math.hypot(a.x, a.y);

// Centripetal-ish Catmull-Rom through pts, sampled `per` points per segment.
export const spline = (pts: P2[], per = 10): P2[] => {
  const out: P2[] = [];
  const at = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (a: number, b: number, cc: number, d: number) =>
        0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
      out.push({ x: c(p0.x, p1.x, p2.x, p3.x), y: c(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

export const lengths = (pts: P2[]) => {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + len(sub(pts[i], pts[i - 1])));
  return L;
};

// The first fraction p (0..1) of a sampled curve, ending exactly at its tip.
export const cut = (pts: P2[], p: number): { pts: P2[]; tip: P2; tan: P2 } => {
  const L = lengths(pts);
  const target = Math.max(0, Math.min(1, p)) * L[L.length - 1];
  let i = 1;
  while (i < pts.length - 1 && L[i] < target) i++;
  const k = (target - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
  const tip = add(pts[i - 1], mul(sub(pts[i], pts[i - 1]), Math.max(0, Math.min(1, k))));
  const t = sub(pts[i], pts[i - 1]);
  const tl = len(t) || 1;
  return { pts: [...pts.slice(0, i), tip], tip, tan: mul(t, 1 / tl) };
};

// The part of a sampled curve between arc lengths s0 and s1 (px).
export const segment = (pts: P2[], s0: number, s1: number): P2[] => {
  const L = lengths(pts);
  const total = L[L.length - 1];
  const a = Math.max(0, s0);
  const b = Math.min(total, s1);
  if (b <= a || total <= 0) return [];
  const head = cut(pts, b / total).pts;
  const start = cut(pts, a / total);
  const rest = head.filter((_, j) => j < head.length - 1 && L[j] > a);
  return [start.tip, ...rest, head[head.length - 1]];
};

export const toD = (pts: P2[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("");

export const guides = (week: number, pose: FetusPose, size: number) => {
  const geo = buildFetus(week, pose);
  const fr = outFrame(geo, size);
  const a = anchorsFromGeom(geo, fr);
  const o = fr.toOut;
  const sp = geo.sp;
  const hc = fr.toRig(a.headCenter);
  const end = sp.centre(1);
  const th1 = sp.theta(1);
  const rb = sp.half(1, -1);
  // crown -> back of the head -> back -> round the bottom, offPx outside the skin
  const backCurve = (offPx: number) => {
    const off = offPx / fr.s; // rig units
    const head = [4, 3, 2].map((i) => {
      const p = geo.headPts[i];
      const v = sub(p, hc);
      return add(p, mul(v, off / (len(v) || 1)));
    });
    const back = [0.1, 0.24, 0.4, 0.56, 0.7, 0.82].map((u) => sp.pos(u, -(1 + off / sp.half(u, -1))));
    const cap = [44, 14].map((phi) =>
      add(end, add(mul(dir(th1), Math.cos((phi * Math.PI) / 180) * (rb * 0.95 + off)), mul(dir(th1 + 90), Math.sin((phi * Math.PI) / 180) * (rb + off)))),
    );
    return { pts: [...head, ...back, ...cap], bottom: cap[cap.length - 1] };
  };
  const outer = backCurve(30); // clear of the skin, so it reads as a ruler, not a rim light
  const backPts = spline(outer.pts.map(o), 8);
  const skinPts = spline(backCurve(0).pts.map(o), 14);
  // leg: two straight caliper legs, bottom -> knee -> heel (thigh + shin)
  const bottom = o(outer.bottom);
  const knee = o(geo.leg.knee);
  const legPts = [bottom, knee, a.heel];
  return { backPts, skinPts, legPts, knee, silhouette: geo.silhouette, css: fr.css, a };
};

export type Guides = ReturnType<typeof guides>;
