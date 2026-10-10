"""Sound effects: clean up the ElevenLabs takes, build the heartbeat track to
match the on-screen heart (110 bpm lub-dub), and synthesise the kick thump.
Every file starts at (or fades in from) zero, so no clip clicks on entry."""
import glob
import math
import os

from util import SR, decode, ff, normalize_peak, read, to_wav, write

PICK = {  # which downloaded take to use for each effect
    "whoosh": "Microscopic_underwat_#1-*.mp3",
    "impact": "Soft_cinematic_impac_#1-*.mp3",
    "pop": "Single_soft_wet_orga_#1-*.mp3",
    "heart": "Fetal_heartbeat_hear_#4-*.mp3",
    "riser": "Airy_cinematic_riser_#2-*.mp3",
}

# Scene3 heart: heartbeat(t, 110) peaks at 8% (lub) and 26% (dub) of each period.
BPM, LUB, DUB = 110, 0.08, 0.26
HEART_LEN, HEART_FADE = 3.2, 0.7  # seconds of heartbeat, fade at the end
# The heartbeat file starts HEART_PAD before the heartStarts frame (3 whole
# frames), so the first lub's grain is not cut off. clips.ts places it 0.1 s early.
HEART_PAD = 0.1
KNOCK = 0.9 * 10 ** (-1.5 / 20)  # kick's 550 Hz "knock": 1.5 dB under its sine
# Riser: a wide 4 dB dip around 2.5 kHz leaves room for the voice's consonants.
RISER_EQ = "equalizer=f=2500:t=o:w=1.5:g=-4"


def src(root, key):
    hits = glob.glob(os.path.join(root, "inbox", PICK[key]))
    assert hits, f"missing take for {key}: {PICK[key]}"
    return hits[0]


def pitched(src_wav, dst, ratio):
    """Pitch + speed change (like a tape), keeps it organic for pops/whooshes."""
    ff("-i", src_wav, "-af", f"asetrate={int(SR * ratio)},aresample={SR}", "-c:a", "pcm_s16le", dst)


def heartbeat_track(heart_wav, dst):
    """One thump cut from the doppler take, placed on every lub and dub."""
    s = read(heart_wav)
    a, b = int(0.04 * SR), int(0.24 * SR)  # first thump (peak at ~0.12s)
    thump = s[a:b]
    n = len(thump)
    for i in range(n):  # short fade in/out on the grain
        thump[i] *= min(1, i / (0.01 * SR), (n - i) / (0.06 * SR))
    peak_off = int(0.08 * SR)  # thump peak sits 80 ms into the grain
    pad = int(HEART_PAD * SR)  # room for the first grain, which starts before t=0
    period = 60 / BPM
    out = [0.0] * (int((HEART_LEN + 0.3) * SR) + pad)
    k = 0
    while True:
        base = k * period
        if base > HEART_LEN:
            break
        for frac, gain in ((LUB, 1.0), (DUB, 0.55)):
            t0 = int((base + frac * period) * SR) - peak_off
            for i, x in enumerate(thump):
                j = t0 + pad + i
                if 0 <= j < len(out):
                    out[j] += x * gain
        k += 1
    fade0 = pad + int((HEART_LEN - HEART_FADE) * SR)
    for j in range(fade0, len(out)):
        out[j] *= max(0.0, 1 - (j - fade0) / (HEART_FADE * SR))
    # File t=0 is HEART_PAD before the heartStarts frame; the first lub peaks
    # at HEART_PAD + LUB * period.
    write(dst, out)


