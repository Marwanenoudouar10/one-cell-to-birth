/**
 * Kinetic captions of the long film (same look as src/overlays/Captions.tsx, incl. its two
 * verified QA fixes), taking their lines as a prop.
 *
 *   <CaptionsLong lines={LONG_LINES} />          totalFrames defaults to LONG_TOTAL
 *     lines  CaptionLine[] in GLOBAL seconds (captions/types.ts): one per script sentence,
 *            { id, text, start, end, emphasis?, words?, phrases? }
 * Timing rules live in captions/pages.ts:
 *   - no stacked text: a page is at 0 opacity for 2 clear frames before the next page's
 *     first word appears (also between pages of one sentence)
 *   - the LAST line is the end title: 112 px, one line, gold last word, never fades out,
 *     slow 4% scale-up + glow to the final frame
 *   - a sentence longer than 2 rows (box x 150..930) is paged at its pauses / phrases
 * useCurrentFrame() must be the GLOBAL film frame. Caption block centred on CAPTION_Y.
 */
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../theme/colors";
import { DISPLAY } from "../../theme/fonts";
import { CAPTION_Y } from "../../theme/layout";
import { EASE, tween } from "../../lib/ease";
import { LONG_TOTAL } from "../chapters";
import { useFontsReady } from "../lib/measure";
import {
  CAPTION_LS,
  CAPTION_SIZE,
  CAPTION_X,
  Page,
  WORD_GAP,
  WORD_IN,
  WORD_LEAD,
  buildPages,
  clean,
} from "./captions/pages";
import type { CaptionLine } from "./captions/types";

export type { CaptionLine } from "./captions/types";

const END_Y = CAPTION_Y + 60; // end title sits a touch lower, on the dark sleeve

const PageView: React.FC<{ page: Page; frame: number; total: number }> = ({ page, frame, total }) => {
  const { final, fade } = page;
  const out = tween(frame, fade.from, fade.to, [1, 0], fade.ease);
  const lift = tween(frame, fade.from, fade.to, [0, -24], fade.ease);
  const settle = final ? tween(frame, page.settleFrom, total - 1, [0, 1], EASE.inOut) : 0;
  const shadow = final ? "0 8px 44px rgba(0,0,0,0.6)" : "0 6px 30px rgba(0,0,0,0.55)";
  const n = page.words.length;

  return (
    <div
      style={{
        position: "absolute",
        top: final ? END_Y : CAPTION_Y,
        left: final ? 40 : CAPTION_X,
        right: final ? 40 : CAPTION_X,
        transform: `translateY(calc(-50% + ${lift}px)) scale(${1 + 0.04 * settle})`,
        opacity: out,
        textAlign: "center",
        whiteSpace: final ? "nowrap" : undefined,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: final ? 112 : CAPTION_SIZE,
        lineHeight: 1.12,
        letterSpacing: final ? -2.5 : CAPTION_LS,
        textWrap: "balance",
        color: C.text,
        textShadow: shadow,
      }}
    >
      {page.words.map(({ word, at }, i) => {
        const p = tween(frame, at - WORD_LEAD, at + WORD_IN, [0, 1], EASE.out);
        const isEmph = page.emphasis.has(clean(word));
        const glow =
          final && isEmph ? `0 0 ${18 + 22 * settle}px ${C.gold}${Math.round(40 + 60 * settle).toString(16)}` : "";
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: i < n - 1 ? `${WORD_GAP}em` : 0,
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

export const CaptionsLong: React.FC<{ lines: readonly CaptionLine[]; totalFrames?: number }> = ({
  lines,
  totalFrames = LONG_TOTAL,
}) => {
  const frame = useCurrentFrame();
  const fontsReady = useFontsReady(); // paging measures text; hold until the real fonts are in
  const pages = useMemo(() => buildPages(lines, totalFrames), [lines, totalFrames, fontsReady]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pages.map((p) =>
        frame >= p.start - 4 && frame <= p.fade.to ? (
          <PageView key={p.id} page={p} frame={frame} total={totalFrames} />
        ) : null,
      )}
    </AbsoluteFill>
  );
};
