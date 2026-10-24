/**
 * Caption timing for the long film: lines -> on-screen PAGES with their word times and
 * fade windows. Pure functions (no React), so the rules are easy to test.
 *
 *   buildPages(lines, totalFrames) -> Page[] sorted by start
 *
 * Rules (CLAUDE.md rules 6, 9, 17; the first two started in the teaser's src/overlays/Captions.tsx):
 * 1. No stacked text: a page reaches 0 opacity CLEAR (2) frames before the next page's first
 *    word becomes visible (that word fades in from WORD_LEAD frames before its onset), so
 *    fade.to = next.start - WORD_LEAD + 1 - CLEAR. Normally end+6 -> end+16; pulled in (6 frames,
 *    softer curve) when the next page comes sooner. Holds between pages of the same line too.
 * 2. End title: the LAST line of the film is never paged, never fades out, and settles
 *    (slow 4% scale-up + gold glow) from its first word to the final frame.
 * 3. Paging: a line is one sentence of script.md. If it wraps to more than MAX_ROWS (2) rows
 *    in the caption box (x 150..930 at 76 px), it is split into pages by a small search over
 *    every word boundary (splitLine). Each page is <= 2 rows; the cheapest set of breaks wins:
 *      - a page on screen < MIN_PAGE frames (0.7 s)              huge cost (avoided if possible)
 *      - each page                                               10 (fewer pages)
 *      - a break after punctuation 0, at an authored phrase start (`phrases`) 12, elsewhere 40,
 *        +40 more if the page would end on a function word ("the", "a", "of", ...)
 *      - the page's last word must READ before the handoff: its peak opacity (fade-in x the
 *        page's fade-out) below 0.85 costs (0.85 - peak) x 300, so breaks land on real pauses
 *    Words keep their spoken onsets (karaoke); each page builds word by word.
 */
import { DISPLAY } from "../../../theme/fonts";
import { sec } from "../../../theme/timing";
import { EASE, tween } from "../../../lib/ease";
import { textWidth } from "../../lib/measure";
import type { CaptionLine } from "./types";

export const CAPTION_SIZE = 76;
export const CAPTION_LS = -1.5;
export const WORD_GAP = 0.26; // em, the margin after each word
export const CAPTION_X = 150; // caption box x 150..930 (rule 6 band), so the text never leaves it
const BOX_W = 1080 - 2 * CAPTION_X;
const MAX_ROWS = 2; // rule 9: 2 rows x 85 px, centred in the caption zone (y 1300..1560)
const FONT = `800 ${CAPTION_SIZE}px "${DISPLAY}"`;

/** A word fades in over [at - WORD_LEAD, at + WORD_IN]; first visible frame = at - WORD_LEAD + 1. */
export const WORD_LEAD = 2;
export const WORD_IN = 8;
const CLEAR = 2; // frames with no caption at all between two pages (rule 9)
const FADE = 6; // shortest page fade-out (rule 14)
const MIN_PAGE = 21; // 0.7 s on screen (rule 17)
const PEAK = 0.85; // the last word of an inner page must reach this opacity before its page fades

export type Page = {
  id: string;
  words: { word: string; at: number }[]; // at = frame the word is spoken (it fades in from at - WORD_LEAD)
  emphasis: Set<string>;
  final: boolean;
  start: number; // frame of the first word
  end: number; // frame the spoken page ends
  settleFrom: number; // end title only
  fade: { from: number; to: number; ease: (t: number) => number };
};

export const clean = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "");

/** Last frame a page may still be visible at, so the CLEAR gap holds before a word at `nextAt`. */
const clearBefore = (nextAt: number) => nextAt - WORD_LEAD + 1 - CLEAR;

/** Each word's start (seconds): from the line's `words` when they match, else spread by length. */
const wordSecs = (line: CaptionLine, tokens: string[]) => {
  if (line.words && line.words.length === tokens.length) return line.words;
  const weights = tokens.map((w) => w.length + 2);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return tokens.map((_, i) => {
    const t = line.start + ((line.end - line.start) * acc) / total;
    acc += weights[i];
    return t;
  });
};

/** Rows the words wrap to in the caption box (greedy, like the browser; balance keeps the count). */
export const rowsOf = (tokens: string[]) => {
  const gap = WORD_GAP * CAPTION_SIZE;
  let rows = 1;
  let w = 0;
  tokens.forEach((t, i) => {
    const ww = textWidth(t, FONT, CAPTION_LS) + (i < tokens.length - 1 ? gap : 0);
    if (w > 0 && w + ww > BOX_W * 0.98) {
      rows++;
      w = ww;
    } else w += ww;
  });
  return rows;
};

