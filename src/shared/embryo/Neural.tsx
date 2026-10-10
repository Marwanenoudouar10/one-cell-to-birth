import React from "react";
import { C } from "../../theme/colors";
import { Body } from "./body";
import { N, project, sAt } from "./centreline";
import { Pt, add, clamp01, lerp, mul, ramp, smoothPath, table } from "./math";

// Dorsal surface details of the disc stages, drawn on the top (ectoderm) face:
// keyhole neural plate -> raised folds with a groove -> tube that zips shut
// from the neck outward (zip 0..1), plus the primitive streak and node.

const PW_S = [-0.27, -0.2, -0.08, 0.04, 0.14, 0.4, 0.7, 0.84, 0.9];
const PW_V = [0, 0.5, 0.6, 0.5, 0.27, 0.2, 0.18, 0.12, 0];
const Z0 = 0.12; // closure starts at the neck (4th-6th somite level)

// 0 open .. 1 closed at s for a given zip.
export const closure = (s: number, zip: number) => {
  const d = s < Z0 ? (Z0 - s) / 0.39 : (s - Z0) / 0.78;
  return ramp(clamp01((zip * 1.2 - d) / 0.2), 0, 1);
};

// Surface point at body sample i, lateral offset v (fraction of b), on the top face.
export const surf = (b: Body, i: number, vf: number, lift = 0): Pt => {
  const { a, b: bb } = b.sec[i];
  const e = b.st.expo;
  const u = a * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(vf), e)), 1 / e) + lift;
  return project(add(b.line.c[i], mul(b.line.n[i], u)), vf * bb, b.st);
};

const range = (s0: number, s1: number) => {
  const out: number[] = [];
  for (let i = 0; i <= N; i++) {
    const s = sAt(i);
    if (s >= s0 && s <= s1) out.push(i);
  }
  return out;
};

export const Neural: React.FC<{ b: Body; zip: number; uid: string }> = ({ b, zip, uid }) => {
  const st = b.st;
  const vis = st.plate;
  const streak = st.streak;
  if (vis < 0.01 && streak < 0.01) return null;
  const idx = range(-0.27, 0.9);
  const half = (i: number) => table(sAt(i), PW_S, PW_V) * (1 - closure(sAt(i), zip));
  const rise = st.foldRise;
  const L = (k: number, lift = 0) => idx.map((i) => surf(b, i, half(i) * k, lift));
  const R = (k: number, lift = 0) => idx.map((i) => surf(b, i, -half(i) * k, lift));
  const region = (k: number) => smoothPath([...L(k), ...R(k).reverse()], true);
  const shade = (k: number) => smoothPath(L(k), false) + smoothPath(R(k), false);
  // primitive streak: a short groove at the caudal midline, regressing tailward
  const sA = lerp(0.5, 0.8, ramp(st.week, 3, 3.9));
  const sIdx = range(sA, 0.95);
  const node = sIdx.length ? surf(b, sIdx[0], 0) : null;
  const sLine = (vf: number) => smoothPath(sIdx.map((i) => surf(b, i, vf)), false);
  return (
    <g>
      {vis > 0.01 && (
        <g opacity={vis}>
          {/* thickened neural plate: a raised keyhole with a soft cool edge, shadow outside the folds */}
          <path d={shade(1.18)} fill="none" stroke={C.womb} strokeOpacity={0.28 * rise} strokeWidth={5} strokeLinecap="round" filter={`url(#${uid}-soften)`} />
          <path d={region(1.06)} fill={C.cellBlue} opacity={0.16} filter={`url(#${uid}-soften)`} />
          <path d={region(1)} fill={C.cell} opacity={0.5 + 0.1 * rise} />
          {/* the closed tube: a soft raised ridge along the midline (open parts draw their groove over it) */}
          <path d={smoothPath(idx.map((i) => surf(b, i, 0)), false)} fill="none" stroke={C.cell} strokeOpacity={0.55 * rise * zip} strokeWidth={9} strokeLinecap="round" filter={`url(#${uid}-soften)`} />
          {/* the groove deepens as the folds rise */}
          <path d={region(0.5)} fill={C.wombDeep} opacity={0.12 + 0.3 * rise} />
          <path d={region(0.22)} fill={C.wombDeep} opacity={0.2 * rise} />
          {/* fold crests catch the light; where closed the two crests merge into the tube */}
          <path d={shade(0.92)} fill="none" stroke={C.text} strokeOpacity={0.25 + 0.5 * rise} strokeWidth={2.6} strokeLinecap="round" />
        </g>
      )}
      {streak > 0.01 && sIdx.length > 1 && (
        <g opacity={streak}>
          <path d={sLine(0)} fill="none" stroke={C.cellBlue} strokeOpacity={0.3} strokeWidth={11} strokeLinecap="round" filter={`url(#${uid}-soften)`} />
          <path d={sLine(0)} fill="none" stroke={C.wombDeep} strokeOpacity={0.5} strokeWidth={3.2} strokeLinecap="round" />
          <path d={sLine(0.06)} fill="none" stroke={C.cell} strokeOpacity={0.7} strokeWidth={2} strokeLinecap="round" />
          <path d={sLine(-0.06)} fill="none" stroke={C.cell} strokeOpacity={0.35} strokeWidth={1.6} strokeLinecap="round" />
          {node && (
            <>
              <circle cx={node.x} cy={node.y} r={9} fill={C.cell} opacity={0.85} filter={`url(#${uid}-soften)`} />
              <circle cx={node.x} cy={node.y + 0.6} r={3.4} fill={C.wombDeep} opacity={0.55} />
            </>
          )}
        </g>
      )}
    </g>
  );
};
