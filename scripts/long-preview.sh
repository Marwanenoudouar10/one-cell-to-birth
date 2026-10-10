#!/bin/bash
# Render ONE chapter of the long film in isolation (global background, week tracker and
# captions shifted to the chapter's place in the film) -> out/long/<id>/preview.mp4 + sheet.jpg
# usage: scripts/long-preview.sh C05 [scale=0.4]
#        FRAMES=60-120 scripts/long-preview.sh C05   # render only that range (fast iteration) -> range.mp4 + range-sheet.jpg
# Sheet out/long/<id>/sheet.jpg: one tile every 15 frames, left->right, top->bottom
# (tile k = chapter-local frame 15*k).
set -e
cd "$(dirname "$0")/.."
source ~/.nvm/nvm.sh >/dev/null 2>&1
ID=$1; SCALE=${2:-0.4}
ENTRY=$(scripts/long-entry.sh "$ID")
D=out/long/$ID; mkdir -p "$D/frames" "$D/scratch"
start=$(date +%s)
OUT="$D/preview.mp4"; SHEET="$D/sheet.jpg"; RANGE_ARGS=()
if [ -n "$FRAMES" ]; then OUT="$D/scratch/range-$FRAMES.mp4"; SHEET="$D/scratch/range-$FRAMES-sheet.jpg"; RANGE_ARGS=(--frames="$FRAMES"); fi
nice -n 15 npx remotion render "$ENTRY" "$ID" "$OUT" --scale="$SCALE" --concurrency=4 --log=error "${RANGE_ARGS[@]}"
echo "render took $(( $(date +%s) - start ))s"
N=$(ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$OUT")
ROWS=$(( ( (N + 14) / 15 + 7 ) / 8 ))
ffmpeg -y -loglevel error -i "$OUT" \
  -vf "select='not(mod(n\,15))',scale=216:-1,tile=8x$ROWS:padding=6:color=white" \
  -frames:v 1 "$SHEET"
echo "wrote $OUT ($N frames) and $SHEET"
