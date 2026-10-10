export const meta = {
  name: 'birth-long-foundations',
  description: 'Build shared building blocks for the 2-min film in parallel: fetus rig, embryo rig, womb kit, long-film framework',
  phases: [{ title: 'Build', detail: '4 parallel builders, each in its own folder' }],
}

const ROOT = '/Users/tandeemwork/birth-teaser'

const COMMON = `Project: ${ROOT} — Remotion 4.0.534, React 19, TS, 1080x1920 @30fps, flat-2D (Kurzgesagt-like) motion graphics about human development from fertilisation to birth.
A finished 30s teaser exists (composition "Main"); we are extending it to a ~2:10 film ("Long") with ~14 chapters covering every stage. Many chapter agents will soon build chapters IN PARALLEL using the shared building blocks you are making now — so your API must be clean, documented at the top of each file, and visually consistent with the teaser.
Read first: ${ROOT}/briefs/00-rules.md (style, palette, motion bar, safe zones, perf, how to check work), src/theme/*, src/lib/*.
Hard rules:
- Write ONLY inside your assigned folder(s) listed below. Do NOT edit src/scenes/*, src/theme/*, src/lib/*, src/overlays/*, src/Main.tsx, src/ScenePreview.tsx (the teaser must keep rendering exactly as now). Other agents work in other folders at the same time; ignore their files/errors.
- No file over 300 lines; split by job. Deterministic only (remotion random(), @remotion/noise). Palette C only. Prefix every SVG id with your folder's short name to avoid collisions.
- Check visually: create your own showcase entry (a .tsx/.ts entry file inside your folder that calls registerRoot with one Composition) and render with \`npx remotion render <entry> <CompId> out/<name>.mp4 --scale=0.5 --concurrency=3\` or \`npx remotion still <entry> <CompId> out/<name>.png --frame=N\`; build contact sheets with ffmpeg tile; READ the images and judge them like a strict art director. Iterate at least 3 times.
- Types clean for your folder: \`npx tsc --noEmit 2>&1 | grep "<your folder>" || echo clean\`.
Return: a concise API doc (component names, props with types and meaning, coordinate conventions, example usage) + paths of showcase renders + known limitations.`

