// <VoiceWaves>: one voice as a train of tapered arcs rolling in from outside
// the womb. Same recipe as the kit's <SoundWaves> (soft glow, tapered core,
// bright inner highlight; crisp outside the sac, muffled inside it), plus
// what C15 needs: colours cycled per arc (her gold/rose), a cool in-sac tint
// for the stranger, and a "wash" pass: a soft band of light (glow only) laid
// over the baby, strongest around the head when given a `focus`.
// Must be a child of <AmnioticSac> (reads the live membrane for the clip).
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../../../theme/colors";
import { WombLayer, useSac } from "../../../shared/womb";
import { crescent } from "../../../shared/womb/geom";
import { loudness } from "./motion";
import { Train, trainStart } from "./shot";

// 0..1 visibility of an arc at radius r (fade in near the source, out at the end)
const arcFade = (r: number, length: number) => {
  if (r <= 0 || r >= length) return 0;
  const a = Math.min(1, r / 90);
  const t = Math.max(0, (r - 0.62 * length) / (0.38 * length));
  return a * (1 - t * t * (3 - 2 * t));
};

// Screen-space mask: keeps the tracker band (y 100-290) and the caption zone
// (y 1300-1560) free of bright arcs.
const BAND_MASK = "linear-gradient(180deg, transparent 0px, transparent 300px, #000 400px, #000 1180px, transparent 1300px)";

type Part = "back" | "wash";

// `focus` (wash only): a circle where the pass is strongest, e.g. the head, so
// her arcs brighten as they cross the face; without it the wash is uniform.
type Focus = { x: number; y: number; r: number };

export const VoiceWaves: React.FC<{ train: Train; frame: number; part?: Part; focus?: Focus }> = ({ train: t, frame, part = "back", focus }) => {
  const sac = useSac();
  const travel = (frame - trainStart(t)) * t.speed;
  const arcs = Array.from({ length: t.count }, (_, k) => {
    const r = travel - k * t.spacing;
    return { k, r, a: arcFade(r, t.length) * loudness(t, k) * t.loud };
  }).filter((x) => x.a > 0.01);
  if (arcs.length === 0 || !sac) return null;
  const wash = part === "wash";
  const id = `c15-${t.key}-${part}`;
  const a0 = t.dir - t.spread;
  const a1 = t.dir + t.spread;
  const wOf = (k: number, r: number) => t.width * (0.75 + 0.45 * loudness(t, k + 9)) * (1 - 0.35 * (r / t.length));
  const col = (list: string[], k: number) => list[k % list.length];
  const glow = (muffled: boolean, scale: number) =>
    arcs.map(({ k, r, a }) => (
      <path key={k} d={crescent(t.from, r, a0, a1, wOf(k, r) * 2.8 * scale)} fill={col(muffled ? t.muffled : t.colors, k)} opacity={a * (muffled ? 0.24 : 0.26)} />
    ));
  const core = (muffled: boolean) =>
    arcs.map(({ k, r, a }) => (
      <path key={k} d={crescent(t.from, r, a0, a1, wOf(k, r))} fill={col(muffled ? t.muffled : t.colors, k)} opacity={a * (muffled ? t.inAlpha : 0.92)} />
    ));
  const shine = arcs.map(({ k, r, a }) => (
    <path key={k} d={crescent(t.from, r - wOf(k, r) * 0.18, a0 + 4, a1 - 4, wOf(k, r) * 0.32)} fill={C.text} opacity={a * 0.55} />
  ));
  return (
    <AbsoluteFill style={{ WebkitMaskImage: BAND_MASK, maskImage: BAND_MASK }}>
      <WombLayer blend={wash ? "screen" : undefined}>
        <defs>
          <filter id={`${id}-gb`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={10} />
          </filter>
          <filter id={`${id}-mb`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={18} />
          </filter>
          <filter id={`${id}-ms`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={4} />
          </filter>
          <clipPath id={`${id}-in`}>
            <path d={sac.d} />
          </clipPath>
          <clipPath id={`${id}-out`}>
            <path d={`M-4000,-4000H5000V6000H-4000Z ${sac.d}`} clipRule="evenodd" />
          </clipPath>
          {focus && (
            <>
              <radialGradient id={`${id}-fg`} gradientUnits="userSpaceOnUse" cx={focus.x} cy={focus.y} r={focus.r}>
                <stop offset="0.2" stopColor={C.text} />
                <stop offset="1" stopColor={C.text} stopOpacity={0.14} />
              </radialGradient>
              <mask id={`${id}-fm`} maskUnits="userSpaceOnUse" x={-4000} y={-4000} width={9000} height={10000}>
                <rect x={-4000} y={-4000} width={9000} height={10000} fill={`url(#${id}-fg)`} />
              </mask>
            </>
          )}
        </defs>
        {part === "back" && (
          <g clipPath={`url(#${id}-out)`}>
            <g filter={`url(#${id}-gb)`}>{glow(false, 1)}</g>
            {core(false)}
            {shine}
          </g>
        )}
        <g clipPath={`url(#${id}-in)`} opacity={wash ? t.wash : 1}>
          <g mask={wash && focus ? `url(#${id}-fm)` : undefined}>
            <g filter={`url(#${id}-mb)`}>{glow(true, wash ? 1.9 : 1)}</g>
            {!wash && <g filter={`url(#${id}-ms)`}>{core(true)}</g>}
          </g>
        </g>
      </WombLayer>
    </AbsoluteFill>
  );
};
