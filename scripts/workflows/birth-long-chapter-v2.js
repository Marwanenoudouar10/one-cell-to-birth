export const meta = {
  name: 'birth-long-chapter-v2',
  description: 'Build + polish ONE chapter from its one-page chapter pack (faster: less reading, range renders, joins checked once at the end); same quality bar',
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
READ ONLY TWO THINGS FIRST: ${ROOT}/CLAUDE.md (house rules + top rules) and your chapter pack ${ROOT}/briefs/long/packs/${id}.md (your storyboard section, the previous chapter's END, the next chapter's START, the REAL voice word timings, your verified facts, and the kit APIs you need). Open other briefs only if the pack leaves something unclear. Do not re-read docs/LESSONS.md (CLAUDE.md already has its rules).
VOICE: the word timings in the pack are measured from the audio (about ±2 frames): trust them; do not re-measure onsets yourself. Every beat in beats.ts tagged // sync: "<word>" lands on its word (or 1-3 frames before).
${reuse ? `REUSE (CLAUDE.md rule 21): this chapter matches the finished teaser scene ${reuse}. Keep at least 80% of that scene's code and look (copy it into your folder, never import src/scenes); change only timing and what the storyboard adds.` : ''}
JOINS: match the previous chapter's END and hand over to the next chapter's START by the NUMBERS in the pack (positions, sizes, zoom, colours). Do NOT pixel-diff against neighbours: the orchestrator runs one careful pass over all joins at the end.
FAST ITERATION (same quality bar, less waiting): fix one thing, then re-render only the affected range with \`FRAMES=a-b scripts/long-preview.sh ${id} 0.4\` (writes out/long/${id}/scratch/range-a-b.mp4 + sheet); do a full-chapter preview at the start and at the end. Pull single frames with scripts/long-frame.sh. One render at a time, never parallel renders (the user's Mac).
OUTPUT FOLDERS: out/long/${id}/{preview.mp4, sheet.jpg, frames/}; extra images only in out/long/${id}/scratch/ with descriptive names; delete scratch you no longer need before finishing.
Boundaries: edit ONLY src/long/chapters/${id}/. Never edit finished chapters, shared kits, src/scenes, or shared files.`

const buildPrompt = `${args.note ? args.note + '\n' : ''}You are a senior motion designer + Remotion engineer building chapter ${id} of a ~2:29 vertical motion-graphics film about human development (flat 2D, Kurzgesagt-like, studio quality).
${COMMON}
Your folder src/long/chapters/${id}/ may already contain partial work from an earlier interrupted builder (made before the real voice existed): render it first; keep what is good, fix or replace what is not.
Build to the storyboard with the shared kits (fetus/embryo/womb) so the baby and world stay consistent. beats.ts holds every story moment (sync-tagged). No audio in the chapter: return sfxCues (local seconds) instead.
Iterate: full preview -> read out/long/${id}/sheet.jpg -> pull frames at every beat, frame 0 and the last frame -> judge like a strict art director against CLAUDE.md's top rules (especially 11 face/animal traps, 22 every narrated thing visible on its word, 23 minimum readable size) -> fix with range renders -> repeat until it genuinely meets the bar. Finish with clean types (\`npx tsc --noEmit 2>&1 | grep "src/long/chapters/${id}" || echo clean\`) and a final successful preview.`

const reviewPrompt = (built) => `You are an independent, demanding art director AND embryology fact-checker reviewing chapter ${id}. Find what keeps it from being world-class, then FIX it yourself.
${COMMON}
Builder's report (may be optimistic — verify everything yourself):
${JSON.stringify(built, null, 1)}
1. The builder already rendered out/long/${id}/preview.mp4 + sheet.jpg: start from those (re-render only if they are older than the code). Pull frames 0, 8, 15, every beat in beats.ts and beat+6, last-15 and the last frame (scripts/long-frame.sh ${id} ...); read them all.
2. Score 1-10 and rank problems against CLAUDE.md's top rules and docs/LESSONS.md: readability at phone size, polish, motion (no pops), sync to the real voice words, START/END handoffs by the pack's numbers (the final join pass does the pixel matching), safe zones, accuracy, consistency with the kits and the teaser look, code rules.
3. Fix in order of impact, only inside src/long/chapters/${id}/, verifying each fix with a range render (FRAMES=a-b), then one full preview at the end. End with clean types and a successful preview, and delete your scratch files.
Return the structured review including the final sfxCues.`

let built = args.builtReport || null
if (mode !== 'polish') {
  phase('Build')
  built = await agent(buildPrompt, { label: `build:${id}`, phase: 'Build', schema: BUILD })
}
phase('Polish')
const review = built ? await agent(reviewPrompt(built), { label: `polish:${id}`, phase: 'Polish', schema: REVIEW }) : null
return { id, built, review }