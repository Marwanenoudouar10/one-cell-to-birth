// The trunk skeleton in the X-ray, side view (rig units, inside the body clip):
//   - vertebral bodies: short blocks along the back, small at the neck, biggest in the
//     lumbar region, tapering into the sacrum, with cool cartilage discs between them
//   - ribs: thin arcs sweeping from the spine down and forward to the chest front
//   - the collarbone (one of the first bones to harden)
// Sizes vary along the column (no even row of identical dots, rule 12).
import React from "react";
import { C } from "../../../../theme/colors";
import { buildFetus } from "../../../../shared/fetus";
import { P, Pt, add, lerp, lerpPt as lerpP, mul, smoothPath, sub } from "../geom";

type Geo = ReturnType<typeof buildFetus>;
const DEG = Math.PI / 180;
const dir = (deg: number): Pt => P(Math.cos(deg * DEG), Math.sin(deg * DEG));

const N_VERT = 22;
const RIBS = [0.13, 0.16, 0.19, 0.222, 0.254, 0.286, 0.318, 0.35, 0.382];

// vertebral body width (x L) along the column: neck small, lumbar big, sacrum tapering
const vw = (u: number) => 0.024 + 0.022 * Math.sin(Math.min(1, u / 0.82) * Math.PI * 0.62) - 0.02 * Math.max(0, (u - 0.8) / 0.2);

// a rounded block centred at c, long axis along heading th (deg)
const block = (c: Pt, th: number, len: number, wid: number) => {
  const t = dir(th), n = dir(th + 90);
  const corner = (a: number, b: number) => add(c, add(mul(t, a * len), mul(n, b * wid)));
  return smoothPath([corner(-0.5, -0.5), corner(0, -0.56), corner(0.5, -0.5), corner(0.56, 0), corner(0.5, 0.5), corner(0, 0.56), corner(-0.5, 0.5), corner(-0.56, 0)], true);
};

export const Axial: React.FC<{ geo: Geo; oss: number }> = ({ geo, oss }) => {
  const { sp, arm } = geo;
  const L = geo.g.L;
  const step = 0.95 / N_VERT;
  const verts = Array.from({ length: N_VERT }, (_, i) => {
    const u = 0.02 + (i + 0.5) * step;
    return { c: sp.pos(u, -0.56), th: sp.theta(u), w: vw(u) * L, len: step * L * 0.72 };
  });
  const ribs = RIBS.map((u, i) => {
    const s = sp.pos(u, -0.5);
    // upper ribs short and flat, lower ones longer and steeper: a fanned cage
    const e = sp.pos(u + 0.07 + 0.024 * i, 0.72 - 0.035 * i);
    const up = mul(dir(sp.theta(u)), -(0.085 - 0.004 * i) * L);
    const m = add(add(mul(add(s, e), 0.5), up), mul(sub(e, s), -0.12));
    return `M${s.x.toFixed(1)},${s.y.toFixed(1)} Q${m.x.toFixed(1)},${m.y.toFixed(1)} ${e.x.toFixed(1)},${e.y.toFixed(1)}`;
  });
  // collarbone: from the top of the breastbone out to the shoulder, a gentle S
  const cl0 = sp.pos(0.06, 0.8);
  const cl1 = add(arm.shoulder, mul(dir(sp.theta(0.15) - 90), 0.02 * L));
  const k = lerp(0.65, 1, oss);
  return (
    <g>
      {/* ribs: cartilage-blue under, thin bone-white over */}
      {ribs.map((d, i) => (
        <g key={`r${i}`}>
          <path d={d} fill="none" stroke={C.cellCyan} strokeWidth={0.02 * L} strokeLinecap="round" opacity={0.18} />
          <path d={d} fill="none" stroke={C.text} strokeWidth={(0.0085 - 0.0003 * i) * L} strokeLinecap="round" opacity={0.5 * k} />
        </g>
      ))}
      <path d={smoothPath([lerpP(cl0, cl1, 0), add(lerpP(cl0, cl1, 0.5), mul(dir(sp.theta(0.1)), -0.012 * L)), lerpP(cl0, cl1, 1)], false)}
        fill="none" stroke={C.text} strokeWidth={0.016 * L} strokeLinecap="round" opacity={0.7 * k} />
      {/* the column: cartilage discs, then the hardened bodies */}
      <path d={smoothPath(verts.map((v) => v.c), false)} fill="none" stroke={C.cellCyan} strokeWidth={0.05 * L} strokeLinecap="round" opacity={0.16} />
      {verts.map((v, i) => (
        <path key={`v${i}`} d={block(v.c, v.th, v.len, v.w)} fill={C.text} opacity={(0.62 + 0.25 * Math.sin(i * 1.7) ** 2 * 0.4) * k} />
      ))}
    </g>
  );
};
