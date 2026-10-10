#!/bin/bash
# Render the whole long film (composition "Long", isolated entry src/long/entry.ts).
# usage: scripts/long-render.sh [scale=0.5] [extra remotion args, e.g. --frames=0-899]
# -> out/long/_film/long[-<scale>].mp4 plus contact sheets
#    out/long/_film/long[-<scale>]-sheet-<n>.jpg: one tile per second (tile k = film second k,
#    32 per page, left->right, top->bottom).
set -e
cd "$(dirname "$0")/.."
source ~/.nvm/nvm.sh >/dev/null 2>&1
SCALE=${1:-0.5}; shift || true
NAME=long; [ "$SCALE" != "1" ] && NAME="long-$SCALE"
F=out/long/_film; mkdir -p $F
start=$(date +%s)
nice -n 15 npx remotion render src/long/entry.ts Long "$F/$NAME.mp4" --scale="$SCALE" --concurrency=3 --log=error "$@"
echo "render took $(( $(date +%s) - start ))s"
rm -f $F/$NAME-sheet-*.jpg
ffmpeg -y -loglevel error -i "$F/$NAME.mp4" \
  -vf "select='not(mod(n\,30))',scale=180:-1,tile=8x4:padding=4:color=white" \
  -fps_mode vfr -start_number 1 "$F/$NAME-sheet-%d.jpg"
echo "wrote $F/$NAME.mp4 and $(ls $F/$NAME-sheet-*.jpg | wc -l | tr -d ' ') sheets $F/$NAME-sheet-N.jpg"
