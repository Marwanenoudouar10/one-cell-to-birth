# One Cell to Birth

**Hello, World: Forty Weeks from One Cell** is a 2.5-minute vertical (1080x1920) motion-graphics film about human development, from a single cell to birth, week by week. It is made entirely in code with [Remotion](https://www.remotion.dev) (React + TypeScript). Flat 2D, every frame generated, every fact checked against medical sources.

<p align="center">
  <img src="docs/images/hook.gif" width="270" alt="The opening: a newborn's hand grips a finger, then the camera dives into a gold speck in the palm and back to the single cell" />
</p>

<p align="center">
  <img src="docs/images/stills.jpg" width="820" alt="Frames from the film: the hand grip, the race of sperm, cell division, implantation and the pregnancy test, the three germ layers, the first heartbeat, webbed fingers at week 8, the fetus at week 20" />
</p>

## What the film covers
A question hook ("Have you ever wondered how you began?"), then 16 chapters: the race and fertilisation, cell division, implantation and the pregnancy-test hormone, the three germ layers, the first heartbeat, the first movement, webbed fingers and the tail, embryo becoming a fetus, fingerprints, the first kick a mother feels, hearing and opening eyes, the brain growth spurt, practice breathing, knowing mum's voice, and birth with the first breath. A week counter with a size label ("size of a lime · 5.4 cm") runs through all 40 weeks.

**Status:** chapters C00-C08 are finished (with voice); C09-C16 are in progress. See `RESUME.md`.
A shorter 30-second cut (composition `Main`, `src/scenes/`) came first and is finished; the long film reuses its look and code.

## Run it
```bash
npm install
npm run studio                                   # Remotion Studio: browse Long, Main and every chapter
scripts/long-preview.sh C05 0.4                  # one chapter, with its voice -> out/long/C05/preview.mp4 + sheet.jpg
npx remotion render src/long/entry.ts Long out/final/long.mp4    # the full film
```
Audio pipeline (voice split into chapter clips, word timing, sound-effect prep, -14 LUFS master): `scripts/audio/` and the commands in `CLAUDE.md`.

## How it is organised
```
src/long/               the film: chapters.ts (timeline), chapters/C00..C16/, captions, week counter + size chip
src/shared/             reusable kits: fetus (weeks 9-40), embryo (weeks 3-8), womb
src/scenes/             the earlier 30 s cut
src/theme, src/lib      palette, layout, easing, transitions (focusPull)
scripts/                preview / render / audio / QA scripts, plus the AI-agent workflow scripts
briefs/                 storyboard, narration, fact list with sources (briefs/long/facts.md)
docs/                   LESSONS.md (mistakes and fixes), REUSE.md (how to reuse this for a new film)
public/                 voice and sound files used by the film
```

## How it was made
Built with Claude Code agents: research and an adversarial fact-check, competing scripts judged by other agents, one builder per chapter followed by an independent "polish" reviewer, and multi-lens QA. `CLAUDE.md` holds the rules those agents follow; `docs/LESSONS.md` records what went wrong and how it was fixed.

## Accuracy
Weeks are gestational (counted from the last period), as doctors use. Every narrated fact is listed with its sources in `briefs/long/facts.md`. This is an educational animation, not medical advice.

## Credits
- Voice and sound effects generated with [ElevenLabs](https://elevenlabs.io).
- Fonts: Sora and JetBrains Mono (SIL Open Font License), via Google Fonts.
- Made with [Remotion](https://www.remotion.dev); see its [license](https://www.remotion.dev/license) (free for individuals and small teams).
