// The macro fingertip, seen from the pad side, pointing up. Pad-local design
// px: origin = pad centre, x right, y down. One half-width profile drives the
// SVG outline AND the ridge mask, so the two always match.
import { P, Pt, smoothstep } from "../geom";

export const PAD = {
  hw: 250, // half-width of the pad at its widest
  capY: -116, // where the rounded tip begins
  hcap: 256, // height of the rounded tip (apex at capY - hcap)
  crease: 262, // distal flexion crease (end of the fingerprint)
  bottom: 640, // finger continues below the crease, fading out
  p: 2.35, // superellipse exponent of the tip (2 = round, higher = squarer)
};
export const APEX = PAD.capY - PAD.hcap;
export const LAMBDA = 23; // ridge period, design px

// half-width at height y (0 above the apex)
export const halfWidth = (y: number): number => {
  const { hw, capY, hcap, p, crease } = PAD;
  if (y < capY) {
    const u = (capY - y) / hcap;
    return u >= 1 ? 0 : hw * Math.pow(1 - Math.pow(u, p), 1 / p);
  }
  // narrows gently toward the joint, then the middle phalanx
  // bulbous pad, a soft waist at the joint, a slimmer middle phalanx below
  const neck = 16 * Math.exp(-(((y - crease - 10) / 42) ** 2));
  return hw - 12 * smoothstep(capY, crease, y) - 20 * smoothstep(crease - 70, crease + 40, y) - neck + 6 * smoothstep(crease + 60, PAD.bottom, y);
};

// normalised "radius" from the finger's axis: hw at the outline, 0 on the axis
export const axisRadius = (x: number, y: number): number => {
  const { hw, capY, hcap, p } = PAD;
  if (y >= capY) return (Math.abs(x) * hw) / Math.max(1, halfWidth(y));
  return hw * Math.pow(Math.pow(Math.abs(x) / hw, p) + Math.pow((capY - y) / hcap, p), 1 / p);
};

// closed outline, apex -> right side -> bottom -> left side
export const fingerOutline = (bottom = PAD.bottom): Pt[] => {
  const right: Pt[] = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const y = APEX + (PAD.capY - APEX) * (1 - Math.cos((u * Math.PI) / 2));
    right.push(P(halfWidth(y), y));
  }
  for (let y = PAD.capY + 30; y <= bottom; y += 30) right.push(P(halfWidth(y), y));
  const left = right.slice(1).reverse().map((q) => P(-q.x, q.y));
  return [P(0, APEX), ...right.slice(1), P(halfWidth(bottom) * 0.98, bottom + 40), P(-halfWidth(bottom) * 0.98, bottom + 40), ...left];
};
