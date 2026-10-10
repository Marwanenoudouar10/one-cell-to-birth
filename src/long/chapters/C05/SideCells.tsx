import React from "react";
import { noise2D } from "@remotion/noise";
import { random } from "remotion";
import { C } from "../../../theme/colors";
import { bandMid } from "./geo";
import { mix } from "./DiscDefs";
import { View } from "./view";

// The cells inside each layer of the side cut, clipped to their band:
//   ectoderm = tall columnar cells packed side by side,
//   mesoderm = loose, irregular round cells scattered through the band,
//   endoderm = one row of flat cuboidal cells that touch.
// Each cell is a soft body with a lit membrane edge and an off-centre nucleus,
// with random size, spacing and offset (never an even grid of dots).

type CellSpec = { x: number; dy: number; jr: number; jw: number };

const cells = (key: string, step: number, loose: boolean): CellSpec[] => {
  const out: CellSpec[] = [];
  let x = -0.98;
  let i = 0;
  while (x <= 0.98) {
    const jw = 0.75 + random(`${key}w${i}`) * 0.5;
    out.push({
      x,
      dy: loose ? (random(`${key}y${i}`) - 0.5) * 1.1 : 0,
      jr: loose ? 0.62 + random(`${key}r${i}`) * 0.6 : 0.9 + random(`${key}r${i}`) * 0.18,
      jw,
    });
    x += step * (loose ? 0.45 + random(`${key}s${i}`) * 0.75 : jw);
    i++;
  }
  return out;
};

// step = mean spacing (fraction of the half-length), w = width / spacing,
// h = height / band height, nuc = nucleus size, edge = membrane tint
const LAYERS = [
  { k: 0, step: 0.04, loose: false, w: 0.5, h: 0.72, nuc: 0.36, edge: C.text, body: mix(C.gold, C.skin, 0.4) }, // endoderm: cuboidal
  { k: 1, step: 0.05, loose: true, w: 0.42, h: 0.52, nuc: 0.46, edge: C.skin, body: mix(C.rose, C.skin, 0.25) }, // mesoderm: loose
  { k: 2, step: 0.03, loose: false, w: 0.48, h: 0.9, nuc: 0.34, edge: C.text, body: C.cell }, // ectoderm: columnar
].map((L) => ({ ...L, cells: cells(`c05-cl${L.k}`, L.step, L.loose) }));

type Props = { v: View; f: number; clips: [string, string, string]; glow: [number, number, number] };

export const SideCells: React.FC<Props> = ({ v, f, clips, glow }) => {
  const o = v.side * v.side;
  if (o < 0.01) return null;
  const t = f * 0.02;
  return (
    <g opacity={o}>
      {LAYERS.map((L) => (
        <g key={L.k} clipPath={`url(#${clips[L.k]})`}>
          {L.cells.map((c, i) => {
            const m = bandMid(v, c.x, L.k);
            if (m.h < 3 || Math.abs(m.x - 540) > 640) return null;
            const breathe = 1 + 0.05 * noise2D(`c05-cb${L.k}`, t, i * 0.7);
            const drift = L.loose ? 0.12 * noise2D(`c05-cd${L.k}`, i * 0.9, t * 0.6) : 0;
            const rx = L.step * v.A * L.w * c.jw * c.jr * breathe;
            const ry = m.h * L.h * c.jr * breathe;
            const cy = m.y + (c.dy + drift) * m.h * 0.5;
            const lit = glow[L.k];
            return (
              <g key={i}>
                <ellipse cx={m.x} cy={cy} rx={rx} ry={Math.max(1, ry)} fill={`url(#c05-cell-${L.k})`} opacity={0.8 + 0.2 * lit} />
                <ellipse cx={m.x} cy={cy} rx={rx * 0.94} ry={Math.max(1, ry * 0.94)} fill="none" stroke={L.edge} strokeOpacity={0.16 + 0.24 * lit} strokeWidth={1.6} />
                <ellipse
                  cx={m.x - rx * 0.12}
                  cy={cy - ry * (L.k === 2 ? 0.2 : 0.06)}
                  rx={rx * L.nuc}
                  ry={Math.max(0.8, Math.min(rx, ry) * L.nuc * 1.1)}
                  fill={lit > 0.3 ? L.body : mix(L.body, C.wombDeep, 0.55)}
                  opacity={0.22 + 0.3 * lit}
                />
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
};
