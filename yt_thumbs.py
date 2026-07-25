#!/usr/bin/env python3
"""Set custom thumbnails on the already-uploaded Ancient Firelight episodes.

Reads the episode -> videoId map from yt_uploaded.json and uploads
assets/thumbs/<EP>_launch.png for each. Idempotent: re-running just re-sets
the same image. Costs 50 quota units per call (cheap vs 1600 for an upload).
"""
import json, os, sys
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError

HERE = os.path.dirname(os.path.abspath(__file__))
# Guard against the one-token-one-channel trap: a token authorized for a
# DIFFERENT channel produces confusing 403s on every call. Fail loudly instead.
EXPECT_CHANNEL = "UCP2d1oA8gmFz5YyLuS_N3cg"   # Ancient Firelight
STATE = os.path.join(HERE, "yt_uploaded.json")

def creds():
    c = Credentials.from_authorized_user_file(os.path.join(HERE, "yt_token.json"))
    if not c.valid:
        c.refresh(Request())
    return c

def main():
    only = [a.upper() for a in sys.argv[1:]] or None
    yt = build("youtube", "v3", credentials=creds(), cache_discovery=False)
    ch = yt.channels().list(part="snippet", mine=True).execute().get("items", [])
    if not ch or ch[0]["id"] != EXPECT_CHANNEL:
        got = ch[0]["snippet"]["title"] if ch else "(none)"
        sys.exit("WRONG CHANNEL: token is for %r, expected Ancient Firelight.\n"
                 "Re-run: yt_auth.py --full  and pick Ancient Firelight." % got)
    print("channel: %s  ✅\n" % ch[0]["snippet"]["title"])
    state = json.load(open(STATE))
    ok = fail = 0
    for ep in sorted(state):
        if only and ep not in only:
            continue
        img = os.path.join(HERE, "assets", "thumbs", "%s_launch.png" % ep)
        if not os.path.exists(img):
            print("  %s  SKIP — no %s" % (ep, os.path.basename(img)))
            continue
        vid = state[ep]["videoId"]
        try:
            yt.thumbnails().set(
                videoId=vid,
                media_body=MediaFileUpload(img, mimetype="image/png"),
            ).execute()
            print("  %s  OK   %-28s -> %s" % (ep, os.path.basename(img), state[ep]["url"]))
            ok += 1
        except HttpError as e:
            print("  %s  FAIL %s" % (ep, e))
            fail += 1
    print("\nthumbnails set: %d ok, %d failed" % (ok, fail))

if __name__ == "__main__":
    main()