const JOBS = [
  {
    key: 'fetus',
    prompt: `FOLDER: src/shared/fetus/ (showcase entry inside it).
Build ONE parametric fetus character used by every chapter from week 9 to week 40, so the baby looks like the same individual growing.
Study and match the established look: src/scenes/Scene4/ (week 12 -> 20 rig: Fetus.tsx, rig.ts, shapes.ts, timeline.ts) and src/scenes/Scene5/ (full-term head-down baby). Reuse their best shapes/shading ideas (copy code into your folder; do not import from scenes).
API: <Fetus week={number 9..40} size={px height of the curled body} pose={...} /> drawn in local coords centred on its own origin (document the anchor and where the navel/cord attachment, hands, feet, face and heart are, via an exported helper e.g. fetusAnchors(week, pose) so chapters can attach cords, highlights and effects).
Continuous with week: proportions (head ~1/2 body at 9-12 -> ~1/3 at 20 -> ~1/4 at 40), skin (very translucent with faint vessels early -> pinker, opaque; thin/wrinkly at 22-26 -> plump with fat 32+), fine lanugo hint 16-32 and vernix sheen 20-38 (subtle!), eyelids fused until ~26 then eyeOpen prop allowed, separated fingers/toes from 10, hair hint 30+.
Pose props (0..1 or angles, all animatable): curl, headTilt, armPose (e.g. 'rest' | 'handToFace' | 'thumbSuck' blendable), handOpen, legKick, toesCurl, headDown (rotate whole body to head-down 0..1), breathe (chest motion for practice breathing), hiccup impulse, expression (neutral/smile/frown subtle), eyeOpen.
Showcase: a contact sheet of weeks 9,12,16,20,24,28,32,36,40 side by side at the same scale-relative size (also one at true relative scale), and a 6s morph 9->40 with a few pose changes.`,
  },
  {
    key: 'embryo',
    prompt: `FOLDER: src/shared/embryo/ (showcase entry inside it).
Build ONE parametric embryo for gestational weeks 3 to 8 (continuous stage prop), matching Scene3's week-6 embryo look (study src/scenes/Scene3/: Embryo.tsx, embryoShape.ts, Heart.tsx, motion.ts — copy code into your folder; do not import from scenes).
Stages: week 3 flat embryonic disc with three germ layers (ectoderm/mesoderm/endoderm as three colour bands — subtle, elegant); week 4 neural groove/plate folding into a tube that 'zips' closed from the middle outward (prop zip 0..1), disc curling into a C; week 5-6 C-shaped embryo with heart bulge (prop heartBeat 0..1 to pulse it), eye spot, limb buds; week 7 arm/leg paddles, hand plates; week 8 webbed fingers/toes forming, face with nose/lips forming, eyelids forming, tail regressing, ~the 'end of the embryonic period'.
API: <Embryo week={3..8.99} size={px} zip={0..1} heartBeat={0..1} /> + embryoAnchors(week) giving heart, head, eye, hand, yolk-stalk attach points. Also export <YolkSac/> and a connecting stalk helper consistent with Scene3.
Showcase: contact sheet weeks 3, 3.5, 4, 4.5, 5, 6, 7, 8 and a 6s continuous morph 3->8 with the zip and heartbeat animating.`,
  },
  {
    key: 'womb',
    prompt: `FOLDER: src/shared/womb/ (showcase entry inside it).
Build a reusable womb environment kit so all chapters inside the uterus look like one world. Study and match src/scenes/Scene3/ (Sac, Environment, Particles, Rings), src/scenes/Scene4/ (Sac, Placenta, Cord, Overlays, Filters) and src/scenes/Scene5/ (womb folds). Copy code into your folder; do not import from scenes.
Components (all props animatable, documented): <WombBackdrop warmth={0..1} depth parallax folds />, <AmnioticSac cx cy r wobble ripples={[{x,y,t}]} /> with a ripple API for kicks/heartbeats/sounds, <Placenta at angle size />, <Cord from={{x,y}} to={{x,y}} slack twist pulse />, <FluidSpecks count seed />, <LightShafts />, <CaptionShade /> (keeps y 1300-1560 dark for captions), <SoundWaves from dir progress /> (concentric arcs entering the womb from outside — for "the baby can hear your voice"), <Camera zoom x y shake> wrapper.
Showcase: 3 looks (early: warm-dark small sac; mid: bigger sac with placenta+cord; late: cramped big sac) and a 6s animated demo with a ripple, sound waves and a camera push.`,
  },
  {
    key: 'framework',
    prompt: `FOLDERS: src/long/ (all new code), scripts/long-*.sh (new scripts), and you MAY add ONE composition registration to src/Root.tsx (only add lines; keep "Main" and the Scene compositions exactly as they are).
Build the data-driven framework for the long film. The final chapter list arrives later from the script team, so everything must be driven by config:
1. src/long/chapters.ts: CHAPTERS = [{ id: 'C01', durationSec, transition: 'cut'|'fade'|'focus', weekKeys: [[sec, week], ...] }...] — fill 14 placeholder chapters of ~9.3s (total ~130s). Derive LONG_START (global start frame per chapter, accounting for 15-frame transition overlaps) and LONG_TOTAL.
2. src/long/registry.ts mapping chapter id -> component; unregistered chapters render a tasteful placeholder card (chapter id + week range).
3. src/long/LongFilm.tsx: shared Background (duration-aware copy of src/overlays/Background.tsx that takes total frames as a prop), TransitionSeries of chapters (use the same focus-pull presentation idea as src/lib/focusPull.tsx — import it, do not edit it), then overlays: a NEW week tracker with a size chip (below), captions (a copy of src/overlays/Captions.tsx that takes its lines as a prop instead of importing theme/script), grain, and a soundtrack component taking clip lists as props. Register composition "Long" in src/Root.tsx.
4. NEW week tracker (src/long/overlays/WeekTrackerLong.tsx): same look as src/overlays/WeekTracker.tsx (mono week label left, "40 WEEKS" right, thin progress bar + glowing dot), plus a size chip under the bar: "size of a lime · 5.4 cm" (reads src/long/data/sizes.ts: [{week, compare, lengthCm, lengthType, weightG}] — create it with plausible placeholder values for weeks 4-40; it will be replaced by a fact-checked table). When the week number changes, the number rolls (odometer) and the chip text crossfades/slides — calm, never jittery even when weeks tick fast (e.g. 10 weeks in 2 s). Weeks < 4: show the stage instead ("conception", "day 3", ...). Week driven by the global keyframes from CHAPTERS.weekKeys.
5. Per-chapter isolated preview so parallel chapter agents can never break each other: scripts/long-preview.sh <ChapterId> [scale] that auto-generates src/long/preview/<id>.ts (an entry registering just that chapter with the overlays shifted to its global time, like src/ScenePreview.tsx does for the teaser), renders out/long-<id>.mp4 and a contact sheet out/long-<id>-sheet.jpg (tile every 15 frames). scripts/long-frame.sh <ChapterId> <frames...> to pull exact frames. Also scripts/long-render.sh to render the whole Long film at a given scale.
6. src/long/README.md (<= 80 lines): how a chapter agent adds a chapter (folder src/long/chapters/<id>/index.tsx exporting the component, register it, local beats file, preview commands, rules).
Showcase: render the Long composition at scale 0.25 with placeholders and verify the tracker + chip across the whole timeline (contact sheet), including a fast multi-week tick.`,
  },
]

const results = await parallel(JOBS.map((j) => () =>
  agent(`${COMMON}\n\n${j.prompt}`, { label: `build:${j.key}`, phase: 'Build' }).then((r) => ({ key: j.key, report: r }))
))
return results.filter(Boolean)