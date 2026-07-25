#!/usr/bin/env python3
"""One-time YouTube authorization for the Ancient Firelight upload pipeline.

Reuses the EXISTING Google OAuth desktop client from the fleet lockbox
(project kit-assistant-486203) and adds the YouTube scopes that the current
Gmail/Calendar grant is missing.

Run it, approve in the browser that opens, and the refresh token is saved to
yt_token.json. After that every upload is non-interactive, forever.
"""
import json, os, sys
from google_auth_oauthlib.flow import InstalledAppFlow

HERE = os.path.dirname(os.path.abspath(__file__))
TOKEN = os.path.join(HERE, "yt_token.json")
CLIENT = os.path.join(HERE, "yt_client.json")

# The OAuth desktop-client credentials are NOT stored in this repo.
# Source of truth: fleet lockbox `sneakyfree/kit-army-config` →
# ACCESS_LOCKBOX.md → §19 VIDEO PRODUCTION & YOUTUBE PUBLISHING
# (project kit-assistant-486203). Recreate yt_client.json with two keys,
# "client_id" and "client_secret", copied from that lockbox section — or set
# YT_CLIENT_ID / YT_CLIENT_SECRET in the environment instead.
CLIENT_ID = os.environ.get("YT_CLIENT_ID")
CLIENT_SECRET = os.environ.get("YT_CLIENT_SECRET")
if not (CLIENT_ID and CLIENT_SECRET):
    if not os.path.exists(CLIENT):
        sys.exit(
            "Missing OAuth client credentials.\n"
            "Create %s as {\"client_id\": \"...\", \"client_secret\": \"...\"}\n"
            "Values are in the fleet lockbox, ACCESS_LOCKBOX.md §19." % CLIENT
        )
    _c = json.load(open(CLIENT))
    CLIENT_ID, CLIENT_SECRET = _c["client_id"], _c["client_secret"]

# upload = push the video; readonly = list channels so we can confirm we're on
# the right one before sending anything.
#
# Run with --full to also request the broad `youtube` scope, which is what
# unlocks: changing visibility (private -> public), setting the channel banner
# and branding, and creating playlists. Custom thumbnails are documented to work
# with youtube.upload alone, but --full rules the scope out as a suspect.
SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
]
if "--full" in sys.argv:
    SCOPES.append("https://www.googleapis.com/auth/youtube")

CLIENT_CONFIG = {
    "installed": {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": ["http://localhost"],
    }
}

def main():
    flow = InstalledAppFlow.from_client_config(CLIENT_CONFIG, SCOPES)
    # access_type=offline + prompt=consent guarantees a refresh_token comes back
    creds = flow.run_local_server(
        port=8765,
        access_type="offline",
        prompt="consent",
        authorization_prompt_message=(
            "\n=== APPROVE IN THE BROWSER ===\n"
            "If it doesn't open automatically, visit:\n\n{url}\n\n"
            "IMPORTANT: pick the Google account that owns the Ancient Firelight\n"
            "channel, and if asked to choose a channel, pick Ancient Firelight.\n"
            "You will see an 'unverified app' warning — click Advanced, then\n"
            "'Go to kit-assistant (unsafe)'. It is your own project.\n"
        ),
        success_message="Authorized. You can close this tab and return to the terminal.",
        open_browser=True,
    )
    with open(TOKEN, "w") as f:
        f.write(creds.to_json())
    os.chmod(TOKEN, 0o600)
    print("\nSAVED:", TOKEN)
    print("refresh_token present:", bool(creds.refresh_token))
    print("scopes:", creds.scopes)

if __name__ == "__main__":
    main()
