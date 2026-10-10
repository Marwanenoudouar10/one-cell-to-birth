"""Long film voiceover: align the two ElevenLabs takes (intro + main) to the
caption lines in src/long/data/lines.ts, cut one clip per chapter, fit each
chapter's speech into its window (extending chapters when needed), and write
src/long/data/voTiming.ts (chapter-local seconds).
usage: python3 scripts/audio/long_vo.py [--apply-durations]"""
import difflib
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from util import duration, ff, loudnorm_linear, silences  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
INBOX = os.path.join(ROOT, "inbox", "long")
GAP = 0.35  # min silence between two chapters' speech (s)
OVERLAP = 0.5  # fade/focus transitions overlap 15 frames


def norm(w):
    w = w.lower().replace("’", "'").replace("it's", "its")
    return re.sub(r"[^a-z0-9-]", "", w)


def parse_lines():
    src = open(os.path.join(ROOT, "src", "long", "data", "lines.ts")).read()
    body = src[src.index("CHAPTER_LINES"):src.index("export const LONG_LINES")]
    out = {}
    for m in re.finditer(r"\n  (C\d\d): \[", body):
        cid = m.group(1)
        end = body.find("\n  C", m.end())
        block = body[m.end(): end if end > 0 else len(body)]
        lines = []
        for chunk in block.split("line(")[1:]:
            ph = re.findall(r'\["([^"]+)",\s*([\d.]+)(?:,\s*([\d.]+))?\]', chunk)
            if ph:
                lines.append({"text": " ".join(p[0] for p in ph), "start": float(ph[0][1])})
        out[cid] = lines
    return out


def chapters():
    src = open(os.path.join(ROOT, "src", "long", "chapters.ts")).read()
    rows = re.findall(r'id: "(C\d\d)".*?durationSec: ([\d.]+), transition: "(\w+)"', src)
    return [{"id": i, "dur": float(d), "tr": t} for i, d, t in rows]


def speech_segments(path):
    total = duration(path)
    segs, t = [], 0.0
    for s, e in silences(path, -36, 0.1):
        e = total if e is None else e
        if s > t + 0.001:
            segs.append([t, s])
        t = e
    if t < total - 0.02:
        segs.append([t, total])
    i = 0
    while i < len(segs):  # merge blips into the nearer neighbour
        a, b = segs[i]
        if b - a < 0.15 and len(segs) > 1:
            gp = a - segs[i - 1][1] if i > 0 else 1e9
            gn = segs[i + 1][0] - b if i + 1 < len(segs) else 1e9
            if gp <= gn:
                segs[i - 1][1] = b
            else:
                segs[i + 1][0] = a
            segs.pop(i)
            continue
        i += 1
    return segs, total


def whisper_words(name):
    d = json.load(open(os.path.join(INBOX, f"{name}-words.json")))
    return [(s["offsets"]["from"] / 1000, s["text"].strip()) for s in d["transcription"] if s["text"].strip()]


def align(script_words, take):
    """Rough start time for every script word, from whisper (interpolate gaps)."""
    a = [norm(w) for w in script_words]
    b = [norm(w) for _, w in take]
    rough = [None] * len(a)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            rough[blk.a + k] = take[blk.b + k][0]
    known = [i for i, t in enumerate(rough) if t is not None]
    for i in range(len(rough)):
        if rough[i] is None:
            lo = max([k for k in known if k < i], default=None)
            hi = min([k for k in known if k > i], default=None)
            if lo is None:
                rough[i] = rough[hi]
            elif hi is None:
                rough[i] = rough[lo]
            else:
                rough[i] = rough[lo] + (rough[hi] - rough[lo]) * (i - lo) / (hi - lo)
    return rough, len(known) / max(1, len(a))


def refine(words, rough, segs):
    """Snap words into real speech segments; spread by length inside each."""
    seg_of = []
    for t in rough:
        best = min(range(len(segs)), key=lambda k: 0 if segs[k][0] - 0.12 <= t <= segs[k][1] else min(abs(t - segs[k][0]), abs(t - segs[k][1])))
        seg_of.append(best)
    for i in range(1, len(seg_of)):  # monotonic
        seg_of[i] = max(seg_of[i], seg_of[i - 1])
    times = [0.0] * len(words)
    for k in sorted(set(seg_of)):
        idx = [i for i, s in enumerate(seg_of) if s == k]
        a, b = segs[k]
        wts = [len(words[i]) + 2 for i in idx]
        tot, acc = sum(wts), 0
        for i, wt in zip(idx, wts):
            times[i] = a + (b - a) * acc / tot
            acc += wt
    ends = {}
    for i, k in enumerate(seg_of):
        ends[i] = segs[k][1]
    return times, ends, seg_of


