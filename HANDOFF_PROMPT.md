# ANCIENT FIRELIGHT — PRODUCTION HANDOFF

*Paste this into a fresh Claude session that has terminal/tool access to Grant's machines (Claude Code / Cowork with tools). If the session is a plain chat with no execution, it can only do the writing/planning/creative parts — the rendering, recording, and file work need a session that can run commands on this machine and SSH to Veron.*

---

You are taking over production of **Ancient Firelight**, a faceless YouTube channel. Everything you need is below, and the full history is in Grant's auto-memory. **START by reading these files:**
- `/home/grantwhitmer/.claude/projects/-home-grantwhitmer/memory/MEMORY.md`
- `/home/grantwhitmer/.claude/projects/-home-grantwhitmer/memory/project_ancient_firelight_youtube.md`
- Related: `project_pattern_upstream_book.md`, `user_grant.md`, `feedback_grant_is_ideas_guy_take_charge.md`

## WHO
**Grant Whitmer** — USNA grad, founder of Windstorm Institute, author of *The Pattern Upstream of Everything* (the book this channel is built from). He's an **ideas guy — take charge, run with things, don't ask permission for reversible work**. He's non-technical on audio/video, so **open files and media on his screen for him** and walk him through anything hands-on in simple steps.

## THE CHANNEL (what & why)
Faceless YouTube channel on **human origins — "the long dawn of the human mind,"** the hundreds of thousands of years our ancestors spent slowly becoming *sapient*. Based on Grant's book. The strategic position is the **honest-history / "how we got the story wrong" lane**. Commercial goal: top-of-funnel for Grant's 7 books and his thesis (not an AdSense play). Model to copy: **Fall of Civilizations** — faceless but unmistakably *authored*. Channel is LIVE: `youtube.com/@AncientFireLight`. Domain `ancientfirelight.com` is available but not yet bought.

## THE RULES (non-negotiable creative constraints)
1. **Promise a vanished world; deliver the mechanism as payload.** Titles/hooks are concrete (a hand, a skull, a fire, a body in ice) — never abstract ("cognition," "emergence"). Verified: mechanism-framing loses to vanished-world framing **7–66×** with the same guest on the same channel.
2. **"Ancient humans," never "cavemen." SAPIENT, never "sentient"** (animals are sentient; *Homo sapiens* = "wise man").
3. **Show your sources on screen** — the honesty IS the moat.
4. **The style is deliberately crude** ("the first art was crude too") — flat vector, **soot-and-ember palette**, the **hand-stencil motif** as logo/transition. Premium-but-simple. This flat-vector look is the channel; do NOT try to out-render it with photoreal AI video.
5. **Never AI-generate the recurring cast** — hand-draw/vector it (consistency by construction). The 5090/ComfyUI, if used, is for backgrounds/props only.

