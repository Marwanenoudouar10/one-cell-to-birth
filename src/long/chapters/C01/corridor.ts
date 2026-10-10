import { B } from "./beats";
import { scroll } from "./camera";
import { keysXY } from "./math";

// The corridor the swarm climbs: cervix (mucus mesh) -> womb (wide, dark) ->
// tube entrance (narrow throat) -> ciliated tube with the egg.
// Corridor coordinate u is in egg-plane units, y down. A corridor point u on a
// layer with parallax p sits at layer y = p * (u + scroll(f)).
export const yAt = (u: number, f: number, p = 1) => p * (u + scroll(f));
export const uAt = (y: number, f: number, p = 1) => y / p - scroll(f);

// Each gate is placed so it sits at a chosen egg-plane y on its beat.
export const MESH_H = 420; // half-height of the mucus band
export const MESH_U = 420 - scroll(B.mesh);
export const WOMB_U = 250 - scroll(B.womb);
export const GATE_U = 320 - scroll(B.gate);

export const meshY = (f: number, p = 1) => yAt(MESH_U, f, p);
export const gateY = (f: number, p = 1) => yAt(GATE_U, f, p);

// The throat (gate 3), relative to its gate line: inner tips at x = +-GAP.
// Below the line the shoulders flare out toward the womb wall; a swimmer at
// |x| is stopped when the lower surface reaches it.
export const GAP = 145;
export const lowerSurf = (ax: number) => (ax <= GAP ? 0 : 400 * Math.pow(Math.min(1, (ax - GAP) / 800), 0.72));

// The ciliated tube lining starts just above the throat.
export const LINING_U0 = GATE_U - 150;
export const LINE_X = 345;
export const liningX = (u: number, side: number) =>
  side * (LINE_X + 14 * Math.sin(u * 0.008 + 1.3 * side) + 6 * Math.sin(u * 0.021 + 0.4));
// survivors rest with their heads in the cilia, just off the surface
export const REST_IN = 20;

// Blurred background walls: outward offset by corridor position. Straight
// channel up to the mesh, wide open womb, pinched at the throat, tube above.
export const wallOffset = keysXY([
  [GATE_U - 900, -40],
  [GATE_U - 170, -60],
  [GATE_U, -150],
  [GATE_U + 380, 140],
  [WOMB_U - 240, 660],
  [WOMB_U + 300, 660],
  [MESH_U - MESH_H - 40, 40],
  [MESH_U - MESH_H + 140, 0],
  [MESH_U + 6000, 0],
]);

// How open the womb feels at corridor u (0 channel/tube .. 1 womb), for darkness.
export const wombness = (u: number) => Math.max(0, Math.min(1, wallOffset(u) / 660));
