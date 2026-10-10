export const meta = {
  name: 'birth-teaser-qa-fixes',
  description: 'Apply verified QA fixes to the teaser in parallel (audio, overlays, Scene1/2/4/5), each fixer verifies its own result',
  phases: [{ title: 'Fix', detail: 'one fixer per area, disjoint files' }],
}

const ROOT = '/Users/tandeemwork/birth-teaser'
const FINDINGS = `${ROOT}/briefs/qa-fix-groups.json`

const COMMON = `Project: ${ROOT} (Remotion 4, 1080x1920, 30fps, 30s teaser "Main"; scenes start at global frames 0/180/330/480/690).
A QA team found problems in the rendered film and an independent skeptic verified them. The findings for YOUR area are in ${FINDINGS} under the key given below — read them (each has evidence, fix, and betterFix; prefer betterFix when present; anything marked "not independently verified" must be re-checked first).
Read ${ROOT}/briefs/00-rules.md for style/safe-zone rules and how to preview (scripts/preview.sh SceneN, scripts/frame.sh SceneN f...). Node: \`source ~/.nvm/nvm.sh\`.
Other agents are editing other areas AND building new shared code under src/shared/ and src/long/ at the same time: edit ONLY the files listed for your area, ignore everyone else's files and type errors.
After fixing, VERIFY: re-render what you changed, measure/look again, and confirm each finding is gone without new problems. Keep files <= 300 lines, deterministic code.
Return a short report: each finding -> fixed / not fixed (why), what you measured after.`

const JOBS = [
  { key: 'audio', files: 'scripts/audio/sfx.py, scripts/audio/util.py, src/audio/clips.ts, src/audio/Soundtrack.tsx, public/sfx/* (regenerate via `python3 scripts/audio/build.py`)', extra: 'After rebuilding, render the film audio only to check the mix: `npx remotion render src/index.ts Main out/qa-fix-audio.wav --codec=wav` (or render mp4 at --scale=0.25) and re-measure each finding (clicks, band levels vs voice, peaks). Keep VO untouched (public/vo and voTiming.ts are correct). Note: src/theme/beats.ts Scene1.raceStart may be moved earlier by the Scene1 fixer; clips.ts already follows beats automatically.' },
  { key: 'overlays', files: 'src/overlays/Captions.tsx, src/overlays/WeekTracker.tsx', extra: 'Do NOT change the VO text/timing (no new VO take is possible). For the tracker: tie DAY labels to the visible stages and use the current week-twenty VO time (~20.25s). Verify with `npx remotion render src/index.ts Main out/qa-fix-ov.mp4 --scale=0.5` and pulled frames at 2.2-2.7s, 20.0-20.6s, 7-11.5s, 28-30s.' },
  { key: 'Scene1', files: 'src/scenes/Scene1/* and ONLY the raceStart line of src/theme/beats.ts', extra: 'Keep frame 0 a beautiful thumbnail; the END handoff state (zygote at 540,860 r150 etc., frames 176-194) must remain exactly as now.' },
  { key: 'Scene2', files: 'src/scenes/Scene2/*', extra: 'Keep START/END handoff states unchanged.' },
  { key: 'Scene4', files: 'src/scenes/Scene4/*', extra: 'Keep START/END handoff states unchanged.' },
  { key: 'Scene5', files: 'src/scenes/Scene5/*', extra: 'Measure caption-zone (y 1300-1560) luminance contrast vs white text across 25.4-27.0s global (local 72-120) before/after; target >= 4.5:1 throughout.' },
]

const results = await parallel(JOBS.map((j) => () =>
  agent(`${COMMON}\n\nYOUR AREA KEY: "${j.key}"\nFILES YOU MAY EDIT: ${j.files}\n${j.extra}`, { label: `fix:${j.key}`, phase: 'Fix' }).then((r) => ({ key: j.key, report: r }))
))
return results.filter(Boolean)