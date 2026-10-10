// <FluidSpecks count seed layer />: tiny particles suspended in the amniotic
// fluid, drifting slowly upward with organic noise. Inside an <AmnioticSac>
// they fill and are clipped to the sac, and heartbeat ripples nudge them.
//   count    number of specks (default 26; keep < 60)
//   seed     deterministic layout seed (use a different one per layer)
//   layer    "far"  (default) small, sharp-ish, behind the baby, slower
//            "near" bigger, softly blurred, in front of the baby
//            "lens" big out-of-focus bokeh motes across the whole frame
//   size     radius multiplier (default 1)
//   opacity  multiplier (default 1)
//   drift    rise speed multiplier (default 1)
//   cx,cy,r  region when not inside a sac (default 540, 860, 380)
// Colours: warm peach / cool cell-white, a few gold (palette C).
import React from "react";
import { noise2D } from "@remotion/noise";
import { random, useCurrentFrame } from "remotion";
import { C } from "../../theme/colors";
import { HEIGHT, WIDTH } from "../../theme/layout";
import { useWombCamera, WombLayer } from "./Camera";
import { useUid } from "./geom";
import { ringAlpha, ringRadius, ringReach } from "./ripples";
import { SacClip, useSac } from "./sacContext";

export type FluidSpecksProps = {
  count?: number;
  seed?: string;
  layer?: "far" | "near" | "lens";
  size?: number;
  opacity?: number;
  drift?: number;
  cx?: number;
  cy?: number;
  r?: number;
};

// soft = radial-gradient edge instead of a (costly) full-frame blur
const LOOK = {
  far: { depth: 0.85, soft: false, rMin: 1.3, rMax: 3.2, o: [0.25, 0.7] },
  near: { depth: 1.2, soft: true, rMin: 4, rMax: 9, o: [0.3, 0.7] },
  lens: { depth: 1.7, soft: true, rMin: 30, rMax: 90, o: [0.1, 0.2] },
} as const;
const COLORS = [C.gold, C.peach, C.cell, C.rose];

export const FluidSpecks: React.FC<FluidSpecksProps> = ({
  count = 26,
  seed = "wb-sp",
  layer = "far",
  size = 1,
  opacity = 1,
  drift = 1,
  cx = 540,
  cy = 860,
  r = 380,
}) => {
  const f = useCurrentFrame();
  const sac = useSac();
  const cam = useWombCamera();
  const id = useUid("specks");
  const L = LOOK[layer];
  const lens = layer === "lens";
  const inSac = !!sac && !lens;
  const c = inSac ? { x: sac.shape.cx, y: sac.shape.cy } : { x: cx, y: cy };
  const R = inSac ? sac.shape.r - 20 : r;
  const span = R * 2 + 240; // vertical wrap distance
  // parallax relative to the sac plane, while staying clipped to the sac
  const px = inSac ? (cam.x - cam.ax) * (1 - L.depth) * 0.5 : 0;
  const py = inSac ? (cam.y - cam.ay) * (1 - L.depth) * 0.5 : 0;
  const pts = Array.from({ length: count }, (_, i) => {
    const k = `${seed}${layer}${i}`;
    const rr = (L.rMin + random(`${k}r`) * (L.rMax - L.rMin)) * size;
    const o = (L.o[0] + random(`${k}o`) * (L.o[1] - L.o[0])) * opacity;
    const hue = random(`${k}c`);
    let x: number;
    let y: number;
    if (lens) {
      x = random(`${k}x`) * WIDTH + noise2D(`${k}nx`, f * 0.007, 0) * 30;
      const y0 = random(`${k}y`) * (HEIGHT + 400) - 200 - f * 0.25 * drift;
      y = ((y0 + 200) % (HEIGHT + 400) + HEIGHT + 400) % (HEIGHT + 400) - 200;
    } else {
      const a = random(`${k}a`) * Math.PI * 2;
      const d = Math.sqrt(random(`${k}d`)) * R;
      x = c.x + Math.cos(a) * d + noise2D(`${k}nx`, f * 0.006, i) * 40;
      const y0 = c.y + Math.sin(a) * d + noise2D(`${k}ny`, i, f * 0.006) * 40 - f * 0.12 * drift * L.depth;
      y = c.y - R - 120 + ((((y0 - (c.y - R - 120)) % span) + span) % span);
    }
    if (inSac) {
      for (const g of sac.ripples) {
        if (g.kind !== "beat") continue;
        const dx = x - g.x;
        const dy = y - g.y;
        const dd = Math.hypot(dx, dy) || 1;
        const push = 7 * g.strength * ringAlpha(g) * Math.exp(-((dd - ringRadius(g, ringReach(g, sac.shape))) ** 2) / (2 * 34 * 34));
        x += (dx / dd) * push;
        y += (dy / dd) * push;
      }
    }
    // standalone (no sac): fade out toward the region edge so wraps never pop
    const edge = inSac || lens ? 1 : Math.max(0, Math.min(1, (R * 1.1 - Math.hypot(x - c.x, y - c.y)) / (R * 0.35)));
    const ci = lens ? (hue > 0.5 ? 3 : 1) : hue > 0.86 ? 0 : hue > 0.45 ? 1 : 2;
    return { x, y, r: rr, o: o * edge, ci };
  });
  return (
    <WombLayer depth={inSac ? 1 : L.depth}>
      <defs>
        {inSac && <SacClip id={`${id}-clip`} sac={sac} inset={12} />}
        {L.soft &&
          COLORS.map((col, i) => (
            <radialGradient key={i} id={`${id}-g${i}`}>
              <stop offset="0" stopColor={col} stopOpacity={1} />
              <stop offset="0.55" stopColor={col} stopOpacity={0.6} />
              <stop offset="1" stopColor={col} stopOpacity={0} />
            </radialGradient>
          ))}
      </defs>
      <g clipPath={inSac ? `url(#${id}-clip)` : undefined}>
        <g transform={`translate(${px} ${py})`}>
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={L.soft ? `url(#${id}-g${p.ci})` : COLORS[p.ci]} opacity={p.o} />
          ))}
        </g>
      </g>
    </WombLayer>
  );
};
