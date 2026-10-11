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
- GitHub (public): https://github.com/Marwanenoudouar10/one-cell-to-birth — first commit ada54be (C00-C06). Commit + push after each finished chapter (no Co-Authored-By; git-config identity). Finished videos go in GitHub Releases, not the repo.
- C07 polished 7 -> 7.6 (21:10). weekKeys re-timed. Kit TODO grows: embryo week 6/7 'duckling' read (head + dot eye + red heart as bill); womb backdrop fold rings read as a target in wide shots (C07 END, copied by C08, and C11 uses ripples).
- VO bleed found (C07 tail has C08's "Week eight"; C09 lost "a face" to C10's head; C14 head has "grows"; C15 head has "probably ready") -> VO repair job running before C09 starts.
- SPEED-UP (21:00, same quality bar): chapter packs (scripts/make_packs.py -> briefs/long/packs/), range renders (FRAMES=a-b), joins matched by numbers during build + ONE final pixel join pass by the orchestrator, 3 agents at a time. Workflow: scripts/workflows/birth-long-chapter-v2.js. Regenerate packs AFTER the VO repair (vo-words.md changes).
- FINAL JOIN PASS TODO: for every cut Cn->Cn+1, composite END-20..END+5, pixel-diff, fix.
- C08 polished 6 -> 8 (21:35). Real C08 END: zoom ~2.36-2.55 big side view, kit week 8.99 size 374 at (472,835), embryo ~900 px tall — C09 must start from THIS (storyboard END text is outdated).

## STOPPED 2026-10-10 ~22:30 — resume next week from here
Done: C00-C08 built + polished (scores 7.6-8.2). Voice clips repaired + verified (scripts/audio/vo_repair.py + vo_onsets.py;
backups in out/_archive/vo-long-pre-repair/). NEVER rerun long_vo.py alone again (it reintroduces the bleed) — run vo_repair.py after it.
Voice now plays in the Long film (data/audio.ts LONG_VOICE) and in every chapter preview (makeChapterRoot).
Rough cut with voice: out/final/review/long-C00-C08-roughcut.mp4 (chapter previews stitched, no crossfades).
C09 duration 9.5 -> 10.0 (its last words "a face." moved into it). Packs for C09-C16 regenerated with the repaired timings.

NEXT WEEK, in this order:
1. Re-time beats of built chapters to the repaired word times (each beat has // sync: "<word>"; compare with briefs/long/vo-words.md):
   C04 (animation 0.2-0.8 s AHEAD of the voice: every beat), C02, C03, C06 (0.2-0.4 s), C01/C05/C07/C08 small. One agent, chapter by chapter, range renders.
2. Build + polish C09-C16 with scripts/workflows/birth-long-chapter-v2.js (packs, range renders, 3 at a time).
   Reuse: C09/C11 <- Scene4, C16 <- Scene5. C13 + C15 have half-built code with type errors (expected).
3. Kit fixes once C09+ are done: embryo week 6-7 'duckling' read; womb backdrop fold rings read as a target.
4. Captions: paginate long lines (max 2 rows); tracker weekKeys per chapter on the spoken week word.
5. Final join pass (pixel-diff every cut), SFX + womb bed + music (user still has to make the music: 2:30 prompt in ElevenLabs-guide-long.html or Gemini/Lyria), master -14 LUFS, render, QA.
