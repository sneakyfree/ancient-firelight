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
STATE = os.path.join(HERE, "yt_uploaded.json")

def creds():
    c = Credentials.from_authorized_user_file(os.path.join(HERE, "yt_token.json"))
    if not c.valid:
        c.refresh(Request())
    return c

def main():
    only = [a.upper() for a in sys.argv[1:]] or None
    yt = build("youtube", "v3", credentials=creds(), cache_discovery=False)
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
