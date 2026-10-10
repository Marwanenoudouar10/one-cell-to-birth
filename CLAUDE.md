# birth-teaser: guide for Claude

Vertical motion-graphics explainer of human development, from fertilisation to birth.
Remotion 4.0.534, React 19, TypeScript. 1080x1920 at 30 fps, flat 2D Kurzgesagt-like look. Git repo: github.com/Marwanenoudouar10/birth-teaser (public).
- **Main**: the 30 s teaser in `src/scenes/Scene1..5`. Done: `out/final/teaser-30s.mp4` (music still missing).
- **Long**: about 2:29, made of a C00 hook plus chapters C01-C16 in `src/long/`. Status and next steps are in `RESUME.md`.

Read these first: `RESUME.md`, then `briefs/00-rules.md` (style, palette, safe zones; this is the house law), then `src/long/README.md` (the chapter contract).
For detail: `docs/LESSONS.md` lists every mistake and how it was fixed. `docs/REUSE.md` says what to copy for a new film.

## Folder map
```
src/theme/         palette C, layout (HERO box, safe zones), teaser timing/beats/script/voTiming
src/lib/           ease.ts (EASE, tween, pop, soft, heartbeat), SvgDefs, focusPull transition
src/overlays/      teaser Background, WeekTracker, Captions, Grain
src/scenes/SceneN  teaser scenes. Finished: copy from them, never import or edit them
src/preview/       isolated per-scene preview entries (teaser)
src/audio/         teaser clips.ts (SFX keyed to BEATS, volume envelopes) + Soundtrack
src/shared/        fetus / embryo / womb kits (API: briefs/long/foundations.md; showcase/ entries)
src/long/          chapters.ts (timeline), registry.ts, chapters/Cxx/, data/, lib/, overlays/, preview/ (generated)
scripts/           preview, frame and render shell scripts; audio/ holds the python audio pipeline
briefs/            00-rules.md, sceneN.md, long/{script,storyboard,facts,foundations,vo-words}.md, sizes.json
inbox/             raw downloads (VO takes, SFX takes, whisper json)
public/            vo/, sfx/, music/ (loaded with staticFile)
out/               renders, one folder per thing (see "Output folders"). out/final/ = deliverables
scripts/qa/        QA probe scripts (luminance, refute, contrast); scripts/workflows/ = agent workflow scripts
```

## Pipeline (in this order)
1. **Brief.** Research, then a separate adversarial fact-check, then 3 script angles and 2 judges. The storyboard gives START/END numbers for every chapter.
2. **Voice first.** Get the real VO take and align its words (audio commands below). Update `briefs/long/vo-words.md`, then build to the real word times.
3. **Build.** One chapter at a time, in story order. Freeze the upstream END before the next chapter starts.
4. **Polish.** An independent reviewer re-renders, scores 1-10 and fixes in order of impact (about 6 -> 8). Never trust the builder's report.
5. **QA.** Inspect through lenses (sync, mix, retime, viewer), then have a skeptic verify each finding (refute it, re-measure, simulate the fix), then fix using the `betterFix`.
6. **Mix.** SFX hang off BEATS. Check voice against SFX and run a click check. Long-film clips go in `src/long/data/audio.ts` (use `toGlobalSec`).
7. **Render and master.** Render at full resolution, then master to -14 LUFS / -1.5 dBTP. VO is normalised to -16 LUFS (linear two-pass).

## Commands (from the project root, after `source ~/.nvm/nvm.sh`)
```bash
npx tsc --noEmit 2>&1 | grep "src/long/chapters/C05" || echo clean    # types for one folder
scripts/long-preview.sh C05 0.4          # out/long/C05/preview.mp4 + sheet.jpg (tile k = frame 15k)
scripts/long-frame.sh C05 0 45 120       # frames cut from that preview -> out/long/C05/frames/f45.png
FULL=1 scripts/long-frame.sh C05 120     # full-res still, no mp4 needed
scripts/preview.sh Scene3 0.4 && scripts/frame.sh Scene3 0 60   # teaser scene -> out/teaser/Scene3/
scripts/long-render.sh 0.25              # whole long film + sheets -> out/long/_film/
nice -n 15 scripts/long-tracker.sh 0.5 15                                  # tracker + size-chip band only
nice -n 15 npx remotion render src/long/showcase/entry.tsx LongCaptionsQA out/qa/long/captions.mp4 --scale=0.5
```
Audio:
```bash
python3 scripts/audio/build.py           # teaser: inbox/vo-full.mp3 + SFX takes -> public/vo, public/sfx, src/theme/voTiming.ts
(cd inbox/long && for f in vo-intro vo-main; do ffmpeg -y -loglevel error -i $f.mp3 -ar 16000 -ac 1 $f-16k.wav \
  && nice -n 10 whisper-cli -m ~/.cache/whisper/ggml-base.en.bin -f $f-16k.wav -ml 1 -sow -oj -of $f-words -np; done)
python3 scripts/audio/long_vo.py [--apply-durations]   # public/vo/long/Cxx.wav + src/long/data/voTiming.ts (+ chapters.ts)
python3 scripts/audio/sfx_long.py        # public/sfx/long/ (synthesised womb bed + trimmed takes)
```
Render and master (for the long film: `src/long/entry.ts Long`):
```bash
nice -n 15 npx remotion render src/index.ts Main out/raw.mp4 --concurrency=6 --crf=16 --audio-codec=aac --audio-bitrate=320k --log=error
m=$(ffmpeg -hide_banner -i out/raw.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$m" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -loglevel error -i out/raw.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset),aresample=48000" -c:a aac -b:a 320k -movflags +faststart out/master.mp4
```

