"""Word onsets inside one short VO clip (helper for vo_repair.py; no numpy).

Envelopes: 16 kHz, 10 ms RMS window, 5 ms hop, dBFS, in three bands:
  bb = broadband (> 70 Hz), lo = voiced band (80-1200 Hz), hi = fricative band (> 3.5 kHz).
Method (a small forced aligner):
  1. whisper DTW gives each caption word a guide time; DTW is late by LAG (0.14 s,
     the median measured against silence onsets in these takes);
  2. acoustic candidates: S = rise out of silence, D = dip in the voiced band (a
     consonant between two vowels), F = start of a fricative/aspiration (hi >= lo)
     that runs into a vowel;
  3. a dynamic-programming pass gives each word, in order, one candidate (or its
     guide, at a cost) minimising |candidate - guide| - LAM * depth. Spelling decides
     which candidates a word may take: s/f/sh/ch/th(ree|irty|umb) words start on F,
     voiceless stops on D or F (aspiration), other words on D; any word may take S;
  4. refine: S -> first frame at the word's own loudness (voiced band for vowels and
     sonorants, so a breathy lead-in is skipped); F -> the fricative start; D -> the
     voicing rise for vowel words, the burst/aspiration for p/t/k, else the burst
     after the closure or the start of the consonant.
Tested against hand-measured onsets of C05-C08: mean error 0.025 s, 63/67 within 80 ms.
"""
import array
import difflib
import json
import math
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(__file__))
from long_vo import norm as base_norm  # noqa: E402

HOP, SIL, ON = 0.005, -70.0, -65.0
LAG, LAM, SKIP_W, SKIP_F, SKIP_S = 0.14, 0.004, 0.12, 0.25, 0.15
MODEL = os.path.expanduser("~/.cache/whisper/ggml-base.en.bin")
ALIAS = {"1": "one", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "10": "ten",
         "12": "twelve", "15": "fifteen", "17": "seventeen", "20": "twenty", "22": "twenty-two",
         "27": "twenty-seven", "30": "thirty", "36": "thirty-six", "40": "forty",
         "too": "two", "practices": "practises", "moved": "move"}
BANDS = {"bb": "highpass=f=70", "lo": "highpass=f=80,lowpass=f=1200,lowpass=f=1200",
         "hi": "highpass=f=3500,highpass=f=3500"}


def norm(w):
    w = base_norm(w)
    return ALIAS.get(w, w)


def envelope(path, af=BANDS["bb"]):
    """10 ms RMS, 5 ms hop, dBFS; frame i covers [i*HOP, i*HOP + 0.01]."""
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", "16000", "-af", af,
                          "-f", "f32le", "-"], check=True, capture_output=True).stdout
    a = array.array("f")
    a.frombytes(raw)
    blk = [sum(x * x for x in a[i:i + 80]) for i in range(0, len(a) - 79, 80)]
    return [10 * math.log10(max(1e-12, (blk[i] + blk[i + 1]) / 160)) for i in range(len(blk) - 1)]


def whisper(path, tmp):
    """[(dtw_time, word)] heard by whisper (sub-word tokens joined)."""
    w16, out = os.path.join(tmp, "w16.wav"), os.path.join(tmp, "w")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", path, "-ar", "16000", "-ac", "1", w16], check=True)
    subprocess.run(["nice", "-n", "10", "whisper-cli", "-m", MODEL, "-t", "2", "-nfa", "-dtw", "base.en",
                    "-f", w16, "-ojf", "-of", out, "-np"], check=True, capture_output=True)
    words = []
    for seg in json.load(open(out + ".json"))["transcription"]:
        for t in seg["tokens"]:
            if t["text"].startswith("[_") or not t["text"].strip():
                continue
            if t["text"].startswith(" ") or not words:
                words.append([t["t_dtw"] / 100, t["text"].strip()])
            else:
                words[-1][1] += t["text"]
    return [(t, w) for t, w in words if norm(w)]


def guides(script, heard):
    """Whisper time for every script word (difflib match, gaps interpolated)."""
    a, b = [norm(w) for w in script], [norm(w) for _, w in heard]
    g = [None] * len(a)
    for m in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(m.size):
            g[m.a + k] = heard[m.b + k][0]
    known = [i for i, t in enumerate(g) if t is not None]
    for i in range(len(g)):
        if g[i] is None:
            lo = max((k for k in known if k < i), default=None)
            hi = min((k for k in known if k > i), default=None)
            g[i] = (g[hi] - 0.25 * (hi - i) if lo is None else g[lo] + 0.25 * (i - lo) if hi is None
                    else g[lo] + (g[hi] - g[lo]) * (i - lo) / (hi - lo))
    return g


def wclass(w):
    """F = starts with a voiceless fricative, P = voiceless stop, V = vowel, C = other."""
    w = re.sub("[^a-z]", "", base_norm(w))
    if re.match("(s|f|sh|ch|thir|thr|thu)", w):
        return "F"
    if re.match("(p|t(?!h)|k|c(?![hei])|q)", w):
        return "P"
    return "V" if w[:1] in "aeiou" else "C"


