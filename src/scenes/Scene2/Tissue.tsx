import React from "react";
import { getPointAtLength } from "@remotion/paths";
import { C } from "../../theme/colors";
import { mix } from "./palette";
import { CX } from "./timeline";
import { Pt, smooth } from "./geometry";
import {
  GLAND_X, LOBES, STROMA, TWIGS, VESSELS, Wrap, X0, X1, bodyPath, glandPath, humpPts, smoothOpen, surfacePts,
  surfaceY,
} from "./tissueShape";
import { TissueDefs } from "./TissueDefs";

export { TissueDefs };

// The endometrium (womb lining): thick rose flesh with a lit surface of
// epithelial cells, glands, stroma and spiral arteries with travelling glints.
// Drawn in tissue-local coords (y = 0 at the landing spot).
type P = { f: number; w: Wrap; heat: number };

// Lit surface: soft bloom + crisp rim + a row of epithelial cells.
const Surface: React.FC<{ f: number; w: Wrap; d: string }> = ({ f, w, d }) => {
  const cells = [];
  for (let x = X0 + 10, i = 0; x < X1; x += 24, i++) {
    const y = surfaceY(x, f, w);
    const a = Math.atan((surfaceY(x + 4, f, w) - surfaceY(x - 4, f, w)) / 8);
    const cx = x - Math.sin(a) * 15;
    const cy = y + Math.cos(a) * 15;
    cells.push(
      <ellipse
        key={i}
        cx={cx}
        cy={cy}
        rx={11.5}
        ry={14}
        transform={`rotate(${((a * 180) / Math.PI).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})`}
        fill="url(#s2t-epi)"
        stroke={C.peach}
        strokeOpacity={0.2}
        strokeWidth={1.1}
      />,
    );
  }
  return (
    <g>
      <path d={d} fill="none" stroke={C.rose} strokeOpacity={0.5} strokeWidth={60} style={{ filter: "blur(18px)" }} />
      {cells}
      <path d={d} fill="none" stroke={mix(C.rose, C.peach, 0.6)} strokeOpacity={0.95} strokeWidth={4.5} />
      <path d={d} fill="none" stroke={C.text} strokeOpacity={0.35} strokeWidth={1.4} transform="translate(0 -1.5)" />
    </g>
  );
};

const Vessels: React.FC<{ f: number; heat: number }> = ({ f, heat }) => (
  <g>
    {VESSELS.map((v, i) => {
      const hot = v.near ? heat : 0;
      return (
        <g key={i}>
          <path d={v.d} fill="none" stroke="url(#s2t-vglow)" strokeOpacity={0.5 + 0.5 * hot} strokeWidth={18} strokeLinecap="round" />
          <path d={v.d} fill="none" stroke="url(#s2t-vcore)" strokeWidth={5 + 1.5 * hot} strokeLinecap="round" />
          <path d={v.d} fill="none" stroke="url(#s2t-vhi)" strokeOpacity={0.6 + 0.4 * hot} strokeWidth={1.3} strokeLinecap="round" transform="translate(-1 -1)" />
          {TWIGS[i].map((t, k) => (
            <path key={k} d={t} fill="none" stroke={C.heart} strokeOpacity={0.45 + 0.3 * hot} strokeWidth={2.2} strokeLinecap="round" />
          ))}
          {[0, 0.5].map((ph) => {
            const t = (ph + i * 0.17 + f * (0.014 + 0.014 * hot)) % 1;
            const p = getPointAtLength(v.d, t * v.len);
            if (!p) return null;
            // Glints rise toward the surface and only show in the upper,
            // lit part of the wall (deep ones would sit behind the captions).
            const o = Math.sin(Math.PI * t) ** 0.7 * smooth((t - 0.3) / 0.35) * (0.75 + 0.25 * hot);
            return <circle key={ph} cx={p.x} cy={p.y} r={7 + 4 * hot} fill="url(#s2t-glint)" opacity={o} />;
          })}
        </g>
      );
    })}
  </g>
);

const Fold: React.FC<{ pts: Pt[]; fill: string; rim: string; rimO: number }> = ({ pts, fill, rim, rimO }) => {
  const edge = smoothOpen(pts);
  return (
    <g>
      <path d={bodyPath(pts)} fill={fill} />
      <path d={edge} fill="none" stroke={rim} strokeOpacity={rimO} strokeWidth={6} />
    </g>
  );
};

