"""Sound effects for the long film: clean up the ElevenLabs takes in inbox/long
and synthesise the womb ambience bed (the take came out 1 s long).
usage: python3 scripts/audio/sfx_long.py"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from util import SR, normalize_peak, write  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
IN = os.path.join(ROOT, "inbox", "long")
OUT = os.path.join(ROOT, "public", "sfx", "long")


def womb_bed(path, seconds=24.0, bpm=72):
    """Muffled in-utero rush: brown noise, low-passed, swelling with the
    mother's pulse (uterine 'whoosh'), plus a faint low heartbeat thump."""
    n = int(seconds * SR)
    out, brown, lp1, lp2 = [], 0.0, 0.0, 0.0
    seed = 98765
    period = 60 / bpm
    for i in range(n):
        t = i / SR
        seed = (1103515245 * seed + 12345) % 2**31
        white = (seed / 2**31) * 2 - 1
        brown = 0.995 * brown + 0.05 * white
        lp1 += 0.035 * (brown - lp1)
        lp2 += 0.035 * (lp1 - lp2)  # ~260 Hz two-pole low-pass
        ph = (t % period) / period
        whoosh = 0.55 + 0.45 * math.exp(-((ph - 0.18) ** 2) / 0.012)
        thump = math.exp(-((ph - 0.05) ** 2) / 0.0006) * math.sin(2 * math.pi * 48 * t)
        slow = 0.85 + 0.15 * math.sin(2 * math.pi * t / 7.3)
        out.append(slow * (lp2 * 9 * whoosh + 0.12 * thump))
    fade = int(0.8 * SR)  # loop-friendly ends
    for i in range(fade):
        out[i] *= i / fade
        out[-1 - i] *= i / fade
    write(path, out)
    normalize_peak(path, path, -6)


def main():
    os.makedirs(OUT, exist_ok=True)
    womb_bed(os.path.join(OUT, "womb-bed.wav"))
    normalize_peak(f"{IN}/sfx-cry.mp3", f"{OUT}/first-cry.wav", -4, "afade=t=in:d=0.01,afade=t=out:st=0.8:d=0.2")
    normalize_peak(f"{IN}/sfx-hum.mp3", f"{OUT}/mum-hum.wav", -5,
                   "atrim=0.12:1.85,asetpts=PTS-STARTPTS,lowpass=f=900,afade=t=in:d=0.08,afade=t=out:st=1.45:d=0.28")
    normalize_peak(f"{IN}/sfx-chime.mp3", f"{OUT}/chime.wav", -4, "afade=t=in:d=0.004")
    normalize_peak(f"{IN}/sfx-rumble.mp3", f"{OUT}/tummy-rumble.wav", -5,
                   "atrim=0.75:3.35,asetpts=PTS-STARTPTS,afade=t=in:d=0.05,afade=t=out:st=2.2:d=0.4")
    print(", ".join(sorted(os.listdir(OUT))))


if __name__ == "__main__":
    main()
