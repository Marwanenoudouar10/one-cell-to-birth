# Shared building blocks for the long film (API reports from their builders)

## fetus

I've built the shared `<Fetus>` component in `src/shared/fetus/`: one baby, weeks 9 to 40, in the same style as the teaser's Scene4 and Scene5. Types are clean and I didn't touch anything outside the folder. I did 6 render-and-review rounds; the weeks 12 and 20 proportions were checked side by side against Scene4. It renders about 60 frames in 10s at 0.5 scale, once the bundle is cached.

**Usage**
```tsx
import { Fetus, fetusAnchors, crlCm } from "../../shared/fetus";
const a = fetusAnchors(week, pose, 520);          // same week / pose / size as the component
<svg><g transform="translate(540 860)">
  <Fetus week={week} size={520} pose={pose} heartbeat={heartbeat(f)}
    cord={<MyCord from={a.navel} out={a.navelDir} .../>} />
</g></svg>
```

**Coordinates**
- The fetus draws in local px around its own origin: the centre of the curled body's box in that week's default pose. Wrap it in a `<g transform>` to place it.
- `size` is the px height of that default curled body. Pose changes never move the origin or rescale the body.
- Default view: head up, facing +x (right), back on the left, y down.
- Light stays fixed on screen: key light upper-left, warm rim lower-right, even when the body turns or mirrors.
- It must sit inside an `<svg>`. Every SVG id is `fetus-<uid>-…`, so several fetuses can share one svg.

**`<Fetus>` props**
- `week`: 9..40. Fractional values animate smoothly.
- `size`: px.
- `pose`: a `FetusPose` (fields below).
- `cord`: a ReactNode drawn over the torso and legs but under the head and arm, in anchor coordinates.
- `rim` (0.75), `glow` (1), `bloom` (0), `opacity` (1): lighting strengths, 0..1.
- `heartbeat`: 0..1 pulse. The heart only shows through the chest while the skin is translucent (early weeks).
- `uid`: optional fixed id prefix.

**`FetusPose` fields** (all optional, all animatable)
- `curl`: 0 stretched, 0.5 natural (default), 1 tight ball.
- `headTilt`: degrees; positive tucks the chin.
- `armPose`: `"rest" | "handToFace" | "thumbSuck"`, or weights like `{rest, handToFace, thumbSuck}` to blend. The hand is placed by IK, so it lands on the face whatever the head size or tilt.
- `armSway`: degrees of idle arm motion (feed it noise).
- `handOpen`: 0..1.
- `legKick`: −0.35 (tuck, for anticipation) .. 0 rest .. 1 extended.
- `toesCurl`: −1..1, one number or five values (big toe first).
- `headDown`: 0..1 turns the whole body 180°.
- `breathe`: 0..1 practice-breathing inhale.
- `hiccup`: 0..1 impulse; drive it with a spike, e.g. exp(−(f−f0)/3).
- `expression`: −1..1, or `"neutral" | "smile" | "frown"`. Subtle.
- `eyeOpen`: 0..1. Ignored before about week 26 (lids fused), full effect from week 27.
- `mirror`: faces left. `mirror` + `headDown: 1` ends up like Scene5 (head down, facing right).
- `rotate`: extra clockwise degrees.

**What changes with week**
- **Proportions:** head is about 1/2 of the body at weeks 9–12, about 1/3 at 20, about 1/4 at 40. Limbs lengthen and thicken.
- **Hands and feet:** webbed paddles at week 9, separate fingers and toes from about 10.5.
- **Early (9 on):** dark eye showing under thin lids, low-set ears, faint vessels, translucent skin.
- **Middle:** lanugo fuzz at 16–32, vernix sheen at 20–38, thin wrinkly skin at 22–26.
- **Late:** fat from 28, creases from 32, brows and a hair hint from 30.

`growth(week)` returns all of these strengths. `crlCm(week)` gives crown-rump length for true relative scale.

