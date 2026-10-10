export const meta = {
  name: 'birth-long-research-script',
  description: 'Research week-by-week fetal development, fact-check every claim, then write + judge a 2-minute script and storyboard',
  phases: [
    { title: 'Research', detail: '5 researchers: 4 stage ranges + weekly size table' },
    { title: 'Fact-check', detail: 'skeptic re-verifies each research packet against sources' },
    { title: 'Write', detail: '3 script drafts from different angles' },
    { title: 'Judge', detail: '2 judges score the drafts' },
    { title: 'Synthesize', detail: 'final script + storyboard + data files' },
  ],
}

const ROOT = '/Users/tandeemwork/birth-teaser'

const PROJECT = `Project: a vertical (1080x1920) flat-2D motion-graphics explainer of human development from fertilisation to birth, built in Remotion at ${ROOT}.
A 30s teaser already exists (read ${ROOT}/briefs/00-rules.md and ${ROOT}/briefs/scene1.md..scene5.md for its 5 scenes, and ${ROOT}/src/theme/script.ts for its narration).
We are now extending it to a ~2:00-2:20 film that covers the whole pregnancy: ~14 narrated milestones, while an on-screen week counter ticks through ALL 40 weeks showing the baby's size each week (e.g. "size of a lime · 5.4 cm").
Audience: general public on TikTok/Reels/Shorts. Tone: wonder, calm, warm, accurate, never graphic.
CONVENTION: use GESTATIONAL weeks (counted from the first day of the last period), as doctors and pregnancy apps do — so fertilisation is ~week 2, implantation ~week 3-4, heartbeat ~week 6, full term 39-40. Always state which convention a source uses and convert.`

const SOURCES = `Use web search + fetch. Prefer: ACOG, NHS (nhs.uk), Mayo Clinic, Cleveland Clinic, MedlinePlus/NIH, Britannica, Embryo Project (ASU), Carnegie-stage embryology references, peer-reviewed reviews. Avoid blogs/content farms unless only for fruit-size comparisons (and then cross-check the cm/g numbers against a medical source). Every fact needs >= 1 reputable URL; contested facts need 2.`

const RANGES = [
  { key: 'w0-4', range: 'fertilisation through week 4 (gestational): sperm journey, fertilisation, zygote, cleavage, morula, blastocyst, hatching, implantation, hCG, gastrulation / three germ layers, neural tube starting' },
  { key: 'w5-12', range: 'weeks 5-12: heart tube + first beats, neural tube closure, brain regions, limb buds -> paddles -> fingers, eyes/ears forming, end of embryonic period and the switch to "fetus", organs formed, fingers/toes separate, face, eyelids fused, kidneys/urine, swallowing, sex organs beginning' },
  { key: 'w13-27', range: 'weeks 13-27 (second trimester): bone hardening, facial expressions, sucking thumb, hearing begins, quickening (first kicks felt), vernix and lanugo, fingerprints, rapid growth, lungs branching + surfactant starting, viability threshold (~22-24), eyes beginning to open near the end, sleep/wake cycles' },
  { key: 'w28-40', range: 'weeks 28-40 + birth: eyes open, REM-like sleep, brain growth spurt, fat layers, practice breathing, turning head-down, lungs maturing, full term 39-40, typical weight/length at birth, labour (non-graphic), FIRST BREATH (lungs inflate, fluid clears, circulation switches: foramen ovale/ductus close), newborn grasp reflex' },
]

const PACKET = {
  type: 'object',
  properties: {
    milestones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          week: { type: 'string', description: 'gestational week or range, e.g. "6" or "18-20"' },
          fact: { type: 'string', description: 'one plain-language sentence a 12-year-old understands' },
          detail: { type: 'string', description: 'precise technical version with numbers' },
          visual: { type: 'string', description: 'how it could be SHOWN in flat 2D animation' },
          wow: { type: 'number', description: '1-5: how surprising/emotional for a general audience' },
          sources: { type: 'array', items: { type: 'string' } },
          caveat: { type: 'string', description: 'common myth or uncertainty to avoid; empty if none' },
        },
        required: ['week', 'fact', 'detail', 'visual', 'wow', 'sources', 'caveat'],
      },
    },
  },
  required: ['milestones'],
}

