# Storyboard: Hello, World (long film, 2:18.5)

This brief adds to `briefs/00-rules.md`, `src/long/README.md` and `briefs/long/foundations.md`; it does not replace them. The narration is in `script.md`, the sources in `facts.md`, and the counter data in `sizes.json`.

## How to read this
- **Local times:** seconds from the chapter's own frame 0. For C02 to C16, local 0 to 0.5 s is the overlap with the previous chapter (a fade or focus transition).
- **Planned times:** every time is planned. Once the voice take exists, re-time to its word timings. Animate TO beat constants in your `beats.ts`; never hard-code beat frames.
- **"W17 lands 5.25":** the tracker number has finished rolling to 17 at 5.25 s. Each weekKey sits about 0.45 s before its landing time (see the table in the Appendix).
- **Chip text:** read from `sizes.json` from week 4 on, using the stage table below for weeks 1 to 3. The chip always reads "size of {compare} · {length}".
- **Kits:**
  - `E` is the embryo kit (`src/shared/embryo`). It takes a kit week; see the mapping below.
  - `F` is the fetus kit (`src/shared/fetus`). Its week equals the gestational week.
  - `W` is the womb kit (`src/shared/womb`).

## Film-wide rules
1. **On-screen text:** captions and the week tracker with its size chip, nothing else. That means no labels, tags, numbers or words inside the art. The test-strip line, ghost icons, dot rows, rings and rulers are graphics, not text.
2. **Week convention:** gestational weeks, and "week N" means N completed weeks. The counter is hidden during C01. It appears in C02 on the convention line, reading WEEK 01, and rolls to WEEK 02 on the word "two". It hides in C16 after the birth flash.
3. **Tone:** wonder, calm, warm, never graphic.
   - No birth canal, no pain and no NICU imagery.
   - Parents' contributions use neutral tints (gold and peach), never pink and blue.
   - Nothing implies choice or feeling: the first movements are spontaneous, the face movements are random, and the baby does not "see" or "understand".
4. **Safe zones:** the caption zone (y 1300 to 1560) stays calm and dark; use `<CaptionShade>`. The tracker band (y 100 to 290) stays clear from C02 on. C01 may use that band, but keep the thumbnail calm there.
5. **Week 1 chip:** it reads "last period · the count starts". It must NOT say "no baby yet": shown over a fertilised cell, that wording reads as a political statement.
6. **Callbacks** (each needs its set-up to land):

| Set-up | Pay-off |
|---|---|
| Dim, unlit heart tube waits (C05 end) | Lights up, first beat (C06) |
| Womb wall perfectly still while it wiggles (C07) | First flutter ripples the wall (C11) |
| Glint runs along the sealed eyelid in the face sweep (C09) | Eyelids open (C12) |
| One silent low sound ring and a tiny startle at W19 (C11) | Hears mum's heartbeat (C12), knows her voice (C15) |
| "No air. Not yet." (C14) | "A first breath of air." (C16) |
| One gold cell (C01, C02) | One gold speck by the gripping hand (C16) |
| Chip stays "0.1 mm" while the cells multiply (C03) | Proves "it doesn't grow" |

### Stage chip, weeks 1 to 3
GA day = round(week × 7), where day 14 is fertilisation. This replaces `src/long/data/stages.ts`.

| GA day from | stage (bright) | detail (dim) | Seen in |
|---|---|---|---|
| 0 | last period | the count starts | C02 |
| 14 | one cell | 0.1 mm | C02 |
| 15 | dividing | 0.1 mm | C03 |
| 18 | morula | 0.1 mm | C03, C04 |
| 19 | hollow ball | 0.1–0.2 mm | C04 |
| 21 | implanting | 0.1–0.2 mm | C04 |
| week 4 on | size chip from `sizes.json` | | C04 end onward |

### Embryo kit: gestational week to kit `week`
The kit's labels run 1 to 2 weeks early, except at week 6 (see foundations.md).

| GA | 4.0–4.3 | 4.5 | 4.7 | 5.0 | 5.5 | 6.0 | 7.0 | 7.5 | 8.0 | 9.0–9.5 |
|---|---|---|---|---|---|---|---|---|---|---|
| kit `week` | 3.0 | 3.5 | 4.0 | 4.6 | 5.2 | 6.0 (= Scene3) | 6.6 | 7.0 | 7.5 | 8.5–8.99 |

Fetus kit: `week` = GA. The one exception is C09, which starts at kit week 10.6 so the fingers freed in C08 stay free.

---

## C00 · The question (intro hook)
counter hidden · net 8.5 s (durationSec 8.5, first chapter) · global 0:00.0–0:08.5 · **new; reuses the C16/Scene5 hand-grip art for its opening image** · C01 then follows by a hard CUT (match cut on the egg)

> Have you ever wondered how you began? Long before your first breath, you were a single cell, smaller than a grain of salt.

Why: the viewer needs a reason to stay before the science starts. Open on the emotional payoff, ask the question, then "rewind" to the beginning.

