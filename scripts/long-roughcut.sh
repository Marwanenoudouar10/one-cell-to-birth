#!/bin/bash
# Quick review cut: the current chapter previews (with voice, captions, tracker) joined end to end.
# No crossfades, preview size; takes ~20 s and renders nothing. For the real film use long-render.sh.
# usage: scripts/long-roughcut.sh C00 C11   (first and last chapter, inclusive)
# -> out/final/review/long-<first>-<last>-roughcut.mp4 + long-<first>-<last>-stills.jpg (one still per chapter)
set -e
cd "$(dirname "$0")/.."
FIRST=${1:-C00}; LAST=${2:-C16}
R=out/final/review; mkdir -p $R
ids=$(grep -o 'id: "C[0-9][0-9]"' src/long/chapters.ts | grep -o 'C[0-9][0-9]' | awk -v a=$FIRST -v b=$LAST '$0>=a && $0<=b')
ins=(); fl=""; cat=""; i=0
for c in $ids; do
  f=out/long/$c/preview.mp4; [ -f $f ] || { echo "missing $f (run scripts/long-preview.sh $c)"; exit 1; }
  ins+=(-i $f)
  fl+="[${i}:v]scale=432:768,setsar=1,fps=30,format=yuv420p[v${i}];[${i}:a]aresample=48000,aformat=channel_layouts=stereo[a${i}];"
  cat+="[v${i}][a${i}]"; i=$((i+1))
done
OUT=$R/long-$FIRST-$LAST-roughcut.mp4
nice -n 15 ffmpeg -y -loglevel error "${ins[@]}" -filter_complex "${fl}${cat}concat=n=${i}:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 20 -preset fast -c:a aac -b:a 192k -movflags +faststart $OUT
T=$(mktemp -d); j=0
for c in $ids; do
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/long/$c/preview.mp4)
  ffmpeg -y -loglevel error -ss $(python3 -c "print($d*0.62)") -i out/long/$c/preview.mp4 -frames:v 1 -vf scale=270:480 $T/$(printf %02d $j).png
  j=$((j+1))
done
cols=$(( j < 6 ? j : 6 )); rows=$(( (j + 5) / 6 ))
ffmpeg -y -loglevel error -i $T/%02d.png -vf "tile=${cols}x${rows}:padding=6:color=white,format=yuvj420p" -frames:v 1 $R/long-$FIRST-$LAST-stills.jpg
rm -rf $T
echo "wrote $OUT ($(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT) s) and $R/long-$FIRST-$LAST-stills.jpg"