**`fetusAnchors(week, pose, size)`**
- Returns points in the same local px, already turned and mirrored.
- Head and face: `headCenter`, `headRadius`, `crown`, `face`, `eye`, `nose`, `mouth`, `chin`, `ear`, `cheek`, `profile[]`.
- Body: `heart`, `navel` + `navelDir` (cord attachment), `rump`, `back`.
- Arm: `shoulder`, `elbow`, `wrist`, `hand`, `fingertips[5]`, `thumbTip`.
- Leg: `hip`, `knee`, `ankle`, `foot`, `heel`, `toes[5]`, `farFoot`, plus `footReach[]` (contact points for kick effects).
- Also `bounds` (current pose), `scale`, `turn`. Helpers `placeAnchor` and `footReachDistance` are included.

**Showcase renders** (entry `src/shared/fetus/showcase/entry.tsx`, comp `FetusShowcase`, `--props='{"mode":"morph|single|sheet|scale|poses"}'`)
- Weeks 9–40 at the same size: `out/fetus/sheet.png`, `out/fetus/weeks-row.jpg`, `out/fetus/single-sheet.jpg`
- True relative scale: `out/fetus/scale.png`
- 6s morph 9→40 with pose changes: `out/fetus/morph.mp4` (contact sheet `out/fetus/morph-sheet.jpg`)
- 12 pose tests at week 30: `out/fetus/poses30-sheet.jpg`
- Anchor overlay check: `out/fetus/anch20-sheet.jpg`, `out/fetus/anch-detail.png`
- Comparison with the teaser: `out/fetus/compare-s4.png`

**Known limitations**
- **Side view only.** Only the near arm is drawn, and the far leg only shows when the near leg kicks.
- **`headDown` is a rigid 180° turn.** The legs don't refold the way Scene5's baby does.
- **Week 40 won't crossfade exactly into Scene5.** It is leaner, with a slightly smaller head, than Scene5's stylised baby; only the orientation matches.
- **The week-9 hand can't fully reach the face.** Arms are too short, so `thumbSuck` and `handToFace` stop just short.
- **Fine details need size.** Expression, lanugo, vernix and wrinkles mostly only read at size ≥ 500px.
- **Rotation must go through the pose.** Use `pose.rotate` or `mirror`; a rotated parent `<g>` would rotate the lighting too.
- **No cord.** Chapters supply their own through the `cord` slot.

All files are in `src/shared/fetus/`. Each one has a doc header, and the full API doc is at the top of `index.ts`. The longest file is 138 lines.

## embryo

EMBRYO API: `src/shared/embryo/` (import from `src/shared/embryo/index.ts`)

The embryo, yolk sac, stalk and anchors are built and render cleanly from week 3 to 8.99. Week 6 matches Scene3's embryo; I compared it side by side with Scene3 at frame 164. The type check for this folder is clean, no file is over 300 lines, and the only files changed are in `src/shared/embryo/` plus my renders in `out/`. I could not split this across agents because this session had no tool for starting them.

**Looks by week** (`week` is continuous, values are clamped to 3..9):
- **3:** flat pear-shaped disc lying flat, head end on the right, seen from above and in front. The rim shows three bands: ectoderm (cool), mesoderm (rose), endoderm (gold). Primitive streak and node on top, a faint cell speckle, and the yolk sac hugging it from below.
- **3.5:** slipper-shaped disc with a keyhole neural plate.
- **4:** raised neural folds and groove, first somite pairs. The disc starts folding and sitting up.
- **4.5:** curling into a C, head fold, heart bulge appears.
- **5–6:** C-shaped embryo with heart bulge, eye spot and limb buds. Week 6 is Scene3.
- **7:** arm and leg paddles with hand/foot plates, finger rays, darker eye.
- **8:** webbed fingers and toes, nose, lips and ear forming, eyelid folds, tail regressing. 8.99 is the end of the embryonic period.

**Components**

`<Embryo />` returns an SVG `<g>`, so put it inside your own `<svg>`.

| Prop | Type, default | Meaning |
|---|---|---|
| `week` | number, required | 3..8.99 |
| `size` | 280 | px, roughly the figure height. Use 322 to match Scene3's size. |
| `zip` | follows the week | Neural-tube closure 0..1. Starts at the neck and works outward; both ends close last. |
| `heartBeat` | 0 | Heart pulse 0..1 (the first beat can reach about 1.7) |
| `heartGlow` | 0.8 × heartBeat | Slower glow that lights the body from the heart |
| `heartLit` | 1 | 0 = dormant heart, 1 = lit |
| `hold` | 0 | Scene3's squeeze just before the first beat |
| `x`, `y` | 0, 0 | Where the visual centre goes |
| `rotate` | 0 | Degrees; rotates the shape but keeps the light at top-left |
| `alive` | 1 | 0 = still, 1 = gentle wobble |
| `frame` | current frame | Clock for the wobble |
| `id` | none | Required when several embryos share one `<svg>` |

