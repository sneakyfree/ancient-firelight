# Ancient Firelight — PRODUCTION RUNBOOK

**Read this first if you are a fresh agent instance picking up this channel.**
It documents the entire pipeline end to end: script → narration → animation →
render on Veron 1 → mux → publish to YouTube. Everything here has been run in
anger and produced six finished episodes on 2026-07-24/25.

Credentials referenced here live in the fleet lockbox:
`sneakyfree/kit-army-config` → `ACCESS_LOCKBOX.md` → **§19 VIDEO PRODUCTION & YOUTUBE PUBLISHING**.

---

## 0. The one-paragraph version

Narration is recorded by Grant. `faster-whisper` transcribes it to word-level
timings. An animation is hand-authored **per episode** as a JavaScript file that
draws the whole episode as a pure function of time, `render(ctx, t)`. Headless
Chromium screenshots every frame (24 fps) — this is parallelised across 14
workers on **Veron 1**, which is the only machine that matters here. ffmpeg
encodes the frames to video, the video is pulled back to Windy 0, muxed with the
narration WAV, uploaded to Cloudflare R2 for private review, and finally pushed
to YouTube by `yt_upload.py`.

**Render is ~4–6 minutes per episode on Veron. Authoring the animation is the
real work: 15–25 hours per episode.**

---

## 1. Machines and why

| Machine | Role | Why |
|---|---|---|
| **Veron 1** (i9 24-core, RTX 5090, 251 GB RAM) | **all rendering + all AI image gen** | 24 cores → 14 parallel Chromium workers. Only box with CUDA, so the only one that can make the cave-art ghosts. |
| **Windy 0** (2017 iMac, no GPU) | cockpit: authoring, narration mic, stills QA, mux, upload | Nice screen, working USB mic. Too slow to render (~70 min/episode) and thermally throttles. |
| Mac mini M4 | edit bay (unused by this pipeline) | No CUDA. |

**Quality is identical on every machine** — the render is deterministic canvas
drawing. Only wall-clock and GPU capability differ. Always render on Veron.

**Transfer direction matters:** the link to Veron is asymmetric. Downloading
from Veron is fast; uploading to it is slow (~16 KB/s observed). So: push only
tiny text files (`.js`, `.html`, `.css`) to Veron, render there, pull the
video-only MP4 back, and **mux the audio locally on Windy 0.** Never rsync the
narration WAV to Veron — it will silently stall.

SSH: `ssh wg-veron` (WireGuard, via the Hostinger VPS). See lockbox §15.

---

## 2. Repo layout

```
ancient-firelight/
├── RUNBOOK.md              ← this file
├── animation/
│   ├── engine.js           ← SHARED render engine (palette, fire, ghosts, text…)
│   ├── EP0N.js             ← per-episode animation (the actual creative work)
│   ├── EP0N.html           ← loads fonts.css + engine.js + EP0N.js
│   ├── fonts.css           ← EB Garamond subset as base64 data-URIs
│   ├── stills.py           ← shoot sample frames for QA (ALWAYS run before rendering)
│   ├── EP0N_words.json     ← word-level timings from whisper
│   └── EP0N_transcript.txt ← segment transcript (used to author the beats)
├── voice/                  ← narration masters (.wav, gitignored — large)
├── exports/                ← finished episodes (.mp4, gitignored — large)
├── site/worker.js          ← Cloudflare Worker: private season-preview site
├── episodes.json           ← YouTube metadata for all episodes
├── yt_auth.py              ← one-time YouTube OAuth (writes yt_token.json)
└── yt_upload.py            ← uploads episodes; resumable + idempotent
```

---

## 3. The animation contract

`engine.js` loads first and provides everything shared. The episode file loads
**after** and defines a single global:

```js
window.EPISODE = {
  duration:   663.6,                 // narration master length in seconds
  bounds:     [96,188,245,...],      // scene boundaries → dip-to-dark cut hider
  ghostNames: ['hands','lions'],     // PNGs preloaded from ./ghosts_glow/
  render:     function(ctx, t){ ... }// draws the entire episode at time t
};
```

Engine provides: `baseBg vignette grain watermark ghost chapterBlink figure
figureLying flame drawHand fireGlow line strokes emberDrift smoke glyph
citation kicker arrow bigNumber` plus palette constants (`SOOT EMBER EMBER2
CREAM SPARK ASH GOLD NIGHT NIGHT2 MOON COOL`) and easing (`clamp smooth ramp
env rnd mix rgba`).

Two helpers do most of the work:
- `ramp(t,a,b)` — smooth 0→1 between a and b
- `env(t,a,b,c,d)` — fade in over [a,b], hold, fade out over [c,d]