def kick_thump(dst):
    """Muffled 'felt from inside' thump. A falling sine (175 -> 55 Hz) and
    low-passed noise give the weight; a short 550 Hz knock and a 2nd harmonic
    let phone speakers, which cannot play the sub, hear it too."""
    n = int(1.0 * SR)  # exp(-t/0.14) is near -60 dB by the end: no hard stop
    out, phase, lp = [], 0.0, 0.0
    seed = 12345
    for i in range(n):
        t = i / SR
        phase += 2 * math.pi * (55 + 120 * math.exp(-t / 0.045)) / SR
        env = min(1, t / 0.004) * math.exp(-t / 0.14)
        seed = (1103515245 * seed + 12345) % 2**31
        noise = (seed / 2**31) * 2 - 1
        lp += 0.08 * (noise - lp)  # one-pole low-pass (~600 Hz)
        body = 0.9 * math.sin(phase) + 0.25 * math.sin(2 * phase) + 2.2 * lp * math.exp(-t / 0.05)
        knock = KNOCK * min(1, t / 0.0015) * math.exp(-t / 0.02) * math.sin(2 * math.pi * 550 * t)
        # Negative polarity (sounds the same): the first swing then opposes the
        # voice's "first" under it instead of stacking into the film's top peak.
        out.append(-(env * body + knock))
    tmp = dst + ".src.wav"
    write(tmp, out)
    # 38 Hz high-pass trims rumble nobody can hear; the last 30 ms fade to zero
    normalize_peak(tmp, dst, -1, f"highpass=f=38,highpass=f=38,afade=t=out:st={n / SR - 0.03}:d=0.03")
    os.remove(tmp)


def body_thump(length=0.8):
    """Pitched thump (300 -> 140 Hz over ~0.1 s, 2nd harmonic 600 -> 280 Hz),
    high enough for phone speakers. Own 4 ms fade-in; decays to ~-58 dB."""
    out, phase = [], 0.0
    for i in range(int(length * SR)):
        t = i / SR
        phase += 2 * math.pi * (140 + 160 * math.exp(-t / 0.035)) / SR
        env = min(1, t / 0.004) * math.exp(-t / 0.12)
        out.append(env * (math.sin(phase) + 0.4 * math.sin(2 * phase)))
    return out


def impact(take, dst, body_db=-6):
    """The impact take is mostly sub-bass and starts mid-waveform: high-pass it,
    fade the first 4 ms in (after the filter, so nothing rings on the step),
    and layer a body thump under it so phones hear a boom, not just a click."""
    tmp = dst + ".src.wav"
    s = decode(take, "highpass=f=35,afade=t=in:d=0.004")
    b = body_thump()
    g = max(abs(x) for x in s) * 10 ** (body_db / 20) / max(abs(x) for x in b)
    for i, x in enumerate(b[: len(s)]):
        s[i] += g * x
    write(tmp, s)
    normalize_peak(tmp, dst, -3)
    os.remove(tmp)


def build(root):
    d = os.path.join(root, "public", "sfx")
    tmp = os.path.join(root, "inbox")
    os.makedirs(d, exist_ok=True)

    normalize_peak(src(root, "whoosh"), f"{d}/whoosh.wav", -3, "afade=t=in:d=0.01")
    pitched(f"{d}/whoosh.wav", f"{d}/whoosh-low.wav", 0.78)
    impact(src(root, "impact"), f"{d}/impact.wav")
    normalize_peak(src(root, "riser"), f"{tmp}/riser-norm.wav", -3)
    to_wav(f"{tmp}/riser-norm.wav", f"{d}/riser.wav", RISER_EQ)  # EQ after: keeps the dip
    os.remove(f"{tmp}/riser-norm.wav")

    # The pop take has a lead-in tick ~36 ms before the real pop: trim to just
    # before the main transient (~0.082 s), restart the clock (asetpts) so the
    # fades count from the trimmed start, fade in 3 ms and out at the tail.
    normalize_peak(src(root, "pop"), f"{d}/pop.wav", -4,
                   "atrim=0.078:0.43,asetpts=PTS-STARTPTS,afade=t=in:d=0.003,afade=t=out:st=0.27:d=0.08")
    pitched(f"{d}/pop.wav", f"{d}/pop-hi.wav", 1.3)
    pitched(f"{d}/pop.wav", f"{d}/pop-hi2.wav", 1.65)
    pitched(f"{d}/pop.wav", f"{d}/pop-lo.wav", 0.7)

    heart_wav = f"{tmp}/heart-src.wav"
    to_wav(src(root, "heart"), heart_wav)
    heartbeat_track(heart_wav, f"{d}/heartbeat.wav")
    kick_thump(f"{d}/kick.wav")
    return sorted(os.listdir(d))
