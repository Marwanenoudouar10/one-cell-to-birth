#!/bin/bash
# Render one teaser scene (isolated entry) -> out/teaser/<Scene>/preview.mp4 + sheet.jpg
# usage: scripts/preview.sh Scene1 [scale=0.4]
# Sheet: one tile every 15 frames, left->right, top->bottom (tile k = frame 15*k).
set -e
cd "$(dirname "$0")/.."
source ~/.nvm/nvm.sh >/dev/null 2>&1
S=$1; SCALE=${2:-0.4}
ENTRY=src/preview/$(echo "$S" | tr 'A-Z' 'a-z').ts
D=out/teaser/$S; mkdir -p "$D/frames" "$D/scratch"
start=$(date +%s)
nice -n 15 npx remotion render "$ENTRY" "$S" "$D/preview.mp4" --scale="$SCALE" --concurrency=4 --log=error
echo "render took $(( $(date +%s) - start ))s"
ffmpeg -y -loglevel error -i "$D/preview.mp4" \
  -vf "select='not(mod(n\,15))',scale=216:-1,tile=8x2:padding=6:color=white" \
  -frames:v 1 "$D/sheet.jpg"
echo "wrote $D/preview.mp4 and $D/sheet.jpg"
