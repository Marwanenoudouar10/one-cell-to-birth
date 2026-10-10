export const meta = {
  name: 'birth-long-chapters-retry',
  description: 'Build a batch of chapters of the 2-min film in parallel, each followed by an independent art-director/science polish pass',
  phases: [
    { title: 'Build', detail: 'one builder per chapter (+ framework fixes in batch 1)' },
    { title: 'Polish', detail: 'independent reviewer critiques and fixes each chapter' },
  ],
}

const ROOT = '/Users/tandeemwork/birth-teaser'
const IDS = args.ids
const WITH_FRAMEWORK = !!args.framework

const BUILD = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
    sfxCues: { type: 'array', items: { type: 'object', properties: { localSec: { type: 'number' }, sound: { type: 'string' }, note: { type: 'string' } }, required: ['localSec', 'sound', 'note'] } },
    startState: { type: 'string' },
    endState: { type: 'string' },
    knownIssues: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'files', 'sfxCues', 'startState', 'endState', 'knownIssues'],
}

const REVIEW = {
  type: 'object',
  properties: {
    scoreBefore: { type: 'number' },
    scoreAfter: { type: 'number' },
    fixed: { type: 'array', items: { type: 'string' } },
    remaining: { type: 'array', items: { type: 'string' } },
    sfxCues: { type: 'array', items: { type: 'object', properties: { localSec: { type: 'number' }, sound: { type: 'string' }, note: { type: 'string' } }, required: ['localSec', 'sound', 'note'] } },
    startState: { type: 'string' },
    endState: { type: 'string' },
  },
  required: ['scoreBefore', 'scoreAfter', 'fixed', 'remaining', 'sfxCues', 'startState', 'endState'],
}

const READ = `Read first (in this order): ${ROOT}/briefs/00-rules.md (style, palette, motion bar, perf), ${ROOT}/src/long/README.md (chapter contract + preview commands), ${ROOT}/briefs/long/storyboard.md (the "How to read this", "Film-wide rules", tables, YOUR chapter section, and the sections of the chapters right before and after yours for handoffs), ${ROOT}/briefs/long/foundations.md (APIs of the shared kits: src/shared/fetus, src/shared/embryo, src/shared/womb, and the src/long framework), ${ROOT}/briefs/long/script.md (narration), and the facts for your weeks in ${ROOT}/briefs/long/facts.md.`

const buildPrompt = (id) => `${args.note || ""}\nYou are a senior motion designer + Remotion engineer building chapter ${id} of a ~2:18 vertical motion-graphics film about human development (flat 2D, Kurzgesagt-like, studio quality). The 30s teaser it grew from is in src/scenes/Scene1..5 (composition "Main") and looks great — match its quality and look.
Project: ${ROOT}. Node: \`source ~/.nvm/nvm.sh\`.
${READ}
Build: replace the placeholder in src/long/chapters/${id}/ (index.tsx must keep \`export const ${id}: React.FC\`). Use the shared kits (fetus/embryo/womb) so the baby and world stay consistent across chapters. If the storyboard says your chapter reuses a teaser scene, COPY the relevant code from src/scenes/SceneN into your folder and adapt it (never import from src/scenes; never edit it).
Timing: put every story moment in src/long/chapters/${id}/beats.ts as local seconds/frames, each with a comment \`// sync: "<exact caption word>"\` (the word it must land on) or \`// free\`. Use the storyboard's planned times; the real voice will be re-timed later by editing only beats.ts, so never hard-code beat frames elsewhere.
No audio in your chapter: instead return sfxCues (local seconds) describing the sounds your animation needs.
Boundaries: edit ONLY src/long/chapters/${id}/. Other agents build other chapters and the framework (tracker, captions, data) at the same time — ignore their files and type errors; the tracker/captions in your previews may change while you work.
Iterate: \`scripts/long-preview.sh ${id}\` -> read out/long-${id}-sheet.jpg; \`scripts/long-frame.sh ${id} <frames>\` at every beat, frame 0, and the last frame; judge like a strict art director; at least 3 render -> look -> improve cycles. Respect safe zones (tracker band y 100-290 from C02 on, captions y 1300-1560 calm/dark), START/END handoffs, accuracy notes, and the film-wide rules (no on-screen text in the art). Files <= 300 lines, deterministic, palette C, SVG ids prefixed "${id.toLowerCase()}-".
Finish with clean types for your folder (\`npx tsc --noEmit 2>&1 | grep "src/long/chapters/${id}" || echo clean\`) and a final successful preview.`

