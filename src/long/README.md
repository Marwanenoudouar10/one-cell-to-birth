# Long film ("Long", ~2:10) — how to add a chapter

Everything is data-driven. Read `briefs/00-rules.md` first (style, palette C, motion bar, perf).

## Files you READ (never edit, unless you own them)
- `chapters.ts`  CHAPTERS list: id, title, durationSec, transition (`cut|fade|focus`, how the
  chapter ENTERS), weekKeys `[localSec, week]`, optional trackerHide. Derived: `LONG_START[id]`
  (global start frame), `LONG_TOTAL`, `chapterFrames(id)`, `toGlobalFrame/Sec(id, localSec)`.
- `lib/weeks.ts`  `weekAt(globalFrame)`, `weekAtLocal(id, localFrame)`, `weekLabel(w)`.
  Weeks are COMPLETED gestational weeks: the label shows `floor(w)` ("WEEK 12"), never DAY.
- `data/sizes.ts` (verified rows of `briefs/long/sizes.json`), `data/stages.ts` (stage chip,
  weeks 1-3, by gestational day), `data/lines.ts` (one caption per script sentence), `data/audio.ts`.
- `registry.ts`  id -> component. Unregistered chapters show a placeholder card.

## Add chapter C05
1. Folder `src/long/chapters/C05/`. Write ONLY there. `index.tsx` must `export const C05: React.FC`.
2. Split by job, no file over 300 lines (e.g. `Embryo.tsx`, `Camera.tsx`, `beats.ts`, `index.tsx`).
3. `beats.ts`: your story moments as LOCAL frames, animate TO them (never hard-code beat frames):
   ```ts
   import { FPS } from "../../../theme/layout";
   const s = (sec: number) => Math.round(sec * FPS);
   export const BEATS = { foldStarts: s(1.2), heartOn: s(4.0) } as const;
   ```
4. Register it in `registry.ts` (two one-line edits: the import + `C05,` in CHAPTER_COMPONENTS),
   or leave that to the orchestrator. Previews do not need it.

## Chapter contract
- `useCurrentFrame()` is chapter-local: frame 0 = first frame, `chapterFrames(id)` frames long,
  including the transition overlaps.
- Render on a TRANSPARENT root. The global background, tracker, captions and grain are drawn
  for you, above and below the chapter.
- First/last 15 frames (`LONG_TRANSITION`) overlap the neighbours when the transition is
  `fade` or `focus`: honour the START/END handoff states in your brief.
- Canvas 1080x1920. Hero in `HERO` (cy 860, y 380..1300). Keep **y 100..290 clear** (week label,
  bar and the size chip, which ends at y ~262). Keep the caption zone y 1300..1560 calm/dark.
- Need the week for sync? `weekAtLocal("C05", frame)`. Need a global time for audio?
  `toGlobalSec("C05", localSec)`.
- Deterministic only (`random(seed)`, `@remotion/noise`). Palette `C` only (alpha OK).
- Prefix every SVG id with your lower-case chapter id: `c05-glow`, `c05-skin-grad`.
- Shared helpers you may import: `src/theme/*`, `src/lib/ease` (EASE, tween, pop, soft, heartbeat),
  `src/lib/SvgDefs`, `src/lib/focusPull`, and anything in `src/long/lib`. Never edit them.
- Sounds tied to your animation: put `<Sequence from={BEATS.x}><Audio .../></Sequence>` inside
  your chapter (local time), or ask for a line in `data/audio.ts`.

## Check your work (isolated: other chapters' errors cannot break it)
```bash
cd <project root> && source ~/.nvm/nvm.sh
npx tsc --noEmit 2>&1 | grep "src/long/chapters/C05" || echo clean
scripts/long-preview.sh C05 [scale=0.4]  # out/long/C05/preview.mp4 + sheet.jpg (tile k = frame 15k)
scripts/long-frame.sh C05 0 45 120       # out/long/C05/frames/f45.png ... (cut from the preview mp4)
FULL=1 scripts/long-frame.sh C05 120     # full-resolution still, no mp4 needed
```
`long-preview.sh` (re)generates `src/long/preview/C05.ts`, an entry that imports ONLY your
chapter, with background + overlays shifted to its place in the film. Do not hand-edit it.
Read the sheet and frames like a strict art director; iterate.

## Whole film / tracker QA (orchestrator)
Extra test images go in out/long/<id>/scratch/ (delete them when done) — never loose in out/.
```bash
scripts/long-render.sh 0.25        # out/long/_film/long-0.25.mp4 + sheets (tile = 1 s)
scripts/long-tracker.sh 0.5 15     # tracker band only: out/qa/long/tracker/sheet-N.jpg
scripts/long-tracker.sh 0.5 1 3250-3329   # one strip per frame over a range (fast ticks)
```
Studio: composition "Long" is also registered in `src/Root.tsx`.
