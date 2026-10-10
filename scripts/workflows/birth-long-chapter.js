export const meta = {
  name: 'birth-long-chapter',
  description: 'Build and/or polish ONE chapter of the long film (one agent at a time), using CLAUDE.md, real voice timings, teaser reuse and tidy output folders',
  phases: [
    { title: 'Build', detail: 'builder (skipped in polish-only mode)' },
    { title: 'Polish', detail: 'independent art-director + science reviewer' },
  ],
}

const ROOT = '/Users/tandeemwork/birth-teaser'
const id = args.id
const mode = args.mode || 'build+polish'
const reuse = args.reuse || ''

const SCHEMA_CUES = { type: 'array', items: { type: 'object', properties: { localSec: { type: 'number' }, sound: { type: 'string' }, note: { type: 'string' } }, required: ['localSec', 'sound', 'note'] } }
const BUILD = { type: 'object', properties: { summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } }, sfxCues: SCHEMA_CUES, startState: { type: 'string' }, endState: { type: 'string' }, knownIssues: { type: 'array', items: { type: 'string' } } }, required: ['summary', 'files', 'sfxCues', 'startState', 'endState', 'knownIssues'] }
const REVIEW = { type: 'object', properties: { scoreBefore: { type: 'number' }, scoreAfter: { type: 'number' }, fixed: { type: 'array', items: { type: 'string' } }, remaining: { type: 'array', items: { type: 'string' } }, sfxCues: SCHEMA_CUES, startState: { type: 'string' }, endState: { type: 'string' } }, required: ['scoreBefore', 'scoreAfter', 'fixed', 'remaining', 'sfxCues', 'startState', 'endState'] }

const COMMON = `Project: ${ROOT}. Node: \`source ~/.nvm/nvm.sh\`.
READ FIRST, in order: ${ROOT}/CLAUDE.md (house rules, top rules, output folders, performance), ${ROOT}/docs/LESSONS.md (every mistake earlier agents made and how polish fixed it — do not repeat them), ${ROOT}/src/long/README.md (chapter contract), ${ROOT}/briefs/long/storyboard.md ("How to read this", "Film-wide rules", tables, YOUR chapter's section and the neighbours' sections for handoffs), ${ROOT}/briefs/long/foundations.md (shared kit APIs), and your weeks in ${ROOT}/briefs/long/facts.md.
REAL VOICE: the final voiceover exists. Word timings in chapter-LOCAL seconds are in ${ROOT}/briefs/long/vo-words.md (captions already follow them). Every beat in beats.ts tagged // sync: "<word>" must land on that word's real time (or 1-3 frames before). Your chapter's duration is in src/long/chapters.ts (some were extended to fit the voice).
${reuse ? `REUSE (CLAUDE.md rule 21): this chapter matches the finished teaser scene ${reuse}. Keep at least 80% of that scene's code and look (copy it into your folder, never import src/scenes); change only timing and what the storyboard adds.` : ''}
THE USER'S MAC MUST STAY RESPONSIVE: run only ONE render at a time, never parallel renders; previews at scale 0.4 (scripts/long-preview.sh ${id} 0.4); full-res only for fine detail (FULL=1 scripts/long-frame.sh ${id} <frame>).
OUTPUT FOLDERS: the scripts write out/long/${id}/{preview.mp4, sheet.jpg, frames/}. Any extra test image goes in out/long/${id}/scratch/ with a descriptive name; never write loose files in out/. Before finishing, delete scratch you no longer need.
Boundaries: edit ONLY src/long/chapters/${id}/. Never edit finished chapters, shared kits, src/scenes, or shared files.`

const buildPrompt = `${args.note ? args.note + '\n' : ''}You are a senior motion designer + Remotion engineer building chapter ${id} of a ~2:29 vertical motion-graphics film about human development (flat 2D, Kurzgesagt-like, studio quality).
${COMMON}
Your folder src/long/chapters/${id}/ may already contain partial work from an earlier interrupted builder: inspect it and render it first; keep what is good, fix or replace what is not.
Build to the storyboard with the shared kits (fetus/embryo/womb) so the baby and world stay consistent. beats.ts holds every story moment (sync-tagged). No audio in the chapter: return sfxCues (local seconds) instead.
Iterate: render -> read out/long/${id}/sheet.jpg -> pull frames at every beat, frame 0 and the last frame -> judge like a strict art director against CLAUDE.md's top rules -> improve. At least 3 cycles. Finish with clean types (\`npx tsc --noEmit 2>&1 | grep "src/long/chapters/${id}" || echo clean\`) and a final successful preview.`

const reviewPrompt = (built) => `You are an independent, demanding art director AND embryology fact-checker reviewing chapter ${id}. Find what keeps it from being world-class, then FIX it yourself.
${COMMON}
Builder's report (may be optimistic — verify everything yourself):
${JSON.stringify(built, null, 1)}
1. Render (scripts/long-preview.sh ${id} 0.4), read the sheet, pull frames 0, 8, 15, every beat in beats.ts and beat+6, last-15 and the last frame (scripts/long-frame.sh ${id} ...); read them all.
2. Score 1-10 and rank problems against CLAUDE.md's top rules and docs/LESSONS.md: readability at phone size, polish, motion (no pops), sync to the real voice words, START/END handoffs with the neighbouring chapters (pixel-check against their real frames where they exist), safe zones, accuracy, consistency with the kits and the teaser look, code rules.
3. Fix in order of impact, only inside src/long/chapters/${id}/. At least 2 fix -> render -> look cycles. End with clean types and a successful preview, and delete your scratch files.
Return the structured review including the final sfxCues.`

let built = args.builtReport || null
if (mode !== 'polish') {
  phase('Build')
  built = await agent(buildPrompt, { label: `build:${id}`, phase: 'Build', schema: BUILD })
}
phase('Polish')
const review = built ? await agent(reviewPrompt(built), { label: `polish:${id}`, phase: 'Polish', schema: REVIEW }) : null
return { id, built, review }