export const TissueBack: React.FC<P & { farDy: number; farOp: number }> = ({ f, w, heat, farDy, farOp }) => {
  const pts = surfacePts(f, w);
  const edge = smoothOpen(pts);
  return (
    <g>
      <g transform={`translate(0 ${farDy.toFixed(1)})`} opacity={farOp} style={{ filter: "blur(6px)" }}>
        <Fold pts={humpPts(-70, 330, 330, -20, f, 0.3)} fill="url(#s2t-far)" rim={C.rose} rimO={0.35} />
        <Fold pts={humpPts(1160, 350, 300, -10, f, 2.1)} fill="url(#s2t-far)" rim={C.rose} rimO={0.3} />
      </g>
      <path d={bodyPath(pts)} fill="url(#s2t-body)" />
      {LOBES.map((l, i) => (
        <ellipse key={i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} fill="url(#s2t-lobe)" />
      ))}
      {STROMA.map((s, i) => (
        <ellipse
          key={i}
          cx={s.x}
          cy={s.y}
          rx={s.rx}
          ry={s.ry}
          transform={`rotate(${s.rot.toFixed(1)} ${s.x.toFixed(1)} ${s.y.toFixed(1)})`}
          fill={s.light ? C.rose : C.wombDeep}
          opacity={s.light ? 0.12 : 0.42}
        />
      ))}
      {GLAND_X.map((x, i) => {
        const d = glandPath(x, f, w, i);
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="url(#s2t-gline)" strokeWidth={24} strokeLinecap="round" />
            <path d={d} fill="none" stroke="url(#s2t-glum)" strokeWidth={9} strokeLinecap="round" />
          </g>
        );
      })}
      <Vessels f={f} heat={heat} />
      <Surface f={f} w={w} d={edge} />
    </g>
  );
};

// The same tissue, clipped to the blastocyst disc and laid over it: whatever
// part has sunk below the surface (or is hugged by the lips) reads as embedded.
export const TissueFront: React.FC<P & { by: number; op: number; clipR: number }> = ({ f, w, by, op, clipR }) => {
  if (op <= 0.01) return null;
  const pts = surfacePts(f, w, 10).filter((p) => Math.abs(p[0] - CX) < w.R * 1.6);
  const edge = smoothOpen(pts);
  return (
    <g opacity={op}>
      <defs>
        <clipPath id="s2t-clip">
          <circle cx={CX} cy={by} r={clipR} />
        </clipPath>
      </defs>
      <g clipPath="url(#s2t-clip)">
        <path d={`${edge}L${CX + w.R * 1.6} ${by + w.R * 2}L${CX - w.R * 1.6} ${by + w.R * 2}Z`} fill="url(#s2t-front)" />
        <path d={edge} fill="none" stroke={C.rose} strokeOpacity={0.5} strokeWidth={44} style={{ filter: "blur(12px)" }} />
        <path d={edge} fill="none" stroke={mix(C.rose, C.peach, 0.6)} strokeOpacity={0.95} strokeWidth={4.5} />
      </g>
    </g>
  );
};

export const ContactGlow: React.FC<{ f: number; c: number; w: Wrap }> = ({ f, c, w }) => {
  if (c <= 0.01) return null;
  const y = surfaceY(CX, f, w) - 10;
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <ellipse cx={CX} cy={y} rx={120 + 420 * c} ry={80 + 260 * c} fill="url(#s2t-contact)" opacity={0.75 * c} />
      <ellipse cx={CX} cy={y + 30} rx={70 + 110 * c} ry={26 + 30 * c} fill="url(#s2t-contact)" opacity={0.4 * c} />
    </g>
  );
};

// After contact the trophoblast starts to invade the wall: a few soft
// tendrils root the blastocyst into the tissue.
const ROOTS = [62, 76, 90, 104, 118];
export const Invasion: React.FC<{ g: number; by: number; R: number; f: number }> = ({ g, by, R, f }) => {
  if (g <= 0.01) return null;
  return (
    <g opacity={Math.min(1, g * 2) * 0.7} style={{ mixBlendMode: "screen" }}>
      {ROOTS.map((deg, i) => {
        const a = (deg * Math.PI) / 180;
        const r0 = R - 4;
        const L = (26 + 14 * ((i * 7) % 3)) * g;
        const x0 = CX + Math.cos(a) * r0;
        const y0 = by + Math.sin(a) * r0;
        const bend = (i % 2 ? 1 : -1) * 5 * Math.sin(f * 0.05 + i);
        const x1 = x0 + Math.cos(a) * L + bend;
        const y1 = y0 + Math.sin(a) * L;
        const d = `M${x0.toFixed(1)} ${y0.toFixed(1)}Q${(x0 + Math.cos(a) * L * 0.5 - bend).toFixed(1)} ${(y0 + Math.sin(a) * L * 0.5).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
        return (
          <g key={deg}>
            <path d={d} fill="none" stroke={C.rose} strokeOpacity={0.5} strokeWidth={20} strokeLinecap="round" style={{ filter: "blur(7px)" }} />
            <path d={d} fill="none" stroke={C.rose} strokeOpacity={0.35} strokeWidth={7} strokeLinecap="round" style={{ filter: "blur(2px)" }} />
          </g>
        );
      })}
    </g>
  );
};

export const TissueNear: React.FC<{ f: number; dy: number; op: number }> = ({ f, dy, op }) => (
  <g transform={`translate(0 ${dy.toFixed(1)})`} opacity={op} style={{ filter: "blur(12px)" }}>
    <Fold pts={humpPts(-90, 420, 250, 680, f, 1.2)} fill="url(#s2t-near)" rim={C.womb} rimO={0.5} />
    <Fold pts={humpPts(1190, 420, 230, 700, f, 3.3)} fill="url(#s2t-near)" rim={C.womb} rimO={0.45} />
  </g>
);
