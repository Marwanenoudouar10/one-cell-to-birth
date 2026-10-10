// Small geometry helpers for organic SVG shapes (C16, copied from Scene5).
export type Pt = [number, number];

const f = (n: number) => n.toFixed(1);

// Smooth closed curve through points (Catmull-Rom -> cubic Bezier).
export const smoothClosed = (pts: Pt[], tension = 1): string => {
  const n = pts.length;
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + "Z";
};

// Smooth open curve through points. `move` false continues an existing path.
export const smoothOpen = (pts: Pt[], move = true, tension = 1): string => {
  const n = pts.length;
  let d = move ? `M${f(pts[0][0])},${f(pts[0][1])}` : ` L${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
};

// Tapered capsule: circle radius ra at A, rb at B, joined by outer tangents.
export const capsule = (ax: number, ay: number, bx: number, by: number, ra: number, rb: number): string => {
  const dx = bx - ax;
  const dy = by - ay;
  const d = Math.max(0.001, Math.hypot(dx, dy));
  if (d <= Math.abs(ra - rb)) {
    const [cx, cy, r] = ra > rb ? [ax, ay, ra] : [bx, by, rb];
    return `M${f(cx - r)},${f(cy)} a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0 a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0Z`;
  }
  const a = Math.atan2(dy, dx);
  const delta = Math.asin((ra - rb) / d);
  const p = (cx: number, cy: number, r: number, ang: number): Pt => [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  const up = a + Math.PI / 2 + delta;
  const dn = a - Math.PI / 2 - delta;
  const a1 = p(ax, ay, ra, up);
  const b1 = p(bx, by, rb, up);
  const b2 = p(bx, by, rb, dn);
  const a2 = p(ax, ay, ra, dn);
  const largeB = delta > 0 ? 1 : 0;
  const largeA = delta < 0 ? 1 : 0;
  return (
    `M${f(a1[0])},${f(a1[1])} L${f(b1[0])},${f(b1[1])} ` +
    `A${f(rb)},${f(rb)} 0 ${largeB} 0 ${f(b2[0])},${f(b2[1])} ` +
    `L${f(a2[0])},${f(a2[1])} A${f(ra)},${f(ra)} 0 ${largeA} 0 ${f(a1[0])},${f(a1[1])}Z`
  );
};

export const circle = (cx: number, cy: number, r: number): string =>
  `M${f(cx - r)},${f(cy)} a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0 a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0Z`;

// Noisy circle as a smooth closed path. `rad(theta)` returns the radius.
export const blob = (cx: number, cy: number, rad: (theta: number) => number, n = 28): string => {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const r = rad(t);
    pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  return smoothClosed(pts);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
