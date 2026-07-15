#!/bin/bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VIDEO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CAPTIONS_DIR="$VIDEO_DIR/captions"
mkdir -p "$CAPTIONS_DIR"

INPUT="$1"
LANG="${3:-zh}"
if [ ! -f "$INPUT" ]; then echo "Usage: $0 <video> [--lang zh|en]"; exit 1; fi

BASENAME=$(basename "$INPUT" | sed 's/\.[^.]*$//')
SRT_FILE="$CAPTIONS_DIR/${BASENAME}.srt"
AUDIO_FILE="/tmp/nara_audio_$$.wav"

echo "[i] Extracting audio..."
ffmpeg -y -i "$INPUT" -ar 16000 -ac 1 "$AUDIO_FILE" -loglevel error

echo "[i] Transcribing with Whisper (lang=$LANG)..."
python3.10 -c "
import whisper, sys
model = whisper.load_model('base')
result = model.transcribe('$AUDIO_FILE', language='$LANG')
with open('$SRT_FILE', 'w', encoding='utf-8') as f:
    for i, seg in enumerate(result['segments'], 1):
        def st(s):
            h=int(s//3600); m=int((s%3600)//60); s2=int(s%60); ms=int((s%1)*1000)
            return f'{h:02d}:{m:02d}:{s2:02d},{ms:03d}'
        f.write(f\"{i}\n{st(seg['start'])} --> {st(seg['end'])}\n{seg['text'].strip()}\n\n\")
print(f'[✓] SRT saved: $SRT_FILE')
"
rm -f "$AUDIO_FILE"
