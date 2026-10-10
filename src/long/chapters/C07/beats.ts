// C07 "First move" (W07): every story moment in CHAPTER-LOCAL frames (frame 0 = C06's
// frame 240; 0-14 fade in over C06, 231-245 sit under C08). Re-time by editing ONLY
// this file: everything in the chapter animates TO these constants.
//
//   > Week seven: its very first move. A tiny wiggle, months before anyone can feel it.
//
// Word onsets MEASURED from public/vo/long/C07.wav (clipAt 0.571 s; 10 ms envelope,
// voiced band < 1.2 kHz vs fricative band > 3.5 kHz; whisper base.en cross-check):
//   Week 0.68 | seven 0.86 (vowel 1.03) | its 1.76 | very 2.02 | first 2.42 |
//   move 2.86 || A 3.68 | tiny 3.82 | wiggle 4.10 | months 4.94 | before 5.43 |
//   anyone 5.80 | can 6.25 | feel 6.44 | it 6.86 (speech ends 6.94)
// NOTE vo-words.md / voTiming.ts put "it" at 7.30 and the line end at 7.99: that is
// C08's "Week eight", which bleeds into the tail of C07.wav (7.30-8.04) and is spoken
// again by C08.wav. Beats follow the real "it" (6.86).
import { FPS } from "../../../theme/layout";
import { chapterFrames } from "../../chapters";

const s = (sec: number) => Math.round(sec * FPS);

export const DURATION = chapterFrames("C07"); // 246, incl. both 15-frame overlaps
export const OVERLAP = 15; // LONG_TRANSITION

export const BEATS = {
  // --- START = C06 END, held still through the fade-in
  fadeEnd: OVERLAP, // free: C06 has faded under us; nothing changed shape before this
  // --- "Week seven:" arm buds lengthen into paddles, the head swells ahead of the body
  grow: s(0.68), // sync: "Week" (0.68): growth starts (tracker lands W07 by itself)
  paddle: s(1.03), // sync: "seven" (vowel 1.03): soft glow on the forming arm paddle
  legPaddle: s(1.4), // free: the leg paddle a beat later
  grown: s(1.76), // sync: "its" (1.76): paddles formed (kit ~6.85), head swollen
  // --- "its very first move."
  spark: s(2.42), // sync: "first" (2.42): a glint runs down the spinal cord, reaching the rump as the bend starts
  firstMove: s(2.84), // sync: "move" (2.86): the first sideways bend of head + rump
  // --- "A tiny wiggle,"
  wiggle: s(4.1), // sync: "wiggle" (4.10): a second, smaller bend (no wind-up: the first
  //                 move has only just settled), then stillness
  // --- "months before anyone can feel it."
  pullBack: s(4.94), // sync: "months" (4.94): camera eases back, the sac small in the womb
  wide: s(6.05), // free (between "anyone" and "can"): wide shot settled, wall + camera still
  twitch: s(6.42), // sync: "feel" (6.44): one flick inside (peaks 6.63, on "feel"); the wall does not stir
  pushIn: s(7.05), // free: after "it" (6.86-6.94) and the flick has settled, a slow push-in
  //                 begins (C08 lands it)
  exit: DURATION - OVERLAP, // free (231): C08 fades in on top; glows/rings fade 1 -> 0
} as const;

// ---- C06's END contract (src/long/chapters/C06/beats.ts "END contract for C07"), as numbers.
// Our frame 0 = C06 frame 240 (its BEATS.exit), so C06's clocks continue as f + 240.
export const C06_OFFSET = 240;
// C06's beat clock: frames since its first beat (C06 frame 93) -> ours f + 147.
export const C06_BEAT0 = C06_OFFSET - 93;
export const C06_END = {
  zoom: 1.35, // camera, no drift; aim = heart*0.7 + 40 lift (computed in camera.ts)
  aim: 0.7,
  lift: 40,
  embryo: { week: 6.0, size: 322, x: 472.45, y: 835.3, wobbleSeed: "emb-c05" },
  glowAdd: 0.2, // C06 feeds the kit heartGlow = glow + 0.4 * fill * (1 - 0.5 * lit) = glow + 0.2
  yolk: { x: 806.51, y: 902.21, r: 41.97 }, // yolkSuggest(6, 322, place), still (alive 0)
} as const;

// ---- END contract for C08 (C08 frame 0 = our frame BEATS.exit = 231; end.ts recomputes
// these from the live functions). The subject is still through the overlap; only the
// slow push-in moves.
//   camera  womb-kit <Camera drift={0}>, anchor HERO (540, 860):
//           zoom = 0.62 * (1 + 0.32 * u^2), u = (f - 212) / 60 (f = our frame; continue it
//           as C08 frame + 231, linear beyond u = 1), aim lerps (540, 884) -> (486, 846)
//           by 0.55 * u^2.  At f231: zoom 0.6399, aim (537.02, 881.90); f245: 0.68, (531.02, 877.68)
//   embryo  = the kit's own <Embryo week={7} size={350} x={472.45} y={835.3} rotate={0}>
//           with id "c05" (wobble seed "emb-c05") and frame = our f + 240, heartGlow =
//           glow + 0.2, heartLit 1, zip 1 (our BendEmbryo is exactly that at rest pose,
//           head = kit head, float 0)
//   yolk    <YolkSac x 806.51 y 902.21 r ~40.9 id>, stalk from the embryo's yolkStalk
//           anchor (kit), scale yolkSuggest(7, 350).stalk, no sway
//   heart   C06's lub-dub (world/beat.ts) on beat clock t = 147 + f + 0.14 f^2 / (2 * 246):
//           t(231) = 393.18 at 124.5/min, rising 0.014/min per frame (heading for week 9)
//   sac     world/Sac.tsx (C06's Scene3 sac): SAC (540, 860) r 330, wob 0.5, clock
//           sacClock = 421.6 + 0.35 * (f - 231); villi/rays/fluid as C06's; NO pulse rings
//   specks  world/Particles.tsx far (depth 0.8, blur 1.5) + near (1.25, blur 3), clock f + 240;
//           lens bokeh (Foreground) already faded to 0
//   halo    C06's HeartHalo at 0.45 (fill 1, ignite 1, flare 1)
//   wall    kit <WombBackdrop> early look + { warmth 0.04, depth 0.75, r 410, cx 540,
//           cy 960, aspect 1.12, pear 0.3 }, folds 0.5, breathe 0, opaque false, seed "s3",
//           inside <Freeze frame={285}>: perfectly still (C11's first flutter moves it)
//   shade   kit <CaptionShade strength 1 top 0.5>
//   rule 5  over our last 15 frames halo, specks, sac, wall and shade fade 1 -> 0 (linear)
//           under C08: C08 draws them at full strength from its frame 0; embryo + yolk opaque.
