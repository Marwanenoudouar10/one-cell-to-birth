import { toLayer } from "./camera";
import { B, CDIR, HEAD, ZONA } from "./constants";
import { Vec, add, arcTable, bez, bezTan, mul, norm, v } from "./math";

// The winner's lane: one curve from below the frame to the contact point on
// the zona. The winner and the rivals it overtakes all swim along it,
// placed by distance-to-go D (0 = head tip touching the zona).
export const SIZE = HEAD * 1.1;
const P0: Vec = v(-210, toLayer(B.raceStart, 1, 540, 1920).y + 70);
const P2: Vec = mul(CDIR, ZONA + SIZE);
const P1: Vec = add(mul(CDIR, ZONA + 560), v(-40, 0));
const ARC = arcTable(P0, P1, P2);
export const LANE = ARC.total;

// Position and unit tangent at distance-to-go D, shifted sideways by `side`.
// Beyond the start (D > LANE) it continues straight back along the entry.
export const laneAt = (D: number, side = 0) => {
  const u = ARC.uAt(LANE - D);
  const tan = norm(bezTan(P0, P1, P2, Math.min(u, 0.999)));
  let pos = bez(P0, P1, P2, u);
  if (D > LANE) pos = add(P0, mul(tan, LANE - D));
  return { pos: add(pos, { x: -tan.y * side, y: tan.x * side }), tan };
};
