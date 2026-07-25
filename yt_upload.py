#!/usr/bin/env python3
"""Upload Ancient Firelight episodes to YouTube — resumable, idempotent, non-interactive.

Usage:
  yt_upload.py --list                 show channels this token can post to (do this first)
  yt_upload.py --dry-run              show exactly what would be sent, send nothing
  yt_upload.py                        upload every episode not already uploaded
  yt_upload.py --only EP02 EP03       upload specific episodes
  yt_upload.py --privacy unlisted     override privacy (default: from episodes.json)

Already-uploaded episodes are recorded in yt_uploaded.json and skipped, so the
command is safe to re-run after any interruption.
"""
import argparse, json, os, sys, time

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError

HERE = os.path.dirname(os.path.abspath(__file__))
TOKEN = os.path.join(HERE, "yt_token.json")
META = os.path.join(HERE, "episodes.json")
STATE = os.path.join(HERE, "yt_uploaded.json")


def creds():
    if not os.path.exists(TOKEN):
        sys.exit("No %s — run yt_auth.py first." % TOKEN)
    c = Credentials.from_authorized_user_file(TOKEN)
    if not c.valid:
        if c.expired and c.refresh_token:
            c.refresh(Request())
            with open(TOKEN, "w") as f:
                f.write(c.to_json())
        else:
            sys.exit("Token invalid and not refreshable — re-run yt_auth.py.")
    return c


def load_state():
    return json.load(open(STATE)) if os.path.exists(STATE) else {}


def save_state(s):
    with open(STATE, "w") as f:
        json.dump(s, f, indent=2)


def list_channels(yt):
    r = yt.channels().list(part="snippet,contentDetails,statistics", mine=True).execute()
    items = r.get("items", [])
    if not items:
        print("No channel visible to this token.")
        return
    print("Channels this token can upload to:")
    for c in items:
        sn = c["snippet"]
        print("  - %s" % sn["title"])
        print("    channelId : %s" % c["id"])
        print("    videos    : %s" % c.get("statistics", {}).get("videoCount", "?"))


def upload_one(yt, ep, defaults, privacy_override, dry):
    path = os.path.join(HERE, ep["file"])
    if not os.path.exists(path):
        print("  !! missing file: %s" % path)
        return None
    size_mb = os.path.getsize(path) / 1048576.0
    tags = list(dict.fromkeys((ep.get("tags") or []) + defaults.get("tags", [])))[:30]
    privacy = privacy_override or defaults.get("privacyStatus", "private")
    body = {
        "snippet": {
            "title": ep["title"],
            "description": ep["description"],
            "tags": tags,
            "categoryId": defaults.get("categoryId", "27"),
            "defaultLanguage": defaults.get("defaultLanguage", "en"),
        },
        "status": {
            "privacyStatus": privacy,
            "selfDeclaredMadeForKids": defaults.get("madeForKids", False),
            "embeddable": True,
        },
    }
    print("\n=== %s — %s ===" % (ep["id"], ep["title"]))
    print("  file    : %s (%.0f MB)" % (ep["file"], size_mb))
    print("  privacy : %s" % privacy)
    print("  tags    : %s" % ", ".join(tags[:8]) + (" …" if len(tags) > 8 else ""))
    if dry:
        print("  [dry-run] not sent")
        return None

    media = MediaFileUpload(path, chunksize=8 * 1024 * 1024, resumable=True,
                            mimetype="video/mp4")
    req = yt.videos().insert(part="snippet,status", body=body, media_body=media)
    resp = None
    tries = 0
    last_pct = -10
    while resp is None:
        try:
            status, resp = req.next_chunk()
            if status:
                pct = int(status.progress() * 100)
                if pct - last_pct >= 10:
                    print("    %d%%" % pct, flush=True)
                    last_pct = pct
        except HttpError as e:
            if e.resp.status in (500, 502, 503, 504) and tries < 6:
                tries += 1
                wait = 2 ** tries
                print("    transient %s — retry %d in %ds" % (e.resp.status, tries, wait))
                time.sleep(wait)
                continue
            raise
    vid = resp["id"]
    print("  DONE -> https://youtu.be/%s" % vid)
    return vid


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--privacy", choices=["private", "unlisted", "public"])
    a = ap.parse_args()

    yt = build("youtube", "v3", credentials=creds(), cache_discovery=False)

    if a.list:
        list_channels(yt)
        return

    meta = json.load(open(META))
    defaults = meta.get("defaults", {})
    eps = meta["episodes"]
    if a.only:
        want = set(x.upper() for x in a.only)
        eps = [e for e in eps if e["id"].upper() in want]
        if not eps:
            sys.exit("No episodes matched --only")

    state = load_state()
    if not a.dry_run:
        list_channels(yt)
        print("\n^ uploading to the channel above.\n")

    for ep in eps:
        if ep["id"] in state and not a.dry_run:
            print("\n=== %s — already uploaded (%s), skipping ===" %
                  (ep["id"], state[ep["id"]].get("url")))
            continue
        try:
            vid = upload_one(yt, ep, defaults, a.privacy, a.dry_run)
        except HttpError as e:
            print("  !! FAILED %s: %s" % (ep["id"], e))
            break
        if vid:
            state[ep["id"]] = {"videoId": vid, "url": "https://youtu.be/%s" % vid,
                               "title": ep["title"]}
            save_state(state)

    if state and not a.dry_run:
        print("\n===== UPLOADED =====")
        for k in sorted(state):
            print("  %s  %s  %s" % (k, state[k]["url"], state[k]["title"]))


if __name__ == "__main__":
    main()
