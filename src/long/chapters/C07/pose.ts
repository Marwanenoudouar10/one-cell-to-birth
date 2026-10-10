// Body pose on top of the shared embryo kit's week stage. The kit has no bend
// control, so a pose offsets the stage's C-curve: `head` and `rump` swing those
// ends about the C's centre (deg, + = clockwise on screen), `nod` tucks the chin,
// `arm`/`leg` swing the paddles (passive follow-through), and `headWeek` lets the
// head swell ahead of the body. Pose 0 = the kit's own embryo, exactly.
import { placer } from "../../../shared/embryo/anchors";
import { buildBody } from "../../../shared/embryo/body";
import { project } from "../../../shared/embryo/centreline";
import { Pt, add, rot } from "../../../shared/embryo/math";
import { Stage, stageAt, stageFor } from "../../../shared/embryo/stage";

export type Pose = { head: number; rump: number; nod: number; arm: number; leg: number; headWeek?: number };
export const REST: Pose = { head: 0, rump: 0, nod: 0, arm: 0, leg: 0 };

// The centre line is a polar spiral th(s) = th0 - s * sweep (head s = -0.18,
// tail s = 1). Solve th0/sweep offsets so the head and rump turn by exactly
// pose.head / pose.rump: flexion (C closes) = head > 0, rump < 0.
export const posed = (st: Stage, p: Pose): Stage => {
  const dSweep = (p.head - p.rump) / 1.18;
  const dTh0 = p.rump + dSweep;
  return {
    ...st,
    sweep: st.sweep + dSweep,
    th0: st.th0 + dTh0,
    headLift: st.headLift + p.nod,
    head: p.headWeek === undefined ? st.head : Math.max(st.head, stageAt(p.headWeek).head),
    arm: { ...st.arm, rot: st.arm.rot + p.arm },
    leg: { ...st.leg, rot: st.leg.rot + p.leg },
  };
};

// `rotate` = the kit's in-screen rotation (folded into `spin`, so the light stays top-left).
export const posedStage = (week: number, p: Pose, rotate = 0) => posed(stageFor(week, rotate), p);

export type PosedAnchors = { crown: Pt; tail: Pt; hand: Pt; heart: Pt; pivot: Pt; head: Pt; stalk: Pt };

// Placed px of a few posed parts (same placement as <BendEmbryo>): used for the
// motion arcs and the camera framing. Noise-free.
export const posedAnchors = (week: number, size: number, place: { x: number; y: number; rotate?: number }, p: Pose): PosedAnchors => {
  const st = posedStage(week, p, place.rotate ?? 0);
  const b = buildBody(st, 0, 0, "c07-rest");
  const P = placer(week, size, place);
  const v = (q: Pt) => P(project(q, 0, st));
  const L = b.line.c;
  const crown = v(add(b.rig.head.c, rot({ x: -10, y: -b.rig.headBlob.ry }, 0)));
  return {
    crown,
    tail: v(L[L.length - 1]),
    hand: v(b.rig.arm.root),
    heart: v(b.rig.heart),
    pivot: v({ x: 0, y: 0 }),
    head: v(b.rig.head.c),
    stalk: v(b.rig.stalk),
  };
};
