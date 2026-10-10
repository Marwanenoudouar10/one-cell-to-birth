// The fetus layer (world px, inside a <WombLayer>): the shared kit's fetus
// placed at its timeline position, with the cord to the placenta in the kit's
// cord slot (over the torso, under the head and arm), plus this chapter's
// week-18/19 skin details, the ear glow and the measuring line.
import React from "react";
import { Fetus } from "../../../shared/fetus";
import { CordShape, WOMB_LOOKS, placentaPort } from "../../../shared/womb";
import { Core, SAC_C } from "./timeline";
import { Fx } from "./staging";
import { guides } from "./guides";
import { EarGlow, Lanugo, TipGlow, Vernix } from "./Shimmer";
import { Measure } from "./Measure";

const L = WOMB_LOOKS.mid;

export const Baby: React.FC<{ c: Core; fx: Fx; f: number }> = ({ c, fx, f }) => {
  const g = guides(c.week, c.pose, c.size);
  const port = placentaPort({ cx: SAC_C.x, cy: SAC_C.y, r: c.sacR }, L.placenta.at, L.placenta.size);
  const to = { x: port.x - c.pos.x, y: port.y - c.pos.y };
  const cord = (
    <CordShape from={g.a.navel} to={to} slack={0.42} side={1} twist={1} pulse={0.6} bpm={140}
      width={L.cordWidth} sway={1} seed="c11-cord" frame={f} />
  );
  return (
    <g transform={`translate(${c.pos.x.toFixed(2)} ${c.pos.y.toFixed(2)})`}>
      <Fetus week={c.week} size={c.size} pose={c.pose} rim={0.75 + 0.2 * fx.bloom} bloom={fx.bloom} cord={cord} uid="c11-baby" />
      <Vernix g={g} p={fx.sheenP} a={fx.sheenA} />
      <Lanugo g={g} p={fx.shimmerP} a={fx.shimmerA} />
      <EarGlow g={g} a={fx.ear} age={fx.earAge} />
      <Measure g={g} cr={fx.cr} heel={fx.heel} sweep={fx.sweepP} alpha={fx.measureA} />
      <TipGlow g={g} a={fx.tips} />
    </g>
  );
};