const PUNCT = /[,:;.!?…]$/;
// A page should not end on one of these (it belongs to the words after it).
const WEAK = new Set(
  "a an the its her his their your my of to for from in into on by with and but or as is are can very every it they has than this about".split(
    " ",
  ),
);

/** Peak opacity of a word spoken at `at` on a page that fades out over [to - FADE, to]. */
const peakOf = (at: number, to: number) => {
  let m = 0;
  for (let f = at - WORD_LEAD; f <= to; f++) {
    const inn = tween(f, at - WORD_LEAD, at + WORD_IN, [0, 1], EASE.out);
    m = Math.max(m, inn * tween(f, to - FADE, to, [1, 0], EASE.inOut));
  }
  return m;
};

/**
 * Word ranges [from, to) of the pages a line is shown in (cheapest breaks, see rule 3).
 *   at        each word's spoken frame
 *   lastTo    last frame the line's final page can be visible (end + 16, or the next line's clear gap)
 */
const splitLine = (
  tokens: string[],
  at: number[],
  phrases: readonly number[] = [],
  lastTo: number,
): [number, number][] => {
  const n = tokens.length;
  if (rowsOf(tokens) <= MAX_ROWS) return [[0, n]];
  const authored = new Set(phrases);
  const pageCost = (a: number, b: number) => {
    if (b - a > 1 && rowsOf(tokens.slice(a, b)) > MAX_ROWS) return Number.POSITIVE_INFINITY;
    const to = b < n ? clearBefore(at[b]) : lastTo;
    let c = 10;
    if (to - at[a] < MIN_PAGE) c += 1000 + (MIN_PAGE - (to - at[a])) * 10;
    if (b < n) {
      const last = tokens[b - 1];
      if (!PUNCT.test(last)) c += (authored.has(b) ? 12 : 40) + (WEAK.has(clean(last)) ? 40 : 0);
      c += Math.max(0, PEAK - peakOf(at[b - 1], to)) * 300;
    }
    return c;
  };
  // best[b] = cheapest paging of words [0, b); from[b] = where its last page starts.
  const best = new Array<number>(n + 1).fill(Number.POSITIVE_INFINITY);
  const from = new Array<number>(n + 1).fill(0);
  best[0] = 0;
  for (let b = 1; b <= n; b++)
    for (let a = 0; a < b; a++) {
      const c = best[a] + pageCost(a, b);
      if (c < best[b]) {
        best[b] = c;
        from[b] = a;
      }
    }
  const out: [number, number][] = [];
  for (let b = n; b > 0; b = from[b]) out.unshift([from[b], b]);
  return out;
};

export const buildPages = (lines: readonly CaptionLine[], totalFrames: number): Page[] => {
  const sorted = [...lines].sort((a, b) => a.start - b.start);
  const timed = sorted.map((line) => {
    const tokens = line.text.split(" ");
    return { line, tokens, at: wordSecs(line, tokens).map(sec) };
  });
  const pages: Page[] = [];
  timed.forEach(({ line, tokens, at }, li) => {
    const final = li === sorted.length - 1;
    const next = timed[li + 1];
    const lastTo = Math.min(sec(line.end) + 16, next ? clearBefore(next.at[0]) : Number.POSITIVE_INFINITY);
    const emphasis = new Set((line.emphasis ?? (final ? [tokens[tokens.length - 1]] : [])).map(clean));
    const ranges: [number, number][] = final ? [[0, tokens.length]] : splitLine(tokens, at, line.phrases, lastTo);
    ranges.forEach(([a, b], pi) => {
      pages.push({
        id: ranges.length > 1 ? `${line.id}.${pi + 1}` : line.id,
        words: tokens.slice(a, b).map((word, k) => ({ word, at: at[a + k] })),
        emphasis,
        final,
        start: at[a],
        // Inner pages hold until the next page takes over (rule 1 pulls the fade in).
        end: b < tokens.length ? at[b] : sec(line.end),
        settleFrom: sec(line.start),
        fade: { from: 0, to: 0, ease: EASE.in },
      });
    });
  });
  pages.forEach((p, i) => {
    if (p.final) {
      p.fade = { from: totalFrames, to: totalFrames + 6, ease: EASE.in };
      return;
    }
    const next = pages[i + 1];
    const to = next ? clearBefore(next.start) : Number.POSITIVE_INFINITY;
    if (to >= p.end + 16) p.fade = { from: p.end + 6, to: p.end + 16, ease: EASE.in };
    else p.fade = { from: Math.min(p.end, to - FADE), to, ease: EASE.inOut };
  });
  return pages;
};