Coordinate space is a logical **1280×720**; the host scales ×1.5 to output 1080p.

### Authoring an episode
1. Read `EP0N_transcript.txt` and pick scene boundaries at natural argument breaks.
2. Write each scene as a function keyed to the real word times from the transcript.
3. Give the episode ONE signature object that carries it (EP02 the hand stencil,
   EP03 the crosshatch, EP04 the bone, EP05 the genome strip, EP06 the week grid).
4. Cite sources on screen via `citation()` — the channel's whole ethic is honesty.

---

## 4. HARD-WON RULES (violate these and you will ship a bug)

1. **ALWAYS shoot stills before rendering.** ~30 frames + a contact sheet.
   Every single episode had real bugs caught this way. It costs 30 seconds and
   saves a 6-minute render plus a bad master.
   ```bash
   python3 animation/stills.py "$PWD/animation/EP0N.html" /tmp/epN "5,40,120,300,..."
   ```
2. **Dark silhouettes vanish on dark backgrounds.** Any figure/animal drawn in a
   scene *without* fire behind it needs a warm radial pool behind it and a
   mid-tone fill (`#241A10`), never near-black (`#100B08`).
3. **Text collisions:** when two beats overlap in time they must not share a `y`.
   A line's fade-out must fully complete before another claims that band.
4. **Never trust a long-file whisper pass in a garbled region** — it hallucinates
   repetitions. Verify with `silencedetect` + a word-level pass on an isolated clip.
5. **Check every master for duplicate takes** with an n-gram shingle scan over
   `EP0N_words.json` before authoring (see §6). Spot-checking phrases misses them.
6. `ffprobe`/ffmpeg's image2 reader stops at the first missing frame — a count of
   N-1 frames is normal and harmless, not a failed render.

---

## 5. Narration → timings

```bash
source ~/whisper-venv/bin/activate
python - <<'PY'
from faster_whisper import WhisperModel
import json
m = WhisperModel("small.en", device="cpu", compute_type="int8")
segs,_ = m.transcribe("voice/EP0N_MASTER.wav", language="en",
                      word_timestamps=True, vad_filter=True, beam_size=5)
words, lines = [], []
for s in segs:
    lines.append(f"[{s.start:8.2f} - {s.end:8.2f}] {s.text.strip()}")
    for w in (s.words or []):
        words.append({"w": w.word.strip(), "s": round(w.start,3), "e": round(w.end,3)})
json.dump(words, open("animation/EP0N_words.json","w"))
open("animation/EP0N_transcript.txt","w").write("\n".join(lines))
PY
```

### Duplicate-take detector (RUN THIS ON EVERY MASTER)
```python
import json, re
W = json.load(open("animation/EP0N_words.json"))
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
toks = [(norm(x["w"]), x["s"]) for x in W if norm(x["w"])]
N, seen, hits = 8, {}, []
for i in range(len(toks)-N):
    k = " ".join(t[0] for t in toks[i:i+N])
    if k in seen and toks[i][1]-toks[seen[k]][1] > 4:
        hits.append((toks[seen[k]][1], toks[i][1], k))
    elif k not in seen:
        seen[k] = i
for a,b,k in hits: print(f"{a:.1f} vs {b:.1f} :: {k[:70]}")
```
Then cut with ffmpeg `atrim` + `acrossfade` **in a silent gap**, and re-transcribe
to prove the seam reads clean and the duplicate count dropped to zero.

---

## 6. Cave-art ghosts (Veron GPU only)

Faint authentic cave art surfacing behind the firelight, keyed to the words.

**Licensing — non-negotiable:** use **FLUX.1-schnell** (Apache-2.0). *Never*
FLUX.1-dev (non-commercial). Source references must be **PUBLIC DOMAIN** on
Wikimedia Commons — check `LicenseShortName`; most Sulawesi/Trois-Frères images
are CC-BY-SA and are NOT usable without attribution, so they were skipped.

**Do not text-to-image cave art** — it produces cartoon/graffiti. The approved
method is **img2img on a real public-domain photograph** so the anatomy and line
come from the cave itself:

```python
# on Veron. NOTE: diffusers lives in ~/chatterbox-venv, NOT system python3
pipe = FluxImg2ImgPipeline.from_pretrained("black-forest-labs/FLUX.1-schnell",
                                           torch_dtype=torch.bfloat16)
pipe.enable_model_cpu_offload()
out = pipe(prompt=P, image=ref, strength=0.40, num_inference_steps=8,
           guidance_scale=0.0, generator=torch.Generator("cpu").manual_seed(11)).images[0]
```
Then convert to ember-glow RGBA (dark pixels → ember/gold, light → transparent)
and drop in `ghosts_glow/<name>.png`. Composite at **~0.10–0.13 alpha** with a
radial iris, one at a time, and keep them OFF data-heavy beats.

