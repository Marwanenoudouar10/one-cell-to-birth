// Close-up skin around the eye (head-local units of the fetus kit, face toward
// +x): week 24-27 skin is thin and finely wrinkled and still covered in
// lanugo. Fine pale hairs flow back over the brow and down the temple, and two
// soft creases sit under the lower lid. Faded in with the close-up `detail`
// (sub-pixel at the medium shot), always low contrast: texture, not a feature.
import React from "react";
import { random } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { P2 } from "./rig";

const f2 = (v: number) => v.toFixed(2);

// hair roots relative to the eye centre, with their flow direction (radians)
const HAIRS = Array.from({ length: 120 }, (_, i) => {
  const r = (k: string) => random(`c12-lan-${k}${i}`);
  const brow = i < 70;
  // brow band: an arc above the eye; temple: a patch behind the outer corner
  const x = brow ? -26 + 46 * r("x") : -27 + 11 * r("x");
  const y = brow ? -29 + 11 * r("y") + 0.006 * (x + 4) ** 2 : -14 + 28 * r("y");
  const flow = brow ? Math.PI + 0.32 + 0.25 * (x / 30) : Math.PI * 0.62 + 0.2 * (y / 20);
  return { x, y, flow, len: 1.3 + 1.4 * r("l"), lit: r("c") < 0.72, o: 0.5 + 0.5 * r("o") };
});

export const SkinDetail: React.FC<{ eye: P2; amt: number; frame: number }> = ({ eye, amt, frame }) => {
  if (amt < 0.02) return null;
  const { x: ex, y: ey } = eye;
  const t = frame / 30;
  return (
    <g opacity={amt}>
      {/* fine creases under the lower lid (thin skin) */}
      <path d={`M${ex - 11},${ey + 7.4} Q${ex},${ey + 11.2} ${ex + 10},${ey + 7.6}`} fill="none" stroke={C.skinShade} strokeOpacity={0.3}
        strokeWidth={0.9} strokeLinecap="round" filter="url(#c12-soft1)" />
      <path d={`M${ex - 6},${ey + 11.6} Q${ex + 1},${ey + 14} ${ex + 7},${ey + 11.8}`} fill="none" stroke={C.skinShade} strokeOpacity={0.18}
        strokeWidth={0.8} strokeLinecap="round" filter="url(#c12-soft1)" />
      <path d={`M${ex - 10.5},${ey + 8.3} Q${ex},${ey + 12} ${ex + 9.5},${ey + 8.5}`} fill="none" stroke={C.skin} strokeOpacity={0.35}
        strokeWidth={0.7} strokeLinecap="round" filter="url(#c12-soft1)" />
      {/* lanugo: a soft fuzz that sways a hair in the fluid */}
      <g fill="none" strokeLinecap="round">
        {HAIRS.map((h, i) => {
          const a = h.flow + 0.12 * noise2D(`c12-lanw${i % 7}`, t * 0.4, i * 0.1);
          const x0 = ex + h.x;
          const y0 = ey + h.y;
          const x1 = x0 + Math.cos(a) * h.len;
          const y1 = y0 + Math.sin(a) * h.len;
          const cx = x0 + Math.cos(a - 0.25) * h.len * 0.55;
          const cy = y0 + Math.sin(a - 0.25) * h.len * 0.55;
          return (
            <path key={i} d={`M${f2(x0)},${f2(y0)} Q${f2(cx)},${f2(cy)} ${f2(x1)},${f2(y1)}`} stroke={h.lit ? C.text : C.skinShade}
              strokeOpacity={(h.lit ? 0.22 : 0.16) * h.o} strokeWidth={0.16} />
          );
        })}
      </g>
    </g>
  );
};
