// Shared parametric fetus, week 9 -> 40: ONE character for every chapter,
// so the baby reads as the same individual growing. Flat-2D look matched to
// the teaser's Scene4 (week 12/20 rig) and Scene5 (term baby).
//
// ---------------------------------------------------------------- usage
//   import { Fetus, fetusAnchors } from "../../shared/fetus";
//
//   const pose = { armPose: { rest: 1 - s, thumbSuck: s }, legKick: k, headTilt: 3 * nz };
//   const a = fetusAnchors(week, pose, 520);           // same week/pose/size!
//   <svg width={1080} height={1920}>
//     <g transform="translate(540 860)">               // place the origin
//       <Fetus week={week} size={520} pose={pose} heartbeat={heartbeat(f)}
//         cord={<MyCord from={a.navel} out={a.navelDir} to={placentaLocal} />} />
//       <circle cx={a.hand.x} cy={a.hand.y} r={40} ... />  // highlight ring
//     </g>
//   </svg>
//
// ---------------------------------------------------------- coordinates
// - <Fetus> draws in local px around its own origin (0,0) = centre of the
//   curled body's bounding box in that week's reference (default) pose.
//   Pose changes (kick, curl, thumb suck...) never move the origin or rescale.
// - `size` = px height of that reference box (crown to lowest point). For
//   true relative scale between weeks use size = k * crlCm(week).
// - Default orientation: head up, face looking +x (right), back on the left,
//   y down. pose.mirror faces left; pose.headDown turns the body 180 deg
//   (forward roll; with mirror:true it ends like Scene5: head down, face
//   right); pose.rotate adds clockwise degrees. Key light always stays
//   upper-left and the warm rim lower-right, whatever the turn.
// - Must be inside an <svg>. Several fetuses can share one svg (ids are
//   per-instance: React useId, or pass uid). SVG ids use the "fetus-" prefix.
//
// ------------------------------------------------------- <Fetus> props
//   week       9..40 (fractional, animatable: growth is continuous)
//   size       px (see above)
//   pose       FetusPose (all optional, all animatable):
//     curl       0 stretched .. 0.5 natural .. 1 tight ball
//     headTilt   degrees, + = chin toward chest
//     armPose    "rest" | "handToFace" | "thumbSuck" or weights
//                { rest, handToFace, thumbSuck } (normalised; blend freely)
//     armSway    degrees of idle arm motion (feed noise)
//     handOpen   0 closed .. 1 open fan (rest pose; fist for thumbSuck)
//     legKick    -0.35 tuck (anticipation) .. 0 rest .. 1 extended
//     toesCurl   -1 stretched .. 1 curled (number or 5 values, big toe first)
//     headDown   0..1 turn to head-down
//     breathe    0..1 practice-breathing inhale (chest up, belly in)
//     hiccup     0..1 impulse; drive with a spike e.g. exp(-(f - f0) / 3)
//     expression -1 frown .. 0 .. 1 smile, or "neutral" | "smile" | "frown"
//     eyeOpen    0..1; ignored before ~26 wk (lids fused), full from 27 wk
//     mirror, rotate (see coordinates)
//   cord       ReactNode drawn above torso + legs and below head + arm, in
//              the same local px coords as fetusAnchors (so a cord from
//              a.navel tucks under the arm like in the teaser)
//   rim        warm rim light 0..1 (0.75)      glow   halo into fluid 0..1 (1)
//   bloom      extra warm glow 0..1 (0)        heartbeat 0..1 pulse (0); the
//              heart shows through the chest only while skin is translucent
//   opacity    whole character (1)             uid    fixed id prefix
//
// ------------------------------------------------ what the week changes
//   head ~1/2 crown-rump at 9-12 -> ~1/3 body at 20 -> ~1/4 at 40; limbs grow
//   9: webbed paddle hands/feet (separate digits from ~10.5), dark eye under
//      thin lids, low ears, scalp + body vessels, very translucent
//   16-32: lanugo fuzz along the back/crown (subtle); 20-38: vernix sheen
//   22-26: lean, thin skin with fine folds; 28+: fat, 32+: plump creases
//   26+: eyelids can open; 30+: hair hint, brows; pinker -> opaque peach
//   growth(week) exposes all of these strengths (0..1) if a chapter needs them.
//
// --------------------------------------------------------- anchors
//   fetusAnchors(week, pose, size) -> FetusAnchors (see anchors.ts), all in
//   the same local px: headCenter/headRadius, crown, face, eye, nose, mouth,
//   chin, ear, cheek, profile[], heart, navel + navelDir (cord attachment),
//   shoulder, elbow, wrist, hand, fingertips[5], thumbTip, hip, knee, ankle,
//   foot, heel, toes[5], footReach[] (kick contact points), farFoot, rump,
//   back, bounds (current pose), scale (px per rig unit), turn (degrees).
//   To get screen px, apply your own placement, e.g. placeAnchor(a.hand, 540, 860).
export { Fetus } from "./Fetus";
export type { FetusProps } from "./Fetus";
export { fetusAnchors, anchorsFromGeom, footReachDistance, placeAnchor } from "./anchors";
export type { FetusAnchors } from "./anchors";
export { resolvePose } from "./pose";
export type { FetusPose, ArmPoseName, ArmPoseMix, ExpressionName } from "./pose";
export { growth, crlCm, MIN_WEEK, MAX_WEEK } from "./growth";
export type { Growth } from "./growth";
export { buildFetus } from "./rig";
export { outFrame } from "./frame";