- **`<YolkSac x y r glow? opacity? id? />`**: Scene3's yolk sac at any position and size.
- **`<YolkStalk from to glow? opacity? sag? sway? scale? />`**: Scene3's sagging stalk.
  - `yolkStalkPath(from, to, opts)` returns `{ body, line }` if you want to draw the stalk yourself.
  - `sacEdge(sac, from)` gives the point on the sac's rim facing the embryo.

**Functions**
- **`embryoAnchors(week, size = 280, { x, y, rotate })`** returns `{ centre, heart, head, crown, eye, hand, foot, yolkStalk, tail, width, height, presence: { heart, eye, hand, foot } }`.
  - Points are in the same px space as an `<Embryo>` with the same placement.
  - `presence` (0..1) says how visible each part is at that week. Before it appears, the point sits where the part will form.
- **`yolkSuggest(week, size, place)`** returns `{ x, y, r, stalk }`: where the sac goes, matching Scene3 at week 6.
  - Early on the sac is big and sits under the disc; later it drifts out to the right.
  - `stalk` is the value to pass as `<YolkStalk scale>`. It is 0 at week 3 (no stalk), a wide duct around week 4, and Scene3's cord from week 6.
- **`heartbeatPulse(frame, { start, bpm = 110, firstBoost })`** and **`heartbeatGlow(...)`**: Scene3's lub-dub drivers (also exported: `firstBeat`, `beatPeriod`).
- **Also exported:** `stageAt`, `stageFor`, `defaultZip`, `centreOf`, `DESIGN`.

**Draw order:** stalk, then sac, then embryo (the stalk starts behind the belly).

**Example**
```tsx
const a = embryoAnchors(w, 340, { x: 540, y: 860 });
const sac = yolkSuggest(w, 340, { x: 540, y: 860 });
const beat = heartbeatPulse(f, { start: B.heartStarts });
const glow = heartbeatGlow(f, { start: B.heartStarts });
// inside your <svg>:
{sac.stalk > 0 && <YolkStalk from={a.yolkStalk} to={sacEdge(sac, a.yolkStalk)} scale={sac.stalk} glow={glow} />}
<YolkSac x={sac.x} y={sac.y} r={sac.r} glow={glow} />
<Embryo week={w} size={340} x={540} y={860} zip={z} heartBeat={beat} heartGlow={glow} />
// pulse rings: centre them on a.heart
```

