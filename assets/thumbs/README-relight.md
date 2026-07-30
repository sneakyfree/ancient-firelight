# Thumbnail exposure — the rule

**A thumbnail must COMPETE in a bright feed, not match the video's dark grade.**

First pass measured **mean luminance 20–45 with 58–88% of the frame near-black**.
Strong YouTube thumbnails run **mean 90–140**. Ours looked like dead black
rectangles in the Studio grid — Grant caught it immediately.

Target: **mean ≥ 55, near-black under ~25%**, while keeping the soot/ember brand.

Current set: EP01 62.6 · EP02 67.7 · EP03 67.1 · EP04 79.3 · EP05 54.5 · EP06 64.7

**All six verified live on YouTube 2026-07-30** (`yt_verify_thumbs.py`, exit 0).
EP05 is the dimmest at 54.5 — a hair under the 55 target, cosmetic, not re-cut.

## How to check
```python
from PIL import Image; import numpy as np, glob
for f in sorted(glob.glob("EP0*_launch.png")):
    a=np.asarray(Image.open(f).convert("RGB")).astype(float)
    lum=0.299*a[...,0]+0.587*a[...,1]+0.114*a[...,2]
    print(f, round(lum.mean(),1), round((lum<25).mean()*100,1))
```

## Gotchas
- **Brightening pure black gives grey mud.** Screen-blend a warm radial ember
  glow first, THEN lift brightness. That's how EP01 went 34.8 → 62.6.
- **A negative stencil (EP02) needs the opposite:** hot spray, DARK plate behind
  the hand. Brightening everything killed the contrast the shape depends on.
- **Design for 210px sidebar width.** Subjects must be huge; fine detail dies.
- **YouTube rate-limits `thumbnails.set` (HTTP 429)** if you change several in
  quick succession — six twice inside an hour was enough to trigger it.
  **The cooldown is HOURS, not minutes.** On 2026-07-25 a retry every 10 min for
  80 min failed every attempt; the same call succeeded first try two days later.
  Don't sit and babysit it, and don't script a short retry loop — walk away and
  re-run later, or drop the file on by hand in Studio.
- **NEVER trust the API's "OK".** `thumbnails.set` returned 200-looking success
  for all six that day, but only four actually changed. A silent partial failure
  is indistinguishable from success at the call site. Verify from the CDN:

      ./yt-venv/bin/python yt_verify_thumbs.py

  It pulls each live thumbnail back off `i9.ytimg.com`, measures it, and compares
  it to the local `_launch.png`. This is the only honest confirmation.
- **Anything left running in `/tmp` dies on reboot.** The 07-25 retry loop lived
  there and vanished, leaving EP05/EP06 dark for days while the notes recorded
  the job as finished. Close the loop in the same session or write down that it's
  still open.

## EP01 re-light (kept, because a redraw was worse)
Screen-blend a warm radial centred on the fire, then Brightness 1.28 / Color 1.15
over `EP01_B_it_wasnt_the_lions.png`. See git history for the exact snippet.
