import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme/colors";
import { DISPLAY } from "../theme/fonts";
import { CAPTION_Y } from "../theme/layout";
import { LINES, Line } from "../theme/script";
import { TOTAL_FRAMES, sec } from "../theme/timing";
import { EASE, tween } from "../lib/ease";

const clean = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "");
const LAST = LINES.length - 1; // the closing line is held as the end title
const END_Y = CAPTION_Y + 60; // end title sits a touch lower, on the dark sleeve

// Each word's start time: from the VO take when known, otherwise spread
// across the line by word length.
const wordTimes = (line: Line) => {
  const words = line.text.split(" ");
  if (line.words && line.words.length === words.length) {
    return words.map((w, i) => ({ word: w, at: sec(line.words![i]) }));
  }
  const weights = words.map((w) => w.length + 2);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return words.map((w, i) => {
    const t = line.start + ((line.end - line.start) * acc) / total;
    acc += weights[i];
    return { word: w, at: sec(t) };
  });
};

// Fade-out window of line i: normally end+6 -> end+16 (ease in). When the next
// line starts sooner, the fade is pulled earlier so this line is fully gone
// before the next line's first word appears (both share one position), and
// it uses a softer curve so the shorter fade still reads as a fade.
const fadeOf = (i: number) => {
  const end = sec(LINES[i].end);
  if (i === LAST) return { from: TOTAL_FRAMES, to: TOTAL_FRAMES + 6, ease: EASE.in };
  const next = LINES[i + 1];
  const to = sec(next.words?.[0] ?? next.start) - 2;
  if (to >= end + 16) return { from: end + 6, to: end + 16, ease: EASE.in };
  return { from: Math.min(end, to - 6), to, ease: EASE.inOut };
};

const LineView: React.FC<{ line: Line; index: number; frame: number }> = ({ line, index, frame }) => {
  const final = index === LAST;
  const fade = fadeOf(index);
  const out = tween(frame, fade.from, fade.to, [1, 0], fade.ease);
  const lift = tween(frame, fade.from, fade.to, [0, -24], fade.ease);
  // End title: the last word takes the accent, and the title keeps a slow
  // settle (scale + glow) until the final frame so the hold never freezes.
  const words = line.text.split(" ");
  const emph = new Set((line.emphasis ?? (final ? [words[words.length - 1]] : [])).map(clean));
  const settle = final ? tween(frame, sec(line.start), TOTAL_FRAMES - 1, [0, 1], EASE.inOut) : 0;
  const shadow = final ? "0 8px 44px rgba(0,0,0,0.6)" : "0 6px 30px rgba(0,0,0,0.55)";

  return (
    <div
      style={{
        position: "absolute",
        top: final ? END_Y : CAPTION_Y,
        left: final ? 40 : 90,
        right: final ? 40 : 90,
        transform: `translateY(calc(-50% + ${lift}px)) scale(${1 + 0.04 * settle})`,
        opacity: out,
        textAlign: "center",
        whiteSpace: final ? "nowrap" : undefined,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: final ? 112 : 76,
        lineHeight: 1.12,
        letterSpacing: final ? -2.5 : -1.5,
        textWrap: "balance",
        color: C.text,
        textShadow: shadow,
      }}
    >
      {wordTimes(line).map(({ word, at }, i) => {
        const p = tween(frame, at - 2, at + 8, [0, 1], EASE.out);
        const isEmph = emph.has(clean(word));
        const glow = final && isEmph ? `0 0 ${18 + 22 * settle}px ${C.gold}${Math.round(40 + 60 * settle).toString(16)}` : "";
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: i < words.length - 1 ? "0.26em" : 0,
              opacity: p,
              transform: `translateY(${(1 - p) * 26}px) scale(${0.92 + p * 0.08})`,
              filter: `blur(${(1 - p) * 8}px)`,
              color: isEmph ? C.gold : C.text,
              textShadow: glow ? `${shadow}, ${glow}` : undefined,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// Kinetic captions for the whole film, driven by theme/script.ts.
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {LINES.map((l, i) =>
        frame >= sec(l.start) - 4 && frame <= fadeOf(i).to ? (
          <LineView key={l.id} line={l} index={i} frame={frame} />
        ) : null,
      )}
    </AbsoluteFill>
  );
};