const SIZES = {
  type: 'object',
  properties: {
    weeks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          week: { type: 'number' },
          compare: { type: 'string', description: 'everyday object/fruit, short: "a poppy seed", "a lime"' },
          lengthCm: { type: 'number' },
          lengthType: { type: 'string', enum: ['crown-rump', 'crown-heel'] },
          weightG: { type: 'number', description: '0 if negligible/unknown' },
        },
        required: ['week', 'compare', 'lengthCm', 'lengthType', 'weightG'],
      },
    },
    notes: { type: 'string', description: 'where numbers came from, and where the measurement switches from crown-rump to crown-heel' },
    sources: { type: 'array', items: { type: 'string' } },
  },
  required: ['weeks', 'notes', 'sources'],
}

const CHECK = {
  type: 'object',
  properties: {
    verified: { type: 'array', items: { type: 'object', properties: {
      week: { type: 'string' }, fact: { type: 'string' }, detail: { type: 'string' }, visual: { type: 'string' },
      wow: { type: 'number' }, sources: { type: 'array', items: { type: 'string' } }, caveat: { type: 'string' },
      status: { type: 'string', enum: ['confirmed', 'corrected'] }, note: { type: 'string' },
    }, required: ['week', 'fact', 'detail', 'visual', 'wow', 'sources', 'caveat', 'status', 'note'] } },
    rejected: { type: 'array', items: { type: 'object', properties: { fact: { type: 'string' }, why: { type: 'string' } }, required: ['fact', 'why'] } },
  },
  required: ['verified', 'rejected'],
}

const SIZE_CHECK = {
  type: 'object',
  properties: {
    weeks: SIZES.properties.weeks,
    corrections: { type: 'array', items: { type: 'string' } },
    sources: { type: 'array', items: { type: 'string' } },
  },
  required: ['weeks', 'corrections', 'sources'],
}

phase('Research')
const research = await pipeline(
  [...RANGES.map((r) => ({ kind: 'range', ...r })), { kind: 'sizes', key: 'sizes' }],
  (item) => item.kind === 'range'
    ? agent(`${PROJECT}\n\nYou are a medical-science researcher. Research ${item.range}.\n${SOURCES}\nReturn 6-12 milestones for this range, each a separate, specific, checkable claim. Include the most surprising, emotional and visual facts — the kind that make viewers say "wow" — but only if well sourced.`, { label: `research:${item.key}`, phase: 'Research', schema: PACKET })
    : agent(`${PROJECT}\n\nYou are a medical-science researcher. Build a week-by-week size table for gestational weeks 4 to 40 (every week). For each week: an everyday comparison object (fruit/veg/familiar object, short and visual), length in cm and weight in grams, using the standard convention (crown-rump length until ~week 20, crown-heel after). ${SOURCES} Make the comparisons consistent with the cm numbers (a lime ~5-6 cm, etc.) and monotonic (never shrinking).`, { label: 'research:sizes', phase: 'Research', schema: SIZES }),
  (packet, item) => !packet ? null : item.kind === 'range'
    ? agent(`${PROJECT}\n\nYou are a skeptical medical fact-checker. Another researcher produced this packet for ${item.range}. Independently re-verify EVERY milestone: open the cited sources (and search for better ones), check the week number under the GESTATIONAL convention, check the numbers, check the plain-language sentence is not misleading. Confirm, correct (fix week/fact/detail and say why), or reject. Default to rejecting claims you cannot verify. ${SOURCES}\n\nPACKET:\n${JSON.stringify(packet, null, 2)}`, { label: `check:${item.key}`, phase: 'Fact-check', schema: CHECK }).then((c) => ({ key: item.key, ...c }))
    : agent(`${PROJECT}\n\nYou are a skeptical medical fact-checker. Re-verify this week-by-week size table (gestational weeks 4-40): spot-check at least weeks 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40 against medical sources, fix any wrong or inconsistent numbers or comparisons, ensure monotonic growth and that comparisons match the cm numbers. Return the full corrected table. ${SOURCES}\n\nTABLE:\n${JSON.stringify(packet, null, 2)}`, { label: 'check:sizes', phase: 'Fact-check', schema: SIZE_CHECK }).then((c) => ({ key: 'sizes', ...c })),
)

