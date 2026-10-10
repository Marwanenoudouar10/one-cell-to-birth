# Lessons from the birth film

These are the mistakes agents made while building the 30 s teaser (Scene1-5) and the long film (C00-C16) in October 2026, what the polish and QA passes did to fix them, and the rule that would have prevented each one.
The top ~20 rules are summarised in `../CLAUDE.md`. This file holds the evidence and the numbers behind them.

How to read an entry:
- **Mistake**: what the builder did.
- **Fix**: what polish or QA changed, with numbers measured before and after.
- **Rule**: what to do from the start next time.
- **Seen**: how many times it happened, with examples.

## At a glance

| Category | Incidents | The one rule to remember |
|---|---|---|
| Science and facts | 41 | Every fact has a GA week and a primary source; run an adversarial fact-check |
| Orchestration | 36 | Build one at a time in story order; skeptic-verify every QA finding |
| Composition and readability | 24 | Check every beat at 270 px wide: "this reads as ___" |
| Timing and sync | 14 | Every frame is `BEATS.x` +/- an offset; record the voice first |
| Handoffs and transitions | 13 | Upstream owns the END as numbers; diff against the real last frame |
| Captions and safe zones | 12 | Measure the caption band without captions: 4.5:1 or better |
| Audio | 9 | Zero first sample, fade-in after filters, 120-600 Hz body for phones |
| Performance and rendering | 9 | 1-2 agents, `nice`, scale 0.4, `overflow: hidden` on big masked layers |
| Lighting and colour | 6 | Shade with the same hue; screen to brighten, multiply to darken |
| Motion | 5 | No `return null` on visible layers; no luma step above 20/255 |
| Code structure | 4 | Unique ids, each filter defined once |

## What the polish pass actually does

Builders landed at about 6/10 every time. An independent polish agent lifted that to about 7.5-8.2 (+1.8 on average). No pass reached 9. Polish works because it does five things the builder skips:
1. **Re-renders and looks for itself.** It never trusts the builder's report. It pulls frames 0, 8, 15, every beat, every beat +6, the frame 15 before the end, and the last frame.
2. **Scores and ranks problems by impact**: readability at phone size, polish, motion, storyboard and handoffs, science, kit consistency, code.
3. **Compares against the neighbours' live code.** It reads their real code, not the brief or a placeholder, so handoffs actually match.
4. **Measures before and after.** It reports contrast ratios, luma steps, pixel diffs and dB, not "looks better".
5. **Runs an explicit biology check** of every on-screen claim.

QA (a separate stage, on the whole film with sound) found the problems that only show up at film level: sync, mix, retime regressions, first-time viewer. Its proposed fixes were often wrong. 13 of 15 confirmed findings needed a corrected `betterFix` from the skeptic verifier, so never skip the verify step.

---

## 1. Captions and safe zones (12)

### 1.1 Bright effects behind the captions (6)
- **Mistake:** Flashes, light sources, shockwave rings, the sperm swarm and body parts sat in the caption band (y 1300-1560) behind white text. Scene5 already had a scrim, but it ramped on `bright` with `EASE.in`, so it arrived about 0.7 s after the bloom. On the film's key line, contrast was only 2.1-3.6:1.
- **Fix:**
  - The scrim was retimed to `tween(T.bloom-4, T.bloom+12)` to 0.85, with a multiply blend so it never shows as a dark bar.
  - The light's hot core moved from y 1760 to y 1900, and the flash's dark floor stops were raised.
  - Effects got screen-space masks that fade from y 1170 to 0 at y 1290.
  - The swarm got a `CAPTION_MASK` that dims to 36% across y 1290-1570.
  - Results: Scene5's worst median contrast went from 2.55:1 to **6.44:1**. Scene2's band luma went from 73 to 64. C00's flash-peak band mean went from 106 to 52/255.
- **Rule:**
  - Render without captions and measure y 1300-1560, x 150-930, with the text pixels excluded. The median contrast against white must be at least 4.5:1 on every frame (aim for 6:1), and the mean luma about 65/255 or lower.
  - A flash's multiply scrim reaches full strength at least 4 frames before the light ramps.
  - Hot cores stay at y 1900 or lower down, or at y 1200 or higher up. Effects fade to 0 by y 1290 in screen space.
- **Seen (6):** the Scene5 birth flash behind "a whole new" (`src/scenes/Scene5/index.tsx`, `womb/BirthLight.tsx`); the Scene4 kick rings crossing the captions around frames 195-205.

