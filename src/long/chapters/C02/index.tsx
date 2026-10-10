// C02 · Week two already (W01 -> W02, 6.0 s incl. its fade-in).
// "Doctors already call this week two: they count from the last period."
//
// START = C01 END (Scene1's settled white-hot zygote at 540,860, core r150,
// zona r175.5, breathing 2 %). The white heat melts into Scene2's calm lit
// cell; two pronuclei (gold, peach) form at opposite edges and drift in to
// rest side by side on "two". A row of 14 day dots draws itself below: dot 1
// rose, a light counts along, dot 14 flares gold and a spark lifts off it into
// the zygote ("day 14 is this cell"), which lights up.
// END = the same zygote (camera back at 1.0), slightly stretched along x,
// pronuclei pressed together, ready for C03's first split.
//
// Back to front: far specks · glow · cell (+ pronuclei) · zona · dots ·
// spark · near specks · caption shade. Timing lives in beats.ts, curves in motion.ts.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { CaptionShade } from "../../../shared/womb";
import { C } from "../../../theme/colors";
import { mix } from "./palette";
import { CX, CY, R0, breathAt, camXf, countDim, exitOp, matchOp, zonaGlint } from "./motion";
import { DayDots } from "./DayDots";
import { Glow } from "./Glow";
import { Pronuclei } from "./Pronuclei";
import { Spark } from "./Spark";
import { SpecksFar, SpecksNear } from "./Specks";
import { Zona } from "./Zona";
import { Zygote } from "./Zygote";

// multiply tint for the dimmed cell: gold-to-terracotta (Scene2's shade family)
const DIM_TINT = mix(C.gold, C.skinShade, 0.6);

export const C02: React.FC = () => {
  const f = useCurrentFrame();
  const breath = breathAt(f);
  const dim = countDim(f);
  const exit = exitOp(f);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: exit }}>
        <SpecksFar f={f} />
      </AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute" }}>
        <defs>
          {/* the tint covers the cell body only (the glassy zona just fades a little) */}
          {[
            ["c02-dim", DIM_TINT],
            ["c02-dimk", C.bg0],
          ].map(([id, c]) => (
            <radialGradient key={id} id={id} gradientUnits="userSpaceOnUse" cx={0} cy={0} r={R0 + 8}>
              <stop offset={(R0 + 1) / (R0 + 8)} stopColor={c} stopOpacity={1} />
              <stop offset={1} stopColor={c} stopOpacity={0} />
            </radialGradient>
          ))}
        </defs>
        <g transform={camXf(f)}>
          <g transform={`translate(${CX} ${CY}) scale(${breath.toFixed(5)})`}>
            <g opacity={exit}>
              <Glow f={f} />
            </g>
            <Zygote f={f}>
              <Pronuclei f={f} />
            </Zygote>
            {/* the cell steps back while the days are counted: a deeper amber
                (multiply, same warm hue) plus a little dark, never khaki/grey */}
            {dim > 0.005 && (
              <>
                <circle r={R0 + 8} fill="url(#c02-dim)" opacity={0.55 * dim} style={{ mixBlendMode: "multiply" }} />
                <circle r={R0 + 8} fill="url(#c02-dimk)" opacity={0.1 * dim} />
              </>
            )}
            <g opacity={exit * (1 - 0.3 * dim)}>
              <Zona glint={zonaGlint(f)} match={matchOp(f)} />
            </g>
          </g>
          <DayDots f={f} />
          <Spark f={f} />
        </g>
      </svg>
      <AbsoluteFill style={{ opacity: exit }}>
        <SpecksNear f={f} />
        <CaptionShade strength={0.7} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
