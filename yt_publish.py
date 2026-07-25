#!/usr/bin/env python3
"""Flip Ancient Firelight episodes between private / unlisted / public.

Requires the broad `youtube` scope — re-run `yt_auth.py --full` first if you get
a 403. Launch day is the whole point of this script: six videos public in one
command, or scheduled to a common time.

Usage:
  yt_publish.py --status                       show current visibility of each
  yt_publish.py --set public                   make ALL episodes public
  yt_publish.py --set public --only EP01       just one (use this to test first)
  yt_publish.py --schedule 2026-08-01T14:00:00Z   publish all at a set time (UTC)
"""
import argparse, json, os, sys
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

HERE = os.path.dirname(os.path.abspath(__file__))
STATE = os.path.join(HERE, "yt_uploaded.json")


def creds():
    c = Credentials.from_authorized_user_file(os.path.join(HERE, "yt_token.json"))
    if not c.valid:
        c.refresh(Request())
    return c


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--status", action="store_true")
    ap.add_argument("--set", choices=["private", "unlisted", "public"])
    ap.add_argument("--schedule", help="ISO8601 UTC, e.g. 2026-08-01T14:00:00Z")
    ap.add_argument("--only", nargs="*")
    a = ap.parse_args()

    yt = build("youtube", "v3", credentials=creds(), cache_discovery=False)
    state = json.load(open(STATE))
    eps = sorted(state)
    if a.only:
        want = set(x.upper() for x in a.only)
        eps = [e for e in eps if e in want]

    if a.status or not (a.set or a.schedule):
        ids = [state[e]["videoId"] for e in eps]
        r = yt.videos().list(part="status,snippet", id=",".join(ids)).execute()
        by = {i["id"]: i for i in r["items"]}
        for e in eps:
            it = by.get(state[e]["videoId"], {})
            st = it.get("status", {})
            print("  %s  %-10s %s" % (e, st.get("privacyStatus", "?"),
                                      it.get("snippet", {}).get("title", "")[:52]))
        return

    ok = fail = 0
    for e in eps:
        vid = state[e]["videoId"]
        status = {}
        if a.schedule:
            status = {"privacyStatus": "private", "publishAt": a.schedule}
        else:
            status = {"privacyStatus": a.set}
        try:
            yt.videos().update(part="status",
                               body={"id": vid, "status": status}).execute()
            print("  %s  -> %s  %s" % (e, a.schedule or a.set, state[e]["url"]))
            ok += 1
        except HttpError as ex:
            print("  %s  FAIL %s" % (e, ex))
            fail += 1
    print("\n%d updated, %d failed" % (ok, fail))


if __name__ == "__main__":
    main()
