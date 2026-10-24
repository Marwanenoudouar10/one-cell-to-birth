// "Every major organ is in place": six soft, wordless glows tick on inside
// the translucent body (heart, brain, lungs, liver, kidneys, gut). Colours
// call back C05's three germ layers: cool = brain (ectoderm), rose = heart +
// kidneys (mesoderm), gold = lungs, liver, gut (endoderm). Deliberately
// non-anatomical: soft rounded light.
// Placed diagonally from each other, all different sizes (rule 11: no pair of
// equal round glows side by side = "eyes"). Fetus-local px, from the anchors,
// so they follow the curl and the growth.
import React from "react";
import { C } from "../../../theme/colors";
import { FetusAnchors } from "../../../shared/fetus";
import { Pt, TL } from "./timeline";
import { mixPt } from "./geom";

type Tone = "cool" | "rose" | "gold" | "heart";
type Organ = { c: Pt; rx: number; ry: number; rot: number; tone: Tone };

const TONES: Record<Tone, [string, string]> = {
  cool: [C.cell, C.cellCyan],
  rose: [C.text, C.rose],
  gold: [C.text, C.gold],
  heart: [C.rose, C.heart],
};

// heart, brain, lungs, liver, kidneys, gut (same order as ORGAN_BEATS). Per-1000 offsets
// from the torso anchors: lungs up-and-back of the heart, liver down-and-front, gut low
// in the belly, the small kidney low on the back (every neighbour on a diagonal).
export const organLayout = (a: FetusAnchors, size: number): Organ[] => {
  const S = size / 1000;
  const R = a.headRadius;
  const off = (p: Pt, dx: number, dy: number): Pt => ({ x: p.x + dx * S, y: p.y + dy * S });
  return [
    { c: off(a.heart, 6, -4), rx: 42 * S, ry: 48 * S, rot: -20, tone: "heart" },
    { c: { x: a.headCenter.x - 0.16 * R, y: a.headCenter.y - 0.12 * R }, rx: 0.64 * R, ry: 0.5 * R, rot: -14, tone: "cool" },
    { c: off(a.heart, -80, -70), rx: 50 * S, ry: 82 * S, rot: 18, tone: "gold" },
    { c: off(a.heart, 52, 92), rx: 70 * S, ry: 40 * S, rot: -22, tone: "gold" },
    { c: off(mixPt(a.back, a.rump, 0.3), 62, 0), rx: 24 * S, ry: 38 * S, rot: 24, tone: "rose" },
    { c: off(mixPt(a.navel, a.rump, 0.55), -6, -10), rx: 50 * S, ry: 42 * S, rot: 6, tone: "gold" },
  ];
};

export const OrganDefs: React.FC = () => (
  <>
    {(Object.keys(TONES) as Tone[]).map((t) => (
      <radialGradient key={t} id={`c09-org-${t}`}>
        <stop offset={0} stopColor={TONES[t][0]} stopOpacity={t === "cool" ? 0.6 : 0.95} />
        <stop offset={0.38} stopColor={TONES[t][1]} stopOpacity={t === "cool" ? 0.42 : 0.8} />
        <stop offset={1} stopColor={TONES[t][1]} stopOpacity={0} />
      </radialGradient>
    ))}
  </>
);

// The skin dims to a translucent wine while the organs glow, so they read as lit
// from inside (multiply, same hue family: rule 13). The level-up band wipes it off
// head to toe (a gradient mask whose edge rides just behind the band).
export const BodyDim: React.FC<{ silhouette: string[]; css: string; amount: number; bandY: number; h: number }> = ({
  silhouette, css, amount, bandY, h,
}) =>
  amount <= 0.003 ? null : (
    <g>
      <defs>
        <linearGradient id="c09-dimG" gradientUnits="userSpaceOnUse" x1={0} y1={bandY - 0.05 * h} x2={0} y2={bandY + 0.3 * h}>
          <stop offset={0} stopColor="black" />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <mask id="c09-dimM" maskUnits="userSpaceOnUse" x={-900} y={-900} width={1800} height={1800}>
          <rect x={-900} y={-900} width={1800} height={1800} fill="url(#c09-dimG)" />
        </mask>
      </defs>
      <g mask="url(#c09-dimM)">
        <g transform={css} opacity={amount} style={{ mixBlendMode: "multiply" }}>
          {silhouette.map((d, i) => (
            <path key={i} d={d} fill={C.womb} />
          ))}
        </g>
      </g>
    </g>
  );

// 1 below the band (not reached yet), 0 above it (already swept)
const ahead = (y: number, bandY: number, h: number) => Math.max(0, Math.min(1, (y - bandY + 0.05 * h) / (0.35 * h)));

export const Organs: React.FC<{ t: TL; list: Organ[]; band: number; h: number }> = ({ t, list, band, h }) => (
  <g>
    <g clipPath="url(#c09-bodyClip)">
      {list.map((o, i) => {
        const s = t.organs[i];
        if (s.on <= 0.001) return null;
        // the band flares each organ as it passes; behind it they settle to a soft rest
        const flare = t.bandA * Math.exp(-(((o.c.y - band) / (0.25 * h)) ** 2));
        const beat = o.tone === "heart" ? 0.25 * t.hb : 0;
        const fwd = t.lp > 0 ? ahead(o.c.y, band, h) : 1;
        const base = 0.6 + 0.5 * s.flash + beat + 0.55 * t.lockP;
        const lvl = Math.min(1.3, s.on * (base * (fwd + (1 - fwd) * 0.45) * t.organRest + 0.7 * flare));
        if (lvl <= 0.003) return null;
        const sc = s.on * (1 + beat * 0.5 + 0.08 * t.lockP);
        return (
          <g key={i} transform={`translate(${o.c.x} ${o.c.y}) rotate(${o.rot}) scale(${sc})`}>
            <ellipse rx={o.rx * 2.3} ry={o.ry * 2.3} fill={`url(#c09-org-${o.tone})`} opacity={0.38 * lvl}
              style={{ mixBlendMode: "screen" }} />
            <ellipse rx={o.rx} ry={o.ry} fill={`url(#c09-org-${o.tone})`} opacity={Math.min(1, 0.9 * lvl)} />
          </g>
        );
      })}
    </g>
    {/* a fine ring pings out as each organ ticks on (at most 3 alive at once) */}
    {list.map((o, i) => {
      const s = t.organs[i];
      if (s.ping <= 0 || s.ping >= 1) return null;
      const r = Math.max(o.rx, o.ry) * (0.9 + 0.8 * s.ping);
      return (
        <circle key={i} cx={o.c.x} cy={o.c.y} r={r} fill="none" stroke={TONES[o.tone][1]} strokeWidth={2.2}
          opacity={0.55 * (1 - s.ping)} />
      );
    })}
  </g>
);
