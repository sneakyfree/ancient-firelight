#!/bin/bash
exec > /tmp/coldopen/build.log 2>&1
set -x
python3 /tmp/coldopen/render.py
AUD="/home/grantwhitmer/Desktop/Grant's Folder/ancient-firelight/voice/EP01_narration_MASTER.wav"
ffmpeg -y -framerate 24 -i /tmp/coldopen/frames/%05d.png -i "$AUD" \
  -c:v libx264 -pix_fmt yuv420p -crf 19 -r 24 -c:a aac -b:a 192k -shortest \
  "/home/grantwhitmer/Desktop/Grant's Folder/ancient-firelight/exports/EP01_coldopen_POC.mp4"
echo "BUILD_DONE rc=$?"
