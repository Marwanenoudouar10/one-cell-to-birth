import React from "react";
import { EASE, tween } from "../../../lib/ease";
import { BEATS as B, GHOSTS } from "./beats";
import { DiscGeo } from "./geo";
import { LAYER_TINT } from "./DiscDefs";
import { GLYPHS } from "./glyphs";
import { GHOST_SCALE, GlyphArt, SLOTS, ghostState } from "./Ghosts";
import { View, lerp } from "./view";

// Bloom passes (each drawn in a blurred, screen-blended layer).
// LayerGlow (world): the speaking layer spills its colour into the fluid; once
// the view has pulled back onto the kit, the endoderm glows on as a gold light
// under the disc rim and through the yolk sac it lines (the gut's own roof).
// GhostGlow (screen, depth 0): a soft halo behind every visible ghost.
type Yolk = { x: number; y: number; r: number; swapT: number; cut: { y: number } };
type Props = { f: number; v: View; g: DiscGeo; glow: [number, number, number]; disc: number; yolk: Yolk };

export const LayerGlow: React.FC<Props> = ({ f, v, g, glow, disc, yolk }) => {
  const kitT = tween(f, B.swap - 6, B.swap + 6, [0, 1], EASE.inOut);
  const rim = glow[0] * kitT;
  return (
    <g>
      {g.bands.map((d, k) =>
        glow[k] > 0.01 ? <path key={k} d={d} fill={LAYER_TINT[k]} opacity={0.85 * glow[k] * disc} /> : null,
      )}
      {/* the bowl of the yolk sac just under the disc catches the gold light */}
      {/* (in the side cut only its lower half shows, so the light sits under the slab) */}
      {glow[0] > 0.01 && (
        <ellipse
          cx={yolk.x}
          cy={lerp(yolk.y - yolk.r * 0.35, yolk.cut.y + yolk.r * 0.15, v.side)}
          rx={yolk.r * 0.85}
          ry={yolk.r * lerp(0.55, 0.3, v.side)}
          fill={LAYER_TINT[0]}
          opacity={(0.32 + 0.3 * kitT) * glow[0]}
        />
      )}
      {rim > 0.01 && <ellipse cx={v.cx} cy={v.cy + 14} rx={v.A * 1.02} ry={v.B * 0.42} fill={LAYER_TINT[0]} opacity={0.55 * rim} />}
    </g>
  );
};

export const GhostGlow: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {GHOSTS.map((gh) => {
      const s = ghostState(f, gh);
      if (s.o < 0.01) return null;
      const p = SLOTS[gh.slot];
      return (
        <g key={gh.kind} opacity={0.6 * s.o} transform={`translate(${p.x + s.dx} ${p.y + s.dy}) scale(${GHOST_SCALE * 1.06 * s.scale})`}>
          <GlyphArt glyph={GLYPHS[gh.kind]} layer={gh.layer} halo />
        </g>
      );
    })}
  </g>
);
