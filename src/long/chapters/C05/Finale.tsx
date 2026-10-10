import React from "react";
import { C } from "../../../theme/colors";
import { EASE, tween } from "../../../lib/ease";
import { Embryo, YolkStalk, embryoAnchors, sacEdge, stageFor } from "../../../shared/embryo";
import { centreOf, placer, restBody } from "../../../shared/embryo/anchors";
import { buildBody } from "../../../shared/embryo/body";
import { N, sAt } from "../../../shared/embryo/centreline";
import { smoothPath } from "../../../shared/embryo/math";
import { surf } from "../../../shared/embryo/Neural";
import { BEATS as B, TUBE_DROP, TUBE_GROW, TUBE_VIS } from "./beats";
import { TUBE_LINE, TUBE_OUTLINE } from "./tube";
import { mix } from "./DiscDefs";
import { KIT_SIZE, PLACE, Pt, clamp01, floatAt, kitClock, kitWeekAt } from "./view";

// The silent end beat on the shared embryo kit (kit 3.3 -> 4.0): the disc
// stretches into a slipper, a glint draws the groove down its centre while the
// neural folds rise either side, and a dim, unlit heart tube waits in the
// future chest. The END frame is exactly C06's frame 0 (same kit week, size,
// placement, zip 0, wobble clock and the same dormant tube).


export const kitPlace = (f: number) => {
  const fl = floatAt(f);
  return { x: PLACE.x + fl.dx, y: PLACE.y + fl.dy };
};

// Groove centre line on the dorsal face of the LIVE body (same seed + clock as <Embryo id="c05">).
const grooveLine = (kw: number, clock: number, place: Pt) => {
  const b = buildBody(stageFor(kw), clock, 1, "emb-c05");
  const P = placer(kw, KIT_SIZE, place);
  const pts: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const s = sAt(i);
    if (s >= -0.27 && s <= 0.9) pts.push(P(surf(b, i, 0)));
  }
  return smoothPath(pts, false);
};

export const KitStalk: React.FC<{ f: number; yolk: { x: number; y: number; r: number; stalk: number } }> = ({ f, yolk }) => {
  const kw = kitWeekAt(f);
  const o = tween(kw, 3.62, 3.85, [0, 1]);
  if (o < 0.01 || yolk.stalk <= 0) return null;
  const a = embryoAnchors(kw, KIT_SIZE, kitPlace(f));
  return <YolkStalk from={a.yolkStalk} to={sacEdge(yolk, a.yolkStalk)} scale={yolk.stalk} opacity={o} />;
};

export const KitEmbryo: React.FC<{ f: number; opacity: number }> = ({ f, opacity }) => {
  const kw = kitWeekAt(f);
  const place = kitPlace(f);
  const clock = kitClock(f);
  const st = stageFor(kw);
  const a = embryoAnchors(kw, KIT_SIZE, place);
  const body = restBody(kw, 0);
  const heartRot = body.rig.cardiac.rot + st.spin;
  const k = KIT_SIZE / 280;
  const ctr = centreOf(kw, 0);
  const toWorld = `translate(${place.x} ${place.y}) scale(${k}) translate(${-ctr.x} ${-ctr.y})`;
  const tubeS = k * Math.max(0.72, st.bulge) * 0.95 * TUBE_GROW;
  const tube = tween(f, B.tubeIn, B.settle, [0, 1], EASE.inOut);
  const gp = tween(f, B.grooveStart, B.grooveEnd, [0, 1], EASE.inOut);
  const gEnv = clamp01((f - B.grooveStart + 2) / 4) * (1 - tween(f, B.grooveEnd - 3, B.grooveEnd + 6, [0, 1]));
  const trail = gEnv * 0.5 + 0.5 * tween(f, B.grooveStart, B.grooveEnd, [0, 1]) * (1 - tween(f, B.grooveEnd, B.settle + 4, [0, 1]));
  const groove = gEnv > 0.01 || trail > 0.01 ? grooveLine(kw, clock, place) : "";
  const L = 0.16;
  return (
    <g opacity={opacity}>
      <Embryo week={kw} size={KIT_SIZE} x={place.x} y={place.y} zip={0} heartLit={0} frame={clock} id="c05" />
      {groove && (
        <g style={{ mixBlendMode: "screen" }}>
          <path d={groove} pathLength={1} strokeDasharray={`${gp} 3`} fill="none" stroke={C.cell} strokeOpacity={0.35 * trail} strokeWidth={4} strokeLinecap="round" />
          <path
            d={groove}
            pathLength={1}
            strokeDasharray={`${L} 3`}
            strokeDashoffset={L - gp * (1 + L)}
            fill="none"
            stroke={C.cellCyan}
            strokeOpacity={0.5 * gEnv}
            strokeWidth={16}
            strokeLinecap="round"
            filter="url(#c05-halo-s)"
          />
          <path d={groove} pathLength={1} strokeDasharray={`${L * 0.7} 3`} strokeDashoffset={L * 0.7 - gp * (1 + L * 0.7)} fill="none" stroke={C.text} strokeOpacity={0.9 * gEnv} strokeWidth={4.5} strokeLinecap="round" />
        </g>
      )}
      {tube > 0.01 && (
        <g clipPath="url(#c05-tube-body)" opacity={TUBE_VIS * tube}>
          <defs>
            <clipPath id="c05-tube-body">
              <path d={body.outline} transform={toWorld} />
              {[...body.belly, ...body.blobs].map((e, i) => (
                <ellipse key={i} rx={e.rx * 0.97} ry={e.ry * 0.97} transform={`${toWorld} translate(${e.x} ${e.y}) rotate(${e.rot})`} />
              ))}
            </clipPath>
          </defs>
          {/* dormant tube: an unlit, wine-dark loop under the head end of the disc,
              lit faintly from the upper left (C06 fills it with warm light) */}
          <g transform={`translate(${a.heart.x + TUBE_DROP.x} ${a.heart.y + TUBE_DROP.y}) rotate(${heartRot}) scale(${tubeS})`}>
            <g filter="url(#c05-tube-soft)">
              <path d={TUBE_OUTLINE} fill="url(#c05-tube-fill)" opacity={0.85} />
              <path d={TUBE_LINE} fill="none" stroke={C.wombDeep} strokeOpacity={0.55} strokeWidth={3.2} strokeLinecap="round" transform="translate(0.8 1.4)" />
              <path d={TUBE_LINE} pathLength={1} strokeDasharray="0.55 3" strokeDashoffset={-0.2} fill="none" stroke={C.rose} strokeOpacity={0.55} strokeWidth={1.8} strokeLinecap="round" transform="translate(-1.8 -2.4)" />
            </g>
          </g>
        </g>
      )}
    </g>
  );
};

export const FinaleDefs: React.FC = () => (
  <defs>
    <filter id="c05-halo-s" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" />
    </filter>
    <filter id="c05-tube-soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.2" />
    </filter>
    <radialGradient id="c05-tube-fill" gradientUnits="userSpaceOnUse" cx={-10} cy={-12} r={52}>
      <stop offset="0" stopColor={C.womb} />
      <stop offset="0.55" stopColor={mix(C.womb, C.wombDeep, 0.55)} />
      <stop offset="1" stopColor={C.wombDeep} />
    </radialGradient>
  </defs>
);