def main(apply_durations):
    lines = parse_lines()
    chs = chapters()
    takes = {}
    for name in ("vo-intro", "vo-main"):
        normed = os.path.join(INBOX, f"{name}-norm.wav")
        loudnorm_linear(os.path.join(INBOX, f"{name}.mp3"), normed, target=-16.0)
        segs, total = speech_segments(normed)
        takes[name] = {"path": normed, "segs": segs, "total": total, "rough": whisper_words(name)}

    # script words per take, remembering (chapter, line) for each word
    per_take = {"vo-intro": [], "vo-main": []}
    for c in chs:
        take = "vo-intro" if c["id"] == "C00" else "vo-main"
        for li, ln in enumerate(lines.get(c["id"], [])):
            for w in ln["text"].split(" "):
                per_take[take].append((c["id"], li, w))
    timing = {}
    for name, items in per_take.items():
        t = takes[name]
        rough, cover = align([w for _, _, w in items], t["rough"])
        print(f"{name}: matched {cover:.0%} of script words to the transcript")
        times, ends, _ = refine([w for _, _, w in items], rough, t["segs"])
        for i, (cid, li, _) in enumerate(items):
            ch = timing.setdefault(cid, {"take": name, "lines": {}})
            ln = ch["lines"].setdefault(li, {"words": [], "end": 0})
            ln["words"].append(times[i])
            ln["end"] = max(ln["end"], ends[i])

    # place every chapter's speech in its window, extending windows if needed
    g = 0.0
    prev_end = -1.0
    report, out = [], {}
    for k, c in enumerate(chs):
        cid = c["id"]
        ov = OVERLAP if (k > 0 and c["tr"] in ("fade", "focus")) else 0.0
        g = 0.0 if k == 0 else g_next
        tm = timing.get(cid)
        if not tm:
            g_next = g + c["dur"] - (OVERLAP if k + 1 < len(chs) and chs[k + 1]["tr"] in ("fade", "focus") else 0)
            continue
        lns = [tm["lines"][i] for i in sorted(tm["lines"])]
        s0 = lns[0]["words"][0]
        s1 = lns[-1]["end"]
        length = s1 - s0
        planned = lines[cid][0]["start"]
        min_local = max(0.15 if ov == 0 else 0.3, prev_end + GAP - g)
        local = max(planned, min_local)
        dur = c["dur"]
        if local + length > dur - 0.15:
            local = max(min_local, dur - 0.15 - length)
        ext = 0.0
        if local + length > dur - 0.15:
            ext = round(local + length + 0.15 - dur + 0.049, 1)
            dur += ext
        shift = local - s0  # take time -> chapter-local time
        t = takes[tm["take"]]
        segs = t["segs"]
        before = max([e for _, e in segs if e <= s0 + 1e-6], default=0.0)
        after = min([s for s, _ in segs if s >= s1 - 1e-6], default=t["total"])
        c0 = max(before + (s0 - before) / 2, s0 - 0.12)
        c1 = min(s1 + (after - s1) / 2, s1 + 0.25)
        ff("-i", t["path"], "-af",
           f"atrim={c0:.3f}:{c1:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,"
           f"afade=t=out:st={c1 - c0 - 0.06:.3f}:d=0.06",
           "-c:a", "pcm_s16le", os.path.join(ROOT, "public", "vo", "long", f"{cid}.wav"))
        out[cid] = {
            "src": f"vo/long/{cid}.wav",
            "clipAt": round(c0 + shift, 3),
            "lines": [{"start": round(l["words"][0] + shift, 3), "end": round(l["end"] + shift, 3),
                       "words": [round(w + shift, 3) for w in l["words"]]} for l in lns],
        }
        report.append(f"{cid}: speech {length:5.2f}s  planned@{planned:4.2f} placed@{local:4.2f}  ends {local + length:5.2f} / window {c['dur']:4.1f}" + (f"  EXTEND +{ext}s" if ext else ""))
        c["newdur"] = round(dur, 1)
        prev_end = g + local + length
        g_next = g + dur - (OVERLAP if k + 1 < len(chs) and chs[k + 1]["tr"] in ("fade", "focus") else 0)
    total = g_next if chs else 0
    print("\n".join(report))
    print(f"film length: {total:.1f}s")

    ts = os.path.join(ROOT, "src", "long", "data", "voTiming.ts")
    with open(ts, "w") as f:
        f.write("// GENERATED by scripts/audio/long_vo.py from the ElevenLabs takes. Do not edit.\n")
        f.write("// Chapter-LOCAL seconds. clipAt = where the chapter's clip starts; per line: start/end of\n")
        f.write("// speech and each word's start (same word order as the caption text in lines.ts).\n")
        f.write("export type VoLine = { start: number; end: number; words: number[] };\n")
        f.write("export const VO_TIMING: Record<string, { src: string; clipAt: number; lines: VoLine[] }> = ")
        f.write(json.dumps(out, indent=1) + ";\n")
    if apply_durations:
        p = os.path.join(ROOT, "src", "long", "chapters.ts")
        src = open(p).read()
        for c in chs:
            if c.get("newdur") and c["newdur"] != c["dur"]:
                src = re.sub(rf'(id: "{c["id"]}".*?durationSec: )[\d.]+', rf"\g<1>{c['newdur']}", src, count=1)
        open(p, "w").write(src)
        print("chapters.ts durations updated")
    return out


if __name__ == "__main__":
    main("--apply-durations" in sys.argv)
