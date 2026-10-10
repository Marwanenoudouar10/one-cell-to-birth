// Shared state of the nearest <AmnioticSac>: its shape, the live (deformed)
// membrane path and the ripples alive this frame. Kit components rendered as
// children of the sac (Placenta, Cord, FluidSpecks, LightShafts) read it, and
// so can your own art: const sac = useSac(); if (sac) sac.rAt(theta) ...
import React, { createContext, useContext } from "react";
import { Pt, SacShape, baseRadius, smooth } from "./geom";
import { LiveRipple } from "./ripples";

export type SacState = {
  shape: Required<SacShape>;
  frame: number;
  d: string; // live membrane outline (world px), for clipPaths
  rAt: (theta: number) => number; // live membrane radius at an angle (radians)
  ripples: LiveRipple[];
  warmth: number;
  // placentas placed as direct children (degrees, half-width, size)
  placentas: { at: number; spread: number; size: number }[];
};

const SacCtx = createContext<SacState | null>(null);
export const SacProvider = SacCtx.Provider;
export const useSac = () => useContext(SacCtx);

// A clipPath of the live membrane (optionally inset), to drop in <defs>.
// clipPath ids are document-global, so define one per SVG that uses it.
export const SacClip: React.FC<{ id: string; sac: SacState; inset?: number }> = ({ id, sac, inset = 0 }) => {
  const d = inset === 0 ? sac.d : insetPath(sac, inset);
  return (
    <clipPath id={id}>
      <path d={d} />
    </clipPath>
  );
};

// Membrane outline pulled inward by `inset` px (positive = smaller).
export const insetPath = (sac: SacState, inset: number, samples = 96) => {
  const { cx, cy } = sac.shape;
  const pts: Pt[] = Array.from({ length: samples }, (_, i) => {
    const th = (i / samples) * Math.PI * 2;
    const r = sac.rAt(th) - inset;
    return { x: cx + Math.cos(th) * r, y: cy + Math.sin(th) * r };
  });
  return smooth(pts);
};

// Open path along the BASE sac shape (no ripples), `inset` px inside it,
// between two angles in degrees: used for speculars and fold lips.
export const shapeArc = (s: SacShape, inset: number, a0: number, a1: number, steps = 18) => {
  const pts: Pt[] = Array.from({ length: steps + 1 }, (_, i) => {
    const th = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180;
    const r = baseRadius(s, th) - inset;
    return { x: s.cx + Math.cos(th) * r, y: s.cy + Math.sin(th) * r };
  });
  return smooth(pts, false);
};

// Open path along the LIVE membrane between two angles (radians).
export const membraneArc = (sac: SacState, a0: number, a1: number, steps = 24) => {
  const { cx, cy } = sac.shape;
  const pts: Pt[] = Array.from({ length: steps + 1 }, (_, i) => {
    const th = a0 + ((a1 - a0) * i) / steps;
    const r = sac.rAt(th);
    return { x: cx + Math.cos(th) * r, y: cy + Math.sin(th) * r };
  });
  return smooth(pts, false);
};

// gradientTransform that stretches a circular radial gradient to the sac's aspect.
export const aspectTf = (s: SacShape) =>
  `translate(${s.cx} ${s.cy}) scale(1 ${s.aspect ?? 1}) translate(${-s.cx} ${-s.cy})`;
