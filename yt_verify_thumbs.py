#!/usr/bin/env python3
"""Verify the thumbnails that are ACTUALLY live on YouTube.

`thumbnails.set` returning 200 does NOT mean the new image is live — on
2026-07-25 four of six landed and two were silently rejected by a rate
limit, and the API's "OK" looked identical either way. The only honest
check is to pull the image back off YouTube's CDN and measure it.

    ./yt-venv/bin/python yt_verify_thumbs.py            # all episodes
    ./yt-venv/bin/python yt_verify_thumbs.py EP05 EP06  # just these

Exit code 0 = every checked episode matches its local `_launch.png`.
Exit code 1 = at least one is stale — publishing did not take; re-run yt_thumbs.py.

A dim-but-matching thumbnail is reported as a WARNING, not a failure: it means
publishing worked and the *source art* is under target, which is fixed by
re-lighting the PNG, not by re-uploading it.
"""
import io
import json
import sys
import urllib.request

import numpy as np
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from PIL import Image

CHANNEL_ID = "UCP2d1oA8gmFz5YyLuS_N3cg"  # Ancient Firelight
TOKEN = "yt_token.json"
UPLOADED = "yt_uploaded.json"
THUMB = "assets/thumbs/{ep}_launch.png"

# Brightness targets — see assets/thumbs/README-relight.md for why.
MIN_MEAN = 55.0
MAX_BLACK_PCT = 25.0
# Mean-luminance gap above which live and local are considered different images.
MATCH_TOL = 8.0


def stats(im):
    """Mean luminance and % near-black.

    Same 0.299/0.587/0.114 weighting as the snippet in README-relight.md, so the
    numbers here are directly comparable to the ones recorded there. Downsampled
    first so the CDN's JPEG artefacts don't skew the result against the PNG.
    """
    a = np.asarray(im.convert("RGB").resize((320, 180))).astype(np.float32)
    lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    return lum.mean(), (lum < 25).mean() * 100


def main():
    creds = Credentials.from_authorized_user_file(TOKEN)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        open(TOKEN, "w").write(creds.to_json())
    yt = build("youtube", "v3", credentials=creds)

    # ONE OAUTH TOKEN = ONE CHANNEL. Never measure the wrong channel's art.
    ch = yt.channels().list(part="snippet", mine=True).execute()["items"][0]
    if ch["id"] != CHANNEL_ID:
        sys.exit(
            f"WRONG CHANNEL: token is on {ch['snippet']['title']} ({ch['id']}), "
            f"expected Ancient Firelight ({CHANNEL_ID}). Re-run yt_auth.py --full."
        )
    print(f"channel: {ch['snippet']['title']}  OK\n")

    uploaded = json.load(open(UPLOADED))
    eps = [e.upper() for e in sys.argv[1:]] or sorted(uploaded)

    print(f"{'EP':6}{'live':>8}{'blk%':>7}{'local':>8}{'blk%':>7}  verdict")
    stale, dim = [], []
    for ep in eps:
        vid = uploaded[ep]["videoId"]
        thumbs = yt.videos().list(part="snippet", id=vid).execute()
        thumbs = thumbs["items"][0]["snippet"]["thumbnails"]
        url = max(thumbs.values(), key=lambda t: t.get("width", 0))["url"]

        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        live_mean, live_blk = stats(Image.open(io.BytesIO(urllib.request.urlopen(req).read())))
        loc_mean, loc_blk = stats(Image.open(THUMB.format(ep=ep)))

        if abs(live_mean - loc_mean) >= MATCH_TOL:
            verdict = "STALE — live is not the local file"
            stale.append(ep)
        elif live_mean < MIN_MEAN or live_blk > MAX_BLACK_PCT:
            verdict = "live, but source art is under target"
            dim.append(ep)
        else:
            verdict = "ok"
        print(
            f"{ep:6}{live_mean:8.1f}{live_blk:6.1f}%{loc_mean:8.1f}{loc_blk:6.1f}%  {verdict}"
        )

    if dim:
        print(f"\nWARNING — dim source art (published fine, but under mean {MIN_MEAN}): "
              f"{' '.join(dim)}")
        print("  Re-light the PNG per assets/thumbs/README-relight.md, then re-run")
        print(f"  yt_thumbs.py {' '.join(dim)}. Re-uploading as-is changes nothing.")
    if stale:
        print(f"\nFAILED — did not publish: {' '.join(stale)}")
        print(f"  ./yt-venv/bin/python yt_thumbs.py {' '.join(stale)}")
        sys.exit(1)
    print(f"\nall {len(eps)} live and matching their local files.")


if __name__ == "__main__":
    main()