### 1.2 Detail under the week tracker (3)
- **Mistake:** Camera push-ins and lit effects carried sac rims, placenta tops, head tops and labour-wave highlights into the tracker band (y 100-240 in the teaser, y 100-290 in the long film).
- **Fix:** A soft dark top band fades in only during the push-ins (Scene4 `Overlays.tsx`). The womb kit's `CaptionShade` gained a `top` option, and C15 added a screen-space mask.
- **Rule:** Before approving a camera move, work out the hero's on-screen bounds at the move's MAX zoom. If bright detail crosses y 240 (teaser) or y 290 (long film), add a top shade driven by the same camera curve.
- **Seen (3):** on the Scene4 toes push-in the sac rim reached y ~120; the C16 labour waves lit the folds under the tracker.

### 1.3 Caption lines stacking, weak ending, overflowing text (3)
- **Mistake:** Each line faded out from end+6 to end+16. When the next line came within 0.33 s, its first word appeared on top of the old line. "Hello, world." was a normal 76 px subtitle that faded out before the last frame. Long sentences wrapped to 4-6 rows.
- **Fix:** `fadeEnd = min(end+16, nextFirstWord-2)` and `fadeStart = min(end+6, fadeEnd-6)`, with `EASE.inOut`. The last line became a 112 px one-line end title at y 1480 with a gold "world.", no fade-out and a 4% scale-up. Long sentences are now paged at phrase boundaries (`src/long/overlays/captions/pages.ts`).
- **Rule:** Line N reaches opacity 0 at least 2 frames before line N+1's first word. Use at most 2 rows at 76 px; page longer sentences at punctuation. The final line is an end title held to the last frame.
- **Seen (3):** teaser overlaps at 2.33-2.63 s and 20.17-20.47 s (`src/overlays/Captions.tsx`); 9 long-film sentences needed paging.

## 2. Handoffs and transitions (13)

### 2.1 Neighbours built against placeholders (10)
- **Mistake:** Neighbouring scenes were built at the same time, so each could only check its handoff against a placeholder or a stale render. Across the crossfade the lighting, size, zoom, facing, placenta side, noise seeds and breathing phase all differed. Rims doubled, sizes jumped and colours popped. Two agents (Scene1 and Scene2) ended up chasing each other's old renders.
- **Fix:** Polish copied the upstream END exactly:
  - Scene2's `Handoff.tsx` redraws Scene1's gradients and phase-locks the breathing as f+180, measured to within 1-2 RGB.
  - Scene5 was mirrored to match Scene4's placenta side.
  - C00 reused C01's camera seeds (diff at most 1/255).
  - C15 runs the kit on C14's clock through a Sequence offset.
- **Rule:** The upstream owns the END contract as numbers in one shared handoff file: centre, radius, zoom, light stops, seeds, clock offset, breath phase, facing, placenta angle. Pixel-diff downstream frame 0 against the upstream's REAL last frame: mean 2/255 or less, max 20/255 or less, and only in blurred areas. The subject stays still through the 15-frame overlap.
- **Seen (10):** Scene1 ends on a white-hot zygote lit from the centre, but Scene2 started on an orange ball lit from the top-left. C07 ends at zoom 0.63 with r 330, but C08 assumed 0.85 with r 300, so the rims doubled.
- **Still open:** the Scene4 -> Scene5 dissolve brightens from plum to rose; there are size jumps from Scene2 to Scene3 (230 -> 335 px) and Scene3 to Scene4 (r 380 -> 360); C02 ends on an elongated cell but C03 starts round.

### 2.2 Assuming a symmetric crossfade (3)
- **Mistake:** Remotion's `fade()` keeps the OUTGOING scene fully opaque (`shouldFadeOutExitingScene` is false by default) and lays the new scene on top. Translucent halos, zona rings and egg light doubled up during the overlap, then vanished at the cut.
- **Fix:** Scene1 (and later C01) fades its translucent extras linearly to 0 over the last 15 frames (`exitAt`) while the opaque core stays. The downstream scene redraws those layers. A render of the Main composition across the cut showed no diff spike at frames 195/196.
- **Rule:** Fade outgoing glows, halos, rings and shells from 1 to 0 over the final 15 frames (`LONG_TRANSITION`). Verify on the COMPOSITE from END-20 to END+5; an isolated preview will look wrong here, and that is expected. Use `focusPull` (`src/lib/focusPull.tsx`) when two similar silhouettes would ghost.
- **Seen (3):** Scene1 `exitAt`; C01 fades its zona and halo under C02.

## 3. Composition and readability (24)

### 3.1 Shapes that read as something else (8)
- **Mistake:** At phone size:
  - Pronuclei side by side read as eyes, and a nucleolus as a face.
  - The week-6 head read as a chick or duckling.
  - A second "nose" appeared on the forehead.
  - The adult finger was a smooth capsule that could read as phallic.
  - The tube-entrance lobes with a slit looked suggestive.
  - The placenta read as a leaf, and the spine as a scar.
