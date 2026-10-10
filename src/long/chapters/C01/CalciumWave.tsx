import React from "react";
import { Easing } from "remotion";
import { EASE, tween } from "../../../lib/ease";
import { C } from "../../../theme/colors";
import { B } from "./beats";
import { CDIR, R } from "./constants";
import { n2 } from "./math";

// The calcium wave: a bright ring sweeping across the egg's surface from the
// entry point toward the far pole: a circle of latitude around the entry axis,
// projected (the axis tips slightly toward the viewer, so the ring reads as a
// curved band; only its front half is drawn). A few stylised sparkles ride it.
// Egg coordinates; draw inside the egg's breathing group, over the cytoplasm.
const F = B.fuse;
const TILT = 0.32;
const ct = Math.cos(TILT);
const st = Math.sin(TILT);
const A = { x: CDIR.x * ct, y: CDIR.y * ct, z: st }; // entry axis
const U = { x: -CDIR.y, y: CDIR.x, z: 0 };
const W = { x: -st * CDIR.x, y: -st * CDIR.y, z: ct }; // A x U

const point = (th: number, ph: number) => {
  const c = Math.cos(th) * R;
  const s = Math.sin(th) * R;
  const cu = Math.cos(ph);
  const su = Math.sin(ph);
  return {
    x: A.x * c + s * (U.x * cu + W.x * su),
    y: A.y * c + s * (U.y * cu + W.y * su),
    z: A.z * c + s * (U.z * cu + W.z * su),
  };
};

const ringPath = (th: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 64; i++) {
    const p = point(th, -Math.PI / 2 + (i / 64) * Math.PI * 2);
    if (p.z > 0) pts.push(`${n2(p.x)},${n2(p.y)}`);
  }
  return pts.length > 1 ? `M${pts.join("L")}` : "";
};

// fast off the mark so the ring runs ahead of the gold that floods in behind it
const LEAD = Easing.bezier(0.3, 0.55, 0.45, 1);
const SPARKS = [0.35, 0.9, 1.45, 1.95, 2.5, 3.0].map((ph, i) => ({ ph, i, d: i * 0.9 }));

export const CalciumWave: React.FC<{ frame: number }> = ({ frame }) => {
  const t = tween(frame, F, F + 17, [0, 1], LEAD);
  const op = tween(frame, F, F + 2) * (1 - tween(frame, F + 11, F + 19, [0, 1], EASE.inOut));
  if (op <= 0.01) return null;
  const th = 0.12 + t * (Math.PI - 0.12);
  const d = ringPath(th);
  return (
    <g style={{ mixBlendMode: "screen" }}>
      {d && (
        <g fill="none" strokeLinecap="round" opacity={op}>
          <path d={d} stroke={C.gold} strokeOpacity={0.3} strokeWidth={22} />
          <path d={d} stroke={C.gold} strokeOpacity={0.6} strokeWidth={8} />
          <path d={d} stroke={C.text} strokeOpacity={0.95} strokeWidth={3} />
        </g>
      )}
      {SPARKS.map((s) => {
        const p = point(th, s.ph);
        if (p.z <= 0) return null;
        const tw = 0.6 + 0.4 * Math.sin(frame * 0.9 + s.d * 3);
        const k = (5 + 4 * tw) * Math.min(1, p.z / (R * 0.4));
        return (
          <g key={s.i} transform={`translate(${n2(p.x)} ${n2(p.y)}) rotate(${s.i * 17})`} opacity={op * tw}>
            <circle r={k * 1.8} fill="url(#c01-spark)" opacity={0.7} />
            <ellipse rx={k * 1.5} ry={k * 0.16} fill={C.text} />
            <ellipse rx={k * 0.16} ry={k * 1.5} fill={C.text} />
          </g>
        );
      })}
    </g>
  );
};
