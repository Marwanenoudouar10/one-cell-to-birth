# QA probes (saved from the teaser QA run, 2026-10-10)

One-off scripts the QA agents wrote; they have hard-coded paths/times from the
teaser, so read them as working examples and adapt the paths before reuse.

- audio/clicks.py      sample discontinuities at every clip start/end (click check)
- audio/phone.py       phone-speaker model: high-pass ~200 Hz, voice vs SFX levels
- audio/gain.py        loudness per window, voice vs effects (dB)
- audio/words.py       voice-onset per word vs caption word times
- audio/align.py       VO alignment checks; stems.py rebuilds stems from clips.ts
- audio/env.py, sfxfiles.py, times.js   envelopes / per-file checks / clip times
- picture/caption_luminance.py        caption band (y 1300-1560) luminance + contrast vs white
- picture/caption_contrast_flash.py   same, frame by frame across a bright flash
