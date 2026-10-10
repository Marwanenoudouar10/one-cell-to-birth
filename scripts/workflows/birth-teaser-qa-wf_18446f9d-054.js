export const meta = {
  name: 'birth-teaser-qa',
  description: 'Multi-lens QA of the 30s birth teaser with sound; each finding adversarially verified',
  phases: [
    { title: 'Inspect', detail: '4 lenses: sync, audio mix, retime regressions, first-time viewer' },
    { title: 'Verify', detail: 'a skeptic tries to refute each finding' },
  ],
}

const ROOT = '/Users/tandeemwork/birth-teaser'
const FILM = `${ROOT}/out/birth-teaser-draft2.mp4`

const CONTEXT = `Project: ${ROOT} (Remotion 4, 1080x1920, 30fps, 900 frames = 30s). Final film with sound: ${FILM}.
Scenes start at global frames Scene1 0, Scene2 180, Scene3 330, Scene4 480, Scene5 690 (15-frame crossfades).
Key files: src/theme/beats.ts (story beats, local frames), src/theme/voTiming.ts (generated word timings of the voiceover, global seconds),
src/theme/script.ts, src/audio/clips.ts (every VO/SFX clip and its global time), src/audio/Soundtrack.tsx, src/overlays/Captions.tsx,
scripts/audio/*.py (how audio was built), public/vo/*.wav, public/sfx/*.wav, src/scenes/SceneN/ (each scene), briefs/*.md (storyboards).
Music is intentionally missing for now (the user will add it later) — do not report "no music" as a finding.
Tools: ffmpeg/ffprobe are installed (extract frames: ffmpeg -ss <sec> -i ${FILM} -frames:v 1 out/qa-<you>-<name>.png ; read PNGs to see them).
python3 (no numpy) is available for audio analysis. Node via \`source ~/.nvm/nvm.sh\`. Save any scratch files as out/qa-<lens>-*.
READ-ONLY review: do NOT edit any source file. Report findings only.`

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          evidence: { type: 'string', description: 'exact times/frames, measurements, files+lines' },
          fix: { type: 'string', description: 'concrete fix: which file, what change' },
        },
        required: ['title', 'severity', 'evidence', 'fix'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT = {
  type: 'object',
  properties: {
    real: { type: 'boolean' },
    reason: { type: 'string' },
    betterFix: { type: 'string', description: 'if the proposed fix is wrong or risky, a better one; else empty' },
  },
  required: ['real', 'reason', 'betterFix'],
}

const LENSES = [
  { key: 'sync', prompt: `Lens: SYNC. Check that picture, captions, voice and effects line up. For every word in voTiming.ts verify its caption word appears within ~2 frames of when it is actually heard (measure the voice onset in the final film's audio, e.g. ffmpeg silencedetect / short-window RMS). For every story beat in beats.ts verify the visual event happens on screen at that frame (pull frames around it from the film) AND that the matching effect in clips.ts lands on it (measure the audio around it). Special checks: Scene3 heartbeat — compare frames where the heart glow peaks with the thump times in the audio (they must coincide within 1 frame); Scene1 flash vs impact; Scene4 kick vs thump; Scene5 flash vs riser peak; Scene2 splits vs pops. Report every mismatch > 2 frames with exact numbers.` },
  { key: 'mix', prompt: `Lens: AUDIO MIX. Analyse the final film's audio track (extract to wav with ffmpeg). Check: voice clarity (is any word masked by an effect? compare short-term loudness of VO-only windows vs VO+SFX windows), effect levels relative to voice (effects should support, never compete; voice should sit ~6-10 dB above effects when they overlap), clicks/pops at clip edges (look for sample discontinuities at every clip start/end time from clips.ts), clipping/true peak, awkward dead silences, abrupt cut-offs (e.g. heartbeat ending, riser tail, impact tail cut by scene changes), and whether each effect is audible at all at phone-speaker levels. Also listen-by-analysis to each public/sfx/*.wav: does the cell pop sound like a pop (energy shape), is the synthesized kick thump too subby for phone speakers (energy below 80 Hz is inaudible on phones — check spectral balance with ffmpeg showspectrum or band-pass RMS)? Give dB numbers.` },
  { key: 'retime', prompt: `Lens: RETIME REGRESSIONS. beats.ts was just changed to match the real voice: Scene2 two 7.5->7.65s, four 8.5->8.4s, hundreds 9.6->9.3s; Scene4 face 19.1->19.3s, weekTwenty 20.4->20.3s, kick 21.9->22.0s; Scene5 human 26.8->26.9s. The scene code was written and polished against the OLD values. Read src/scenes/Scene2, Scene4, Scene5 code for any timing that assumed the old gaps (hard-coded frame numbers, durations between beats, phases that now overlap or leave dead time, things that now finish after the scene ends or after the crossfade starts). Pull frames from the film around each changed beat and confirm each animation still reads correctly. Report concrete breakages with file:line.` },
  { key: 'viewer', prompt: `Lens: FIRST-TIME VIEWER + ART DIRECTOR. Watch the film as frames: pull one frame every 0.5s (60 frames) plus extra frames at every cut (6, 11, 16, 23s ±0.25s), and read them in order. Judge it as a viewer scrolling a phone feed and as a demanding art director: Is the hook in the first 1.5s strong? Is every caption readable over its background? Does each moment have one clear focal point? Are there ugly frames (clipping, half-transparent overlaps, glitches, empty frames, text over busy areas, tracker text clashing)? Is the ending (last 2s) a satisfying, thumbnail-worthy payoff? Is anything scientifically wrong or tasteless? Report the most important problems only, ranked, with exact timestamps.` },
]

const results = await pipeline(
  LENSES,
  (l) => agent(`${CONTEXT}\n\n${l.prompt}\n\nReturn at most 8 findings, most important first. Only report problems you have evidence for.`, { label: `inspect:${l.key}`, phase: 'Inspect', schema: FINDINGS }),
  (r, l) => parallel((r?.findings ?? []).map((f, i) => () =>
    agent(`${CONTEXT}\n\nA reviewer (${l.key} lens) reported this problem in the film. Your job is to try to REFUTE it: re-measure or re-check it yourself from the film and source. If you are unsure, or the evidence does not hold up, say real=false. Also judge whether the proposed fix is correct and safe; if not, give a better one.\n\nFINDING:\n${JSON.stringify(f, null, 2)}`, { label: `verify:${l.key}#${i + 1}`, phase: 'Verify', schema: VERDICT })
      .then((v) => ({ lens: l.key, ...f, verdict: v }))
  )),
)

const all = results.flat().filter(Boolean)
const confirmed = all.filter((f) => f.verdict && f.verdict.real)
const rejected = all.filter((f) => !f.verdict || !f.verdict.real)
log(`${confirmed.length} confirmed, ${rejected.length} refuted`)
return { confirmed, rejected: rejected.map((f) => ({ lens: f.lens, title: f.title, why: f.verdict ? f.verdict.reason : 'no verdict' })) }