def cands(bb, lo, hi):
    """[(frame, kind, strength)] sorted; near-duplicates merged (S wins, deeper D wins)."""
    n, out = len(bb), []
    for f in range(8, n - 10):
        if bb[f] >= ON > bb[f - 1] and min(bb[f - 8:f]) < SIL and sum(x >= -50 for x in bb[f:f + 40]) >= 10:
            out.append((f, "S", 40.0 if max(bb[max(0, f - 16):f - 2]) < SIL else 39.0))  # 40 = after a pause
    ls = [sum(lo[max(0, i - 1):i + 2]) / len(lo[max(0, i - 1):i + 2]) for i in range(n)]
    for m in range(12, n - 12):
        if bb[m] >= SIL and ls[m] <= ls[m - 1] and ls[m] < ls[m + 1]:
            d = min(max(ls[m - 12:m]), max(ls[m + 1:m + 13])) - ls[m]
            if d >= 5:
                out.append((m, "D", min(d, 40.0)))
    fr = [bb[i] >= -55 and hi[i] - lo[i] >= -1 for i in range(n)]
    for f in range(1, n - 5):
        nxt = next((i for i in range(f, min(n, f + 50)) if bb[i] < SIL or lo[i] >= -25), f)
        if fr[f] and not fr[f - 1] and all(fr[f:f + 5]) and lo[nxt] >= -25:
            out.append((f, "F", 25.0))
    keep = []
    for c in sorted(out):
        near = [k for k in keep if c[0] - k[0] < 6]
        dn = [k for k in near if k[1] == "D"]
        if c[1] == "D" and dn:
            if c[2] > dn[0][2]:
                keep[keep.index(dn[0])] = c
        elif c[1] == "S" or not any(k[1] == "S" for k in near):
            keep.append(c)
    return keep


def refine(c, word, bb, lo, hi):
    """Onset frame of `word` given its matched candidate."""
    f, kind, _ = c
    n, cl = len(bb), wclass(word)
    if kind == "S":
        son = cl == "V" or re.match("(w|y|l|r|m|n|the|tho)", word.lower())
        band, thr = (lo, -40.0) if son else (bb, -45.0)
        end = next((i for i in range(f, min(n, f + 80)) if bb[i] < SIL), min(n, f + 80))
        thr = min(thr, max(band[f:end]) - 20)
        return next((i for i in range(f, end) if band[i] >= thr), f)
    if kind == "F":
        return f
    peak = max(lo[f:f + 16])
    v = next((i for i in range(f, min(n, f + 16)) if lo[i] >= peak - 10), f)
    if cl == "V":
        return v
    a = f
    while a > 0 and lo[a - 1] < peak - 15 and bb[a - 1] >= SIL:
        a -= 1
    if cl == "P":
        asp = next((i for i in range(a, f + 16) if hi[i] - lo[i] >= -3 and bb[i] >= -55), None)
        if asp is not None:
            return asp
    dp = min(range(a, v + 1), key=lambda i: bb[i])
    if bb[dp] < sorted(bb[a:v + 1])[(v - a) // 2] - 10:
        return next((i for i in range(dp, v + 1) if bb[i] >= bb[dp] + 6), dp)
    return a


def onsets(path, words, tmp):
    """Onset (clip s) of every caption word, the candidate kind used, and whisper's words."""
    bb, lo, hi = (envelope(path, BANDS[k]) for k in ("bb", "lo", "hi"))
    heard = whisper(path, tmp)
    n, INF = len(words), 1e9
    e = [x - LAG for x in guides(words, heard)]
    C = sorted([(c[0] * HOP + 0.005, c[1], c[2], c, None) for c in cands(bb, lo, hi)]
               + [(e[i], "G", 0.0, None, i) for i in range(n)], key=lambda c: c[0])
    m = len(C)

    def match(i, j):
        t, k, d, _, gi = C[j]
        wc = wclass(words[i])
        if k == "G":
            return (SKIP_F if wc == "F" else SKIP_W) if gi == i else INF
        if k == "F" and wc not in "FP" or k == "D" and wc == "F":
            return INF
        return abs(t - e[i]) - LAM * d

    f = [[INF] * m for _ in range(n)]
    bk = [[None] * m for _ in range(n)]
    f[0][next(j for j in range(m) if C[j][1] == "S")] = 0.0  # first word = first sound
    ps = [0]  # prefix count of pause onsets (S after >= 80 ms of silence)
    for c in C:
        ps.append(ps[-1] + (c[1] == "S" and c[2] == 40))
    for i in range(1, n):
        for j in range(m):
            mc = match(i, j)
            if mc >= INF:
                continue
            for jp in range(j):  # skipping a pause onset (S, strength 40) costs SKIP_S
                if f[i - 1][jp] < INF and C[jp][0] <= C[j][0] - 0.04:
                    v = f[i - 1][jp] + mc + SKIP_S * (ps[j] - ps[jp + 1])
                    if v < f[i][j]:
                        f[i][j], bk[i][j] = v, jp
    j = min(range(m), key=lambda j: f[n - 1][j])
    asg = [0] * n
    for i in range(n - 1, -1, -1):
        asg[i], j = j, bk[i][j]
    out, how = [], []
    for i, j in enumerate(asg):
        t, k, _, raw, _ = C[j]
        t = refine(raw, words[i], bb, lo, hi) * HOP + 0.005 if raw else t
        out.append(max(t, out[-1] + 0.05) if out else t)  # keep order, >= 50 ms apart
        how.append(k)
    return out, how, heard, bb


def last_sound(env, t0, t1):
    """End (s) of the last frame >= SIL in [t0, t1)."""
    fr = [i for i in range(round(t0 / HOP), min(len(env), round(t1 / HOP))) if env[i] >= SIL]
    return fr[-1] * HOP + 0.01 if fr else t0
