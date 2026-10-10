"""Build all film audio from the downloads in inbox/.
usage: python3 scripts/audio/build.py"""
import glob
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import sfx  # noqa: E402
import vo  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

if __name__ == "__main__":
    os.makedirs(os.path.join(ROOT, "public", "vo"), exist_ok=True)
    take = glob.glob(os.path.join(ROOT, "inbox", "vo-full.mp3"))[0]
    timing = vo.build(take, ROOT)
    for lid, t in timing.items():
        print(f"{lid}: {t['start']:6.2f} -> {t['end']:6.2f}s  words {t['words']}")
    print("sfx:", ", ".join(sfx.build(ROOT)))
