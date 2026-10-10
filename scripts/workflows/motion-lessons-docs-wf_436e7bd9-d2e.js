export const meta = {
  name: 'motion-lessons-docs',
  description: 'Mine every build/polish/QA report for lessons, then write CLAUDE.md + docs/LESSONS.md + docs/REUSE.md (read-only, no renders)',
  phases: [
    { title: 'Mine', detail: 'collect mistakes and fixes from all agent reports' },
    { title: 'Write', detail: 'CLAUDE.md, LESSONS.md, REUSE.md' },
  ],
}

const ROOT = '/Users/tandeemwork/birth-teaser'
const WF = '/Users/tandeemwork/.claude/projects/-Users-tandeemwork/61186c4b-9f7b-4d8a-9770-68b5e45a7e5f/subagents/workflows'
const RUNS = ['wf_af37e455-c43 (teaser scenes: build + polish)', 'wf_18446f9d-054 (teaser QA: 4 lenses + skeptic verify)', 'wf_ee04eefa-dc7 (teaser QA fixes)', 'wf_cddadccd-a97 (shared kits: fetus, embryo, womb, framework)', 'wf_02a54ec3-f72 (research, fact-check, scripts, judges)', 'wf_0598ab61-d20, wf_a8d3d205-dd9, wf_3cc64248-dc2, wf_7e1374c5-34b, wf_323acd8d-e15 (long chapters, interrupted runs)', 'wf_f0246707-563 (C00 build + polish)', 'wf_19d2dd00-b8c (C01 build + polish)']

const RULE = `This is a READ-ONLY documentation job on the user's Mac: never run remotion renders, npm, or anything CPU-heavy; reading files with cat/grep/python is fine. Another agent is rendering chapter C02 right now — do not touch src/ or out/.`

const ORCH = `Orchestrator's own lessons from this session (include them; they are verified):
- Isolated preview entry per scene/chapter (src/preview/*, src/long/preview/*) so parallel builders cannot break each other's renders.
- One timing source: beats.ts per scene/chapter, every beat tagged // sync: "<word>" or // free; re-timing to the real voice = editing data, not animation code. Better still: record the real voice BEFORE building, then build to its word timings (vo-words.md).
- Too many parallel agents (17) overloaded the 10-core Mac and agents died on connection errors; the user wants 1-2 agents at a time. Renders now run under nice -n 15, previews at scale 0.4, and orphaned headless Chrome processes (node_modules/.remotion/chrome-headless-shell) must be killed after interrupted runs.
- Restart crashed agents with a RESUME NOTE telling them to continue from the partial files in their folder.
- Builder -> independent polish reviewer roughly lifts quality from ~6 to ~8/10; reviewers must re-render and verify, not trust the builder's report.
- ElevenLabs website: the Sound Effects duration slider was ignored twice (files came out 1-2 s); synthesize beds (womb-bed) and loop/trim takes. No PayPal; the pasted API key was invalid. Free alternatives: Gemini TTS in AI Studio, Lyria 3.5 in the Gemini app for music, Pixabay for SFX.
- whisper.cpp base.en word times drift by 0.2-0.6 s: snap to silencedetect phrase boundaries, spread words by length inside each phrase (scripts/audio/vo.py, long_vo.py). Fit each chapter's speech in its window and extend the chapter when needed.
- Loudness: VO normalised to -16 LUFS (linear two-pass loudnorm), final master -14 LUFS / -1.5 dBTP.
- Remotion transitions: fade() keeps the EXITING scene opaque (shouldFadeOutExitingScene=false) — design handoffs for that; crossfading two similar silhouettes ghosts -> focusPull (blur-out/blur-in) presentation in src/lib/focusPull.tsx.
- Chrome 'Page crashed!' when a masked/blurred layer is scaled ~10x past the frame -> overflow:hidden on that layer.
- Captions: lines too close stack on top of each other -> fade a line out before the next first word; last line = end title; bright moments need a scrim tied to the bright event.
- Phone speakers: energy below ~150 Hz is inaudible; SFX need 150-600 Hz body; every clip needs a few-ms fade-in to avoid clicks.
- Hooks: frame 0 must already move; open on the emotional payoff + a question ("Have you ever wondered...") before the science.
- Science: one week convention (gestational), dedicated fact-check agents rejected ~14 plausible-but-wrong claims; keep tone neutral on sensitive topics.
- Copy code from teaser scenes into new chapters instead of importing, so the finished teaser never breaks.`

