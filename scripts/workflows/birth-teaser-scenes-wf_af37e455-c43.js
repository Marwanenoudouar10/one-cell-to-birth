export const meta = {
  name: 'birth-teaser-scenes',
  description: 'Build the 5 Remotion scenes of the birth teaser in parallel, then an independent art-director pass polishes each',
  phases: [
    { title: 'Build', detail: 'one builder agent per scene' },
    { title: 'Polish', detail: 'independent art director critiques + fixes each scene' },
  ],
}

const ROOT = '/Users/tandeemwork/birth-teaser'
const SCENES = ['Scene1', 'Scene2', 'Scene3', 'Scene4', 'Scene5']

const BUILD = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: 'what the scene shows, beat by beat' },
    files: { type: 'array', items: { type: 'string' } },
    renderSeconds: { type: 'number', description: 'time of last scripts/preview.sh run' },
    knownIssues: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'files', 'knownIssues'],
}

const REVIEW = {
  type: 'object',
  properties: {
    scoreBefore: { type: 'number', description: '1-10 art-director score before your fixes' },
    scoreAfter: { type: 'number', description: '1-10 after your fixes' },
    fixed: { type: 'array', items: { type: 'string' } },
    remaining: { type: 'array', items: { type: 'string' } },
    startState: { type: 'string', description: 'what frame 0-15 looks like (positions/sizes/colours)' },
    endState: { type: 'string', description: 'what the last 15 frames look like' },
  },
  required: ['scoreBefore', 'scoreAfter', 'fixed', 'remaining', 'startState', 'endState'],
}

const n = (id) => id.replace('Scene', '')

const buildPrompt = (id) => `You are a senior motion designer + React/Remotion engineer building ${id} of a 30s motion-graphics teaser.

Project: ${ROOT}
1. Read ${ROOT}/briefs/00-rules.md (shared rules — follow them exactly) and ${ROOT}/briefs/scene${n(id)}.md (your storyboard).
2. Read the shared code you will use: src/theme/*.ts, src/lib/ease.ts, src/lib/SvgDefs.tsx, src/overlays/Background.tsx, src/overlays/Captions.tsx (so you know what sits around your scene).
3. Replace the placeholder in src/scenes/${id}/ with the real scene. index.tsx must export \`${id}\`. Only touch files inside src/scenes/${id}/. No file over 300 lines.
4. Iterate: render with \`scripts/preview.sh ${id}\`, read out/${id}-sheet.jpg, pull exact frames with \`scripts/frame.sh ${id} <frames...>\` at every beat (BEATS.${id}) plus frame 0 and the last frame, read them, and judge them like a strict art director. Do at least 3 full render -> look -> improve cycles. Aim for genuinely beautiful, studio-quality frames, not a prototype.
5. Finish with clean types in your folder (\`npx tsc --noEmit 2>&1 | grep "src/scenes/${id}" || echo clean\`) and a final successful preview render.

Other agents are building other scenes at the same time in other folders: never edit outside src/scenes/${id}/, and ignore their errors.
Return the structured summary.`

const reviewPrompt = (id, built) => `You are an independent, demanding art director and science reviewer. Another agent just built ${id} of a 30s motion-graphics teaser about human development (fertilisation -> birth). Your job: find what keeps it from looking world-class, then FIX it yourself.

Project: ${ROOT}
Brief: ${ROOT}/briefs/00-rules.md and ${ROOT}/briefs/scene${n(id)}.md. Code: src/scenes/${id}/.
Builder's own report (may be optimistic — verify everything yourself):
${JSON.stringify(built, null, 2)}

1. Render: \`cd ${ROOT} && source ~/.nvm/nvm.sh && scripts/preview.sh ${id}\`. Read out/${id}-sheet.jpg. Pull frames 0, 8, 15, every beat in BEATS.${id} (src/theme/beats.ts), beat+6 for each, last-15 and last frame with \`scripts/frame.sh ${id} ...\` and read every one.
2. Score it 1-10 and write a ranked list of problems, checking: (a) does each beat clearly read at phone size, one focal point at a time; (b) visual polish — lighting, depth, gradients, silhouettes, no clip-art look, no awkward overlaps or clipping, no empty dead frames; (c) motion — easing, anticipation/overshoot, secondary motion, no jitter or popping between frames (compare adjacent frames); (d) brief compliance — START/END handoff states exactly as specified, safe zones (tracker y 100-240, captions y 1300-1560 calm and readable), palette only; (e) scientific accuracy per the brief; (f) code — deterministic (no Math.random/Date), files <= 300 lines, only inside src/scenes/${id}/.
3. Fix the problems in order of visual impact, directly in src/scenes/${id}/. Re-render and re-check after fixes; do at least 2 fix -> render -> look cycles. Do not edit anything outside src/scenes/${id}/ (other agents are working in other folders; ignore their errors).
4. End with clean types in your folder (\`npx tsc --noEmit 2>&1 | grep "src/scenes/${id}" || echo clean\`) and a successful final render.
Return the structured review.`

const results = await pipeline(
  SCENES,
  (id) => agent(buildPrompt(id), { label: `build:${id}`, phase: 'Build', schema: BUILD }),
  (built, id) => built
    ? agent(reviewPrompt(id, built), { label: `polish:${id}`, phase: 'Polish', schema: REVIEW }).then((r) => ({ id, built, review: r }))
    : { id, built: null, review: null },
)

return results