# What to reuse for the next motion-graphics film

**Short answer: yes.** About half of this project is a topic-free toolkit for vertical, voice-led explainers. It covers the timeline, captions, counter, transitions, previews, QA probes, the audio pipeline, the agent workflows and the style rules. The other half is biology art (fetus, embryo and womb kits, the scenes) that only helps with body or medical topics.

Paths are relative to `~/birth-teaser` unless they start with `~`.

---

## 1. Generic: reuse for any topic

### 1.1 Canvas, theme and motion helpers
| Path | What it does | How to reuse |
|---|---|---|
| `src/theme/layout.ts` | 1080x1920 at 30 fps, `HERO` box (cy 860, y 380-1300), `CAPTION_Y`, `TRACKER_Y` | Copy as is. The safe zones are tuned for TikTok/Reels/Shorts UI. |
| `src/theme/colors.ts` | Palette `C` (bg, warm, cool, accents, text) | Copy the structure, replace the hex values. Keep 6-digit hex so `${C.x}88` alpha works. |
| `src/theme/fonts.ts` | Two type levels: Sora (words) and JetBrains Mono (numbers) | Copy. Change the fonts only if the brand needs it. |
| `src/theme/timing.ts` | `sec()`, scene list, `TRANSITION=15`, `SCENE_START` | Copy for a short film made of scenes; long films use `src/long/chapters.ts`. |
| `src/lib/ease.ts` | `EASE` curves, `tween()`, `pop()`/`soft()` springs, `heartbeat()` | Copy as is. It is the house motion language. |
| `src/lib/focusPull.tsx` | Transition: the old shot defocuses while the new one pulls into focus; `{blur:0, zoom:0}` gives a plain fade | Copy. Use it wherever two similar silhouettes would ghost. |
| `src/lib/SvgDefs.tsx` | Shared glow and blur filters | Copy. Define each id once per page. |
| `src/overlays/Grain.tsx` | Film grain plus vignette | Copy as is (`src/long` imports it). |
| `src/shared/womb/Camera.tsx` + `geom.ts` | Parallax camera: `<Camera zoom x y shake drift>` and depth layers (`WombLayer depth blur`) | Generic despite the name. Copy into `src/lib/camera/` and rename `WombLayer` to `Layer`. |
| `src/shared/womb/CaptionShade.tsx` | Screen-space shade for the caption band (`mode: "dark" or "multiply"`) and optionally the tracker band (`top`) | Generic. Copy into `src/lib/`. Use it in every bright shot. |

### 1.2 Film assembly (data-driven chapters)
| Path | What it does | How to reuse |
|---|---|---|
| `src/long/chapters.ts` | `CHAPTERS` list (id, duration, transition cut/fade/focus, counter keys, tracker hide windows), plus derived `LONG_START`, `LONG_TOTAL`, `chapterFrames`, `toGlobalSec` | Copy and replace the list. Rename `weekKeys` to `counterKeys` if the counter isn't weeks. |
| `src/long/LongFilm.tsx`, `LongRoot.tsx`, `entry.ts` | The whole film: background -> `TransitionSeries` of chapters -> overlays -> grain -> soundtrack | Copy as is. Point `package.json` `studio` at `src/long/entry.ts`. |
| `src/long/registry.ts` + `Placeholder.tsx` | Maps id to component; unbuilt chapters show a timed placeholder card, so the film always plays | Copy and empty the imports. Only the orchestrator edits it. |
| `src/long/lib/transitions.ts` | `transitionFor("cut" / "fade" / "focus")` | Copy as is. |
| `src/long/preview/makeChapterRoot.tsx` + `scripts/long-entry.sh` | Generates an isolated preview entry per chapter, so other chapters' errors can't break it | Copy as is. This is the single biggest enabler of parallel or resumable building. |
| `src/long/README.md` | The chapter contract for builder agents | Copy and edit the safe-zone numbers if the overlays change. |