const LESSONS = {
  type: 'object',
  properties: {
    lessons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'e.g. composition, motion, lighting, captions/safe-zones, handoffs/transitions, timing/sync, audio, performance/render, science, code-structure, orchestration' },
          mistake: { type: 'string', description: 'what builders got wrong (concrete)' },
          fix: { type: 'string', description: 'what the polish/QA agent did to fix it' },
          rule: { type: 'string', description: 'a short preventive rule for future agents' },
          count: { type: 'number', description: 'how many scenes/chapters showed it' },
          examples: { type: 'array', items: { type: 'string' } },
        },
        required: ['category', 'mistake', 'fix', 'rule', 'count', 'examples'],
      },
    },
    scoreStats: { type: 'string', description: 'before/after polish scores you found' },
  },
  required: ['lessons', 'scoreStats'],
}

phase('Mine')
const mined = await agent(`${RULE}

You are mining lessons from a motion-graphics project built by AI agents (Remotion, flat-2D explainer about human development) at ${ROOT}.
Each workflow run folder under ${WF}/<runId>/ has a journal.jsonl: lines with {"type":"result", "result": ...} hold every agent's final report (builders: summary/knownIssues; polish reviewers: scoreBefore/scoreAfter/fixed/remaining; QA: findings with evidence/fix and skeptic verdicts). Runs: ${RUNS.join('; ')}.
Also read ${ROOT}/briefs/00-rules.md, ${ROOT}/briefs/qa-fix-groups.json, ${ROOT}/src/long/README.md and ${ROOT}/briefs/long/foundations.md (Known limitations sections).
Extract every recurring MISTAKE builders made and what the polish/QA agents did to FIX it, merge duplicates, count occurrences, and write a short preventive RULE for each. Prefer concrete, checkable rules ("keep caption zone y 1300-1560 below X luminance") over vague ones. Collect the before/after polish scores.`, { label: 'mine:lessons', phase: 'Mine', schema: LESSONS })

phase('Write')
const report = await agent(`${RULE}

You are writing durable documentation for ${ROOT}, so future Claude sessions make better motion graphics faster. Write exactly these files (create docs/ if needed); do not edit anything else:

1. ${ROOT}/CLAUDE.md — loaded automatically into every future session in this folder, so keep it SHORT (<= 120 lines), imperative, and skimmable: what this project is, folder map, the build pipeline (brief -> voice first -> build -> polish -> QA -> mix -> render), the commands (preview/frame scripts, audio scripts, render + master), the TOP rules (the most impactful ~20 from the lessons), performance rules for the user's Mac (1-2 agents max, nice renders, scale 0.4 previews, kill orphan headless Chrome), and pointers to docs/LESSONS.md and docs/REUSE.md for detail. Match the existing house rules in briefs/00-rules.md; do not contradict them.
2. ${ROOT}/docs/LESSONS.md — the full catalogue grouped by category: mistake -> what polish/QA fixed -> preventive rule, with counts and 1-2 examples each; plus the orchestration lessons; plus the polish score stats. Plain English.
3. ${ROOT}/docs/REUSE.md — what is reusable for FUTURE motion-graphics projects (any topic), split into: generic (framework: chapters config/tracker/captions/transitions/focusPull, preview+QA scripts, audio pipeline scripts, workflow prompt patterns for build->polish and QA->verify, briefs/00-rules.md style system) vs topic-specific (fetus/embryo/womb kits). For each: path, what it does, how to reuse it (copy which folders, what to rename). Include a short "start a new explainer in 10 steps" checklist. Note what would make it better as a reusable template or a Claude skill (do not create the skill).

Inputs:
MINED LESSONS:
${JSON.stringify(mined, null, 1)}

${ORCH}

Read the actual files you reference (paths, script names, commands) so every path and command you write is correct. Return a short summary of what you wrote.`, { label: 'write:docs', phase: 'Write' })

return { report, lessons: mined ? mined.lessons.length : 0, scores: mined ? mined.scoreStats : '' }