const packets = research.filter(Boolean)
const facts = packets.filter((p) => p.key !== 'sizes')
const sizes = packets.find((p) => p.key === 'sizes')
log(`verified milestones: ${facts.reduce((a, p) => a + p.verified.length, 0)}, rejected: ${facts.reduce((a, p) => a + p.rejected.length, 0)}; sizes: ${sizes ? sizes.weeks.length : 0} weeks`)

const FACTS_TEXT = JSON.stringify(facts.map((p) => ({ range: p.key, milestones: p.verified })), null, 1)

const DRAFT = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    totalSeconds: { type: 'number' },
    chapters: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          week: { type: 'string', description: 'gestational week(s) this chapter covers' },
          seconds: { type: 'number', description: 'planned duration' },
          vo: { type: 'string', description: 'narration for this chapter, exactly as it will be spoken' },
          visual: { type: 'string', description: 'what is on screen, beat by beat' },
          reuse: { type: 'string', description: 'which existing teaser scene (Scene1..Scene5) this reuses/extends, or "new"' },
          factRefs: { type: 'array', items: { type: 'string' }, description: 'the verified facts this chapter relies on' },
        },
        required: ['week', 'seconds', 'vo', 'visual', 'reuse', 'factRefs'],
      },
    },
    rationale: { type: 'string' },
  },
  required: ['title', 'totalSeconds', 'chapters', 'rationale'],
}

const ANGLES = [
  { key: 'wonder', angle: 'WONDER: a Kurzgesagt/Attenborough-style storyteller. Awe, rhythm, short poetic sentences, emotional build to the first breath.' },
  { key: 'teacher', angle: 'CLEAR TEACHER: maximise understanding. Every chapter teaches one concrete thing with a number or comparison a viewer will remember and repeat to friends.' },
  { key: 'hook', angle: 'SOCIAL HOOK: optimised for retention on TikTok/Reels. A killer first 2 seconds, a curiosity loop every ~15s ("but the strangest part happens at week 24..."), a payoff ending that makes people rewatch/share.' },
]

const RULES = `Script rules:
- Total 120-140 seconds at a calm narration pace (~2.3 words/second => ~280-320 words total, leave breathing room for visuals).
- ~12-16 chapters, gestational weeks, chronological, from the race of sperm to the first breath and the newborn grasping a finger ("Hello, world." should stay as the last line).
- Reuse the 5 teaser beats (race+fertilisation, cell division+implantation, week-6 heartbeat, week-12 fingers/toes/face, week-20 first kick, week-40 birth + hand grip) and add new chapters between them.
- One clear idea per chapter, each must be easy to SHOW in flat 2D animation inside a womb/cell world (no talking heads, no text walls). On-screen text is only the captions + the week counter/size chip.
- Use ONLY facts from the verified list below. No myths (e.g. no "fish gills" / recapitulation, no "the heart beats at 3 weeks").
- Mention the week convention once, lightly, near the start (e.g. doctors count from the last period, so conception is "week 2").
- Plain English; numbers spoken naturally ("about the size of a lime").`

