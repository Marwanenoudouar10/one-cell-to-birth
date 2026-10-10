#!/bin/bash
# Pull exact frames out of out/teaser/<Scene>/preview.mp4 (run preview.sh first)
# -> out/teaser/<Scene>/frames/f<N>.png
# usage: scripts/frame.sh Scene1 0 60 129 150
set -e
cd "$(dirname "$0")/.."
S=$1; shift
D=out/teaser/$S; mkdir -p "$D/frames"
for f in "$@"; do
  ffmpeg -y -loglevel error -i "$D/preview.mp4" -vf "select=eq(n\,$f)" -vframes 1 "$D/frames/f$f.png"
  echo "$D/frames/f$f.png"
done
