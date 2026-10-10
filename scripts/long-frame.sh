#!/bin/bash
# Pull exact chapter-local frames of one long-film chapter -> out/long/<id>/frames/f<N>.png
# usage: scripts/long-frame.sh C05 0 45 120
#   default: cut from out/long/<id>/preview.mp4 (run scripts/long-preview.sh first; preview scale)
#   FULL=1 scripts/long-frame.sh C05 45   render full-resolution stills instead (no mp4 needed)
set -e
cd "$(dirname "$0")/.."
source ~/.nvm/nvm.sh >/dev/null 2>&1
ID=$1; shift
D=out/long/$ID; mkdir -p "$D/frames"
[ $# -gt 0 ] || { echo "usage: $0 <ChapterId> <frame> [frame...]" >&2; exit 1; }
if [ -z "$FULL" ] && [ -f "$D/preview.mp4" ]; then
  for f in "$@"; do
    ffmpeg -y -loglevel error -i "$D/preview.mp4" -vf "select=eq(n\,$f)" -vframes 1 "$D/frames/f$f.png"
    echo "$D/frames/f$f.png"
  done
else
  ENTRY=$(scripts/long-entry.sh "$ID")
  for f in "$@"; do
    nice -n 15 npx remotion still "$ENTRY" "$ID" "$D/frames/f$f.png" --frame="$f" --log=error
    echo "$D/frames/f$f.png"
  done
fi