### 1.3 Overlays (captions, counter, chip)
| Path | What it does | How to reuse |
|---|---|---|
| `src/long/overlays/CaptionsLong.tsx` + `captions/pages.ts`, `captions/types.ts` | Word-by-word kinetic captions. Paging at phrase starts, no stacked text (fade out 2 frames before the next word), and an end-title last line | Copy as is. Feed it `data/lines.ts`. |
| `src/long/data/lines.ts` | One caption line per script sentence; planned per-phrase times, replaced by the real `voTiming.ts` | Copy the `line()` helper and replace the content. |
| `src/long/overlays/tracker/Odometer.tsx` | Mechanical rolling-digit counter (pure function of the value) | Copy as is. Works for years, km, % and so on. |
| `src/long/lib/smooth.ts` | Causal smoothing kernel, so many fast steps roll as one motion | Copy as is. |
| `src/long/overlays/tracker/chipSchedule.ts`, `SizeChip.tsx`, `Label.tsx`, `visibility.ts` | Chip text under the counter with a "calm rule" (only show text that rests long enough), plus hide windows | Generic logic, topic data. Keep it and swap `data/sizes.ts` / `data/stages.ts` for your own rows. |
| `src/long/lib/measure.ts` | `useFontsReady()` and cached `textWidth()` for self-sizing overlays | Copy as is. |
| `src/long/overlays/BackgroundLong.tsx` | Plum gradient that warms over the film, with drifting bokeh | Copy, then retint through palette `C`. |
| `src/long/showcase/entry.tsx` | Cheap QA compositions: `LongTrackerQA` (top band only) and `LongCaptionsQA` (caption band only) | Copy. Render every frame of the overlays in seconds. |

### 1.4 Preview, render and QA scripts
| Path | What it does | How to reuse |
|---|---|---|
| `scripts/long-preview.sh <id> [scale]` | Renders one chapter (`nice -n 15`, concurrency 4) into an mp4 plus a contact sheet (tile k = frame 15k) | Copy as is. Pass scale `0.4`. |
| `scripts/long-frame.sh <id> f...` (`FULL=1` for full res) | Exact frames as PNG | Copy as is. |
| `scripts/long-render.sh [scale]` | Whole film plus one-tile-per-second sheets | Copy as is. |
| `scripts/long-tracker.sh` | Renders the tracker band only | Copy; add `nice -n 15` (it has none). |
| `scripts/preview.sh`, `scripts/frame.sh` + `src/preview/*`, `src/ScenePreview.tsx` | The same for the teaser's hand-written scene entries | For short films; run under `nice`. |
| `out/qa/teaser/verify/qa-refuteflash-lum.py` | Caption-band contrast against white text (linear luma, text pixels excluded) | Promote to `scripts/qa/caption-contrast.py`; take the film path and times as arguments. |
| `out/qa/teaser/viewer/qa-viewer-lum.py` | Band luma per frame | Merge into the probe above. |
| `out/qa/teaser/audio/qa-audio-clicks.py` | Sample jumps and high-frequency spikes at every clip edge | Promote to `scripts/qa/clicks.py`; read the clip times from a JSON export. |
| `out/qa/teaser/audio/qa-audio-phone.py` | SFX against voice through a 200 Hz high-pass phone model | Promote to `scripts/qa/phone-mix.py`. |
| `out/qa/teaser/audio/qa-audio-words.py` | Voice against SFX level for every VO word, in the full, speech (1-4 kHz) and phone bands (needs VO and SFX stems) | Promote to `scripts/qa/word-mask.py`. This is the "voice beats SFX by 6 dB" check. |
| `out/qa/teaser/audio/qa-audio-align.py` | Cross-correlates the rendered film audio against a mix model to find timing offsets and the peak | Keep for debugging late or early clips. |
| `out/qa/teaser/retime/qa-retime-calc.cjs` | Re-runs the animation maths with old and new BEATS and prints frame tables | Use it as the template for a `scripts/qa/timing-sim.cjs` per film. |

These probes are throwaway versions: they hard-code paths like `out/qa-audio-film-mono.wav`, and `out/` is git-ignored. Copy them out before cleaning `out/`.