**Showcase renders**
- `out/embryo-sheet.png`: contact sheet for weeks 3, 3.5, 4, 4.5, 5, 6, 7, 8.
- `out/embryo-morph.mp4`: 6 s morph from week 3 to 8.99 with the zip and heartbeat animating. Contact sheets: `out/embryo-morph-sheet.jpg` (every 12 frames) and `out/embryo-morph-dense.jpg` (every 6 frames).
- `out/embryo-zip.png`: week 4 at zip 0, 0.5 and 1.
- `out/embryo-vs-scene3.png`: my week 6 next to Scene3.
- Entry files:
  - `showcase/sheetEntry.tsx` (`EmbryoSheet`). It takes `--props` such as `{"weeks":[6],"cols":1}`, plus `"guides":true` (shows the bounding box and anchors), `"scene3":true` (puts week 6 at Scene3's position), and `"rotate"` and `"zip"`.
  - `showcase/morphEntry.tsx` (`EmbryoMorph`).

**Known limitations**
- **Week labels:** `week` follows the brief's labels. In true gestational age, weeks 3–4 and 7–8 look about 1–2 weeks early. Week 6 is consistent with Scene3.
- **Fast change around week 4.5:** the disc turns 90° and rotates from looking at its back to a side view between weeks 3.6 and 4.6. A chapter that holds at 4–4.5 sees a transitional, slightly pale shape.
- **View:** only the near-side limbs are drawn, always in side view.
- **Size:** every stage is drawn at about the same size, so real growth is up to you via `size`. The disc is wide and short, so its `height` is smaller than the later stages'.
- **Yolk-sac position:** `yolkSuggest` positions were tuned for the placements I tested. At wide placements the sac can leave the frame (it does in the contact sheet's right column at weeks 6–8).
- **Ids:** two embryos (or two sacs) in one `<svg>` without different `id`s will clash.
- **Cost:** each embryo carries four SVG filters. That is cheap for one or a few on screen; about 8 per frame (as in the contact sheet) still rendered fine.

## womb

WOMB KIT: `src/shared/womb/` (import from `"../../shared/womb"` or the right relative path)

Types are clean for the folder, every file is under 300 lines, and there are no imports from `src/scenes`. Everything uses palette C, is deterministic (`random`, `noise2D`), and every SVG id is `wb-<name>-<useId>`, so many instances never collide. I went through 4 render-and-review rounds.

**Conventions**
- **Coordinates:** world px on the 1080x1920 canvas. With `<Camera>` defaults (zoom 1, x 540, y 860), world equals screen.
- **Angles:** degrees, SVG convention (0 = right, 90 = down, -90 = up). The only exception is `useSac().rAt(theta)`, which takes radians.
- **Frames:** `useCurrentFrame()` wherever the component renders, so your chapter's local frame. Ripple `t` uses the same clock.
- **Layering:** each component is its own full-frame layer (AbsoluteFill + SVG) and reads the camera from context. DOM order is paint order. Children of `<AmnioticSac>` render between its back (fluid) and front (membrane).
- **House rules:** placenta on the upper-right wall (-38 to -50 deg), key light from the upper left.

**Components** (all props optional and animatable unless marked *)
- **`<Camera zoom x y rot shake drift anchor seed>`** wraps the shot. The world point (x, y) sits at the screen anchor (default 540, 860). `shake` is a px amplitude; `kickShake(frame, at, amp)` gives a decaying thump. `drift` (default 1) is the always-on handheld drift.
- **`<WombLayer depth blur opacity blend>`** is one plane for your own art. Depth 1 = sac plane, below 1 = farther, above 1 = nearer, 0 = locked to the screen.
- **`<WombBackdrop warmth depth parallax folds cx cy r aspect pear breathe opaque seed>`** goes first. It paints an opaque base, soft tissue masses (depth 0.45) and concentric fold rings (depth 0.75).
  - `warmth` 0..1: dark plum (Scene3/4) to warm rose (Scene5).
  - `depth`: how dark the creases and vignette are.
  - `parallax`: multiplies how far the backdrop planes sit from the sac plane.
  - `folds` 0..1: soft to crisp week-40 folds.
- **`<AmnioticSac cx cy r aspect pear wobble ripples warmth villi sheen opacity part seed>{children}</AmnioticSac>`**
  - `warmth` blends the teaser's three fluids: 0 = Scene3, 0.4 = Scene4, 1 = Scene5.
  - `villi` 0..1 adds the fuzzy chorion fringe for early weeks.
  - `pear` makes the top broader than the bottom (full-term shape).
  - `part` is "all", "back" or "front", for splitting the sac around several of your own layers.
  - `opacity` only fades the sac's own layers, not its children.
- **`<Placenta at spread size opacity cx cy r>`**
  - `at` = degrees around the rim (default -38).
  - `spread` = angular half-width (default 32).
  - Inside a sac it uses that sac. Make it a direct child: then the sac hides its membrane line there and `<Cord>` finds its insertion point on its own.
  - `placentaPort(shape, at, size)` returns that insertion point.
- **`<Cord from* to slack side twist pulse bpm width sway opacity depth blur seed>`**
  - `to` defaults to the sac's placenta insertion point.
  - `pulse` sends blood beads from the placenta to the baby on each heartbeat.
  - `<CordShape>` is the raw SVG `<g>`, for drawing the cord between your own body parts.
- **`<FluidSpecks count seed layer size opacity drift cx cy r>`**
  - `layer` is "far" (behind the baby), "near" (in front) or "lens" (big bokeh across the frame).
  - Inside a sac they are clipped to the fluid and nudged by heartbeats.
- **`<LightShafts from angle fan count intensity length width color clip depth blend seed>`** are blurred beams. As a sac child they are clipped to the fluid.
- **`<SoundWaves from* dir* progress* count spacing length spread width color sac opacity depth seed>`** are tapered arcs from an outside source. They are crisp outside the sac and muffled inside. Use them as a sac child placed before your baby layer, so the arcs pass behind the baby.
- **`<CaptionShade strength top mode from to>`** goes last and is screen-space. It keeps y 1300–1560 dark.
  - `mode="multiply"` is for bright warm shots.
  - `top` adds a band under the week tracker.

**Ripple API**
`Ripple = { x, y, t /*start frame*/, kind?: "beat"|"kick"|"sound", strength?, life? }`
- **beat:** rose pulse rings from the heart, plus a wall pulse.
- **kick:** wall bulge and ringing, a gold flash, shock rings rolling into the wall, and glints racing along the membrane.
- **sound:** the membrane quivers at the entry point and peach glints run along the rim.

Helpers:
- `heartbeatRipples(frame, {x, y, start, bpm, strength, boostFirst})` returns the live lub/dub ripples.
- `soundRipples({from, dir, start, end, count, spacing, length, strength}, sacShape)` makes the matching sound ripples. Drive `progress={soundProgress(frame, start, end)}` linearly so they line up.
- `useSac()` gives the live membrane (`d`, `rAt(theta)`, `shape`, `ripples`) for your own art. `SacClip` and `insetPath` turn it into clip paths.

**Presets**
`WOMB_LOOKS.early | mid | late` hold `{backdrop, sac, placenta, shafts, cordWidth}`. `mixLook(a, b, t)` blends two looks for growth across a chapter.

**Example**
```tsx
const f = useCurrentFrame(); const L = WOMB_LOOKS.mid;
const ripples = [...heartbeatRipples(f, { x: 520, y: 840, start: 0, bpm: 150, strength: 0.5 }),
  { x: 760, y: 1080, t: 40, kind: "kick" as const },
  ...soundRipples({ from: { x: -140, y: 250 }, dir: 42, start: 64, end: 168 }, L.sac)];
<Camera zoom={tween(f, 0, 180, [1, 1.12], EASE.inOut)} shake={kickShake(f, 40)}>
  <WombBackdrop {...L.backdrop} />
  <AmnioticSac {...L.sac} ripples={ripples}>
    <LightShafts {...L.shafts} />
    <FluidSpecks seed="c7far" />
    <SoundWaves from={{ x: -140, y: 250 }} dir={42} progress={soundProgress(f, 64, 168)} />
    <Placenta {...L.placenta} />
    <Cord from={bellyPt} width={L.cordWidth} />
    <WombLayer blur={focusBlur}><MyFetus /></WombLayer>
    <FluidSpecks seed="c7near" layer="near" count={10} />
  </AmnioticSac>
  <FluidSpecks layer="lens" count={5} seed="c7lens" />
  <CaptionShade />
</Camera>
```

**Showcase**
Entry `src/shared/womb/showcase/entry.tsx`, composition "WombShowcase":
- frames 0–59: early look
- frames 60–119: mid look
- frames 120–179: late look
- frames 180–359: 6s demo (kick, sound waves rippling the sac, camera push)
- frames 360–419: edge cases (zoom 1.4, `part` split, standalone placenta)

Renders in `out/womb/`:
- `looks.png` (three looks)
- `looks-vs-teaser.png` (the looks next to the teaser's Scene4)
- `cmp-mid.png` (full-res mid look vs Scene4)
- `full-90.png`
- `look-30.png`, `look-90.png`, `look-150.png`
- `demo.mp4` (half scale, about 30s to render while the machine was under heavy load)
- `demo-sheet.jpg` (tile k = demo frame 15k)
- `tests.png`

**Known limitations**
- `<Placenta>` must be a direct child of `<AmnioticSac>` (not wrapped in a fragment or component), or the membrane line won't be hidden over it and `<Cord>` won't find it.
- A sac's `opacity` doesn't fade its children. Wrap everything in an AbsoluteFill with opacity to fade the whole sac world.
- "near" and "far" specks inside a sac only shift approximately for parallax, so they stay clipped to the sac.
- The `warmth` blend stacks see-through fills, so values between the three stops are a smooth approximation, not an exact mix.
- Membrane speculars follow the base shape, not the ripples.
- `soundRipples` assumes linear progress.
- Placenta `at` interpolated by `mixLook` sweeps along the rim.
- With aspect or pear far from 1, the placenta and fold rings are only approximately fitted to the shape.
- The `StandIn` figure is a showcase-only placeholder, not part of the kit.

## framework

The framework for the "Long" film is built and renders end to end with placeholder cards: 14 chapters, 3843 frames (128.1 s). Types are clean for `src/long` and `src/Root.tsx`, and no file is over 300 lines. I checked the tracker and size chip across the whole timeline, frame by frame through the fast tick (weeks 28 to 38 in 2 s), and on the day-to-week and stage-to-size switches. Over 4 rounds I fixed overlapping chip text, the DAY/WEEK swap, and the pill cropping words while resizing. The "Main" teaser and Scene1–5 compositions are unchanged.

# API

**Coordinates.** Canvas is 1080x1920 at 30 fps. Inside a chapter, `useCurrentFrame()` is chapter-local: frame 0 is its first frame, and the length is `chapterFrames(id)` including transition overlaps. The overlays and background need the **global** film frame; a preview gets this by wrapping them in `<Sequence from={-LONG_START[id]}>`. Week values are fractional: 1/7 = day 1, 40 = birth. The tracker band (week label, bar and size chip) covers y 138–262, so chapters must keep **y 100–290 clear**. The caption zone y 1300–1560 must stay calm.

**`src/long/chapters.ts`**
- `ChapterSpec`:
  - `id: string` — also the folder name and the export name.
  - `title: string` — shown on the placeholder card only.
  - `durationSec: number` — includes the overlaps.
  - `transition: 'cut'|'fade'|'focus'` — how the chapter *enters* from the previous one; ignored for the first chapter.
  - `weekKeys: [localSec, week][]` — tracker keyframes; the week eases between keys and holds outside them.
  - `trackerHide?: [fromSec, toSec][]` — local windows where the tracker fades out.
- `CHAPTERS` holds 14 placeholders. `ChapterId` is the union of their ids.
- Derived values:
  - `LONG_TRANSITION` = 15; `fade` and `focus` overlap 15 frames, `cut` has no overlap.
  - `LONG_START[id]` (global start frame) and `LONG_TOTAL`.
  - `chapterFrames(id)`, `chapterSpec(id)`, `overlapIn(id)`, `toGlobalFrame(id, localSec)`, `toGlobalSec(id, localSec)`.

**`src/long/lib/weeks.ts`**
- `weekAt(globalFrame)` and `weekAtLocal(id, localFrame)` give the week at a frame.
- `weekLabel(w)` returns "DAY 03" or "WEEK 12". `dayNumber`, `weekNumber`, `isDayMode` give the parts.
- `chapterWeekRange(id)` and `WEEK_KEYS` are also exported.

**`src/long/registry.ts`**
- `CHAPTER_COMPONENTS: Partial<Record<ChapterId, React.FC>>` maps ids to components.
- `chapterComponent(id)` returns the registered component or a placeholder.
- To register a chapter, add one import line and one entry line.

**`src/long/LongFilm.tsx`**
- `<LongFilm/>` stacks the background, the chapter series, the overlays, grain and soundtrack.
- `<LongChapters/>` is the transparent chapter series on its own.
- "Long" is registered in `src/Root.tsx`, and alone in `src/long/entry.ts`.

**Overlays**
- `<WeekTrackerLong weekAt? opacityAt? sizes? stages? totalFrames? showWeight?/>`
  - Same look as the teaser tracker, plus the size chip under the bar.
  - The number rolls like an odometer, and DAY → WEEK rolls the same way.
  - Steps are smoothed, so fast ticks become one continuous roll.
  - A chip text is only shown if the tracker rests on it for at least 22 frames. During a fast run the chip folds away and returns with the destination text.
  - The chip shows the stage before week 4.
  - The pill sizes itself to its text. It holds the render until the fonts are loaded, so this is deterministic.
- `<CaptionsLong lines={CaptionLine[]}/>` takes lines in global seconds; same fields as the teaser captions.
- `<BackgroundLong totalFrames/>` warms over the film length with a smooth colour blend. The teaser switches colour at the halfway point, which would pop in a long film.
- `<SoundtrackLong music? sfx? voice?/>` takes lists of `LongClip = {src, at (global sec), volume?}`.
- `<LongOverlays/>` is the tracker plus captions, shared by the film and every preview.

**Data** (placeholders, same shape for the fact-checked versions)
- `data/sizes.ts`: `SIZES` for weeks 4–40, each `{week, compare, article?, lengthCm, lengthType, weightG}`. Below 1 cm the chip shows mm.
- `data/stages.ts`: `STAGES`, each `{day, stage, detail?}`.
- `data/lines.ts`: `CHAPTER_LINES` in chapter-local seconds, converted to `LONG_LINES` in global seconds.
- `data/audio.ts`: empty clip lists.

**Placeholder card.** `ChapterPlaceholder` / `placeholderFor(id)` shows the chapter id, title, week range and a gold arc for local progress.

**Example chapter**
```tsx
// src/long/chapters/C05/index.tsx
export const C05: React.FC = () => { const f = useCurrentFrame(); const w = weekAtLocal("C05", f); ... };
// registry.ts: import { C05 } from "./chapters/C05";  ...  C05,
```

**Scripts**
- `scripts/long-preview.sh <id> [scale]` writes `out/long-<id>.mp4` and `out/long-<id>-sheet.jpg` (one tile every 15 frames).
  - It first runs `scripts/long-entry.sh <id>`, which regenerates `src/long/preview/<id>.ts`.
  - That entry imports only that chapter, or the placeholder if the chapter has no `index.tsx` yet.
- `scripts/long-frame.sh <id> <frames...>` cuts frames from the preview mp4. With `FULL=1` it renders full-resolution stills instead.
- `scripts/long-render.sh [scale] [extra remotion args]` writes `out/long[-scale].mp4` plus contact sheets, one tile per second.
- `scripts/long-tracker.sh [scale] [step] [from-to]` is a QA strip of just the tracker band, for any frame range.

The chapter-agent guide is `src/long/README.md` (61 lines).

# Showcase renders
- Full film at 0.25 scale: `out/long-0.25.mp4`, sheets `out/long-0.25-sheet-1.jpg` … `-5.jpg`.
- Tracker across the whole timeline: `out/long-tracker.mp4`, sheets `out/long-tracker-sheet-1.jpg` … `-4.jpg`.
- Fast tick, earlier fold version: `out/qa/fast-tick-2.jpg` (one strip every 2 frames). The words-fully-out-before-resize fix landed after this, so it isn't in that strip.
- DAY → WEEK swap: `out/qa/stage-switch-2.jpg` (one strip per frame).
- Stage → size switch: `out/qa/stage-to-size-2.jpg` (one strip per frame).
- Chapter preview test: `out/long-C10-sheet.jpg`; full-resolution frame: `out/long-C08-f200.png`.
- Showcase entry: `src/long/showcase/entry.tsx` (composition "LongTrackerQA").

# Known limitations
- **Week counting is mixed.** Days use the teaser rule (`max(1, round(w*7))`, with conception as day 1), but the size table uses pregnancy-app weeks 4–40. The fact-checkers should settle this; the code only reads the tables.
- **Transitions near chapter edges.** The tracker keeps moving through the 15-frame overlaps, from one chapter's last key to the next chapter's first. So the placeholder range for C10 reads "WEEK 16 → WEEK 21".
- **Fast runs blank the chip.** Short in-between texts are skipped on purpose. If the script wants every fruit shown during a montage, that needs slower keys.
- **Shared registry file.** Chapters register by editing `registry.ts` one line at a time, so parallel agents could collide; the orchestrator may prefer to do registrations itself. A broken chapter can break the full Long render and the Studio root (which now imports Long), but never another chapter's preview.
- **Possible Studio warning.** The font wait in `lib/measure.ts` could leave a harmless "delayRender" warning in Studio dev mode.
- **Untested paths.** The "real chapter folder" preview branch was tested with a throwaway component inside my folder; I didn't create any `src/long/chapters/<id>` folder. Audio lists are empty, so the soundtrack path is untested with real files.
- **Timings are inflated.** The machine was at load average ~48 from other agents' renders. The C10 preview at 0.5 took 110 s and the full film at 0.25 took 175 s.