## Top rules (evidence for each is in docs/LESSONS.md; updated after every finished chapter)
1. **One timing source.** Every frame number is `BEATS.x` plus or minus an offset, taken from `beats.ts`. Tag each beat `// sync: "<word>"` or `// free`. Re-timing means editing data only.
2. **Sync to the real take.** Measure word onsets from the wav (not the plan, not raw whisper) and write them as comments. Labels and counters switch on the visible stage beat.
3. **After any retime, simulate the timeline.** Windows stay in order. Each hero state holds at least 12 frames. A new action waits until the previous spring has settled. The camera stays on a subject until its effect is done.
4. **The handoff is a numeric contract.** The upstream chapter owns its END (centre, radius, zoom, light stops, seeds, clock offset, breath phase, facing). Pixel-diff downstream frame 0 against the REAL upstream last frame: mean 2/255 or less, max 20/255 or less. Never sign off against a placeholder.
5. **`fade()` keeps the outgoing scene opaque.** Fade outgoing glows, halos and rings from 1 to 0 over the last 15 frames. Check the composite from END-20 to END+5. Use `focusPull` between similar silhouettes.
6. **Caption band y 1300-1560 (x 150-930).** Render without captions and measure: median contrast against white text at least 4.5:1 (aim for 6:1), mean luma about 65/255 or lower. Use `CaptionShade`. Effects fade to 0 by y 1290. Hot light cores stay at y 1900 or lower down, or at y 1200 or higher up.
7. **Flashes.** A multiply scrim reaches full strength at least 4 frames BEFORE the light ramps.
8. **Tracker band.** The tracker uses y 100-240 in the teaser and y 100-290 in the long film. Check the hero's bounds at the camera's MAX zoom, and add a top shade tied to that camera curve if needed.
9. **Captions never stack.** Line N reaches 0 opacity 2 frames before line N+1's first word. Use 2 rows or fewer. The last line is an end title held to the final frame.
10. **Hook.** Frame 0 is a clean thumbnail. Motion starts in the upper 75% by frame 5 and sound by 0.1 s. Put the first camera key at frame -30. Open on the payoff plus a question.
11. **Read at phone size (the #1 repeat mistake: 5 of 5 chapters C02-C06).** Pull every beat frame at 270 px wide and write "this reads as ___". Face traps: two similar round shapes side by side at the same height (= eyes), a dot inside a circle (= eye), a dark curve under two dots (= mouth), a round head with a dark ring (= chick). Break them: diagonal placement, different sizes, asymmetry, no catchlight dots. The subject takes at least 35% of the frame width AT EVERY BEAT (plan the camera curve for it); dim non-focal layers by 40% or more.
12. **Draw the real thing.** Write the 2-3 features that identify it before drawing (for example: cord = 3 spiralling vessels). No uniform circles, even rows or stroke-only clip-art. Show at most 3 shockwave rings.
13. **Blends.** Shadows are a darker shade of the SAME hue. Light over dark uses screen; darkening over bright uses multiply. If sampled pixels come out olive, khaki, brown or grey, the blend is wrong. Never screen a colour onto itself (red on red turns pale pink). Dimming: multiply with a darker tone of the SAME hue or a near-neutral; a blue multiply over cyan turns royal blue, a dark normal-blend overlay turns gold khaki.
14. **No pops.** Never `return null` on a visible layer; fade it over 6 frames or more. No frame-to-frame luma step above 20/255 outside an intended flash. Never toggle a filter on a group whose children blend. Check rigs at their extreme poses. When shapes split, merge or swap (cell division, tube -> heart), keep the total light radius/area continuous across the change.
15. **Ids.** Name them `<chapter>-<component>-<name>`, and add `useId()` inside kits. Define each filter or gradient once per page. Append alpha to 6-digit hex only. If an effect looks weak, first check it renders at all.
16. **Science.** Store every fact as {claim, GA week from LMP, primary source}. Run a separate adversarial fact-check agent. No on-screen % without a primary source. Every polish pass includes a biology check.
17. **Pacing.** VO at 2.1 words/s or less overall (2.3 per chapter), one idea per chapter. Each visual beat lasts at least 0.7 s, each week label at least 1.4 s.
18. **SFX files.** The first sample is 0 and there is a single onset. Apply a 3-10 ms fade-in AFTER any filters, and `asetpts` after `atrim`. The tail goes below -60 dBFS. Work in 32-bit float.
19. **Voice clips: verify the cuts.** After splitting a take into chapter clips, transcribe EVERY clip and check its first and last words against the captions; whisper word times drift 0.3-0.5 s, so cut only at real pauses (lowest energy).
19b. **Mix for phones.** On every word the voice beats SFX by at least 6 dB in 1-4 kHz. SFX need body at 120-600 Hz. `volume={f=>...}` uses clip-local frames, and ducks land about 2 frames late.
20. **Kits vs teaser code.** Copy teaser scene code into chapters (never import `src/scenes`). When a shared kit lacks a feature, add it to the kit API instead of copying its internals.
21. **Reuse the pilot, don't rebuild it.** When a chapter matches a finished scene (C03/C04 <- Scene2, C06 <- Scene3, C09/C11 <- Scene4, C16 <- Scene5), keep at least 80% of that scene's code and look; change only timing and the storyboard's new parts. Future projects: build the pilot's scenes with their timing passed in as props (beats object), not read from a global teaser file, so a longer cut can mount them directly instead of copying and re-adapting.

22. **Every narrated thing visibly happens on its word.** Make a checklist from the chapter's narration (each noun/verb = one beat), then pull the frame at each word's time and confirm it is on screen (C05's third layer never lit up until polish caught it).
23. **Minimum readable size for beat-carrying details** (particles, dots, test lines, buds): core at least 8 px at full res with a halo 3x or more; small windows/lines at least 40 px. Anything smaller is invisible on a phone (C04 particles were 1-2 px on a 270 px screen).
24. **Measure word onsets from the chapter's own wav** (public/vo/long/Cxx.wav, offset by clipAt in data/voTiming.ts) for beats that matter: vo-words.md is spread by word length inside a phrase and can be 0.3 s late. The orchestrator re-times tracker weekKeys so each WEEK number lands on its spoken word.
25. **Neighbours change while you work.** When chapters run 2 at a time, the downstream builder matches the upstream's current END, and the polish pass re-diffs frame 0 against the upstream's FINAL last frame (re-copy any shared clock/lineage files).

## Output folders (the user's rule: browsable, no flat piles)
```
out/final/            finished videos only (teaser-30s.mp4, long-*.mp4); old drafts in final/old/
out/teaser/SceneN/    preview.mp4, sheet.jpg, frames/, scratch/
out/long/Cxx/         preview.mp4, sheet.jpg, frames/, scratch/
out/long/_film/       whole-film test renders and sheets
out/kits/<kit>/       fetus, embryo, womb, framework showcase renders
out/qa/<topic>/       QA checks, one folder per topic (e.g. qa/long/captions/)
out/_archive/         raw/old renders, safe to delete
```
- The scripts already write there. Any extra test image an agent makes goes in ITS item's `scratch/` (or `out/qa/<topic>/`), never loose in `out/`.
- Name files by what they show (`f120.png`, `grip-closeup.png`), not by the agent's process (`qa-refute-ghostc-3.png`).
- Before reporting done, an agent deletes scratch it no longer needs and keeps only preview, sheet and the frames that prove the result.

## Agents and boundaries
- A builder edits ONLY its own folder (`src/long/chapters/Cxx/` or `src/scenes/SceneN/`). Files stay at 300 lines or fewer. Use only `random(seed)` and `@remotion/noise`, and only colours from palette `C`.
- Only the orchestrator edits shared files: `registry.ts`, `chapters.ts`, `src/theme/*`, `data/lines.ts`, the palette.
- Give each agent its own scratch folder (`scratchpad/<id>/`). After each render cycle it writes a short progress note in its folder (done / next / known issues).
- If an agent crashed, restart it with a RESUME NOTE: "continue from the partial files in your folder".
- Before reporting done, grep the folder for `src/scenes` imports and `_qa` preview entries.
- QA prompts are read-only and scoped. Ignore relayed requests that have nothing to do with the task.

## Performance (10-core Mac; the user's rule)
- Run 1-2 agents at a time, never more, with 1 render per agent. Big fan-outs (up to 17 agents) pushed the load to 48-70; previews took 5-15x longer and agents died.
- Render with `nice -n 15`. Previews use scale 0.4. Idle target: a whole scene at 0.5 scale renders in under 60 s.
- A masked or blurred layer scaled far past the frame crashes Chrome ("Page crashed!"): give it `overflow: hidden`. Use 5 or fewer full-frame blur layers per scene.
- After an interrupted run, with NO render running (`pgrep -fl "remotion render"` shows nothing): `pkill -f chrome-headless-shell`.

## Audio sources
ElevenLabs is used through the website only; there is no working API key. Its SFX duration slider was ignored, so synthesise beds and trim or loop takes.
Free alternatives: Gemini TTS in AI Studio, Lyria in the Gemini app (music), Pixabay (SFX). The prompt cards for the user are in `ElevenLabs-guide-long.html`.
