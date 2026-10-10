import React from "react";
import { noise2D } from "@remotion/noise";
import { random } from "remotion";
import { C } from "../../../theme/colors";
import { EASE, pop, tween } from "../../../lib/ease";
import { WombLayer, useWombCamera, worldToScreen } from "../../../shared/womb";
import { GHOSTS } from "./beats";
import { bandMid } from "./geo";
import { LAYER_LIGHT, mix } from "./DiscDefs";
import { GLYPHS, Glyph } from "./glyphs";
import { Pt, View, clamp01, lerp } from "./view";

// Soft filled ghost glyphs that bloom above the stack, one per spoken organ.
// Each one is fed by a little stream of light rising from its glowing layer,
// blooms with a springy overshoot as it pulls into focus, floats, then
// dissolves upward when the next layer speaks. The glyphs live in SCREEN space
// (depth 0) so the push-in at the end never drags them around.

// on a diagonal, never a level pair: two round glyphs side by side over the
// stacked slab read as a face (eyes over a mouth)
export const SLOTS: Pt[] = [
  { x: 334, y: 598 },
  { x: 750, y: 510 },
];
export const GHOST_SCALE = 1.3;

// per layer (endo, meso, ecto): highlight, body, deep
const TINTS = [
  [C.text, C.gold, mix(C.gold, C.skinShade, 0.55)],
  [C.skin, C.rose, mix(C.rose, C.womb, 0.45)],
  [C.text, mix(C.cell, C.cellCyan, 0.55), mix(C.cellCyan, C.cellBlue, 0.55)],
];

export const ghostState = (f: number, g: (typeof GHOSTS)[number]) => {
  const appear = tween(f, g.at - 7, g.at + 6, [0, 1], EASE.inOut);
  const exit = tween(f, g.out - 2, g.out + 12, [0, 1], EASE.inOut);
  const t = f * 0.03;
  return {
    o: appear * (1 - exit),
    scale: (0.55 + 0.45 * pop(f, g.at - 6)) * (1 + 0.08 * exit) * (1 + 0.012 * noise2D(`c05-gb${g.kind}`, t, 0)),
    blur: 9 * (1 - appear) + 9 * exit,
    dx: noise2D(`c05-gx${g.kind}`, t * 0.5, 1) * 4,
    dy: noise2D(`c05-gy${g.kind}`, 2, t * 0.5) * 5 - 30 * exit,
  };
};

export const GlyphArt: React.FC<{ glyph: Glyph; layer: number; grad?: string; halo?: boolean }> = ({ glyph, layer, grad, halo }) => {
  const [hi, , deep] = TINTS[layer];
  const body = grad ? `url(#${grad})` : TINTS[layer][1];
  return (
    <g transform={`rotate(${glyph.rot}) scale(${glyph.scale})`}>
      {glyph.parts.map((p, i) => {
        if (halo && (p.kind === "line" || p.kind === "deep")) return null;
        const fill = halo ? TINTS[layer][1] : body;
        if (p.kind === "fill") return <path key={i} d={p.d} fill={fill} />;
        if (p.kind === "tube") return <path key={i} d={p.d} fill="none" stroke={fill} strokeWidth={p.w} strokeLinecap="round" strokeLinejoin="round" />;
        const col = p.kind === "line" ? hi : deep;
        if (!p.w) return <path key={i} d={p.d} fill={col} opacity={p.o} />;
        return <path key={i} d={p.d} fill="none" stroke={col} strokeOpacity={p.o} strokeWidth={p.w} strokeLinecap="round" />;
      })}
    </g>
  );
};

const GhostDefs: React.FC<{ id: string; layer: number }> = ({ id, layer }) => {
  const t = TINTS[layer];
  return (
    <defs>
      <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={-34} cy={-46} r={175}>
        <stop offset="0" stopColor={t[0]} stopOpacity={0.95} />
        <stop offset="0.45" stopColor={t[1]} stopOpacity={0.88} />
        <stop offset="1" stopColor={t[2]} stopOpacity={0.8} />
      </radialGradient>
    </defs>
  );
};

// The crisp glyphs: one layer each so they can pull into focus on their own.
export const Ghosts: React.FC<{ f: number }> = ({ f }) => (
  <>
    {GHOSTS.map((g) => {
      const s = ghostState(f, g);
      const p = SLOTS[g.slot];
      return (
        <WombLayer key={g.kind} depth={0} blur={s.blur} opacity={s.o}>
          <GhostDefs id={`c05-gh-${g.kind}`} layer={g.layer} />
          <g transform={`translate(${p.x + s.dx} ${p.y + s.dy}) scale(${GHOST_SCALE * s.scale})`}>
            <GlyphArt glyph={GLYPHS[g.kind]} layer={g.layer} grad={`c05-gh-${g.kind}`} />
          </g>
        </WombLayer>
      );
    })}
  </>
);

// Streams of light rising from the glowing layer into each glyph (screen
// layer, depth 0). The endoderm's sparks rise off the yolk sac it lines once
// the view has pulled back onto the kit.
const SPARKS = 11;
type YolkPt = { x: number; y: number; r: number; swapT: number };

export const Sparks: React.FC<{ f: number; v: View; yolk: YolkPt }> = ({ f, v, yolk }) => {
  const cam = useWombCamera();
  return (
    <g>
      {GHOSTS.map((g) => {
        const p = SLOTS[g.slot];
        return Array.from({ length: SPARKS }, (_, j) => {
          const key = `c05-sp${g.kind}${j}`;
          const t0 = g.at - 13 + Math.round(random(`${key}t`) * 6);
          const dur = 9 + Math.round(random(`${key}d`) * 4);
          const u = clamp01((f - t0) / dur);
          if (f < t0 || u >= 1) return null;
          let src: Pt;
          if (g.layer === 0 && yolk.swapT > 0.5) {
            const a = -Math.PI * (0.15 + 0.7 * random(`${key}a`));
            src = { x: yolk.x + Math.cos(a) * yolk.r * 0.8, y: yolk.y + Math.sin(a) * yolk.r * 0.8 };
          } else {
            const xf = ((p.x - 540) / 1.6 + 540 - v.cx) / v.A + (random(`${key}x`) - 0.5) * 0.16;
            const m = bandMid(v, Math.max(-0.9, Math.min(0.9, xf)), g.layer);
            src = { x: m.x, y: m.y + (random(`${key}y`) - 0.5) * m.h };
          }
          const a = worldToScreen(cam, src);
          const end = { x: p.x + (random(`${key}ex`) - 0.5) * 70, y: p.y + (random(`${key}ey`) - 0.5) * 60 };
          const bow = (random(`${key}b`) - 0.5) * 120;
          const e = EASE.inOut(u);
          const x = lerp(a.x, end.x, e) + bow * Math.sin(Math.PI * e);
          const y = lerp(a.y, end.y, e);
          const o = Math.min(1, u * 5) * (1 - clamp01((u - 0.75) / 0.25));
          const r = lerp(4.6, 2.4, e) * (0.8 + 0.4 * random(`${key}r`));
          return (
            <g key={key} opacity={o}>
              <circle cx={x} cy={y} r={r * 4} fill={LAYER_LIGHT[g.layer]} opacity={0.22} />
              <circle cx={x} cy={y} r={r} fill={C.text} />
            </g>
          );
        });
      })}
    </g>
  );
};
