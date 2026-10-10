# Shared rules for every scene (read fully)

Project: /Users/tandeemwork/birth-teaser — Remotion 4.0.534, React 19, TypeScript.
Film: 30s vertical (1080x1920, 30fps) teaser explaining human development from
fertilisation to birth. Flat 2D vector style (think Kurzgesagt: clean geometric
shapes, soft gradients, rim light, inner glow, depth layers). English VO + kinetic
captions already exist globally. It must look like a top-tier studio made it.

## What already exists (do NOT edit these)
- src/theme/colors.ts   palette `C` — use only these colours (alpha variants OK, e.g. `${C.rose}88`)
- src/theme/layout.ts   WIDTH/HEIGHT/FPS, HERO safe box {cx:540, cy:860, top:380, bottom:1300}
- src/theme/timing.ts   scene durations, TRANSITION=15 (crossfade overlap with neighbours)
- src/theme/beats.ts    BEATS.SceneN = local frame numbers of each story beat. Animate TO these
                        constants (import them), never hard-code beat frames. VO will be re-timed later.
- src/theme/script.ts   VO lines (captions read this)
- src/lib/ease.ts       EASE curves, tween(), pop(), soft() springs, heartbeat()
- src/lib/SvgDefs.tsx   shared glow filters (#glow-soft, #glow-strong, #blur-bokeh)
- src/overlays/*        global Background (dark plum gradient + bokeh), WeekTracker (top), Captions (bottom), Grain
- src/Main.tsx, src/Root.tsx, src/ScenePreview.tsx, src/preview/*

## Your boundaries
- Edit/create files ONLY inside src/scenes/SceneN/ (your scene). `index.tsx` must export `SceneN`.
- Other agents are building the other scenes at the same time. Ignore their files and their errors.
- No file over 300 lines. Split by job (e.g. Sperm.tsx, Egg.tsx, Camera.tsx, index.tsx).
- Deterministic only: `random(seed)` from remotion and `@remotion/noise`. Never Math.random / Date.
- Scene renders on a TRANSPARENT root (the global background shows underneath). You may add your own
  environment layers (tissue walls, sac, light) on top of it.
- Use `useCurrentFrame()` local frames. Your scene's frame 0 = its first frame.

## Layout
- Hero visuals centred in HERO box. Keep y 100–240 (week tracker) clear of important detail.
- Keep the caption zone y 1300–1560 calm: no bright/high-contrast detail behind white captions.
  Darken it with a soft gradient if your scene gets bright.
- First 15 and last 15 frames crossfade with neighbour scenes: honour the START/END handoff states
  in your brief exactly (positions/sizes/colours) so the crossfade reads as one continuous shot.

## Motion quality bar (this is what makes it "pro")
- Nothing linear. Use EASE.out / inOut / springs. Anticipation, overshoot, follow-through.
- Always alive: slow camera drift/push (scale ~1.00 -> 1.06 over the scene), noise-driven organic wobble,
  parallax depth layers (far = smaller, blurrier, slower).
- Lighting: radial-gradient fills, inner glow, rim light, soft drop glow. Avoid flat single-colour blobs
  and avoid stroke-only clip-art.
- Clear focal point every moment; one idea per beat. Big readable silhouettes at phone size.
- Scientifically accurate (details in your brief). Tasteful, never graphic.

## Performance
- Avoid hundreds of SVG filter instances; prefer one filter on a group, CSS blur on a group, or radial
  gradients for glow. A 0.5-scale preview of your whole scene should render in well under 60s.

## How to check your work (do this repeatedly)
1. `cd /Users/tandeemwork/birth-teaser && source ~/.nvm/nvm.sh`
2. Type errors in YOUR folder: `npx tsc --noEmit 2>&1 | grep "src/scenes/SceneN" || echo clean`
3. Render: `scripts/preview.sh SceneN` -> out/teaser/SceneN/preview.mp4 + sheet.jpg
   (contact sheet: tile k = frame 15*k, left->right, top->bottom). Read the sheet image.
4. Exact frames: `scripts/frame.sh SceneN 0 45 120` -> out/teaser/SceneN/frames/f45.png etc. Read them. Extra test images go in out/teaser/SceneN/scratch/; delete them when done.
5. Look critically, like an art director. Fix and repeat until it is genuinely beautiful.
