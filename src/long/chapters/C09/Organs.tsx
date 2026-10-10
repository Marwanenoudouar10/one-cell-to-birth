// "Every major organ is in place": six soft, wordless glows tick on inside
// the translucent body (heart, brain, lungs, liver, kidneys, gut). Colours
// call back C05's three layers: cool = brain, rose = heart + kidneys, gold =
// lungs, liver, gut. Deliberately non-anatomical: soft rounded light only.
// Fetus-local px; placed from the fetus anchors so they follow curl + growth.
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

// heart, brain, lungs, liver, kidneys, gut (same order as ORGAN_BEATS)
export const organLayout = (a: FetusAnchors, size: number): Organ[] => {
  const k = size / 440;
  const R = a.headRadius;
  const up = (p: Pt, dy: number): Pt => ({ x: p.x, y: p.y - dy * k });
  const lungs = up(mixPt(a.heart, a.back, 0.38), 16);
  return [
    { c: a.heart, rx: 21 * k, ry: 23 * k, rot: -20, tone: "heart" },
    { c: { x: a.headCenter.x - 0.1 * R, y: a.headCenter.y - 0.2 * R }, rx: 0.6 * R, ry: 0.46 * R, rot: -12, tone: "cool" },
    { c: lungs, rx: 27 * k, ry: 40 * k, rot: 18, tone: "gold" },
    { c: mixPt(a.heart, a.navel, 0.58), rx: 38 * k, ry: 26 * k, rot: -14, tone: "gold" },
    { c: { ...mixPt(a.back, a.rump, 0.42), x: mixPt(a.back, a.rump, 0.42).x + 22 * k }, rx: 13 * k, ry: 20 * k, rot: 24, tone: "rose" },
    { c: up(mixPt(a.navel, a.back, 0.36), 6), rx: 25 * k, ry: 21 * k, rot: 0, tone: "gold" },
  ];
};

export const OrganDefs: React.FC = () => (
  <>
    {(Object.keys(TONES) as Tone[]).map((t) => (
      <radialGradient key={t} id={`c09-org-${t}`}>
        <stop offset={0} stopColor={TONES[t][0]} stopOpacity={t === "cool" ? 0.9 : 0.95} />
        <stop offset={0.38} stopColor={TONES[t][1]} stopOpacity={t === "cool" ? 0.5 : 0.8} />
        <stop offset={1} stopColor={TONES[t][1]} stopOpacity={0} />
      </radialGradient>
    ))}
  </>
);

// The skin dims to a translucent wine while the organs glow, so they read
// as lit from inside. The level-up band wipes the dim away, head to toe
// (a gradient mask whose edge rides just behind the band).
export const BodyDim: React.FC<{ silhouette: string[]; css: string; amount: number; bandY: number; h: number }> = ({
  silhouette, css, amount, bandY, h,
}) =>
  amount <= 0.005 ? null : (
    <g>
      <defs>
        <linearGradient id="c09-dimG" gradientUnits="userSpaceOnUse" x1={0} y1={bandY - 0.05 * h} x2={0} y2={bandY + 0.3 * h}>
          <stop offset={0} stopColor="black" />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <mask id="c09-dimM" maskUnits="userSpaceOnUse" x={-600} y={-700} width={1200} height={1400}>
          <rect x={-600} y={-700} width={1200} height={1400} fill="url(#c09-dimG)" />
        </mask>
      </defs>
      <g mask="url(#c09-dimM)">
        <g transform={css}>
          <g opacity={amount} style={{ mixBlendMode: "multiply" }}>
            {silhouette.map((d, i) => (
              <path key={i} d={d} fill={C.rose} />
            ))}
          </g>
          <g opacity={0.4 * amount}>
            {silhouette.map((d, i) => (
              <path key={i} d={d} fill={C.wombDeep} />
            ))}
          </g>
        </g>
      </g>
    </g>
  );

// 0 above the band (already swept), 1 below it (not reached yet)
const ahead = (y: number, bandY: number, h: number) => Math.max(0, Math.min(1, (y - bandY + 0.05 * h) / (0.35 * h)));

export const Organs: React.FC<{ t: TL; list: Organ[]; band: number; h: number }> = ({ t, list, band, h }) => {
  if (t.lp >= 1) return null;
  return (
    <g>
      <g clipPath="url(#c09-bodyClip)">
        {list.map((o, i) => {
          const s = t.organs[i];
          if (s.on <= 0.001) return null;
          // the level-up band flares each organ as it passes, then they rest
          const flare = t.bandA * Math.exp(-(((o.c.y - band) / (0.25 * h)) ** 2));
          const beat = o.tone === "heart" ? 0.25 * t.hb : 0;
          const rest = ahead(o.c.y, band, h);
          const lvl = Math.min(1.25, s.on * ((0.6 + 0.5 * s.flash + beat) * rest + 0.7 * flare));
          if (lvl <= 0.003) return null;
          const sc = s.on * (1 + beat * 0.5);
          return (
            <g key={i} transform={`translate(${o.c.x} ${o.c.y}) rotate(${o.rot}) scale(${sc})`}>
              <ellipse rx={o.rx * 2.3} ry={o.ry * 2.3} fill={`url(#c09-org-${o.tone})`} opacity={0.4 * lvl}
                style={{ mixBlendMode: "screen" }} />
              <ellipse rx={o.rx} ry={o.ry} fill={`url(#c09-org-${o.tone})`} opacity={Math.min(1, 0.9 * lvl)} />
            </g>
          );
        })}
      </g>
      {/* a fine ring pings out as each organ ticks on */}
      {list.map((o, i) => {
        const s = t.organs[i];
        if (s.ping <= 0 || s.ping >= 1) return null;
        const r = Math.min(46, Math.max(o.rx, o.ry)) * (0.85 + 0.85 * s.ping);
        return (
          <circle key={i} cx={o.c.x} cy={o.c.y} r={r} fill="none" stroke={TONES[o.tone][1]} strokeWidth={2}
            opacity={0.6 * (1 - s.ping)} />
        );
      })}
    </g>
  );
};
