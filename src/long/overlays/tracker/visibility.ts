/**
 * trackerOpacity(globalFrame) -> 0..1 for the week tracker: fades in at the film start
 * (0.2s -> 0.9s, like the teaser) and is hidden inside every CHAPTERS[].trackerHide window:
 * it fades out over FADE frames from the window's start and fades back in from its end.
 * A window that starts at the film's first frame (C00) is hidden from frame 0 with no fade,
 * so the opening thumbnail never shows a ghost of the tracker.
 *
 * With the final chapters.ts: hidden through C00 and C01, fades in at C02 local 0.6 s (reading
 * WEEK 01), fades out at C16 local 4.0 s (the birth flash) and stays hidden to the end.
 */
import { EASE, tween } from "../../../lib/ease";
import { FPS } from "../../../theme/layout";
import { CHAPTERS, chapterSpec, toGlobalFrame } from "../../chapters";

const FADE = 14;

const RAW: [number, number][] = CHAPTERS.flatMap((c) =>
  (chapterSpec(c.id).trackerHide ?? []).map(([a, b]): [number, number] => [
    toGlobalFrame(c.id, a),
    Math.max(toGlobalFrame(c.id, a) + 1, toGlobalFrame(c.id, b)),
  ]),
);

// Back-to-back or overlapping windows (C00 then C01) merge into one, so the tracker never
// half-returns for a few frames between them.
const WINDOWS: [number, number][] = [...RAW]
  .sort((x, y) => x[0] - y[0])
  .reduce<[number, number][]>((out, w) => {
    const last = out[out.length - 1];
    if (last && w[0] <= last[1] + FADE) last[1] = Math.max(last[1], w[1]);
    else out.push([w[0], w[1]]);
    return out;
  }, []);

export const trackerOpacity = (frame: number) => {
  let o = tween(frame, Math.round(0.2 * FPS), Math.round(0.9 * FPS), [0, 1], EASE.inOut);
  for (const [a, b] of WINDOWS) {
    const gone = a <= 0 ? 1 : tween(frame, a, a + FADE, [0, 1], EASE.inOut);
    const off = gone * tween(frame, b, b + FADE, [1, 0], EASE.inOut);
    o *= 1 - off;
  }
  return o;
};