- **START (frame 0 = THE thumbnail of the whole film):** the iconic close-up from the end of the film: a newborn's tiny hand gripping an adult's finger, warm medium-dark light, floating warm bokeh, one tiny gold speck glowing in the palm. Already moving: slow push-in. Copy the grip art from src/scenes/Scene5 (grip / hand components) into the chapter folder and adapt; it must look like the same hands as C16.
- **0.4–2.6 "Have you ever wondered how you began?":** slow push toward the palm; the gold speck brightens gently on "began".
- **2.8–3.6:** the camera dives INTO the gold speck: zoom-through with light streaks rushing outward (a rewind feel), warm room colours draining into the dark plum world. Elegant, not a cheesy warp.
- **3.2–5.0 "Long before your first breath,":** the dive settles into darkness; the speck resolves into a single glowing cell.
- **5.0–6.2 "you were a single cell,":** the cell is the gold ZYGOTE (exactly Scene1's END look: gold-white core, translucent zona ring), centred, breathing ±2%.
- **6.2–7.6 "smaller than a grain of salt.":** a big translucent salt crystal (a slightly irregular cube, cool white-cyan facets, crisp specular edges) slides in beside the cell and dwarfs it: crystal edge ≈ 3x the cell diameter (salt grain ~0.3 mm vs cell ~0.1 mm). Tiny camera pull-back so both read at phone size. No text, no rulers.
- **7.6–8.5 END:** the crystal slides away; time keeps rewinding: the gold drains from the cell to cool pearly cell-white (it becomes the unfertilised egg), it eases to (540, 560) at radius 100, the corona cells and the out-of-focus tube walls fade in. The final frame must be IDENTICAL to C01's frame 0 (Scene1's opening frame) so the hard cut is invisible.
- **Accuracy:** a human zygote is about 0.1 mm across; a table-salt grain about 0.3 mm, so "smaller than a grain of salt" is true. The rewind from gold zygote to pearly egg is a deliberate "going back in time" device: C01 then shows how that one cell came to be.
- **Sounds (for the orchestrator):** soft room tone + gentle music start; a reversed whoosh on the dive (2.8); a soft chime on "single cell" (5.2); a faint glassy clink when the crystal lands (6.4); a soft reverse swell into the cut (7.8).

## C01 · The obstacle course
W02, counter hidden · net 8.5 s (durationSec 8.5, first chapter) · global 0:00.0–0:08.5 · **reuses Scene1 (extends it)**

> It starts with a race. Hundreds of millions set off on an obstacle course. Only one gets in.

- **START (frame 0 = thumbnail):** Scene1's opening frame. Dark, out-of-focus tube walls at the edges with parallax. The pearly egg (zona ring plus a loose halo of corona cells) glows small in the upper half. No tracker.
- **0.15:** the swarm bursts in from the bottom (Scene1 raceStart: 3 depth layers, travelling-wave tails).
- **0.5–2.1 "It starts with a race.":** the camera starts pushing up with the swarm.
- **2.5–5.4 "Hundreds of millions set off on an obstacle course.":** the camera travels upward through three soft gates. The egg stays visible above as the goal. The crowd thins by density only, with no numbers.
  - 2.6: a glowing fibrous mucus mesh. Most sperm tangle, bounce or fade.
  - 3.6: a wide, dark open space (the womb). Many drift off.
  - 4.6: a narrow gate (the tube entrance). The stream thins to a trickle.
- **5.0–5.8:** a few dozen survivors rest against the ciliated tube wall, light up one by one, and swim on with whipping tails.
- **5.9–7.1 "Only one gets in.":** the fertilisation itself.
  - 5.9: one sperm with a thin gold rim edges ahead (slow-motion ease-in).
  - 6.6: it touches the zona; its head glows and it slips through.
  - 7.0: fusion. A flash, then a bright ring ripples across the egg surface (the calcium wave) with a few stylised sparkles.
  - 7.0–8.0: the zona ring thickens and shifts tint, the other sperm bounce off and drift away, and the egg warms from cool cell-white to gold.
- **END (8.0–8.5):** Scene1's END state. The zygote sits at (540, 860), core r150, zona r about 175, breathing ±2%.
- **Accuracy:**
  - It is an obstacle course plus a timing game, not a sprint. The fastest sperm do not simply win.
  - Exactly one sperm fuses with the egg.
  - The zona block is strong, not absolute: never show the shell as impenetrable.
  - The sparkles are stylised. The egg does not "flash" light.

## C02 · Week two already
W01 → W02 · net 5.5 s (durationSec 6.0, enters by fade) · global 0:08.0–0:14.0 · **reuses the Scene1 END state, plus new elements**

> Doctors already call this week two: they count from the last period.

- **START:** the C01 END state, exactly.
- **0–6.0:** the zygote breathes under a slow push-in (1.00 → 1.04). Inside it, two soft pronuclei in two warm neutral tints (gold and peach) drift in from opposite sides and settle side by side. They never merge into one bubble.
- **0.6:** the tracker fades in reading WEEK 01, with the chip "last period · the count starts".
- **0.8–2.8 "Doctors already call this week two:":** the number rolls from 01 to 02 and lands at about 2.6, on "two". The chip changes to "one cell · 0.1 mm".
- **3.0–4.8 "they count from the last period.":** a row of 14 small dots draws itself under the zygote (y about 1170, above the captions).
  - Dot 1 glows rose (the period).
  - A light runs from dot to dot, and dot 14 flares gold (conception) at 4.6.
  - No labels.
- **4.9–5.5:** the dots fade, and the zygote begins to elongate (anticipation of the first split).
- **END (5.5–6.0):** the zygote at (540, 860), core r150, zona r about 175, slightly elongated.
- **Accuracy:**
  - Fertilisation is about gestational day 14, that is week 2, 0 days. The convention is said once, here, and never again.
  - The pronuclei stay separate until the first division, so don't merge them.
  - Don't show "23 / 46" or X/Y tags.