const reviewPrompt = (id, built) => `You are an independent, demanding art director AND embryology fact-checker. Another agent just built chapter ${id} of a ~2:18 vertical motion-graphics film about human development. Find what keeps it from being world-class, then FIX it yourself.
Project: ${ROOT}. Node: \`source ~/.nvm/nvm.sh\`.
${READ}
Builder's report (may be optimistic, verify everything):
${JSON.stringify(built, null, 2)}
1. \`scripts/long-preview.sh ${id}\`, read the sheet, pull frames 0, 8, 15, every beat in src/long/chapters/${id}/beats.ts and beat+6, last-15 and the last frame (\`scripts/long-frame.sh ${id} ...\`); read them all.
2. Score 1-10 and rank problems: each beat reads at phone size with one focal point; polish (lighting, depth, silhouettes, no clip-art, no clipping, no dead frames); motion (easing, anticipation, secondary motion, no popping between adjacent frames); storyboard compliance (beats, START/END handoffs with neighbours, safe zones, no text in the art, film-wide rules); scientific accuracy vs facts.md; consistency with the shared kits and the teaser look; code (beats.ts sync comments, deterministic, <= 300 lines, only inside src/long/chapters/${id}/).
3. Fix in order of impact, only inside src/long/chapters/${id}/. At least 2 fix -> render -> look cycles. End with clean types for the folder and a successful preview.
Return the structured review, including the final sfxCues (local seconds) the chapter needs.`

const FRAMEWORK = `You own the long-film framework at ${ROOT}/src/long (NOT src/long/chapters/*, NOT registry.ts, NOT chapters.ts — those are already final). Node: \`source ~/.nvm/nvm.sh\`.
Read ${ROOT}/briefs/long/storyboard.md ("How to read this", "Film-wide rules", "Stage chip" table and the Appendix items 2-5), ${ROOT}/briefs/long/script.md, ${ROOT}/src/long/README.md, and ${ROOT}/briefs/long/foundations.md (framework section).
Do: (1) Appendix item 2: completed-week counting (weekNumber floor), no DAY mode in the long film, chip uses floor week. (2) Item 3: replace src/long/data/stages.ts with the stage table. (3) Item 4: src/long/data/sizes.ts loads/embeds the verified rows from briefs/long/sizes.json with article split ("size of a lime") and CRL/CHL mapping. (4) Item 5: src/long/data/lines.ts — one caption line per sentence of script.md (exact text), accent word as emphasis, local times taken from the storyboard's per-phrase timings for each chapter (estimate per-word times by phrase if needed). (5) Port two verified QA fixes from the teaser's src/overlays/Captions.tsx into the long captions: a line must fully fade out 2 frames before the next line's first word appears (no stacked text), and the LAST line ("Hello, world.") is an end title (bigger ~112px, one line, gold "world.", never fades out, slow 4% scale-up). (6) Make sure the tracker hides as specified (C01 hidden; appears in C02; hides in C16 after the flash).
Verify: \`npx tsc --noEmit 2>&1 | grep "src/long/" | grep -v "src/long/chapters" || echo clean\`, then \`scripts/long-tracker.sh 0.5 15\` and pull frames from \`scripts/long-render.sh 0.25\` around every chapter boundary and every weekKey; read them; the chip must read well and never say "a a". Other agents are editing src/long/chapters/* at the same time — ignore their errors. Return a short report.`

const items = IDS.map((id) => ({ kind: 'chapter', id }))
if (WITH_FRAMEWORK) items.unshift({ kind: 'framework', id: 'framework' })

const results = await pipeline(
  items,
  (it) => it.kind === 'framework'
    ? agent(FRAMEWORK, { label: 'build:framework', phase: 'Build' }).then((r) => ({ framework: r }))
    : agent(buildPrompt(it.id), { label: `build:${it.id}`, phase: 'Build', schema: BUILD }),
  (built, it) => it.kind === 'framework' ? built
    : built
      ? agent(reviewPrompt(it.id, built), { label: `polish:${it.id}`, phase: 'Polish', schema: REVIEW }).then((r) => ({ id: it.id, built, review: r }))
      : { id: it.id, built: null, review: null },
)
return results