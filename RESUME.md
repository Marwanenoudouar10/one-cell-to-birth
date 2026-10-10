# Where we stopped (2026-10-10, ~04:55)

## Done
- 30s teaser: final draft 3 at out/birth-teaser-draft3.mp4 (sound, mastered -14 LUFS). Only missing: music.
- Long film plan: briefs/long/script.md + storyboard.md (C00 intro hook + 16 chapters, ~2:27), facts.md, sizes.json — all fact-checked.
- Shared kits: src/shared/fetus, src/shared/embryo, src/shared/womb; framework in src/long (counter, size chip, captions, previews). API docs: briefs/long/foundations.md
- Chapter C02 built (its polish pass was interrupted).

## Not finished (stopped on purpose; partial code is kept in each folder)
- Chapters C00, C01, C03–C16: builders were mid-way. User asked: build them ONE BY ONE (max 2 at a time, PC gets too slow otherwise). Re-run them with the retry workflow script
  (birth-long-chapters-retry.js, args: ids + "note" telling them to continue from the partial work),
  then polish C02 too.
- ElevenLabs (user does it on the website): ElevenLabs-guide-long.html — 8 cards (intro voice, narration, 2:30 music, 5 SFX).
  User says "long done" when the files are in ~/Downloads.

## After chapters + audio
1. Re-time each chapter's beats.ts to the real voice (sync comments name the word).
2. Captions word timings from the voice (whisper.cpp + silence split, like scripts/audio).
3. Mix + master, render Long, QA pass.

## Update ~06:20 — voice is in
- Voice: inbox/long/vo-intro.mp3 + vo-main.mp3 -> scripts/audio/long_vo.py -> public/vo/long/Cxx.wav,
  src/long/data/voTiming.ts (captions use it), briefs/long/vo-words.md (word table for builders).
  chapters.ts durations adjusted to fit the voice (C00 8.6, C05 9.2, C07 8.2, C15 7.0) -> film 149 s.
- SFX: scripts/audio/sfx_long.py -> public/sfx/long/ (womb-bed synthesized; cry, hum, chime, rumble trimmed).
- Music: still missing (user will make it; Gemini/Lyria is an option).
- Chapters: C00 done (8.2/10). C01 building one-at-a-time. C00/C01/C02 need a beats re-time to vo-words.md.

## Update 2026-10-10 17:40 — day 2
- out/ reorganised (out/final, out/teaser/SceneN, out/long/Cxx, out/kits, out/qa, out/_archive); all scripts write there.
- CLAUDE.md + docs/LESSONS.md + docs/REUSE.md written; scripts/qa/ and scripts/workflows/ saved.
- New per-chapter workflow: scripts/workflows/birth-long-chapter.js (args: id, mode 'build+polish'|'polish', reuse 'SceneN', note).
  Run ONE chapter at a time. Reuse map: C03/C04<-Scene2, C06<-Scene3, C09/C11<-Scene4, C16<-Scene5.
- Done: C00 (8.2), C01 (8.2). C02 built + re-timed; its polish restarted at 17:40 (overnight run stalled when the Mac slept).
- Then: C03 -> C16 in order; re-time C00/C01 beats to vo-words.md; mix; music; render; QA.
- C02 polished 6.5 -> 7.8 (18:00). C03 done (re-synced to C02 beads).
- C03 polished 7 -> 8 (19:05). C03 weekKeys re-timed to the voice.
- FINAL-PASS TODO (orchestrator): (1) captions: C03 line 2 wraps to 3 rows -> paginate long lines by phrase in CaptionsLong (rule 9: max 2 rows); check all lines. (2) C03->C04 handoff: C04 copied C03's clock/lineage before C03's re-time — pixel-check C03 last frame vs C04 frame 0 after C04 is done. (3) re-time C00/C01 beats to vo-words.md.
- C04 polished 6.5 -> 7.8 (19:40). C03->C04 handoff verified (mean 0.23/255) — that todo is done.
  C04 leftovers for the final pass: 2 captions run to 3 rows; hatch squeeze smear f61-63 (kept); blastocyst ring reads as even beads (teaser look).
- C06 started (reuse Scene3) alongside C05.
- C05 polished 6.5 -> 8 (20:15). END contract in C05/beats.ts (zoom 1.3, kit week 4.0, dormant tube); C06 uses it.
  C05 leftovers: Finale.tsx imports embryo-kit internals (should use kit API); mid-tilt 'saucer' frames under blur.
- C07 started alongside C06.
- C06 done (20:50). Note: agents found vo-words.md up to 0.3 s late inside phrases (char-weighted guess) and measured onsets from the wav instead. Final pass: improve word timing (better aligner) and re-check captions vs voice.
  C06 weekKeys re-timed to the voice. TODO after C07+C08 finish: embryo kit week-6 head/eye reads as a chick at phone size -> fix once in src/shared/embryo (Face/eye) so C06-C08 all change; then re-check C06-C08 previews.
