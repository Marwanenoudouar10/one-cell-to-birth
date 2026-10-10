// Pure pose helpers for C08's embryo: kit week / size / wobble over time, and where the
// hand, tail and heart are in WORLD px (same space as the womb kit's Camera).
// Built on the shared embryo kit's own geometry (body, rig, limb) so the custom hand and
// tail sit exactly where the kit would draw them. At frame 0 it IS C07's END embryo
// (handoff.ts EMB0: same week, size, placement, wobble seed and clock).
import { EASE, tween } from "../../../lib/ease";
import { DESIGN, centreOf } from "../../../shared/embryo/anchors";
import { Body, buildBody } from "../../../shared/embryo/body";
import { N, project } from "../../../shared/embryo/centreline";
import { LimbGeo, limbGeo } from "../../../shared/embryo/Limb";
import { Pt, add, mul, norm, ramp, rot, sub } from "../../../shared/embryo/math";
import { Stage, stageFor } from "../../../shared/embryo/stage";
import { BEATS, KIT } from "./beats";
import { EMB0 } from "./handoff";

export const UID = "c08-emb"; // SVG id prefix of the embryo
export const EMB = { x: EMB0.x, y: EMB0.y }; // world placement of the visual centre (C07's)
export const HAND_SCALE = 1.12; // our palm vs the kit's plate radius

export const kitWeek = (f: number) =>
  f < BEATS.uncurl
    ? tween(f, BEATS.grow, BEATS.grown, [KIT.start, KIT.webbed], EASE.inOut)
    : tween(f, BEATS.uncurl, BEATS.uncurlEnd, [KIT.webbed, KIT.end], EASE.inOut);

// real growth 1.6 -> 2.3 cm, shown gently (the camera does the rest)
export const kitSize = (f: number) =>
  tween(f, BEATS.grow, BEATS.grown, [EMB0.size, 356], EASE.inOut) + tween(f, BEATS.uncurl, BEATS.uncurlEnd, [0, 18], EASE.inOut);

// body wobble: C07's (alive 1) through the fade, then calm, so the tail never seems to wag
export const kitAlive = (f: number) => tween(f, BEATS.fadeEnd, BEATS.grown, [1, 0.35], EASE.inOut);

// our hero hand takes over from the kit's plain paddle once C07 has faded under us
export const handMix = (f: number) => tween(f, BEATS.fadeEnd - 3, BEATS.fadeEnd + 13, [0, 1], EASE.inOut);
export const handScale = (f: number) => tween(f, BEATS.fadeEnd - 3, BEATS.grown, [1, HAND_SCALE], EASE.inOut);

// wrist turn (deg): keeps the fingers pointing forward, over the heart and the dark fluid
// (skin on skin would hide them) while the kit's arm swings up; starts once the kit's
// plate under our hand has faded out
export const wristTurn = (f: number) =>
  tween(f, BEATS.fadeEnd + 10, BEATS.pushEnd, [0, -20], EASE.inOut) + tween(f, BEATS.uncurl, BEATS.uncurlEnd, [0, 26], EASE.inOut);

export type Pose = {
  f: number;
  week: number;
  size: number;
  k: number; // design units -> world px
  st: Stage;
  body: Body;
  ctr: Pt; // design-space visual centre
  toWorld: (p: Pt) => Pt; // design -> world
  arm: { at: Pt; ang: number; g: LimbGeo; paddle: number }; // limb frame (design)
  local: { c: Pt; ang: number; r: number }; // hand frame in LIMB-LOCAL coords (for <Arm>)
  hand: { c: Pt; ang: number; R: number }; // palm centre / direction (deg) / radius, WORLD
  handR: number; // hand radius in design units
  tail: { end: Pt; dir: Pt; a: number }; // body end (design), its tangent and half-width
  heart: Pt; // WORLD
};

export const poseAt = (f: number): Pose => {
  const week = kitWeek(f);
  const size = kitSize(f);
  const st = stageFor(week);
  const body = buildBody(st, f + EMB0.wobbleAt, kitAlive(f), EMB0.wobbleSeed);
  const ctr = centreOf(week);
  const k = size / DESIGN;
  const toWorld = (p: Pt): Pt => add(EMB, mul(sub(p, ctr), k));
  const v = (p: Pt) => project(p, 0, st);
  const paddle = ramp(st.week, 6, 7);
  const g = limbGeo(st.arm, paddle);
  const at = v(body.rig.arm.root);
  const ang = body.rig.arm.dir + st.spin;
  // the hand pivots about the wrist (behind the kit's palm centre)
  const turn = wristTurn(f);
  const wrist = add(g.palm, rot({ x: -0.8 * g.palmR, y: 0 }, g.endDir));
  const r = g.palmR * handScale(f);
  const lc = add(wrist, rot({ x: 0.8 * g.palmR + 0.15 * (r - g.palmR), y: 0 }, g.endDir + turn));
  const palm = add(at, rot(mul(lc, st.arm.grow), ang));
  const handR = r * st.arm.grow;
  const L = body.line;
  const end = v(L.c[N]);
  const dir = norm(sub(end, v(L.c[N - 3])));
  return {
    f,
    week,
    size,
    k,
    st,
    body,
    ctr,
    toWorld,
    arm: { at, ang, g, paddle },
    local: { c: lc, ang: g.endDir + turn, r },
    hand: { c: toWorld(palm), ang: ang + g.endDir + turn, R: handR * k },
    handR,
    tail: { end, dir, a: body.sec[N].a },
    heart: toWorld(v(body.rig.heart)),
  };
};

// Hand-local (unit = hand radius, +x = along the fingers) -> world.
export const handToWorld = (p: Pose, q: Pt): Pt => add(p.hand.c, rot(mul(q, p.hand.R), p.hand.ang));
