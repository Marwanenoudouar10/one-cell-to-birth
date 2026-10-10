// A CSS mask that lets a bright layer fade toward the dark background inside
// the caption zone (y 1300-1560), instead of darkening it with a band on top.
// The ramp is long and eased (smoothstep stops), so it reads as falloff, never
// as an edge. keep = how much of the layer survives in the caption zone.
import React from "react";

const smooth = (t: number) => t * t * (3 - 2 * t);
const RAMP = [760, 1300]; // fully kept above, `keep` below
const TAIL = [1580, 1920]; // eases back up a little toward the frame bottom

export const captionMask = (keep: number): React.CSSProperties => {
  if (keep >= 0.999) return {};
  const k = Math.max(0, Math.min(1, keep));
  const stops: string[] = ["#000 0px"];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const a = 1 - (1 - k) * smooth(t);
    stops.push(`rgba(0,0,0,${a.toFixed(3)}) ${Math.round(RAMP[0] + (RAMP[1] - RAMP[0]) * t)}px`);
  }
  stops.push(`rgba(0,0,0,${k.toFixed(3)}) ${TAIL[0]}px`, `rgba(0,0,0,${Math.min(1, k + 0.2).toFixed(3)}) ${TAIL[1]}px`);
  const m = `linear-gradient(180deg, ${stops.join(", ")})`;
  return { WebkitMaskImage: m, maskImage: m };
};