- **Fix:**
  - The pronuclei were moved onto a diagonal.
  - The head became one forward-bowed mass with a soft eye ring.
  - The finger was redrawn from the back of the hand, with nail, lunula, knuckle creases and a curled fist.
  - The throat became an hourglass neck, and the placenta a cushion set into the wall.
- **Rule:** At every beat frame, view the hero at 270 px wide and write "this reads as ___". Reject pairs of dots that read as eyes, slits, openings or capsules that read as body parts, and any animal or face resemblance. Hands always get a nail and knuckle creases.
- **Seen (8):** the Scene5 phallic finger (polish's biggest fix); the Scene3 "duckling" head.

### 3.2 Generic primitives instead of the real thing (7)
- **Mistake:**
  - The corona was drawn as soap bubbles and the tube walls as pink pillows.
  - Salt looked like a glass box (it read as ice).
  - The foot looked like a loaf, and the cord was two lines (or a ladder).
  - The yolk sac looked like a lollipop.
  - The kick was a 4-point lens flare.
  - The pulse rings stacked into a target pattern, and the survivors lined up like comb teeth.
- **Fix:**
  - 104 radially elongated corona cells.
  - A milky, off-square salt grain.
  - A foot with heel, arch and ball.
  - A cord with 1 vein and 2 spiralling arteries.
  - Thin 7-12 px crest rings with a 40-frame life.
  - Random tilt and spacing for the survivors.
- **Rule:** Before drawing an element, write the 2-3 real features that identify it. No uniform circles, rectangles, stroke-only clip-art or evenly spaced rows. At most 3 shockwave rings on screen, each a thin crest plus a soft trail.
- **Seen (7):** Scene4 loaf foot, two-line cord and starburst kick (the starburst is still open); C01 survivors in a comb row.

### 3.3 Weak hook (2)
- **Mistake:** Frames 0-20 were almost still (frame diff 0.2-0.3 against a film median of 1.05). There was no sound until 0.4 s, and the first motion was in the bottom 25% of the frame, under the TikTok/Reels UI.
- **Fix:** `raceStart` moved from frame 18 to frame 5. A camera key placed before frame 0 means the push is already moving on frame 1. Two large "hook" swimmers cross above y 1300 by frame 20. Upper-frame motion rose from 0.29 to **0.77**.
- **Rule:** Frame 0 is a clean thumbnail. By frame 5 something moves in the upper 75% of the frame, and sound starts by 0.1 s. Put the first camera key at frame -30. The mean frame diff over frames 1-15 should be at or above the film median.
- **Seen (2):** Scene1 (`beats.ts raceStart`, `camera.ts`, `swarmSpecs.ts`); C00 now starts mid-push.

### 3.4 Story beats that don't read (5)
- **Mistake:**
  - The "only one wins" sperm arrived LAST.
  - The face beat was just a small glint.
  - Push-ins went only 62% of the way (zoom 1.24-1.34).
  - The embryo filled only 28% of the frame width.
- **Fix:**
  - The winner got its own lane, 6 rivals it visibly overtakes, a gold rim, and the rest of the swarm dimmed 45%.
  - The camera now travels 86% of the way at zoom 1.4-1.5, with a light sweep across the face.
- **Rule:** For each VO beat, the named subject sits in the HERO box at about 35% of the frame width or more, and non-focal layers are dimmed by 40% or more. Check the story logic numerically (who leads at the beat frame), then look at a 270 px-wide downscale.
- **Seen (5):** Scene1 winner (`lane.ts`, `Rivals.tsx`); Scene4 face, hand and foot push-ins.

### 3.5 Inconsistent depth and focus (2)
- **Mistake:** The yolk sac was sharp next to an embryo blurred by 30 px. A reveal finished before its VO word. In C01 the draw order made the egg seem to travel backwards.
- **Fix:** The yolk blur became 0.7x the embryo blur, and the focus pull eases to `weekSix+20`. The C01 egg is now drawn behind the corridor, with a rack focus.
- **Rule:** Objects on the same depth plane share one blur. A reveal completes ON its word. Draw order follows the real spatial story.
- **Seen (2):** Scene3 yolk sac; C01 egg layering.

## 4. Lighting and colour (6)
- **Mistake:** Warm forms were shaded by laying the cool background colour over them, or by screen-blending white over saturated colour. Gold cells turned olive, gold over plum turned khaki, and a wombDeep scrim over yellow made a brown ellipse. The far leg turned into a see-through ghost, and the heart went pale pink-white at its peak.
- **Fix:** Shading now goes toward terracotta or `C.skinShade`. The speck halo switched from normal to screen blend, and the scrims to multiply. The heart is drawn after the glow, with a smaller flare. The far leg uses `C.skinShade` at 0.6 instead of wombDeep at 0.35.
- **Rule:**
  - Shadows on warm forms use a darker tone of the SAME hue family.
  - Light over dark uses screen or additive blending; darkening over bright uses multiply.
  - After every lighting change, sample the hero's pixels. Olive, khaki, brown or grey means the blend is wrong.
  - Focal colours (`C.heart`) stay saturated at their peak.
- **Seen (6):** Scene2 olive cells (now terracotta); C00 khaki flash (normal -> screen).

## 5. Motion (5)
- **Mistake:**
  - A full-frame halo was removed with `return null` while still visible: a 79/255 step.
  - The light used `EASE.in` into its peak and expo out of it.
  - A ring popped in at full strength.
  - Switching a blur filter off changed a group's blend isolation, causing a one-frame jump.
  - A cell shrank 8% because its waist faded faster than its halves separated.
  - The far leg crept out during the wind-up and showed a 7-toe foot.
- **Fix:** Every exit now fades over 6-10 frames. Peaks use S-curves with a held white beat. Blended layers moved outside filtered groups, and the separation rates were matched. Results: C00's max step went from 79 to **21/255**, Scene5's reveal jump from 23.6 to 13, and Scene2's f163 jump from 3.3 to 0.8.
- **Rule:**
  - Scan every scene for the frame-to-frame luma difference in the art region. Any step above 20/255 outside an intended flash must be justified.
  - Never `return null` on a visible layer.
  - Never toggle a filter on a group whose children use blend modes.
  - Check rigs at their extreme poses.
- **Seen (5):** C00 speck halo; Scene4 far leg during the kick wind-up (`rig.ts` used a 0.5 pull-in).

## 6. Timing and sync (14)

### 6.1 Hard-coded or chained timings broke on retime (5)
- **Mistake:**
  - WeekTracker keys were hard-coded (19.8, 20.4), and Scene2 hard-coded `DUR=165`.
  - After the VO retime, Scene2's 32->64 split window opened before the 16->32 one, and a clamp wiped the stagger on all 64 cells.
  - A split started on a spring overshoot of 1.25.
  - Scene4's face close-up shrank to 11 frames.
- **Fix:** Every window was re-derived from BEATS (`GENS[1] = B.four-13`), and the clamp was hardened to `t0 = max(CAV.start, birth+1) + delay`. Each fix was simulated first with frame tables (`out/qa/teaser/retime/qa-retime-*.cjs`).
- **Rule:** Every frame is `BEATS.x` +/- an offset. After a retime, simulate and assert:
  - Windows stay in order, and no clamp overrides a designed delay.
  - Each hero state holds at least 12 frames.
  - New actions start only after the previous spring has settled within 5%.
  - The camera stays until the subject's effect is about 99% done.
  - Overlays read the same BEATS.
- **Seen (5):** `src/overlays/WeekTracker.tsx`; Scene2 `timeline.ts` and the `prims.ts` clamp.

### 6.2 Timed to planned words, not the real take (4)
- **Mistake:** Beats were timed to the planned word times. With the real take, C01's beats were 0.07-0.27 s off, and the aligner put "Only" 0.4-0.65 s early. The teaser's DAY labels ran 1-2 days ahead of the cell stage on screen.
- **Fix:** C01 measured its word onsets from the wav and wrote them as comments in `beats.ts`. The DAY labels now switch on the exact frame each stage appears.
- **Rule:** Don't fine-tune sync until the real take exists. Measure onsets from the waveform and write them as `// sync: "gets" (6.55)`. Spot-check the aligner on every line. Counters are keyed to the visible stage beat.
- **Seen (4):** C01 retime (mesh 2.6 -> 2.49 s, fuse 7.0 -> 6.9 s); `voTiming.ts` has C01 line 3 one word early. C00 and C02 still need a retime to `vo-words.md`.

### 6.3 Too dense (5)
- **Mistake:** The script drafts ran at 2.3-2.56 words/s with 2-3 ideas per chapter, but the real voice speaks at about 2.15 words/s, which put the film over its 140 s cap. Some visual beats lasted about 0.5 s.
- **Fix:** The script was cut to 296 words (about 2.1 words/s, with about 18 s of no narration). Overloaded chapters were split, and each week label gets 1.4-2 s.
- **Rule:** Keep the VO at 2.1 words/s or less overall (2.3 or less per chapter), with one idea per chapter. Each visual beat lasts at least 0.7 s, and each week label at least 1.4 s.
- **Seen (5):** the hook draft ran at 2.56 words/s in C11; Scene3 frames 90-164 had no new idea.

## 7. Science and facts (41)

### 7.1 Plausible but wrong biology on screen (6)
- **Mistake:**
  - The blastocyst cavity opened from the centre, and the cord had 2 lines instead of 3 vessels.
  - The tracker said DAY 04 over 2 cells.
  - The script said "week twenty: the first kick" (the fetus moves from about week 8).
  - The baby's finger was 0.22x the adult's width (real: 0.4-0.45x).
  - The week-20 head sat on top like a ball.
- **Fix:** The cavity now swells from one side, and the cord has 1 vein and 2 arteries. The labels are keyed to the stages, and the ratios were measured and set. The wording became "A flutter... then, a kick."
- **Rule:** Each brief carries a stage-time-visual table with its source and a proportion table:
  - Head to body: 1/2 at weeks 9-12, 1/3 at week 20, 1/4 at week 40.
  - Newborn finger: 0.4-0.45x the adult's width, and about 0.7x the palm's length.
  - Sperm head: 1/20 of the egg's diameter.
  - Every polish pass lists each on-screen claim against these tables.
- **Seen (6):** Scene5 hand ratios (`gripGeom.ts`); Scene4 cord (`Cord.tsx`).

### 7.2 Research that didn't survive the fact-check (35)
- **Mistake:** Researchers mixed fertilisation age with gestational age (the embryo-to-fetus switch is at GA week 10, not 8). They quoted consumer sites ("300 million sperm"), gave overprecise numbers ("90% suck the right thumb"), and invented details. Fruit comparisons were wrong by weight, and a data seam made the length jump 4.6 cm between weeks 24 and 25.
- **Fix:** Separate fact-checkers swapped in primary sources (INTERGROWTH-21st, WHO, Hepper 1994, O'Rahilly) and hedged the wording ("about 8 in 10"). They re-ordered the fruits so they only grow, and fixed the counter convention: completed GA weeks from LMP, floor, no DAY mode.
- **Rule:** Store every fact as {claim, week convention (GA from LMP), primary source}. Add 2 weeks when converting fertilisation-age sources. No on-screen percentage without a primary source. Size chips must rise in both cm and g (check with a script), and from week 20 fruits are matched by weight. Always run a separate adversarial fact-check agent after research.
- **Seen (35):** 29 claims rejected (9 in w13-27, 9 in w5-12, 6 in w0-4, 5 in w28-40) and 6 size-table fixes. "Heart rate rises when mum speaks" became "it tells mum's voice from a stranger's".

## 8. Audio (9)

### 8.1 Hard edges in the SFX files (5)
- **Mistake:** Takes started on non-zero samples (the impact's first sample was -0.512, a -10.5 dBFS jump). `atrim` was used without `asetpts`, so `afade` silently did nothing. The pop had a doubled attack, the heartbeat lost its first 36 ms, and the kick was cut off at -39 dBFS. A decode clipped a +1.05 dBFS take.
- **Fix:** Every chain now runs highpass, then a 3-4 ms `afade` in, with `asetpts=PTS-STARTPTS` right after `atrim`. The heartbeat got a 0.1 s front pad, and the kick runs 1.0 s, decaying below -60 dBFS. `util.normalize_peak` now uses a 32-bit float intermediate.
- **Rule:** Each SFX file starts at sample 0.000 with a single onset. A 3-10 ms fade-in comes AFTER any filters, and `asetpts` follows `atrim`. Tails decay below -60 dBFS or end with a 30 ms fade. Run a click detector (one-sample jumps above -40 dBFS) on every mix.
- **Seen (5):** `impact.wav`, pops, whooshes, heartbeat pad, kick tail (`scripts/audio/sfx.py`, `util.py`).

### 8.2 Levels set on full-range speakers (4)
- **Mistake:** The riser at 0.6 covered "whole new human" in the 1-4 kHz consonant band (the voice sat 7-12 dB under it). The heartbeat was louder than its own line. The kick and impact had 51-66% of their energy below 80 Hz, so they vanished on phone speakers.
- **Fix:** `Clip.volume` can now be a function of the frame. The riser ducks to 0.2 under the words, starting 0.07 s early because volume is applied about 2 frames late. The kick was rebuilt as a 175->55 Hz sweep plus a 550 Hz knock, and its peak went from -1.87 to **-4.64 dBFS**. The impact got a 300->140 Hz body layer, so through a 200 Hz high-pass it rose from -28.9 to -9 dB relative to the voice.
- **Rule:** On every word, the voice beats all SFX by at least 6 dB in 1-4 kHz and by at least 2 LU momentary loudness. Every SFX sits within about 10 dB of the voice through a 200 Hz high-pass (phone model), so it needs content at 120-600 Hz. `volume={f=>...}` counts clip-local frames.
- **Seen (4):** riser on the payoff line; sub-only kick (`src/audio/clips.ts`).

## 9. Code structure (4)
- **Mistake:** Effects silently never rendered:
  - `s4-halo` was used for both a gradient and a filter.
  - `s5-blur10` was defined in two files, and C01 mounted `FertiliseDefs` twice.
  - The egg light's colour was an invalid string (`rgba(...)` with a hex alpha appended), so the light never drew. Scene2 then matched that broken look.
- **Fix:** The ids were renamed (`s4-sacHalo`) and all filters moved into one `Filters.tsx` defined once. The kits use `<prefix>-<name>-<useId>`.
- **Rule:** Name ids `<scene>-<component>-<name>`, and add `useId()` in reusable kits. Define each filter and gradient once per page. Add a check that fails on duplicate ids in one frame's DOM. Append alpha to 6-digit hex only. When an effect looks weak, first confirm it renders at all.
- **Seen (4):** Scene4 body glow invisible; Scene1 egg light never drawn.

## 10. Performance and rendering (9)
- **Mistake:** 5-6 builders rendered at once and pushed the load average to 48-70. 0.5-scale previews went from 11-20 s to 110-330 s, and the user said the PC was too slow. Chrome hit "Page crashed!" 3 times out of 3 on a masked, blurred layer scaled about 10x past the frame. An orphaned headless Chrome kept running.
- **Fix:** The user's rule became one or two chapters at a time, with one render per agent. `overflow: hidden` on the masked layer fixed the crash. Blur was clipped to the frame and consolidated to one filter per group.
- **Rule:** Run at most 2 render agents, with 1 render each, under `nice -n 15`, and previews at scale 0.4. Give `overflow: hidden` to any masked or blurred layer that scales past 1080x1920. Use 5 or fewer full-frame blur layers per scene. An idle 0.5-scale preview should take under 60 s. Kill orphaned `chrome-headless-shell` after interrupted runs (only when nothing is rendering).
- **Seen (9):** C00 crash in `grip/HandWorld.tsx`; C15/C16 previews took 190-317 s at load ~70.

## 11. Orchestration (36)

### 11.1 Parallel agents coupled to each other (8)
- **Mistake:**
  - Neighbours checked against placeholders or stale renders.
  - Agents shared one scratchpad, so they overwrote each other's helper scripts.
  - Every chapter edited `registry.ts`.
  - Captions changed under the builders mid-task.
  - When a kit lacked a feature, agents copied the kit's internals (C07 `BendEmbryo.tsx`, and C16 copied all of Scene5).
- **Fix:** Polish re-checked against the neighbours' live code, and the orchestrator took over `registry.ts`. Later runs built one chapter at a time, with each chapter's measured END as the next one's contract.
- **Rule:** Build in story order, or at least freeze the upstream END first. Give each agent its own `scratchpad/<id>/`. Only the orchestrator edits shared files. Add missing capabilities to the kit API instead of copying the kit.
- **Seen (8):** C16 built against placeholder C14 and C15; C15 imported the womb kit's internal `geom`.

### 11.2 QA fixes were often wrong (19)
- **Mistake:** 13 of the 15 confirmed findings needed a corrected fix. Examples: an `afade` that was a no-op without `asetpts`, a duplicate scrim that would sit under the flash, and duck curves that muted the flash. 3 of 19 findings were refuted outright; "the fetus shrinks at week 20" measured head width, but the head shrinks relative to the body on purpose. Metrics were not comparable: frame-diff scales differed about 3.5x between agents, and one contrast script counted the text pixels.
- **Fix:** Each finding went to a skeptic verifier that re-measured it, simulated the fix in a scratch copy and wrote a `betterFix`. The fixers re-measured every fix.
- **Rule:** Always run inspect -> skeptic verify (refute, re-measure, simulate) -> fix. Move the probes into `scripts/qa/` with fixed definitions: render without captions, full resolution, 0-255 luma, text pixels excluded. Keep QA prompts scoped and read-only.
- **Seen (19):** workflow `wf_18446f9d-054` (19 findings: 15 confirmed, 3 refuted, 1 unchecked); `mix#6` afade no-op.

### 11.3 Agents died mid-work (9)
- **Mistake:** 7 builders died on API connection errors (`SELF_SIGNED_CERT_IN_CHAIN`), and 2 whole runs were stopped. Partial chapters and 4 polish passes (C02, C07, C15, C16) were left with no result, plus leftover `_qa` preview entries.
- **Fix:** A retry workflow (`birth-long-chapters-retry.js`) re-ran the chapters with a note telling them to continue from the partial work. The builders kept most of the code and cleaned up.
- **Rule:** Make workflows resumable. After each render cycle, a builder writes a progress note in its folder (done, next, known issues). The retry prompt says "continue from the partial work". Before reporting done, grep for `src/scenes` imports and `_qa` entries.
- **Seen (9):** `wf_0598ab61-d20` (C01, C03, C04 and C05 died); `wf_a8d3d205-dd9` (C09 and C11 died).

---

## Orchestrator's own lessons (verified this session)
- **Isolated previews.** One entry per scene or chapter (`src/preview/*`, `src/long/preview/*` generated by `scripts/long-entry.sh`), so a broken neighbour can't break your render.
- **One timing source.** Each scene or chapter has its own `beats.ts`, with every beat tagged `// sync: "<word>"` or `// free`. Re-timing to the voice is then a data edit. Better still, record the voice BEFORE building and build to `vo-words.md`.
- **1-2 agents at a time.** 17 parallel agents overloaded the 10-core Mac, and agents died on connection errors. Renders run under `nice -n 15` and previews at scale 0.4. Kill orphaned `node_modules/.remotion/chrome-headless-shell` processes after interrupted runs.
- **Restarting crashed agents.** Use a RESUME NOTE: continue from the partial files in your folder.
- **Builder -> independent polish** lifts quality from about 6 to about 8/10. The reviewer must re-render and verify, not trust the builder.
- **ElevenLabs.** The website's SFX duration slider was ignored twice (files came out at 1-2 s), so synthesise beds (`womb_bed` in `sfx_long.py`) and loop or trim takes. There is no PayPal, and the pasted API key was invalid. Free alternatives: Gemini TTS in AI Studio, Lyria 3.5 in the Gemini app for music, Pixabay for SFX.
- **whisper.cpp.** `base.en` word times drift by 0.2-0.6 s. Snap them to `silencedetect` phrase boundaries and spread the words by length inside each phrase (`vo.py`, `long_vo.py`). Fit each chapter's speech into its window, and extend the chapter when needed (`--apply-durations`).
- **Loudness.** VO is normalised to -16 LUFS (linear two-pass loudnorm). The final master is -14 LUFS / -1.5 dBTP.
- **Transitions.** `fade()` keeps the EXITING scene opaque, so design handoffs for that. Crossfading two similar silhouettes ghosts; use `focusPull` (blur out, blur in).
- **Chrome "Page crashed!"** happens when a masked or blurred layer is scaled about 10x past the frame. Fix it with `overflow: hidden`.
- **Captions.** Fade a line out before the next line's first word. The last line is an end title. Bright moments need a scrim tied to the bright event.
- **Phone speakers.** Energy below about 150 Hz is inaudible, so SFX need body at 150-600 Hz. Every clip needs a few-ms fade-in to avoid clicks.
- **Hooks.** Frame 0 already moves. Open on the emotional payoff plus a question ("Have you ever wondered...") before the science.
- **Science.** Use one week convention (gestational). Dedicated fact-check agents caught many plausible but wrong claims (section 7.2). Keep the tone neutral on sensitive topics: no pink/blue for the parents, nothing implying choice or feeling.
- **Teaser code.** Copy code from the teaser scenes into new chapters instead of importing it, so the finished teaser never breaks.

## Polish and QA scores

Polish passes (score out of 10, before -> after):

| Piece | Before | After |
|---|---|---|
| Scene1 | 6 | 8 |
| Scene2 | 6 | 8 |
| Scene3 | 6 | 7.5 |
| Scene4 | 6 | 7.5 |
| Scene5 | 5.5 | 7.5 |
| C00 | 6.5 | 8.2 |
| C01 | 6.5 | 8.2 |
| **Average (7 passes)** | **6.07** | **7.84 (+1.77)** |

- Teaser average: 5.9 -> 7.7 (+1.8). Long film so far: +1.7.
- Builder output landed at about 6 every time, and polish never reached 9. To go higher, run a second polish pass, or feed polish the rules above up front.
- Four polish passes were interrupted and have no score: C02, C07, C15, C16.

Script judges (two judges): "wonder" 8.1 / 7.5 (won both), "hook" 7.6 / 7.2, "teacher" 7.3 / 7.0.

Teaser QA (`wf_18446f9d-054`): 19 film findings, plus 3 off-task API-key reports. The verifiers confirmed 15, refuted 3 and left 1 unchecked, and 13 of the 15 needed a `betterFix`. 6 fix agents fixed everything except the digital-silence gaps, which are waiting for the music. Measured results:
- Worst caption contrast: 2.55:1 -> 6.44:1.
- Hook upper-frame motion: 0.29 -> 0.77.
- Kick peak: -1.87 -> -4.64 dBFS.
- C00 max luma step: 79 -> 21/255.

Fact-check: 29 research claims rejected and 6 size-table fixes.

## Sources
- Workflow journals: `~/.claude/projects/-Users-tandeemwork/61186c4b-9f7b-4d8a-9770-68b5e45a7e5f/subagents/workflows/*/journal.jsonl`
- Workflow scripts: `~/.claude/projects/-Users-tandeemwork-birth-teaser/61186c4b-9f7b-4d8a-9770-68b5e45a7e5f/workflows/scripts/`
- QA probes and their outputs: `out/qa/teaser/{audio,verify,retime,viewer,science,refkick,hook}/`
- QA findings with fixes: `briefs/qa-fix-groups.json`

## Added by the user's review (2026-10-10)

### Output folder chaos
- **Mistake:** `out/` grew to 1,383 flat files (1 GB): the preview scripts wrote everything flat with name prefixes (`long-C04-f120.png`), ~40 agents invented their own test names (`qa-refute-ghostc-3.png`, `c08-row2.png`), and nobody cleaned up after a render → look → fix cycle.
- **Fix:** reorganised into one folder per thing (`out/final`, `out/teaser/SceneN`, `out/long/Cxx`, `out/kits/<kit>`, `out/qa/<topic>`, `out/_archive`); scripts now write there; useful QA probes moved to `scripts/qa/`.
- **Rule:** decide the output layout BEFORE the first render and bake it into the scripts; every agent prompt says where scratch goes and to delete it when done.

### Rebuilding instead of reusing the pilot
- **Mistake:** the 30 s teaser's scenes were hard-wired to the teaser's global timing (`src/theme/beats.ts`), so the long film could not mount them; chapter agents copied the code and spent time re-adapting it.
- **Fix:** chapters that match a teaser scene now keep at least 80% of it (C03/C04 ← Scene2, C06 ← Scene3, C09/C11 ← Scene4, C16 ← Scene5) and change only timing and new parts.
- **Rule:** build a pilot's scenes as components that take their timing (a beats object) and size as props. Then a longer cut, a 16:9 version or a sequel mounts them directly.

## Day 2: polish findings C02-C06 (added as chapters finished)
Scores: C02 6.5->7.8, C03 7->8, C04 6.5->7.8, C05 6.5->8, C06 6.5->8 (builders still land at ~6.5 even with CLAUDE.md; polish adds ~1.4).

| Repeat mistake | Seen in | What polish did | Rule |
|---|---|---|---|
| Shapes read as faces/eyes/animals at phone size | C02 (3 beads = smiley), C03 (two chromosome sets = eyes), C05 (two icons level = eyes over a mouth), C06 (dark loop = mouth; week-6 head = chick) | hand-placed asymmetric clusters, diagonal slots, removed catchlights, warmed dark loops | CLAUDE.md 11 (face traps list) |
| Subject too small | C04 26%, C06 26% of frame width | camera curves pushed to 35-40% per beat | 11 |
| Beat-carrying details invisible on a phone | C04 hormone particles 1-2 px, test strip lines; C06 bud pops; C02 day dots | bigger cores + halos, bigger windows | 23 |
| Wrong colours from blending | C02 khaki (dark normal overlay on gold), C05 royal blue (blue multiply on cyan), C06 pale crescent (red screened on red) | same-hue/neutral multiply, moved glow off the hero | 13 |
| A narrated beat never shown | C05 "lungs and gut" layer never lit | added the lit state in the side cut on its word | 22 |
| Light/outline pop when shapes split or swap | C03 pair light sized from the sum of two lobes; C06 double heart while tube became bulge | continuous light area; frame-based handover | 14 |
| Word timing 0.2-0.3 s late | C05, C06 (vo-words.md spread by word length) | measured onsets from the chapter wav (spectrogram/envelope) | 24 |
| Tracker WEEK lands before its spoken word | C02, C03, C06 | orchestrator re-timed weekKeys | 24 |
| Upstream changed mid-build | C03 changed TILT while C04 copied it; C05 END changed while C06 built | polish re-copied and re-diffed against the final upstream | 25 |
| Captions wrap to 3 rows | C03, C04, C06 | (orchestrator) paginate long lines by phrase | 9 |
| Voice clips bleed into neighbours (a chapter's clip holds the next chapter's first words, or loses its last words) | C07/C08, C09/C10, C13/C14, C14/C15 | (orchestrator) re-cut at real pauses; verify by transcribing EVERY clip's first/last words | CLAUDE.md audio: after cutting VO clips, transcribe each clip and compare first/last words with the captions |
| Kit shapes read as animals at phone size | C06, C07 (week 6-7 embryo = duckling: round head, dot eye, red heart like a bill) | flagged for a kit-level fix | 11 |
| Concentric backdrop rings read as a target / frozen ripples | C07 wide shot (womb kit fold rings) | flagged for a kit-level fix | 12 |
| Small body part too small in its own close-up | C08 hand at 16% of frame width (42 px on a phone) during "fingers/webbed" | camera rebuilt to frame the PART (not the whole body) at 35%+ | 11 (the subject of the beat, not the character, gets 35%) |
| Animal read on a body part | C08 bulbous fingertip pads = frog/gecko foot | tapered digits; web a different tone from the digits | 11 |
| Screen-space shade with a hard edge | C08 top shade showed a horizontal line across the head | 8-stop eased falloff | 14 |
