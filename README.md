# Hello, World: Forty Weeks from One Cell

A vertical (1080x1920) motion-graphics explainer of human development, from fertilisation to birth, made entirely in code with [Remotion](https://www.remotion.dev) (React + TypeScript). Flat 2D, every frame generated, every fact checked.

- **Teaser (30 s):** composition `Main`, scenes in `src/scenes/Scene1..5`. Finished, music still to add.
- **Long film (~2:29):** composition `Long`, a question hook (C00) plus 16 chapters (C01-C16) in `src/long/`. In progress: see `RESUME.md`.

## Run it
```bash
npm install
npm run studio                                   # Remotion Studio: browse Main, Long, scenes
scripts/long-preview.sh C05 0.4                  # one chapter -> out/long/C05/preview.mp4 + sheet.jpg
scripts/preview.sh Scene3 0.4                    # one teaser scene -> out/teaser/Scene3/
npx remotion render src/index.ts Main out/final/teaser.mp4
```
Audio pipeline (voice split, word timing with whisper.cpp, sound-effect prep, -14 LUFS master): `scripts/audio/` and the commands in `CLAUDE.md`.

## How it is organised
```
src/theme, src/lib      palette, layout, easing, transitions (focusPull)
src/scenes/             the 30 s teaser
src/shared/             reusable kits: fetus (weeks 9-40), embryo (weeks 3-8), womb
src/long/               long film: chapters.ts (timeline), chapters/Cxx/, captions, week counter + size chip
scripts/                preview / render / audio / QA scripts, plus the AI-agent workflow scripts
briefs/                 storyboards, narration, fact list with sources (briefs/long/facts.md)
docs/                   LESSONS.md (mistakes and fixes), REUSE.md (how to reuse this for a new film)
public/                 voice and sound files used by the film
```

## How it was made
Built by Claude Code agents: research and an adversarial fact-check, competing scripts judged by other agents, one builder per scene/chapter followed by an independent "polish" reviewer, and multi-lens QA. `CLAUDE.md` holds the rules those agents follow; `docs/LESSONS.md` records what went wrong and how it was fixed.

## Accuracy
Weeks are gestational (counted from the last period), as doctors use. Every narrated fact is listed with its sources in `briefs/long/facts.md`. This is an educational animation, not medical advice.

## Credits
- Voice and sound effects generated with [ElevenLabs](https://elevenlabs.io).
- Fonts: Sora and JetBrains Mono (SIL Open Font License), via Google Fonts.
- Made with [Remotion](https://www.remotion.dev); see its [license](https://www.remotion.dev/license) (free for individuals and small teams).
