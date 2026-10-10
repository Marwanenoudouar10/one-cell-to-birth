import React from "react";
import { AbsoluteFill, random } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";

const BOKEH = Array.from({ length: 11 }, (_, i) => ({
  x: 80 + random(`s5-bkx${i}`) * 920,
  y: 120 + random(`s5-bky${i}`) * 900,
  r: 40 + random(`s5-bkr${i}`) * 120,
  o: 0.07 + random(`s5-bko${i}`) * 0.14,
  col: [C.gold, C.peach, C.rose][i % 3],
  blur: 6 + random(`s5-bkb${i}`) * 10,
}));

// Out in the world: warm medium-dark room, soft gold light from above,
// out-of-focus bokeh. The bottom stays dark for the captions.
export const Backdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const breathe = 0.85 + 0.15 * Math.sin((frame / 75) * Math.PI * 2);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.womb} 0%, ${C.wombDeep} 42%, ${C.bg2} 70%, ${C.bg1} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: breathe,
          background: `radial-gradient(ellipse 820px 760px at 560px 120px, ${C.gold}99 0%, ${C.peach}44 40%, ${C.rose}00 78%)`,
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {BOKEH.map((b, i) => (
          <circle
            key={i}
            cx={b.x + noise2D(`s5-bkn${i}`, frame * 0.006, 0) * 30}
            cy={b.y + noise2D(`s5-bkm${i}`, 0, frame * 0.006) * 30 - frame * 0.08}
            r={b.r}
            fill={b.col}
            opacity={b.o}
            style={{ filter: `blur(${b.blur}px)` }}
          />
        ))}
      </svg>
      {/* soft blanket folds in the dark foreground below the hands */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 760px 300px at 300px 1380px, ${C.bg2}cc 0%, ${C.bg2}00 100%), radial-gradient(ellipse 700px 320px at 860px 1480px, ${C.bg0}aa 0%, ${C.bg0}00 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const SPECKS = Array.from({ length: 14 }, (_, i) => ({
  x: random(`s5-spx${i}`) * 1080,
  y: 300 + random(`s5-spy${i}`) * 1000,
  r: 2.5 + random(`s5-spr${i}`) * 6,
  depth: random(`s5-spd${i}`),
  ph: random(`s5-spp${i}`) * Math.PI * 2,
}));

// A few warm specks of light floating in the air. The near ones (front) pass
// in front of the hands, so they are drawn big and out of focus rather than
// as crisp dots that would read as marks on the skin.
export const Specks: React.FC<{ frame: number; opacity: number; front: boolean }> = ({ frame, opacity, front }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", opacity }}>
    <defs>
      <radialGradient id={`s5-speck${front ? "F" : "B"}`}>
        <stop offset="0" stopColor={C.text} stopOpacity={front ? 0.6 : 1} />
        <stop offset={front ? 0.5 : 0.25} stopColor={C.gold} stopOpacity={front ? 0.35 : 0.8} />
        <stop offset="1" stopColor={C.gold} stopOpacity={0} />
      </radialGradient>
    </defs>
    {SPECKS.map((s, i) => {
      if (s.depth > 0.72 !== front) return null;
      const speed = 0.25 + s.depth * 0.5;
      const x = s.x + noise2D(`s5-sn${i}`, frame * 0.008, 0) * 40;
      const y = s.y - frame * speed + noise2D(`s5-sm${i}`, 0, frame * 0.008) * 30;
      const tw = 0.55 + 0.45 * Math.sin(frame * 0.09 + s.ph);
      const r = s.r * (0.7 + s.depth * 0.9) * (front ? 2.2 : 1);
      return <circle key={i} cx={x} cy={y} r={r * 4} fill={`url(#s5-speck${front ? "F" : "B"})`} opacity={tw * (front ? 0.45 : 0.35 + s.depth * 0.5)} />;
    })}
  </svg>
);
