#!/bin/bash
# QA strip of the week tracker + size chip across the long film (composition
# "LongTrackerQA" = the top 1080x220 band, background + tracker only, fast to render).
# usage: scripts/long-tracker.sh [scale=0.5] [step=15] [from-to global frames]
# -> out/qa/long/tracker/tracker.mp4 + sheet-<n>.jpg (one strip every <step>
#    frames, 4 columns x 10 rows per page, left->right, top->bottom)
set -e
cd "$(dirname "$0")/.."
source ~/.nvm/nvm.sh >/dev/null 2>&1
SCALE=${1:-0.5}; STEP=${2:-15}; RANGE=$3
ARGS=(); [ -n "$RANGE" ] && ARGS=(--frames="$RANGE")
T=out/qa/long/tracker; mkdir -p $T
nice -n 15 npx remotion render src/long/showcase/entry.tsx LongTrackerQA $T/tracker.mp4 \
  --scale="$SCALE" --concurrency=3 --log=error "${ARGS[@]}"
rm -f $T/sheet-*.jpg
ffmpeg -y -loglevel error -i $T/tracker.mp4 \
  -vf "select='not(mod(n\,$STEP))',tile=4x10:padding=4:color=white" \
  -fps_mode vfr -start_number 1 $T/sheet-%d.jpg
echo "wrote $T/tracker.mp4 and $(ls $T/sheet-*.jpg | wc -l | tr -d ' ') sheets"
