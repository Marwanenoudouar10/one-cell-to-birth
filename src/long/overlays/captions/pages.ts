/**
 * Caption timing for the long film: lines -> on-screen PAGES with their word times and
 * fade windows. Pure functions (no React), so the rules are easy to test.
 *
 *   buildPages(lines, totalFrames) -> Page[] sorted by start
 *
 * Rules (the first two are ported from the teaser's verified src/overlays/Captions.tsx):
 * 1. No stacked text: a page is fully faded out 2 frames before the next page's first word
 *    appears (normally end+6 -> end+16, pulled earlier with a softer curve when the next
 *    page comes sooner). Pages share one position, so two must never be visible at once.
 * 2. End title: the LAST line of the film is never paged, never fades out, and settles
 *    (slow 4% scale-up + gold glow) from its first word to the final frame.
 * 3. Paging: a line is one sentence of script.md. If it would wrap to more than MAX_ROWS
 *    rows at caption size, it is split at its spoken phrase starts (`phrases`), preferring
 *    breaks after punctuation, into as few pages as fit. Each page builds word by word and
 *    hands over to the next page like a separate line.
 */
import { DISPLAY } from "../../../theme/fonts";
import { sec } from "../../../theme/timing";
import { EASE } from "../../../lib/ease";
import { textWidth } from "../../lib/measure";
import type { CaptionLine } from "./types";

export const CAPTION_SIZE = 76;
export const CAPTION_LS = -1.5;
export const WORD_GAP = 0.26; // em, the margin after each word
const BOX_W = 900; // caption box: left 90, right 90
const MAX_ROWS = 3; // 3 rows x 85 px fill the 260 px caption zone (y 1300..1560)
const FONT = `800 ${CAPTION_SIZE}px "${DISPLAY}"`;

export type Page = {
  id: string;
  words: { word: string; at: number }[]; // at = frame the word starts to appear
  emphasis: Set<string>;
  final: boolean;
  start: number; // frame of the first word
  end: number; // frame the spoken page ends
  settleFrom: number; // end title only
  fade: { from: number; to: number; ease: (t: number) => number };
};

export const clean = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "");

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

/** Lexicographic "a scores better than b" (lower is better). */
const better = (a: number[], b: number[]) => {
  for (let j = 0; j < a.length; j++) if (a[j] !== b[j]) return a[j] < b[j];
  return false;
};

/** Word ranges [from, to) of the pages a line is shown in. */
const splitLine = (tokens: string[], phrases: readonly number[] = []): [number, number][] => {
  const n = tokens.length;
  if (rowsOf(tokens) <= MAX_ROWS) return [[0, n]];
  const cand = [...new Set(phrases)].filter((k) => k > 0 && k < n).sort((a, b) => a - b);
  let best: { pages: [number, number][]; score: number[] } | null = null;
  for (let mask = 1; mask < 1 << cand.length; mask++) {
    const cuts = cand.filter((_, j) => mask & (1 << j));
    const edges = [0, ...cuts, n];
    const pages = edges.slice(1).map((to, j): [number, number] => [edges[j], to]);
    const rows = pages.map(([a, b]) => rowsOf(tokens.slice(a, b)));
    if (Math.max(...rows) > MAX_ROWS) continue;
    const loose = cuts.filter((k) => !PUNCT.test(tokens[k - 1])).length;
    const sizes = pages.map(([a, b]) => tokens.slice(a, b).join(" ").length);
    const score = [pages.length, loose, Math.max(...rows), Math.max(...sizes) - Math.min(...sizes)];
    // Fewest pages, then fewest breaks without punctuation, then fewest rows, then balance.
    if (!best || better(score, best.score)) best = { pages, score };
  }
  if (best) return best.pages;
  // A single phrase is too long: fill pages word by word.
  const out: [number, number][] = [];
  let a = 0;
  for (let b = 1; b <= n; b++) {
    if (b > a + 1 && rowsOf(tokens.slice(a, b)) > MAX_ROWS) {
      out.push([a, b - 1]);
      a = b - 1;
    }
  }
  out.push([a, n]);
  return out;
};

export const buildPages = (lines: readonly CaptionLine[], totalFrames: number): Page[] => {
  const sorted = [...lines].sort((a, b) => a.start - b.start);
  const pages: Page[] = [];
  sorted.forEach((line, li) => {
    const final = li === sorted.length - 1;
    const tokens = line.text.split(" ");
    const at = wordSecs(line, tokens).map(sec);
    const emphasis = new Set((line.emphasis ?? (final ? [tokens[tokens.length - 1]] : [])).map(clean));
    const ranges = final ? [[0, tokens.length] as [number, number]] : splitLine(tokens, line.phrases);
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
    const to = next ? next.start - 2 : Number.POSITIVE_INFINITY;
    if (to >= p.end + 16) p.fade = { from: p.end + 6, to: p.end + 16, ease: EASE.in };
    else p.fade = { from: Math.min(p.end, to - 6), to, ease: EASE.inOut };
  });
  return pages;
};