phase('Write')
const drafts = await parallel(ANGLES.map((a) => () =>
  agent(`${PROJECT}\n\nYou are a top documentary scriptwriter. Angle: ${a.angle}\n${RULES}\n\nVERIFIED FACTS:\n${FACTS_TEXT}`, { label: `write:${a.key}`, phase: 'Write', schema: DRAFT }).then((d) => d && { angle: a.key, ...d })
))
const okDrafts = drafts.filter(Boolean)

const SCORE = {
  type: 'object',
  properties: {
    scores: { type: 'array', items: { type: 'object', properties: {
      angle: { type: 'string' }, hook: { type: 'number' }, clarity: { type: 'number' }, emotion: { type: 'number' },
      accuracy: { type: 'number' }, animatable: { type: 'number' }, pacing: { type: 'number' }, total: { type: 'number' },
      bestBits: { type: 'array', items: { type: 'string' } }, problems: { type: 'array', items: { type: 'string' } },
    }, required: ['angle', 'hook', 'clarity', 'emotion', 'accuracy', 'animatable', 'pacing', 'total', 'bestBits', 'problems'] } },
    winner: { type: 'string' },
  },
  required: ['scores', 'winner'],
}

phase('Judge')
const DRAFTS_TEXT = JSON.stringify(okDrafts, null, 1)
const judges = await parallel([
  'a documentary director who cares about story, emotion and pacing',
  'a medical embryologist who cares about accuracy and not misleading viewers, and a motion designer who cares whether each chapter can be animated beautifully in flat 2D',
].map((who, i) => () => agent(`${PROJECT}\n\nYou are ${who}. Score each draft 1-10 on hook, clarity, emotion, accuracy (check every claim against the verified facts), animatable, pacing (does the word count fit the planned seconds at ~2.3 words/s?), and total. List the best lines/ideas worth keeping from each and the problems.\n${RULES}\n\nVERIFIED FACTS:\n${FACTS_TEXT}\n\nDRAFTS:\n${DRAFTS_TEXT}`, { label: `judge:${i + 1}`, phase: 'Judge', schema: SCORE })))

phase('Synthesize')
const final = await agent(`${PROJECT}\n\nYou are the head writer and director. Produce the FINAL script and storyboard for the ~2:00-2:20 film by taking the winning draft and grafting in the best lines/ideas from the others, fixing every problem the judges raised.\n${RULES}\n\nVERIFIED FACTS:\n${FACTS_TEXT}\n\nWEEKLY SIZE TABLE (verified):\n${JSON.stringify(sizes ? sizes.weeks : [], null, 1)}\n\nDRAFTS:\n${DRAFTS_TEXT}\n\nJUDGES:\n${JSON.stringify(judges.filter(Boolean), null, 1)}\n\nWrite these files (create the folder):
1. ${ROOT}/briefs/long/script.md — title, total duration, then each chapter: week(s), planned seconds, the exact narration. Then the full narration again as one clean block (one line per sentence, blank line between chapters) ready to paste into ElevenLabs.
2. ${ROOT}/briefs/long/storyboard.md — per chapter: duration, narration, beat-by-beat visuals (what moves when, tied to words), which existing scene it reuses/extends (Scene1..Scene5 under src/scenes/) or that it is new, start/end handoff states so chapters flow as one continuous shot, and accuracy notes.
3. ${ROOT}/briefs/long/facts.md — every fact used, with week, plain sentence, sources.
4. ${ROOT}/briefs/long/sizes.json — the verified weekly table [{week, compare, lengthCm, lengthType, weightG}] for weeks 4-40.
Then return a short summary: total seconds, word count, chapter list (week + one-line idea), and anything the user must decide.`, { label: 'synthesize', phase: 'Synthesize' })

return { final, judges: judges.filter(Boolean).map((j) => ({ winner: j.winner, totals: j.scores.map((s) => `${s.angle}:${s.total}`) })), rejectedFacts: facts.flatMap((p) => p.rejected) }