Existing library on Veron `~/ep02/ghosts_glow/`: `hands lions horses bear rhino
aurochs mammoth megaloceros`.

---

## 7. RENDER ON VERON (the money step)

```bash
# 1. push ONLY the small text files
scp animation/engine.js animation/EP0N.js animation/EP0N.html animation/fonts.css wg-veron:~/epN/

# 2. on Veron: set duration + paths in render_par.py, then run under systemd
#    (systemd-run survives SSH drops; plain nohup does NOT reliably)
ssh wg-veron 'systemd-run --user --unit=epNrender \
  --working-directory=/home/user1-gpu/epN /bin/bash /home/user1-gpu/epN/build.sh'

# 3. watch
ssh wg-veron 'systemctl --user is-active epNrender; ls ~/epN/frames | wc -l'

# 4. pull back the VIDEO ONLY (fast direction), then mux locally
scp wg-veron:~/epN/EP0N_videoonly.mp4 /tmp/
ffmpeg -y -i /tmp/EP0N_videoonly.mp4 -i voice/EP0N_MASTER.wav \
  -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart exports/EP0N_Name.mp4
```

`render_par.py` = multiprocessing Pool of `WORKERS=14` Chromium instances, each
rendering a contiguous frame chunk via `page.screenshot()`. Encode is
`libx264 -preset slow -crf 18 -pix_fmt yuv420p -an`.

**GOTCHAS**
- `systemd-run` as root → `ModuleNotFoundError: playwright` (it's a user install).
  Use `--user`, or pass `--uid=user1-gpu --setenv=HOME=... --setenv=PYTHONPATH=...`.
- Single-threaded rendering wastes the box (70 min vs 6). Always parallel.
- `diffusers` is in `~/chatterbox-venv`; `playwright` is in system python3.

---

## 8. Publish

**Private review site** (Cloudflare Worker + R2, byte-range streaming so scrubbing
works — Pages cannot do this):
```bash
wrangler r2 object put ancient-firelight/EP0N.mp4 --file=exports/EP0N_Name.mp4 \
  --content-type=video/mp4 --remote        # --remote is MANDATORY or it goes to a local sim
cd site && wrangler deploy                 # edit the EPISODES array first
```
Live at **https://ancientfirelight.thewindstorm.uk** (noindex, private link).

**YouTube:**
```bash
./yt-venv/bin/python yt_upload.py --list      # ALWAYS confirm the channel first
./yt-venv/bin/python yt_upload.py --dry-run
./yt-venv/bin/python yt_upload.py             # uploads everything not yet done
```
Metadata is `episodes.json`. Uploads are resumable and recorded in
`yt_uploaded.json`, so re-running never double-posts.

---

## 9. Channel facts

- **Channel:** Ancient Firelight — `@AncientFireLight` — channelId `UCP2d1oA8gmFz5YyLuS_N3cg`
- **Editorial rule:** promise a place/person/vanished world; deliver the mechanism
  as payload, never as the promise. (Verified 66× view difference on packaging alone.)
- **Say "ancient humans", never "cavemen".** Titles as questions. 8–12 min.
- **Honesty is the brand** — cite sources on screen, state what is unresolved.

---

## 10. ⚠️ YOUTUBE API LIMITS PROVEN IN PRACTICE (2026-07-25)

The API project `kit-assistant-486203` has **not** completed Google's YouTube API
compliance audit. Established by elimination, not guesswork:

| Call | Works? | Notes |
|---|---|---|
| `videos.insert` (upload) | ✅ **YES** | all six episodes uploaded unattended |
| `channels.list` / `videos.list` | ✅ YES | |
| `thumbnails.set` | ❌ 403 | "The thumbnail can't be set for the specified video" |
| `videos.update` (visibility, metadata) | ❌ 403 forbidden | even a no-op private→private is refused |

**It is NOT a scope problem and NOT a channel problem.** The channel's Feature
eligibility shows *Intermediate features: Enabled* (custom thumbnails on), and the
token holds the full `youtube` scope. Do not burn time re-authorizing.

**What this means day to day:**
- Uploading new episodes stays fully automated. That is the expensive part.
- **Thumbnails and the private→public flip must be done by hand in YouTube Studio**
  (~20 seconds per video) until the audit is approved.
- To remove the limit permanently, submit Google's free YouTube API Services
  compliance audit for the project. Worth doing if more channels are coming.

`yt_thumbs.py` and `yt_publish.py` are written and correct — they will start
working the moment the audit clears, with no code changes.