## C03 · Split without growing
W02 · net 8.0 s (durationSec 8.5, enters by fade) · global 0:13.5–0:22.0 · **reuses Scene2 (two, four, hundreds), cleavage part only**

> One cell becomes two… four… eight. But it doesn't grow: each cell just gets smaller.

- **START:** the C02 END state (Scene2 START plus the elongation).
- **0.5–4.0 "One cell becomes two… four… eight.":** the cell divides.
  - 1.3, "two": squash, a pinching furrow, then a springy overshoot. The chip changes to "dividing · 0.1 mm".
  - 2.2, "four": the two cells split again, slightly out of step.
  - 3.2, "eight": eight cells, then a quick 16 at 3.8.
- **4.5–5.5 "But it doesn't grow:":** a hold. A faint dashed circle traces the zona ring, whose size has not changed, as a highlight sweeps around it.
- **5.7–7.0 "each cell just gets smaller.":** the cascade reaches a mulberry-like morula, with every cell visibly smaller. The chip changes to "morula · 0.1 mm" (about 6.05).
- **Throughout:** cilia on the tube wall carry the cluster gently (a parallax background).
- **END (8.0–8.5):** the morula inside the same-size zona ring at (540, 860).
- **Accuracy:**
  - The cleavage stages stay 0.1–0.2 mm and the zona cannot expand, which is why the chip stays at 0.1 mm.
  - Divisions are not perfectly in step; 3-, 5- and 6-cell moments are fine.

## C04 · A message to mum
W02 → W03 → W04 · net 8.0 s (durationSec 8.5, enters by fade) · global 0:21.5–0:30.0 · **reuses Scene2 (hundreds, implant), plus a new hCG/test inset**

> Now a hollow ball, it burrows into the womb wall and sends a message: the hormone a pregnancy test detects.

- **START:** the C03 END state.
- **0.4–1.6 "Now a hollow ball,":** a fluid bubble inflates inside the morula. The cells spread into a thin rose-plum outer shell, leaving a bright gold knot on one side, which gets a soft highlight at 1.2. The chip changes to "hollow ball · 0.1–0.2 mm".
- **1.5–2.4 (the hatch):** the zona stretches thin, a small opening appears, and the ball squeezes out in a figure-8 and pops free with an overshoot (2.2). The empty shell crumples and fades.
- **2.0–3.8 "it burrows into the womb wall":** the camera reveals the thick, velvety rose endometrium, with folds and glints of vessels (Scene2 implant).
  - The ball rolls and sticks at 2.9.
  - 3.0–4.0: it sinks in, the lining closes over it like a blanket, and root-like threads reach toward glowing vessels.
  - The chip changes to "implanting · 0.1–0.2 mm"; W03 lands at 3.2.
- **4.0–5.0 "and sends a message:":** tiny glowing particles leave the outer cells, enter a vessel and stream away.
- **5.2–7.0 "the hormone a pregnancy test detects.":** a clean, brandless test strip slides in at the side of the hero box and draws its second line at 6.8. Beside it, a short row of glow dots doubles 1 → 2 → 4 → 8 (dots only). W04 lands at 7.3 (the missed period), and the chip changes to "size of a poppy seed · 1 mm".
- **END (7.5–8.5):** a warm rose close-up of the buried embryo, and the focus starts to soften.
- **Accuracy:**
  - Implantation begins about a week after fertilisation and is complete a few days later.
  - hCG is made by the outer cells (the future placenta) as the embryo attaches. Never call it the embryo's "first" message.
  - A home test is reliable around the missed period (about week 4).
  - Don't show loss statistics or spotting.

## C05 · Three layers
W04 · net 8.5 s (durationSec 9.0, enters by focus) · global 0:29.5–0:38.5 · **new (E, kit week 3.0 → 4.0)**

> Week four: the embryo forms three layers. One builds brain and skin. One, heart and bone. One, lungs and gut.

- **START:** focus pulls in on a top view of a flat, two-tone glowing disc floating between two soft bubbles (the amniotic sac above, the yolk sac below).
- **0.5–2.8 "Week four: the embryo forms three layers.":** the layers form.
  - 1.2–1.9: a bright line draws itself down the middle (the primitive streak).
  - 1.9–2.8: cells pour through it and a third colour slides in between.
  - 2.5–3.2: the view tilts to a side cut, so the three stacked layers read clearly (cool, rose, gold).
- **3.2–4.6 "One builds brain and skin.":** the cool top layer glows, and soft filled ghost glyphs of a brain and skin bloom above it, about 0.6 s each.
- **4.9–6.1 "One, heart and bone.":** the rose middle layer glows, with heart and bone ghosts.
- **6.4–7.6 "One, lungs and gut.":** the gold bottom layer glows, with lungs and gut ghosts.
- **7.6–8.5 (silent):** the disc stretches into a slipper shape (kit 3.5 → 4.0). A soft groove draws down its centre and two ridges rise on either side. Meanwhile a dim, unlit curved tube waits in the future chest: the heart tube, not yet beating.
- **END (8.5–9.0):** the grooved embryo with its ridges leaning in, and the dim tube.
- **Accuracy:**
  - The layer lists are simplified; the brief allows that.
  - The poppy-seed size applies at the END of week 4; at its start the disc is about 0.2 mm, and "size of" on the chip is fine.
  - The groove (the first sign of brain and spinal cord) comes before the heart, so it is shown here before the heart lights.
  - Don't say "the brain forms in week 4".