### 1.5 Audio pipeline
| Path | What it does | How to reuse |
|---|---|---|
| `scripts/audio/util.py` | `ff()`, `to_wav()`, 32-bit `decode()`, `normalize_peak()`, two-pass linear `loudnorm_linear()`, `silences()`, `duration()`; no numpy | Copy as is. |
| `scripts/audio/long_vo.py` | Whisper words + `silencedetect` phrases -> snaps words to phrases, spreads them by length, cuts one clip per chapter (fade in/out after `asetpts`), fits speech into each window (`--apply-durations` stretches `chapters.ts`), writes `voTiming.ts` | Copy. Rename the takes (`vo-intro` / `vo-main`) and keep the `lines.ts` format. |
| `scripts/audio/vo.py` + `build.py` | Short-film version: a hand-written edit list of lines and phrases, checked against the phrase count | Copy for 30-60 s films with a single take. |
| `scripts/audio/sfx.py` | SFX cleanup patterns: pick a take, high-pass, fade in after the filter, pitch variants, synthesised kick (sweep plus knock), impact body layer, beat-locked heartbeat | Copy the functions and replace the `PICK` file globs. |
| `src/audio/clips.ts` + `Soundtrack.tsx` | Every clip in GLOBAL seconds hung off `BEATS`; `volume` can be a frame function (ducking envelopes) | Copy the pattern. For long films, fill `src/long/data/audio.ts` using `toGlobalSec`. |
| `src/long/overlays/SoundtrackLong.tsx` | Music / SFX / voice layers with default volumes 0.35 / 0.6 / 1 | Copy as is. |
| `ElevenLabs-guide-long.html` | Paste-ready prompt cards for the user (voice, music, SFX) with tick boxes | Copy the format for any tool the user drives by hand. |

whisper.cpp setup (already installed): `brew install whisper-cpp`, model at `~/.cache/whisper/ggml-base.en.bin`. The command is in `../CLAUDE.md`.

### 1.6 Briefs and style system
| Path | What it does | How to reuse |
|---|---|---|
| `briefs/00-rules.md` | House style: palette only, motion bar (no linear motion, anticipation, always alive), safe zones, determinism, 300-line files, perf budget, render -> look -> fix loop | Copy. Change the project paragraph and the "What already exists" list. |
| `briefs/sceneN.md` | Per-scene brief: Story (beats), END state as numbers, Accuracy | Use as the template for short films. |
| `briefs/long/storyboard.md` | "How to read this", film-wide rules (on-screen text, conventions, tone, safe zones, callbacks table), then per chapter: START, timed beats with the VO line, END numbers, Accuracy | Use as the template for long films. Add a numeric handoff table (see section 3). |
| `briefs/long/facts.md`, `sizes.json` | Facts with convention and source; a verified data table | Keep the format; the content is topic-specific. |
| `briefs/long/foundations.md` | API reports written by the kit builders | Keep the habit: every kit builder returns an API section here. |
| `briefs/long/vo-words.md` | Per-chapter word times from the real take, for builders | Regenerate after every VO alignment. |

### 1.7 Agent workflow patterns
The scripts live outside the project, in `~/.claude/projects/-Users-tandeemwork-birth-teaser/61186c4b-9f7b-4d8a-9770-68b5e45a7e5f/workflows/scripts/` (the QA-fix one is in `~/.claude/projects/-Users-tandeemwork/61186c4b-.../workflows/scripts/`). Copy them into the next project (for example `workflows/`) so they survive.

| Script | Pattern | Keep / change |
|---|---|---|
| `birth-long-research-script-wf_02a54ec3-f72.js` | Research (per range) -> skeptic fact-check per packet -> 3 script angles -> 2 judges -> synthesis (script + storyboard + data) | Keep. The judges score pacing in words/s; tell them 2.1 words/s, not 2.3. |
| `birth-long-foundations-wf_cddadccd-a97.js` | Shared kits built in parallel, each in its own folder with a showcase render | Keep, but run 1-2 at a time. |
| `birth-teaser-scenes-wf_af37e455-c43.js`, `birth-long-chapters-retry.js` | Build -> independent polish per chapter. The schemas return `startState`, `endState`, `sfxCues`, `knownIssues` (build) and `scoreBefore/After`, `fixed`, `remaining` (review). `args.note` carries a RESUME NOTE | Keep. Run sequentially in story order. Pass the upstream's measured END into the next build prompt. |
| `birth-teaser-qa-wf_18446f9d-054.js` | 4 read-only lenses (sync, mix, retime, first-time viewer) -> one skeptic per finding that tries to REFUTE it and returns `betterFix` | Keep as is. It is the most valuable QA step. |
| `birth-teaser-qa-fixes-wf_ee04eefa-dc7.js` | One fixer per disjoint file area; each re-renders and re-measures | Keep. Assign the areas so no two fixers share a file. |

