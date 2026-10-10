import { CDIR, HEAD, ZONA } from "./constants";
import { Vec, add, arcTable, bez, bezTan, mul, norm, v } from "./math";
import { WINNER_SV, restPt } from "./survivors";

// The winner's lane: one curve from its resting place on the left tube wall
// to the contact point on the zona, placed by distance-to-go D (0 = head tip
// touching the zona). Beyond the start it continues straight back.
export const SIZE = HEAD * 1.1;
const P0: Vec = restPt(WINNER_SV, WINNER_SV.fDepart);
const P2: Vec = mul(CDIR, ZONA + SIZE);
const P1: Vec = add(mul(CDIR, ZONA + 190), v(-40, 10));
const ARC = arcTable(P0, P1, P2);
export const LANE = ARC.total;

export const laneAt = (D: number, side = 0) => {
  const u = ARC.uAt(LANE - D);
  const tan = norm(bezTan(P0, P1, P2, Math.min(u, 0.999)));
  let pos = bez(P0, P1, P2, u);
  if (D > LANE) pos = add(P0, mul(tan, LANE - D));
  return { pos: add(pos, { x: -tan.y * side, y: tan.x * side }), tan };
};