## C06 · First heartbeats
W05 → W06 · net 8.0 s (durationSec 8.5, enters by fade) · global 0:38.0–0:46.5 · **reuses Scene3 (heartStarts; E kit 4.0 → 6.0, W early look)**

> Week five: a tube of heart cells starts to squeeze, all by itself. By week six, a tiny heart is beating.

- **START:** the C05 END state.
- **0.2–1.3:** the ridges zip shut, starting in the middle and running toward both ends, with a click-sparkle at the head end first, then the tail end. The embryo curls into a small C (kit 4.0 → 4.6). Scene3's sac (r about 330, centred at 540, 860) and the yolk sac on its stalk resolve around it.
- **0.5–1.1 "Week five:":** W05 lands at 0.6, and the chip reads "size of a sesame seed · 2 mm".
- **1.2–3.0 "a tube of heart cells starts to squeeze,":** the first beat.
  - 1.2–2.3: the curved tube fills with warm C.heart light.
  - 2.3–2.8: anticipation; everything dims and goes still (the kit's `hold`).
  - 2.9: the first beat lands (`firstBoost`). A squeeze travels along the tube like a wave and ends in a ring flash through the sac.
- **3.2–4.1 "all by itself.":** a steady beat at about 110 per minute (heartbeat from 2.9 s, 110), each beat sending out a soft ring.
- **4.8–5.6 "By week six,":** W06 lands at 5.3, and the chip reads "size of a lentil · 6 mm".
- **5.7–7.1 "a tiny heart is beating.":** the embryo grows into Scene3's week-6 form (kit 6.0).
  - Arm buds pop near the shoulders (5.6, springy), then leg buds a beat later (6.0), and a dark eye spot appears.
  - The camera pushes toward the heart, to about 1.15x.
  - Optional, 6.2–7.2: one soft fan-shaped ultrasound wedge sweeps across the sac, with the beat flickering inside it. This hints that week 6 is when a scan usually sees it.
- **END (8.0–8.5):** Scene3's END state: the heart beating, camera at about 1.15x.
- **Accuracy:**
  - The first beats come at about week 5, 0 to 2 days. It is a single tube with no chambers, so never draw a heart shape.
  - The teaser line "week six: starts to beat" was a week late; this chapter fixes it.
  - The neural-tube zip and the limb buds are visual only.

## C07 · First move
W07 · net 6.5 s (durationSec 7.0, enters by fade) · global 0:46.0–0:53.0 · **new (E kit 6.0 → 7.0, W early look)**

> Week seven: its very first move. A tiny wiggle, months before anyone can feel it.

- **START:** the C06 END state.
- **0.3–1.6:** the arm buds lengthen and their tips flatten into paddles, with no fingers and no elbows. The head swells ahead of the body. W07 lands at 0.45, and the chip reads "size of a blueberry · 1 cm".
- **0.5–1.1 "Week seven:" and 1.2–2.4 "its very first move.":** at 2.0, the embryo makes one tiny sideways bend of head and rump, about 1 s long, with soft motion arcs.
- **2.8–3.6 "A tiny wiggle,":** a second small bend, then stillness.
- **3.8–5.4 "months before anyone can feel it.":** the camera eases back to show the sac small inside the dark womb. The outer womb wall stays perfectly still, with no ripple; this is the set-up for C11.
- **END (6.5–7.0):** the embryo floats still, and a slow push-in begins.
- **Accuracy:**
  - The first movements come at about 7 to 7.5 weeks. They are spontaneous (made by spinal circuits), not "waving" or chosen.
  - A mother first feels movement at 16 to 24 weeks.

## C08 · Webbing and tail
W08 → W09 · net 7.0 s (durationSec 7.5, enters by fade) · global 0:52.5–1:00.0 · **new (E kit 7.5 → 8.99, W early look)**

> Week eight: its fingers are webbed, and it even has a little tail. Both fade away, right on cue.

- **START:** the C07 END state, with the push-in arriving at a big side view. The paddle hand near the face and the small tapering tail at the rump are both in frame.
- **0.5–1.1 "Week eight:":** W08 lands at 0.5, and the chip reads "size of a raspberry · 1.6 cm". The heart glow pulses noticeably quicker, heading for its week-9 peak (no numbers).
- **1.2–2.2 "its fingers are webbed,":** a soft gold ring on the hand, with five finger rays visible inside the webbing.
- **2.4–3.8 "and it even has a little tail.":** the ring moves to the tail tip. The tail stays still and never wags.
- **4.3–5.2 "Both fade away,":** the webbing turns to fine gold dust that drifts off from tip to base, revealing short, stubby fingers that flex once. The same sparkle dissolves the tail tip while the body lengthens and uncurls a little (kit 7.5 → 8.99). W09 lands at 5.0, and the chip reads "size of a cherry · 2.3 cm".
- **5.3–6.1 "right on cue.":** hold on the free fingers.
- **END (7.0–7.5):** the embryo with free, stubby fingers and no tail, and the focus starts to soften.
- **Accuracy:**
  - The webbing cells die off on schedule (planned cell death) between weeks 8 and 10.
  - The tail goes by about week 10, through cell death plus the body outgrowing it. It is an extension of the developing spine, not a monkey tail.
  - Keep it wondrous ("sculpting"), never violent.
  - Toes lag slightly behind fingers.

## C09 · Fetus
W10 → W11 → W12 · net 9.0 s (durationSec 9.5, enters by focus) · global 0:59.5–1:09.0 · **reuses Scene4 (weekTwelve, fingers, toes, face; F kit 10.6 → 12, W mid look)**

> Week ten: every major organ is in place. The embryo becomes a fetus. Week twelve: fingers, toes, a face.

- **START:** focus pull into the fetus kit at week 10.6 in the Scene4 sac world.
- **0.5–1.1 "Week ten:":** W10 lands at 0.6, and the chip reads "size of a strawberry · 3.1 cm".
- **1.2–2.8 "every major organ is in place.":** soft, wordless organ glows tick on inside the translucent body, about 0.25 s apart: heart, brain, lungs, liver, kidneys, gut.
- **3.2–4.7 "The embryo becomes a fetus.":** a warm level-up glow sweeps from head to toe, and the C-curl relaxes into a more baby-like shape (curl 0.7 → 0.5).
- **4.9:** W11 lands, and the chip reads "size of a fig · 4.1 cm". The cord and placenta fade in (placenta on the upper-right wall).
- **6.0–6.6 "Week twelve:":** W12 lands at 6.5, and the chip reads "size of a lime · 5.4 cm" (Scene4 weekTwelve).
- **6.8–9.0 "fingers, toes, a face.":** three highlights, one per word.
  - 6.8 "fingers": the hand opens and the fingers spread, with a soft gold ring.
  - 7.4 "toes": the toes curl.
  - 8.0 "a face": a light sweeps over the forehead, nose, lips and closed eye, and a tiny glint runs along the sealed eyelid. This plants C12.
- **END (9.0–9.5):** Scene4's week-12 fetus in the sac.
- **Accuracy:**
  - The change of name at week 10 (8 weeks after fertilisation) is a convention, not a sudden event.
  - "In place" does not mean mature.
  - The eyelids are sealed at 12 weeks.
  - Keep the organ glows soft and non-anatomical.

## C10 · Hands of its own
W13 → W17 · net 10.0 s (durationSec 10.5, enters by fade) · global 1:08.5–1:19.0 · **new (F kit 13 → 17)**

> Week fifteen: it sucks its thumb. Week seventeen: fingerprints, set for life, different even from an identical twin's.

- **START:** the C09 END state.
- **Counter:** each week has about 1.5 s to read.

| Week | Lands at | Chip |
|---|---|---|
| W13 | 0.45 | size of a peach · 7.4 cm |
| W14 | 1.95 | size of a lemon · 8.7 cm |
| W15 | 3.45 | size of an apple · 10.1 cm |
| W16 | 4.95 | size of an avocado · 11.6 cm |
| W17 | 6.45 | size of a pomegranate · 13 cm |

- **0.4–3.0 (silent):** an X-ray-style glow inside the translucent body. The arm and leg bones warm from pale cartilage-blue to bone-white, from the middle of each shaft outward. The skull plates grow as islands inside a soft membrane, leaving soft gaps.
- **3.2–5.0 "Week fifteen: it sucks its thumb.":** the near hand drifts up and the thumb meets the lips at 4.6 (pose `thumbSuck`), with gentle rhythmic cheek pulses. No match-cut to a child, and no handedness cue.
- **6.1–6.8 "Week seventeen:":** the camera pushes in to one fingertip.
- **6.9–8.3 "fingerprints, set for life,":** ridge lines ripple outward like rings on a pond from 2 or 3 glowing start points. Where the waves meet, they settle into a whorl that locks with a soft click-glow at 8.1.
- **8.5–10.2 "different even from an identical twin's.":** a second fingertip slides in beside the first, runs the same ripple, and settles into a visibly different pattern, which locks at 10.0.
- **END (10.0–10.5):** two glowing fingertips side by side.
- **Accuracy:**
  - Thumb-sucking is shown from week 15, the earliest age studied. The right-thumb and handedness link is left out (one small study).
  - The fingerprint ridges are set by about week 17.
  - The bones were already hardening from about week 7 to 9; don't imply they "start" here. Most of the skull vault forms from membrane, not cartilage.

## C11 · The first kick she feels
W18 → W20 · net 9.0 s (durationSec 9.5, enters by focus) · global 1:18.5–1:28.0 · **reuses Scene4 (weekTwenty, kick; F kit 18 → 20, W mid look)**

> Around week twenty, its mother feels it move for the first time. A flutter… then, a kick.

- **START:** focus pulls back from the fingertips to the whole fetus in the sac.
- **0.45 (W18 lands; chip "size of a sweet potato · 14.2 cm"):** a fine shimmer of lanugo shows along the outline, plus a thin vernix sheen. The kit does this by week.
- **1.95 (W19 lands; chip "size of a mango · 15.3 cm"):** one slow, wide, low sound ring (`<SoundWaves>`) rolls in through the womb wall. The ear glows, and the fetus gives a tiny startle at 2.3. This silent plant sets up C12.
- **3.0–4.0 "Around week twenty,":** W20 lands at 3.45, and the chip reads "size of a banana · 25.6 cm".
  - The Scene4 weekTwenty spring-morph takes the fetus to week-20 proportions; the sac grows and the camera pulls back.
  - A thin measuring line along the body extends from the bottom to the heel. This explains the jump in the chip's length (it now measures head to heel) without words.
- **4.1–6.1 "its mother feels it move for the first time.":** the fetus stretches.
- **6.5–7.2 "A flutter…":** tiny bubble-like flutter ripples spread across the womb wall, the first time the wall has moved (the C07 pay-off).
- **7.6–8.5 "then, a kick.":** the Scene4 kick.
  - 7.6: the leg tucks (`legKick` −0.35).
  - 8.0: it kicks out fast and follows through.
  - The kick ripple sends rose and gold rings through the sac with a small flash, and the camera shakes 2 to 4 px (`kickShake`).
- **END (9.0–9.5):** the fetus settles into a gentle float.
- **Accuracy:**
  - The baby has moved since week 7. Mothers first FEEL it at 16 to 24 weeks, often after 20 with a first baby, and as a flutter before kicks.
  - First reaction to sound is at about week 19, low and middle pitches first.
  - Don't show kick counts.

## C12 · The senses wake
W21 → W27 · net 12.5 s (durationSec 13.0, enters by focus) · global 1:27.5–1:40.5 · **new (F kit 21 → 27, W mid look, `<SoundWaves>`)**

> Week twenty-two: it can hear its mother's heartbeat, even her tummy rumbling. Around week twenty-seven, its eyelids, sealed for months, open. And it blinks.

- **START:** focus pulls into a medium shot of the fetus's head, with the dim, warm womb wall beyond.
- **Counter:** about 1.4 s per week.

| Week | Lands at | Chip |
|---|---|---|
| W21 | 0.45 | size of an ear of corn · 27.3 cm |
| W22 | 1.75 | size of a grapefruit · 28.9 cm |
| W23 | 3.15 | size of an eggplant · 30.6 cm |
| W24 | 4.55 | size of a head of romaine · 32.3 cm |
| W25 | 5.95 | size of a bunch of bananas · 33.9 cm |
| W26 | 7.35 | size of a coconut · 35.6 cm |
| W27 | 8.75 | size of a bunch of celery · 36.6 cm |

- **1.4–2.1 "Week twenty-two:":** W22 lands.
- **2.2–3.8 "it can hear its mother's heartbeat,":** slow, wide, low sound rings pulse in from the mother's side at a calm heartbeat rhythm (about 70 per minute), and the ear glows with each one.
- **4.0–5.3 "even her tummy rumbling.":** one wobbly, bubbly ring rolls through, and the fetus gives a tiny startle (gentle humour).
- **5.3–8.3 (silent):** the rings fade. The body fills out (the kit's thin, wrinkly skin at 24 to 26). Small random face movements flicker: one brow twitch, a lip corner. The camera glides to an extreme close-up of the closed eye, with soft lashes and the thin glowing seam along the lid (the glint from C09).
- **8.3–9.3 "Around week twenty-seven,":** W27 lands at 8.75.
- **9.5–11.4 "its eyelids, sealed for months, open.":** the seam slowly parts (`eyeOpen` 0 → 1, kit week 27), revealing a dark, glossy, neutral eye with a warm amber catch-light. A dim rose-red glow filters through the womb wall behind it.
- **11.8–12.4 "And it blinks.":** one slow, soft blink at 12.2, then hold. This is the most tender beat of the film.
- **END (12.5–13.0):** the eye open, held.
- **Accuracy:**
  - Cleveland Clinic places hearing the mother's heartbeat, breathing and stomach at week 22. Never say it "understands" or "recognises" voices yet.
  - The lids sealed at weeks 10 to 11 and open at 26 to 28; "around week twenty-seven" sits mid-range.
  - The womb is dim, not dark; the baby does not "see" images.
  - The face movements are random, not happy smiles.
  - Viability (week 24) passes here without comment, by choice; see script.md.

## C13 · Brain spurt
W28 → W31 · net 8.0 s (durationSec 8.5, enters by focus) · global 1:40.0–1:48.5 · **new (F kit 28 → 31, W late look)**

> Week thirty: its brain adds about four teaspoons a week, folding as it grows.

- **START:** focus pulls from the eye into the head: a side view of a stylised glowing brain inside the translucent head. It already shows a few shallow main grooves, including the deep side fissure; it does not start smooth.
- **Counter:**

| Week | Lands at | Chip |
|---|---|---|
| W28 | 0.45 | size of a cauliflower · 37.6 cm |
| W29 | 1.95 | size of a butternut squash · 38.6 cm |
| W30 | 3.45 | size of a cabbage · 39.9 cm |
| W31 | 4.95 | size of a spaghetti squash · 41.1 cm |

- **Teaspoon drops:** at 1.95, 3.45 and 4.95, a small glowing teaspoon tips one bright drop into the brain, which swells slightly.
- **3.1–3.7 "Week thirty:" and 3.8–5.9 "its brain adds about four teaspoons a week,":** the drops continue on the week landings.
- **6.1–7.1 "folding as it grows.":** more and finer grooves draw themselves across the surface, like paper crumpling to fit a small box.
- **7.0–8.5:** the camera pulls back to the whole baby, which begins a slow, graceful half-somersault toward head-down (`headDown` 0 → 0.6).
- **END (8.0–8.5):** the whole baby, mid-turn.
- **Accuracy:**
  - About 22 mL a week, roughly 4.5 teaspoons; that is an average from premature babies' MRI.
  - Never say "faster than ever": growth is similar just after birth.
  - The brain is already partly folded at 29 weeks.

## C14 · Practice breaths
W32 → W36 · net 8.5 s (durationSec 9.0, enters by fade so the turn continues) · global 1:48.0–1:57.0 · **new (F kit 32 → 36, W late look)**

> It practises breathing, though there's no air. Not yet. By week thirty-six, its lungs are probably ready.

- **START:** the C13 END state, mid-turn.
- **Counter:**

| Week | Lands at | Chip |
|---|---|---|
| W32 | 0.45 | size of a cantaloupe · 42.4 cm |
| W33 | 1.85 | size of a pineapple · 43.7 cm |
| W34 | 3.25 | size of a large papaya · 45 cm |
| W35 | 4.65 | size of a honeydew melon · 46.2 cm |
| W36 | 6.05 | size of a mini watermelon · 47.4 cm |

- **0–1.6:** the turn completes (`headDown` 0.6 → 1), with a soft downward glow under the head.
- **0.6–1.8 "It practises breathing," and 2.0–3.1 "though there's no air.":** the chest and diaphragm rise and fall in a slow episode (pose `breathe`), with a soft rhythm line beside the chest (a graphic, not text). Faint fluid swirls ease in and out at the mouth, with no bubbles.
- **3.6–4.3 "Not yet.":** the rhythm pauses, a normal rest, and holds.
- **5.7–6.6 "By week thirty-six,":** W36 lands at 6.05.
- **6.7–8.2 "its lungs are probably ready.":** an inset lung tree draws itself inside the chest and branches into grape-like sacs. A shimmering golden film (surfactant) coats them; one practice pulse passes through, and the coated sacs stay round.
- **Throughout:** the kit's fat grows with the week, so the wrinkles smooth out with no beat of their own.
- **END (8.5–9.0):** the head-down baby, with the inset fading.
- **Accuracy:**
  - The lungs hold fluid the baby makes itself; all oxygen comes through the placenta. Don't show air or say "breathes amniotic fluid".
  - "Probably" is required: NHS says "probably mature enough" at 36, and the lungs keep developing after birth.
  - Most babies are head-down well before the end; show this turn as the "settling", not as unusual.

## C15 · Her voice
W37 → W39 · net 6.0 s (durationSec 6.5, enters by fade) · global 1:56.5–2:03.0 · **new (F kit 37 → 39, W late look, `<SoundWaves>`)**

> Now it can tell its mother's voice from a stranger's, and after birth, it prefers hers.

- **START:** the C14 END state. The head-down baby fills most of the sac, eyes closed, gently cramped, and the framing moves toward Scene5's START (sac r about 400, centred at 540, 860).
- **Counter:**

| Week | Lands at | Chip |
|---|---|---|
| W37 | 0.45 | size of a small pumpkin · 47.9 cm |
| W38 | 2.45 | size of a large honeydew · 48.6 cm |
| W39 | 4.45 | size of a small watermelon · 49.3 cm |

- **0.5–3.4 "Now it can tell its mother's voice from a stranger's,":** warm rose and gold sound rings roll in from the mother's side. The baby's face takes on a gentle glow and makes a small settling movement (1.0–2.0). At 2.4, cooler cell-cyan rings arrive from the other side and get a smaller, different response, with no glow.
- **3.7–5.4 "and after birth, it prefers hers.":** the warm rings return and the baby settles, calm.
- **END (6.0–6.5):** head-down, cramped and warm.
- **Accuracy:**
  - This is telling a familiar voice from a stranger's, not understanding words.
  - Don't show "her voice speeds its heart": that rise came from a recording, and live speech gave mixed results.
  - The preference after birth is from newborn sucking studies.

## C16 · Hello, world
W40 → birth → newborn · net 15.5 s (durationSec 16.0, enters by focus, which hides the kit-to-Scene5 mismatch) · global 2:02.5–2:18.5 · **reuses Scene5 (weekForty, birth, human, hello), plus a new lungs insert**

> Week forty: full term. Then… light. A first breath of air. A finger in its palm, and it holds on tight. One cell has become a whole new human. Hello, world.

- **START:** Scene5's START: the full-term baby curled head-down, filling the big sac (r about 400), in a warm deep-rose world where the womb gently breathes.
- **0.9–1.5 "Week forty:":** W40 lands at 1.2, and the chip reads "size of a pumpkin · 49.9 cm" (Scene5 weekForty, reveal and settle).
- **1.6–2.3 "full term.":** hold.
- **2.0–3.4:** slow, warm concentric rings pulse through the womb walls (labour, kept abstract).
- **3.2–3.7 "Then…" and 4.1–4.6 "light.":** Scene5 birth.
  - 3.6: a white-gold bloom rises from the bottom of the frame.
  - The walls peel open like curtains, and a gold-white wash peaks at 4.6.
  - The tracker fades out from 4.0.
  - Nothing anatomical.
- **5.0–6.6 "A first breath of air." (VO 5.2–6.5):** two muted-rose, liquid-filled lung trees inflate branch by branch over a few breaths, turning bright and airy as the droplets retreat.
  - One soft gold glow pulses once in the chest between them (the heart switching to its new route, with no diagram).
  - 6.4: the first cry appears as a soft light burst, not text.
  - The image settles into a warm, medium-dark world, with the caption zone dark.
- **6.8 (Scene5 human):** an adult finger slides into the newborn's open palm from the side.
- **7.0–8.1 "A finger in its palm,":** the tiny fingers curl around it one by one (7.9–8.8).
- **8.3–9.5 "and it holds on tight.":** a squeeze pulse. When the finger eases back slightly, the grip tightens (9.3).
- **10.0–12.9 "One cell has become a whole new human.":** a slow push-in, with breathing light and floating warm specks. One tiny gold dot glows among them (11.4–12.6), echoing the single gold zygote. Optional: one slow warm ring passes softly across the frame (mum's voice, the C15 pay-off).
- **13.6–14.6 "Hello, world.":** Scene5 hello. The global caption lands; don't draw it in the art.
- **14.6–16.0:** hold on the grip. The last frame is the end thumbnail.
- **Accuracy:**
  - Full term is 39+0 to 40+6 weeks; the chip's 49.9 cm matches "about 50 cm".
  - Keep the birth abstract so it is true for caesarean births too.
  - Within minutes the heart reroutes the blood; show it only as the single glow (the VO no longer explains it).
  - The grip is an automatic reflex triggered by pressure in the palm. Never suggest viewers test it, and never show the baby hanging by its grip.

---

## Appendix: build notes for the orchestrator

**1. `src/long/chapters.ts`:** replace CHAPTERS with this. Times are chapter-local seconds; `D = 1/7` already exists there.
```ts
{ id: "C01", title: "The obstacle course",   durationSec: 8.5,  transition: "cut",   weekKeys: [[0, 1]], trackerHide: [[0, 8.6]] },
{ id: "C02", title: "Week two already",      durationSec: 6.0,  transition: "fade",  weekKeys: [[1.9, 1], [2.15, 2]] },
{ id: "C03", title: "Split without growing", durationSec: 8.5,  transition: "fade",  weekKeys: [[0.7, 2], [1.0, 2 + D], [5.9, 2 + 3 * D], [6.2, 2 + 4 * D]] },
{ id: "C04", title: "A message to mum",      durationSec: 8.5,  transition: "fade",  weekKeys: [[0.3, 2 + 4 * D], [0.6, 2 + 5 * D], [2.45, 2 + 5 * D], [2.75, 3], [6.85, 4]] },
{ id: "C05", title: "Three layers",          durationSec: 9.0,  transition: "focus", weekKeys: [] },
{ id: "C06", title: "First heartbeats",      durationSec: 8.5,  transition: "fade",  weekKeys: [[0.15, 5], [4.85, 6]] },
{ id: "C07", title: "First move",            durationSec: 7.0,  transition: "fade",  weekKeys: [[0, 7]] },
{ id: "C08", title: "Webbing and tail",      durationSec: 7.5,  transition: "fade",  weekKeys: [[0.05, 8], [4.55, 9]] },
{ id: "C09", title: "Fetus",                 durationSec: 9.5,  transition: "focus", weekKeys: [[0.15, 10], [4.45, 11], [6.05, 12]] },
{ id: "C10", title: "Hands of its own",      durationSec: 10.5, transition: "fade",  weekKeys: [[0, 13], [1.5, 14], [3.0, 15], [4.5, 16], [6.0, 17]] },
{ id: "C11", title: "The first kick she feels", durationSec: 9.5, transition: "focus", weekKeys: [[0, 18], [1.5, 19], [3.0, 20]] },
{ id: "C12", title: "The senses wake",       durationSec: 13.0, transition: "focus", weekKeys: [[0, 21], [1.3, 22], [2.7, 23], [4.1, 24], [5.5, 25], [6.9, 26], [8.3, 27]] },
{ id: "C13", title: "Brain spurt",           durationSec: 8.5,  transition: "focus", weekKeys: [[0, 28], [1.5, 29], [3.0, 30], [4.5, 31]] },
{ id: "C14", title: "Practice breaths",      durationSec: 9.0,  transition: "fade",  weekKeys: [[0, 32], [1.4, 33], [2.8, 34], [4.2, 35], [5.6, 36]] },
{ id: "C15", title: "Her voice",             durationSec: 6.5,  transition: "fade",  weekKeys: [[0, 37], [2.0, 38], [4.0, 39]] },
{ id: "C16", title: "Hello, world",          durationSec: 16.0, transition: "focus", weekKeys: [[0.75, 40]], trackerHide: [[4.0, 99]] },
```
The whole film comes to 138.5 s, or 4155 frames.

**2. `src/long/lib/weeks.ts` and `overlays/tracker/chipSchedule.ts`** need to switch to completed gestational weeks:
- `weekNumber(w)` becomes `Math.max(1, Math.floor(w + 1e-6))`.
- `isDayMode` always returns false; the long film never shows "DAY nn".
- In `chipFor`, the integer week becomes `Math.floor(week + 1e-6)`.
- `dayNumber(w)` stays `round(w × 7)`, but it now means the gestational day, which keys the stage table above.

The keys in step 1 already allow for the label's roll, which is causal and lands about 0.45 s after its key.

**3. `src/long/data/stages.ts`:** replace with the stage table above.

**4. `src/long/data/sizes.ts`:** load the rows from `briefs/long/sizes.json`.
- Move the leading "a " or "an " of `compare` into `article`; otherwise the chip reads "size of a a lime".
- Map `lengthType`: crown-rump becomes "CRL" and crown-heel becomes "CHL".

**5. `src/long/data/lines.ts`:** one caption line per sentence of script.md, with the accent word as `emphasis` and the local times above. Re-time everything from the voice take once it exists.

**6. Teaser files:** the teaser's `src/overlays/WeekTracker.tsx` and `src/theme/*` are untouched; the "Main" composition keeps its own counting.