Prompt phrases that worked:
- Builder: "Read first (in this order) ..."
- Builder: "put every story moment in beats.ts ... `// sync: "<word>"` or `// free`"
- Builder: "COPY from src/scenes, never import"
- Builder: "at least 3 render -> look -> improve cycles"
- Polish: "Builder's report (may be optimistic, verify everything)"
- Polish: "pull frames 0, 8, 15, every beat and beat+6, last-15, last"
- QA: "Your job is to try to REFUTE it ... If you are unsure, say real=false"

---

## 2. Topic-specific: human development only
| Path | What it is | Reuse value |
|---|---|---|
| `src/shared/fetus/` | One parametric fetus, weeks 9-40 (`<Fetus week size pose>`, `fetusAnchors()`), pose blending, per-instance ids | Body/medical films only. **Pattern to copy:** one character driven by a single time parameter, an anchors function for attachments, and a showcase sheet. |
| `src/shared/embryo/` | Embryo, weeks 3-8.99 (`<Embryo>`, `embryoAnchors`, `YolkSac`, heartbeat helpers) | Same as above. |
| `src/shared/womb/` | The womb world: backdrop, sac, placenta, cord, light shafts, specks, ripples, sound waves, `WOMB_LOOKS` presets | Topic only, except `Camera`, `geom` and `CaptionShade` (section 1.1). The **presets pattern** (`LOOKS.mid`) is worth copying. |
| Showcase entries | `src/shared/fetus/showcase/entry.tsx` (FetusShowcase), `src/shared/embryo/showcase/sheetEntry.tsx` (EmbryoSheet), `morphEntry.tsx` (EmbryoMorph), `src/shared/womb/showcase/entry.tsx` (WombShowcase); outputs in `out/kits/` | Keep the habit: every kit gets a sheet and a morph render before any chapter uses it. |
| `src/scenes/Scene1..5/` | The teaser scenes (race, cleavage, week-6 embryo, week 12-20 fetus, birth and grip) | Topic only. Good reference code for swarms (`Scene1/swarm*`), cell division (`Scene2/lineage.ts`), match-cut handoffs (`Scene2/Handoff.tsx`), and caption masks. |
| `src/long/chapters/C00..C16/` | The long-film chapters | Topic only. |
| `src/long/data/sizes.ts`, `stages.ts`, `src/long/lib/weeks.ts`, `src/overlays/WeekTracker.tsx` | Week convention, size and fruit table, stage chip | Replace with your own counter data. |
| `briefs/long/facts.md`, `sizes.json`, `script.md` | Verified embryology facts and script | Topic only. |
| `scripts/audio/sfx_long.py` `womb_bed()` | Synthesised in-utero ambience (brown noise plus pulse) | Its technique (synthesise a bed instead of fighting the generator's duration) is generic. |

---

## 3. Start a new explainer in 10 steps
1. **Copy the skeleton** (run from `~/birth-teaser`):
   ```bash
   NEW=~/new-explainer; mkdir -p "$NEW"
   rsync -aR package.json package-lock.json tsconfig.json remotion.config.ts .gitignore \
     scripts src/theme src/lib src/overlays/Grain.tsx src/long briefs/00-rules.md docs CLAUDE.md "$NEW/"
   rsync -aR src/shared/womb/Camera.tsx src/shared/womb/geom.ts src/shared/womb/CaptionShade.tsx "$NEW/"
   rm -rf "$NEW"/src/long/chapters/* "$NEW"/src/long/preview/C*.ts
   cd "$NEW" && source ~/.nvm/nvm.sh && npm ci && git init
   ```
2. **Gut the topic.** Empty the chapter imports in `src/long/registry.ts`. Write the new `CHAPTERS` in `chapters.ts`. Point `package.json` `studio` at `src/long/entry.ts`. Either swap `data/sizes.ts`, `data/stages.ts` and `lib/weeks.ts` for your own counter data, or drop `<WeekTrackerLong/>` from `overlays/LongOverlays.tsx`. Run `npx tsc --noEmit` until it is clean.
3. **Re-skin.** Set the palette in `src/theme/colors.ts`. Rewrite the project lines of `briefs/00-rules.md` and `CLAUDE.md`. Keep `docs/LESSONS.md`.
4. **Research -> fact-check** with separate agents. Store each fact as {claim, convention, primary source} in `briefs/facts.md`.
5. **Script.** Write 3 angles and score them with 2 judges. Aim for 2.1 words/s or less, one idea per chapter, and a hook that is the payoff plus a question.
6. **Storyboard.** Write the film-wide rules, then per chapter: START, timed beats, END as numbers (centre, radius, zoom, light, seeds), and accuracy notes.
7. **Voice first.** Get the take, run whisper and `long_vo.py --apply-durations`, and write `vo-words.md`. Fill `data/lines.ts` from it.
8. **Kits.** Build any character or world that appears in more than one chapter as a parametric kit with a showcase render and API notes, before the chapters.
9. **Build -> polish, one chapter at a time** in story order. Diff each handoff against the real upstream last frame. Previews run at scale 0.4 under `nice`.
10. **QA -> verify -> fix, then mix, render and master** (-14 LUFS / -1.5 dBTP). Run the caption-contrast, frame-diff, click and phone-mix probes before you call it done.

---

## 4. What would make this a better template, or a Claude skill
- **Generic names.** Rename `weekKeys` to `counterKeys`, `WeekTrackerLong` to `Counter`, and `lib/weeks.ts` to `lib/counter.ts`. Make the chip's data a plug-in (`rows`, `labelFor`).
- **One `src/lib/` for the generic pieces.** Move `Camera` + `Layer`, `CaptionShade`, `measure`, `smooth` and `Odometer` there, and keep `src/shared/` for topic kits only.
- **Real QA scripts in `scripts/qa/`** with fixed definitions (full resolution, 0-255 luma, text excluded, captions off):
  - `caption-contrast.py`
  - `frame-diff.py` (luma steps above 20/255)
  - `handoff-diff.py` (upstream last frame vs downstream frame 0)
  - `dup-ids.cjs` (duplicate SVG ids in one frame's DOM)
  - `clicks.py`
  - `phone-mix.py`
  - `timing-sim.cjs` (BEATS windows in order, holds of 12 frames or more)
- **A `captions` prop** (or a `NO_CAPTIONS=1` env) on the film and preview roots, so QA can render the art without text.
- **Script fixes.** Add `nice -n 15` and default scale 0.4 to `scripts/preview.sh` and `scripts/long-tracker.sh`. Add `scripts/master.sh` (the two-pass loudnorm in `CLAUDE.md`) and `scripts/kill-chrome.sh` (refuses while a render runs).
- **A `handoffs.ts` per film:** the END contract of every chapter as numbers, written by the upstream builder and imported by the downstream one.
- **`long_vo.py` writes `briefs/long/vo-words.md` itself.** Today the orchestrator writes it with a one-off inline python snippet from `voTiming.ts`.
- **The workflow scripts move into the repo** (`workflows/`), with `ROOT` and ids as args, sequential by default, and a progress-note step.
- **Git from day one.** Snapshot before each polish so regressions can be diffed. This project is not a git repo.
- **As a Claude skill** (not created): a `motion-explainer` skill would hold:
  - `SKILL.md`: the pipeline plus the top rules from `CLAUDE.md`, triggered by "explainer video", "motion graphics", "Remotion".
  - `template/`: the skeleton from step 1, already gutted and renamed.
  - `scripts/qa/`: the probes.
  - `workflows/`: research, build -> polish, QA -> verify -> fix, and retry.
  - `references/LESSONS.md`.

## Two things to do differently next time (from the user's review)
1. **Output layout first.** Copy `scripts/long-preview.sh`, `long-frame.sh`, `preview.sh`, `frame.sh` (they write `out/<group>/<item>/{preview.mp4, sheet.jpg, frames/, scratch/}`) and the "Output folders" section of `CLAUDE.md` before any render.
2. **Pilot scenes as reusable components.** Give every scene a `beats` prop (and duration) instead of importing a global beats file. The teaser → long-film step then becomes "mount Scene3 with new beats", not "copy Scene3 and re-adapt it".

Also saved for reuse: `scripts/qa/` (audio click/phone/gain checks, caption-contrast probes) and `scripts/workflows/` (the agent workflow scripts: build → polish, QA → skeptic verify → fix, research → fact-check → write → judge, lessons → docs).
