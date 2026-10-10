// The fetus (shared kit) with everything C09 draws on it: organ glows,
// the level-up band + halo, the cord to the placenta and the gold
// highlights. One SVG group in world px (place it inside a <WombLayer>).
import React from "react";
import { C } from "../../../theme/colors";
import { Fetus, buildFetus, outFrame } from "../../../shared/fetus";
import { CordShape, placentaPort } from "../../../shared/womb";
import { Pt, SAC_C, TL } from "./timeline";
import { BodyDim, OrganDefs, Organs, organLayout } from "./Organs";
import { LevelUpBand, LevelUpDefs, LevelUpHalo } from "./LevelUp";
import { FaceSweep, LidGlint, Ring, Sparkles } from "./Highlights";

const blur = (id: string, sd: number, pad = 30) => (
  <filter id={id} x={`-${pad}%`} y={`-${pad}%`} width={`${100 + 2 * pad}%`} height={`${100 + 2 * pad}%`}>
    <feGaussianBlur stdDeviation={sd} />
  </filter>
);

// the sealed lid seam (same curve the kit's Face draws), outer -> inner corner
const lidSeam = (geo: ReturnType<typeof buildFetus>, toOut: (p: Pt) => Pt): Pt[] => {
  const { x: ex, y: ey } = geo.lm.eye;
  const p0 = { x: ex - 13, y: ey - 1 };
  const p1 = { x: ex, y: ey + 9 };
  const p2 = { x: ex + 13, y: ey + 2 };
  return Array.from({ length: 9 }, (_, i) => {
    const u = i / 8;
    const q = {
      x: (1 - u) ** 2 * p0.x + 2 * (1 - u) * u * p1.x + u * u * p2.x,
      y: (1 - u) ** 2 * p0.y + 2 * (1 - u) * u * p1.y + u * u * p2.y,
    };
    return toOut(geo.headPt(q));
  });
};

export const Baby: React.FC<{ t: TL; f: number }> = ({ t, f }) => {
  const { a, size, at } = t;
  const geo = buildFetus(t.week, t.pose);
  const fr = outFrame(geo, size);
  const k = size / 470;
  const band = { h: 360 * k, y: a.bounds.y0 - 200 * k + (a.bounds.y1 - a.bounds.y0 + 400 * k) * t.lp };
  const centre = { x: (a.bounds.x0 + a.bounds.x1) / 2, y: (a.bounds.y0 + a.bounds.y1) / 2 };
  const port = placentaPort({ cx: SAC_C.x, cy: SAC_C.y, r: t.sacR }, -38, 1);
  const cordTo = { x: port.x - at.x, y: port.y - at.y };
  const cord =
    t.cord > 0.005 ? (
      <g opacity={t.cord}>
        <CordShape from={a.navel} to={cordTo} slack={0.8} side={1} twist={1} pulse={0.55 * t.cord} bpm={150}
          width={14 * k + 1} sway={0.8} seed="c09-cord" frame={f} />
      </g>
    ) : null;
  return (
    <g transform={`translate(${at.x} ${at.y})`}>
      <defs>
        {blur("c09-glow", 9)}
        {blur("c09-soft", 3, 50)}
        <radialGradient id="c09-facePool">
          <stop offset={0} stopColor={C.gold} stopOpacity={0.3} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c09-band">
          <stop offset={0} stopColor={C.text} stopOpacity={0.8} />
          <stop offset={0.35} stopColor={C.gold} stopOpacity={0.6} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <clipPath id="c09-bodyClip">
          {geo.silhouette.map((d, i) => (
            <path key={i} d={d} transform={fr.css} />
          ))}
        </clipPath>
        <clipPath id="c09-headClip">
          <path d={geo.head} transform={fr.css} />
        </clipPath>
        <OrganDefs />
        <LevelUpDefs bandY={band.y} h={band.h} />
      </defs>

      <LevelUpHalo silhouette={geo.silhouette} css={fr.css} halo={t.halo} centre={centre} />
      <Fetus week={t.week} size={size} pose={t.pose} heartbeat={t.hb} rim={t.rim} bloom={t.bloom} cord={cord} uid="c09" />

      <BodyDim silhouette={geo.silhouette} css={fr.css} amount={t.dim} bandY={band.y} h={band.h} />
      <Organs t={t} list={organLayout(a, size)} band={band.y} h={band.h} />
      <LevelUpBand bandY={band.y} h={band.h} bandA={t.bandA} />

      <Ring c={a.hand} r={50 * k} p={t.ringHand > 0 ? Math.min(1, t.ringHand * 1.4) : 0} alpha={t.ringHand} />
      <Sparkles pts={a.fingertips} p={t.ringHand} alpha={t.ringHand} size={8 * k} />
      <Ring c={a.foot} r={52 * k} p={t.ringFoot > 0 ? Math.min(1, t.ringFoot * 1.4) : 0} alpha={t.ringFoot} />
      <Sparkles pts={a.toes} p={t.ringFoot} alpha={t.ringFoot} size={7.5 * k} />
      <FaceSweep profile={a.profile} eye={a.eye} p={t.sweep} glow={t.faceGlow} s={k} />
      <LidGlint lid={lidSeam(geo, fr.toOut)} p={t.glint} alpha={t.glintA} s={k} />
    </g>
  );
};