## CURRENT STATE (2026-07-18)
- **Channel live + branded** (banner, hand-stencil logo, description, 3 thumbnails) — in `~/Desktop/Grant's Folder/ancient-firelight/assets/`.
- **EP01 "What Did Ancient Humans Do at Night?" WRITTEN + fact-checked.** Full script w/ shot notes: `ancient-firelight/scripts/EP01_what_did_ancient_humans_do_at_night.md`. Teleprompter: `scripts/EP01_TELEPROMPTER.md`. Sources + trap list: `research/EP01_sources_and_traps.md`. The episode's honest spine: the "fire kept predators away" story has **no supporting study in existence**; the payload is that **someone is always awake** (chronotype varies with age → grandparents are the night watch, unplanned).
- **EP01 NARRATION recorded (Grant's own voice) + edited to master, APPROVED:** `ancient-firelight/voice/EP01_narration_MASTER.wav` (11.6 min, broadcast level). Word transcript: `ancient-firelight/animation/EP01_word_transcript.txt`.
- **Cold-open PROOF-OF-CONCEPT video built + approved:** `ancient-firelight/exports/EP01_coldopen_POC.mp4` (first 45s, 720p). Grant loves the look.

## YOUR TASK
**Build the full EP01 video** by extending the cold-open animation approach across all **11.6 minutes** of narration — each beat gets its own visual treatment (the setting sun → the dark litany → "Half." → the fire igniting → the Packer lion/moonlight study → the citation-drift diagram → the 67%-of-nights fire stat → the sleep numbers → the night-watch payload → the closing hand). Then **render at 1080p** and present to Grant for approval. **Confirm the section-by-section plan with him before rendering all 11.6 minutes.**

## THE ANIMATION PIPELINE (already built — reuse & extend it) — in `ancient-firelight/animation/`
- **`anim.js`** — a `render(ctx, t)` function that draws the entire scene as a function of time `t` in seconds, using time-keyed phases with `ramp()`/`smooth()` easing. Reuses `figure()` (seated silhouette) and `flame()` (layered fire + sparks). Palette: soot `#14100E`, ember `#C4451F`/`#D9552B`, cream `#EDE4D6`, spark `#E9783B`.
- **`anim.html`** — wraps `anim.js` + embedded EB Garamond (the book's typeface, via `fonts.css` base64). Canvas 1280×720.
- **`render.py`** — Playwright (use **system `python3`**, NOT the whisper venv — playwright is in system Python) opens `anim.html`, loops frames calling `window.frame(t)` (returns canvas `toDataURL` PNG), saves to `frames/`. 24 fps.
- **`build.sh`** — runs `render.py`, then ffmpeg muxes frames + narration audio → mp4 (libx264 crf19, `-shortest`).
- **`fonts.css`** — EB Garamond woff2 as base64 data URIs (brand continuity with the book).
- **`scene.js`, `handmark.js`** — the night-fire scene + hand-stencil renderers (used for thumbnails/brand; reusable).
- **SYNC TO VOICE:** get word-level timestamps with faster-whisper (`~/whisper-venv/bin/python`, model `small.en`, `word_timestamps=True`) on the master, then key animation events to word times.
- **1080p final:** bump canvas + Playwright viewport to 1920×1080.
- **File-size note:** flat animation compresses tiny — 2 MB for 45s @ 720p → a full episode ≈ 25–40 MB. Downloads/uploads are a non-issue.

## THE MACHINES
- **Windy 0 (this machine)** — 2017 Fusion-Drive iMac, Fedora, i7-7700K, 62 GB RAM, **NO CUDA GPU**, 2.5 TB free. Grant's cockpit + where you render vector animation (Playwright/ffmpeg on CPU works fine).
- **Veron 1** — SSH `wg-veron` (user `user1-gpu`). The GPU workhorse: **RTX 5090 32 GB**, i9 24-core, 251 GB RAM. For AI image gen (ComfyUI not yet installed), **voice cloning (Chatterbox WORKING at `~/chatterbox-venv`, 3.5× realtime)**, heavy renders. Driven headless over SSH. SSD root 33% used (2.3 TB free); 2× 7.3 TB Seagate HDDs (SMR — **slow writes, ~30 MB/s**) at `/mnt/data1`, `/mnt/data2`. Its residential upload is slow — **upload the final video to YouTube FROM Veron** rather than downloading it to Windy 0.
- **M4 Mac mini** (arriving ~07-19) — edit bay + Riverside/iPhone podcasting. Headless after one-time setup; needs a ~$8 HDMI dummy plug for full GPU.

## GOTCHAS / DOCTRINES (learned the hard way — do not repeat)
- **Wrap ENTIRE pipelines in `timeout`, not just the first command.** A runaway regex once pinned a CPU core at 100 °C for 15 hours. Never use chained `.*?` regex on large HTML.
- **Windy 0's analog audio is DEAD** (CS8409 codec bug). Sound goes to **BT950 Bluetooth headphones** (MAC `EE:6C:88:2B:F3:16`, paired+trusted). Reconnect: `bluetoothctl connect EE:6C:88:2B:F3:16` → `pactl set-default-sink bluez_output.EE_6C_88_2B_F3_16.1` → move sink-inputs. USB audio also works. **Never the jack.**
- **Terminal does NOT make links clickable** (click = copy). To open a file/media FOR Grant: `xdg-open` with the graphical env pulled from gnome-shell's `/proc/<PID>/environ` (`DISPLAY`/`WAYLAND_DISPLAY`/`XDG_RUNTIME_DIR`/`DBUS_SESSION_BUS_ADDRESS`). **claude.ai ARTIFACT links DO work clickable** — use artifacts for anything Grant needs to open/copy.
- **Only one Claude session should touch the machines/Veron at a time** (two at once caused the runaway-process incident).
- Credentials (GoDaddy/Cloudflare/GitHub/HF/AWS) are in the memory `reference_*` files and the fleet lockbox (`grep` the lockbox first — see `feedback_check_lockbox_first.md`).

## AFTER THE VIDEO
- Grant buys `ancientfirelight.com` → wire a redirect via Cloudflare (DNS:Edit token in `reference_api_tokens.md`).
- Upload EP01 to YouTube (from Veron ideally). Launch with thumbnail **B ("It wasn't the lions")**; A/B-test all three via Studio → Test & compare.
- Then **EP02 = the Muna hand-stencil flagship** ("Someone Pressed Their Hand Here 67,800 Years Ago") — see the episode slate in memory.

**Begin:** read the memory files → watch the cold-open POC → propose the full-episode section plan to Grant → on his OK, extend `anim.js` and render. Keep him in the loop between phases.
