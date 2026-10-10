import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { C } from "../../../../theme/colors";
import { EASE, tween } from "../../../../lib/ease";
import { T } from "../timeline";

// the opening sits low, under the caption lines, so its white core never
// lands behind the words
const SRC = { x: 540, y: 1900 };
// flash decay: a beat of white, then a soft (not abrupt) reveal of the room
const FADE = Easing.bezier(0.4, 0, 0.2, 1);

// Warm white-gold light that waits behind the womb walls and floods in
// through the gap as they part.
export const Bloom: React.FC<{ frame: number }> = ({ frame }) => {
  const on = tween(frame, T.bloom, T.bloom + 18, [0, 1], EASE.out);
  if (on <= 0) return null;
  const r = tween(frame, T.bloom, T.flashPeak, [520, 1700], EASE.in);
  const warm = tween(frame, T.curtainA + 10, T.flashPeak, [0, 1], EASE.in);
  const rays = Array.from({ length: 9 }, (_, i) => {
    const a = -90 + (i - 4) * 15 + Math.sin(frame * 0.03 + i * 1.7) * 3;
    const len = 1900;
    const w = 7 + (i % 3) * 3;
    return { a, len, w, o: 0.12 + ((i * 37) % 5) * 0.03 };
  });
  return (
    <AbsoluteFill style={{ opacity: on }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg2} 0%, ${C.wombDeep} 35%, ${C.womb} 75%)` }} />
      <AbsoluteFill style={{ opacity: warm, background: `linear-gradient(180deg, ${C.womb} 0%, ${C.rose} 45%, ${C.peach} 80%)` }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle ${r}px at ${SRC.x}px ${SRC.y}px, ${C.text} 0%, ${C.gold} 20%, ${C.peach}cc 42%, ${C.rose}88 68%, ${C.rose}00 100%)`,
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", mixBlendMode: "screen", filter: "blur(18px)" }}>
        <defs>
          <linearGradient id="c16-ray" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.text} stopOpacity={1} />
            <stop offset="1" stopColor={C.gold} stopOpacity={0} />
          </linearGradient>
        </defs>
        {rays.map((ray, i) => (
          <polygon
            key={i}
            points={`0,0 ${ray.len},${-ray.w * 9} ${ray.len},${ray.w * 9}`}
            fill="url(#c16-ray)"
            opacity={ray.o}
            transform={`translate(${SRC.x} ${SRC.y}) rotate(${ray.a})`}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// The bright gold-white wash that carries us out of the womb.
export const flashAmount = (frame: number) =>
  tween(frame, T.flashUpA, T.flashPeak, [0, 1], EASE.in) * tween(frame, T.flashPeak + 2, T.flashOut - 4, [1, 0], FADE);

export const Flash: React.FC<{ frame: number }> = ({ frame }) => {
  const a = flashAmount(frame);
  if (a <= 0) return null;
  const spread = tween(frame, T.flashUpA, T.flashPeak, [420, 1000], EASE.out);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle ${spread}px at 540px 860px, ${C.text} 0%, ${C.text} 30%, ${C.gold} 62%, ${C.peach} 84%, ${C.rose} 100%)`,
        }}
      />
      {/* the floor of the flash stays warm rose, so the captions keep contrast */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.rose}00 0%, ${C.rose}00 50%, ${C.rose}aa 58%, ${C.womb}e0 66%, ${C.womb} 80%, ${C.wombDeep} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Keeps the captions legible while the picture is bright: a warm rose shadow
// multiplied into the light behind the caption lines (darkens bright areas
// without lifting the dark ones, so it never reads as a pink or brown blob).
export const CaptionScrim: React.FC<{ strength: number }> = ({ strength }) => {
  if (strength <= 0.01) return null;
  return (
    <AbsoluteFill
      style={{
        opacity: strength,
        mixBlendMode: "multiply",
        // a wide warm shadow (edges run off the frame, so it never reads as an
        // oval), with a faint plum core right behind the caption lines
        background: [
          `radial-gradient(ellipse 600px 190px at 540px 1430px, ${C.wombDeep}5c 0%, ${C.wombDeep}40 50%, ${C.wombDeep}00 100%)`,
          `radial-gradient(ellipse 940px 360px at 540px 1430px, ${C.womb} 0%, ${C.womb}f2 36%, ${C.womb}b3 60%, ${C.womb}4d 80%, ${C.womb}00 100%)`,
        ].join(", "),
      }}
    />
  );
};
