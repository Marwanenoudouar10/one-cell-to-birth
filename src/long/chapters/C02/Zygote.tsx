// The zygote's cell body, cell-local px (centre 0,0, core radius 150).
// Under: Scene2's sculpted, lit cell (gradient body, back-lit rim, glint),
// which slowly stretches along x at the end. Over it, for the first second:
// Scene1's white-hot settled zygote (C01's END look), dissolving away so the
// pronuclei (`children`) can be seen through the cytoplasm.
import React from "react";
import { random } from "remotion";
import { noise2D, noise3D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { ROOT_DARK, cellStops } from "./palette";
import { R0, cellRadii, clamp01, exitOp, glowOn, matchOp, polar } from "./motion";

const N = 72;
const cellPath = (f: number) => {
  const { rx, ry } = cellRadii(f);
  const amp = 0.012 * glowOn(f); // Scene2's membrane wobble, eased in from C01's perfect circle
  let d = "";
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const u = [Math.cos(a), Math.sin(a)];
    const k = 1 + amp * noise3D("c02-wob", u[0] * 0.9, u[1] * 0.9, f * 0.035);
    d += `${i ? "L" : "M"}${(u[0] * rx * k).toFixed(2)} ${(u[1] * ry * k).toFixed(2)}`;
  }
  return `${d}Z`;
};

// Fine cytoplasm granules, streaming very slowly around the centre.
const GRAINS = Array.from({ length: 34 }, (_, i) => {
  const rnd = (k: string) => random(`c02-gr-${i}-${k}`);
  return { d: R0 * 0.9 * Math.sqrt(rnd("d")), a: rnd("a") * 360, r: 1.1 + rnd("r") * 1.6, o: 0.1 + rnd("o") * 0.16, warm: rnd("c") > 0.6 };
});

const SpecGlint: React.FC<{ id: string; o: number; x?: number }> = ({ id, o, x = -0.36 }) => (
  <ellipse
    cx={x * R0}
    cy={-0.44 * R0}
    rx={R0 * 0.26}
    ry={R0 * 0.17}
    transform={`rotate(-38 ${x * R0} ${-0.44 * R0})`}
    fill={`url(#${id})`}
    opacity={o}
  />
);

export const Zygote: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => {
  const d = cellPath(f);
  const match = matchOp(f);
  const { rx, ry } = cellRadii(f);
  const gr = Math.sqrt(rx * ry);
  const lit = 1 - ROOT_DARK;
  const t = f * 0.004;
  return (
    <g>
      <defs>
        <radialGradient id="c02-body" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={gr * 1.3} fx={-gr * 0.4} fy={-gr * 0.48}>
          {cellStops(ROOT_DARK).map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </radialGradient>
        <linearGradient id="c02-rim" x1={0.15} y1={0.05} x2={0.91} y2={1}>
          <stop offset={0} stopColor={C.text} stopOpacity={0} />
          <stop offset={0.55} stopColor={C.text} stopOpacity={0.12} />
          <stop offset={1} stopColor={C.text} stopOpacity={0.95} />
        </linearGradient>
        <radialGradient id="c02-spec">
          <stop offset={0} stopColor={C.text} stopOpacity={0.85} />
          <stop offset={1} stopColor={C.text} stopOpacity={0} />
        </radialGradient>
        <clipPath id="c02-cellclip">
          <path d={d} />
        </clipPath>
        {/* Scene1's settled zygote, exactly (C01 END) */}
        <radialGradient id="c02-m-core" gradientUnits="userSpaceOnUse" cx={-0.24 * R0} cy={-0.3 * R0} r={R0 * 1.32}>
          <stop offset={0} stopColor={C.cell} stopOpacity={0.97} />
          <stop offset={0.4} stopColor={C.cell} stopOpacity={0.8} />
          <stop offset={0.75} stopColor={C.cellCyan} stopOpacity={0.5} />
          <stop offset={1} stopColor={C.cell} stopOpacity={0.7} />
        </radialGradient>
        <radialGradient id="c02-m-gold" gradientUnits="userSpaceOnUse" cx={-0.16 * R0} cy={-0.2 * R0} r={R0 * 1.38}>
          <stop offset={0} stopColor={C.text} stopOpacity={1} />
          <stop offset={0.22} stopColor={C.text} stopOpacity={0.96} />
          <stop offset={0.5} stopColor={C.gold} stopOpacity={0.96} />
          <stop offset={0.8} stopColor={C.gold} stopOpacity={0.95} />
          <stop offset={0.92} stopColor={C.peach} stopOpacity={0.85} />
          <stop offset={1} stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c02-m-mem" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={R0}>
          <stop offset={0.74} stopColor={C.text} stopOpacity={0} />
          <stop offset={0.94} stopColor={C.text} stopOpacity={0.55} />
          <stop offset={1} stopColor={C.text} stopOpacity={0.9} />
        </radialGradient>
        <radialGradient id="c02-m-shade" gradientUnits="userSpaceOnUse" cx={-0.4 * R0} cy={-0.5 * R0} r={R0 * 1.75}>
          <stop offset={0.5} stopColor={C.cellBlue} stopOpacity={0} />
          <stop offset={0.8} stopColor={C.cellBlue} stopOpacity={0.2} />
          <stop offset={0.95} stopColor={C.cellBlue} stopOpacity={0.08} />
        </radialGradient>
      </defs>

      {/* Scene2's sculpted cell */}
      <path d={d} fill="url(#c02-body)" />
      <g clipPath="url(#c02-cellclip)" opacity={glowOn(f)}>
        {GRAINS.map((g, i) => {
          const p = polar(g.d, g.a + f * 0.06 * (1 - g.d / R0));
          const x = p.x + noise2D(`c02-gx${i}`, t, 0) * 6;
          const y = p.y + noise2D(`c02-gy${i}`, 0, t) * 6;
          return <circle key={i} cx={x} cy={y} r={g.r} fill={g.warm ? C.skinShade : C.text} opacity={g.o} />;
        })}
      </g>
      {children}
      <SpecGlint id="c02-spec" o={0.75 * lit} />
      {/* back-lit rim (it pokes a few px past r150, so it waits for the dissolve;
          C03 draws the same rim, so it fades out under C03's fade-in) */}
      <g opacity={(1 - match) * exitOp(f)}>
        <path d={d} fill="none" stroke="url(#c02-rim)" strokeWidth={17} strokeLinejoin="round" opacity={0.28 * lit} />
        <path d={d} fill="none" stroke={C.text} strokeOpacity={0.2 * lit} strokeWidth={1.75} />
        <path d={d} fill="none" stroke="url(#c02-rim)" strokeWidth={5} strokeLinejoin="round" opacity={0.3 + 0.7 * lit} />
      </g>

      {/* C01's END look on top, melting away */}
      {match > 0.005 && (
        <g opacity={clamp01(match)}>
          <circle r={R0} fill="url(#c02-m-core)" />
          <circle r={R0} fill="url(#c02-m-gold)" />
          <circle r={R0} fill="url(#c02-m-shade)" opacity={0.15} />
          <circle r={R0} fill="url(#c02-m-mem)" />
          <SpecGlint id="c02-spec" o={0.55 * (0.8 / 0.85)} x={-0.38} />
        </g>
      )}
    </g>
  );
};
