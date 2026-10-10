import React from "react";
import { noise2D } from "@remotion/noise";
import { random } from "remotion";
import { C } from "../../../../theme/colors";
import { SAC } from "./geometry";

// Copied from src/long/chapters/C06/Environment.tsx (= Scene3's; ids -> c07).
// `frame` is the WALL clock: C06's frame, eased to a stop in C07 (motion.ts wallClock)
// so the womb wall is perfectly still while the embryo wiggles (pays off in C11).

// Far layer: the warm, soft womb wall surrounding the cavity (heavily blurred
// by its Layer). Big tissue masses with dark crevices between them.
const MASSES = [
  { x: 120, y: 420, rx: 380, ry: 270, rot: 30, c: C.womb, o: 0.5 },
  { x: 980, y: 470, rx: 360, ry: 250, rot: -35, c: C.womb, o: 0.42 },
  { x: -10, y: 920, rx: 260, ry: 420, rot: 0, c: C.womb, o: 0.36 },
  { x: 1090, y: 960, rx: 260, ry: 440, rot: 0, c: C.womb, o: 0.36 },
  { x: 200, y: 1430, rx: 400, ry: 220, rot: -20, c: C.wombDeep, o: 0.55 },
  { x: 900, y: 1440, rx: 400, ry: 220, rot: 20, c: C.wombDeep, o: 0.55 },
  { x: 540, y: 330, rx: 420, ry: 150, rot: 0, c: C.wombDeep, o: 0.5 },
];

const CREASES = [
  "M60,620 C220,560 330,520 420,470",
  "M1020,690 C880,610 790,560 690,500",
  "M90,1240 C210,1180 300,1130 380,1100",
  "M990,1250 C870,1190 790,1150 700,1110",
];

export const Environment: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <defs>
      {MASSES.map((m, i) => (
        <radialGradient key={i} id={`c07-env-mass-${i}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={m.c === C.womb ? C.rose : C.womb} stopOpacity={m.o * 0.42} />
          <stop offset="0.5" stopColor={m.c} stopOpacity={m.o * 0.65} />
          <stop offset="1" stopColor={m.c} stopOpacity={0} />
        </radialGradient>
      ))}
      <radialGradient id="c07-env-cavity" gradientUnits="userSpaceOnUse" cx={SAC.x} cy={SAC.y} r={SAC.r + 260}>
        <stop offset="0" stopColor={C.wombDeep} stopOpacity={0.5} />
        <stop offset={SAC.r / (SAC.r + 260)} stopColor={C.womb} stopOpacity={0.55} />
        <stop offset="1" stopColor={C.wombDeep} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={SAC.x} cy={SAC.y} r={SAC.r + 260} fill="url(#c07-env-cavity)" />
    {MASSES.map((m, i) => {
      const t = frame * 0.006;
      const dx = noise2D("s3mx", t, i) * 18;
      const dy = noise2D("s3my", i, t) * 18;
      const breathe = 1 + noise2D("s3ms", t, i * 3) * 0.04;
      return (
        <ellipse
          key={i}
          rx={m.rx * breathe}
          ry={m.ry * breathe}
          transform={`translate(${m.x + dx} ${m.y + dy}) rotate(${m.rot})`}
          fill={`url(#c07-env-mass-${i})`}
        />
      );
    })}
    {CREASES.map((d, i) => (
      <path key={i} d={d} fill="none" stroke={C.bg0} strokeOpacity={0.5} strokeWidth={34} strokeLinecap="round" />
    ))}
  </g>
);

// Near layer: big out-of-focus specks drifting in front of the lens.
const BOKEH = [
  { x: 120, y: 560, r: 70, c: C.peach, o: 0.16 },
  { x: 960, y: 420, r: 46, c: C.rose, o: 0.18 },
  { x: 990, y: 1150, r: 90, c: C.rose, o: 0.12 },
  { x: 70, y: 1060, r: 40, c: C.peach, o: 0.14 },
  { x: 800, y: 300, r: 28, c: C.skin, o: 0.12 },
];

export const Foreground: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <defs>
      {BOKEH.map((b, i) => (
        <radialGradient key={i} id={`c07-env-bok-${i}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={b.c} stopOpacity={b.o} />
          <stop offset="0.7" stopColor={b.c} stopOpacity={b.o * 0.6} />
          <stop offset="1" stopColor={b.c} stopOpacity={0} />
        </radialGradient>
      ))}
    </defs>
    {BOKEH.map((b, i) => {
      const t = frame * 0.007;
      const x = b.x + noise2D("s3bx", t, i) * 30 + (random(`s3bv${i}`) - 0.5) * frame * 0.4;
      const y = b.y + noise2D("s3by", i, t) * 30 - frame * 0.25;
      return <circle key={i} cx={x} cy={y} r={b.r} fill={`url(#c07-env-bok-${i})`} />;
    })}
  </g>
);
