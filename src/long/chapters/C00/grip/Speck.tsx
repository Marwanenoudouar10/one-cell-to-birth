// The one gold speck resting in the newborn's palm (screen space, drawn over
// the hand so it never scales with the room). It twinkles, brightens on
// "began?", warms the skin around it, and swells as the camera plunges in.
// Past the speck its light hands over to the Bloom and fades (never held, never
// cut), staying out of the caption zone.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { C } from "../../../../theme/colors";
import { EASE, tween } from "../../../../lib/ease";
import { captionMask } from "../dive/mask";
import { T } from "../timeline";
import { TARGET, handCamAt } from "./handCam";

const Defs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <radialGradient id="c00-speck-halo">
        <stop offset="0" stopColor={C.gold} stopOpacity={0.95} />
        <stop offset="0.22" stopColor={C.gold} stopOpacity={0.55} />
        <stop offset="0.55" stopColor={C.gold} stopOpacity={0.16} />
        <stop offset="1" stopColor={C.gold} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="c00-speck-core" cx="0.42" cy="0.38" r="0.62">
        <stop offset="0" stopColor={C.text} />
        <stop offset="0.45" stopColor={C.text} />
        <stop offset="0.8" stopColor={C.gold} />
        <stop offset="1" stopColor={C.gold} stopOpacity={0} />
      </radialGradient>
      <linearGradient id="c00-speck-ray" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={C.text} stopOpacity={0} />
        <stop offset="0.5" stopColor={C.text} stopOpacity={0.9} />
        <stop offset="1" stopColor={C.text} stopOpacity={0} />
      </linearGradient>
    </defs>
  </svg>
);

export const Speck: React.FC<{ frame: number }> = ({ frame }) => {
  const cam = handCamAt(frame);
  const u = cam.u;
  // the plunge lands exactly on the cell's spot (the hand has blurred away by
  // the time this offset grows), so the lingering light never doubles the cell
  const k = u * u;
  const x = cam.speck[0] + (TARGET[0] - cam.speck[0]) * k;
  const y = cam.speck[1] + (TARGET[1] - cam.speck[1]) * k;
  // through the speck: it keeps swelling a little and fades out over ~10 frames
  const after = tween(frame, T.through - 1, T.through + 10, [0, 1], Easing.bezier(0.25, 0, 0.3, 1));
  const fade = 1 - after;
  if (fade <= 0.003) return null;
  const bright = tween(frame, T.began - 4, T.began + 10, [0, 1], EASE.out) - 0.25 * tween(frame, T.began + 12, T.dive, [0, 1], EASE.inOut);
  const tw = 0.88 + 0.12 * Math.sin(frame * 0.23) * Math.sin(frame * 0.071 + 1);
  const zoom = cam.s;
  // the light's own plunge curve: eases into its peak just past the speck
  // (u itself is steepest at the very end, which made the flash snap)
  const hu = tween(frame, T.dive, T.through + 3, [0, 1], Easing.bezier(0.55, 0, 0.45, 1));
  const core = (13 + 5 * bright) * Math.min(zoom, 1.4) * (1 + 4 * hu * hu);
  // capped growth: the halo keeps a radial falloff across the frame (a flat
  // full-frame wash reads as muddy beige)
  const halo = (74 + 40 * bright) * Math.min(zoom, 1.4) * (1 + 6.5 * Math.pow(hu, 2.2)) * (1 + 0.35 * after);
  const spill = 190 * zoom;
  const star = bright * (1 - u) * tw;
  // u = 0 (the thumbnail): no mask, plain blend, exactly the resting look
  const mask = captionMask(1 - 0.7 * u);
  const layer = (opacity: number, screen = false): React.CSSProperties => ({
    opacity,
    overflow: u > 0 ? "hidden" : undefined,
    mixBlendMode: screen ? "screen" : undefined,
    ...mask,
  });
  const halos = (
    <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
      <circle cx={x} cy={y} r={halo * 2.4} fill="url(#c00-speck-halo)" opacity={(0.5 + 0.2 * bright) * tw} />
      <circle cx={x} cy={y} r={halo} fill="url(#c00-speck-halo)" opacity={0.9 * tw} />
    </svg>
  );
  return (
    <AbsoluteFill>
      <Defs />
      {/* warm light the speck throws on the skin around it */}
      <AbsoluteFill
        style={{
          ...layer((0.5 + 0.4 * bright) * (1 - u * 0.5) * fade, true),
          background: `radial-gradient(circle ${spill}px at ${x}px ${y}px, ${C.gold}66 0%, ${C.peach}22 45%, ${C.peach}00 100%)`,
        }}
      />
      {/* the halo: laid over the skin at rest, turning to pure added light as
          we plunge (a gold film over the dark would read as khaki) */}
      <AbsoluteFill style={layer(fade * (1 - hu))}>{halos}</AbsoluteFill>
      {hu > 0.004 && <AbsoluteFill style={layer(fade * hu, true)}>{halos}</AbsoluteFill>}
      <AbsoluteFill style={layer(fade)}>
        <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
          {star > 0.02 && (
            <g opacity={0.7 * star} transform={`translate(${x} ${y}) rotate(-18)`}>
              <rect x={-80} y={-1.5} width={160} height={3} fill="url(#c00-speck-ray)" />
              <rect x={-46} y={-1.2} width={92} height={2.4} fill="url(#c00-speck-ray)" transform="rotate(90)" />
            </g>
          )}
          <circle cx={x} cy={y} r={core} fill="url(#c00-speck-core)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
