#!/usr/bin/env python3.10
"""
Nara Charm — 双语字幕生成器
1. Whisper 中文语音识别 (small 模型, 平衡速度与准确度)
2. 谷歌翻译 中文→英文
3. 生成双语 SRT (上行中文, 下行英文)
4. 烧录到视频

用法: python3.10 workflow/bilingual_subtitle.py <视频路径> [--model small|medium|large]
"""
import sys, os, re, argparse
from pathlib import Path

# ─── 配置 ──────────────────────────────────────────────────
VIDEO_DIR = Path(__file__).resolve().parent.parent
CAPTIONS_DIR = VIDEO_DIR / "captions"
CAPTIONS_DIR.mkdir(exist_ok=True)

def format_srt_time(seconds):
    """Convert seconds to SRT time format"""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def transcribe_chinese(audio_path, model_name="small"):
    """Transcribe Chinese audio using Whisper"""
    print(f"[1/4] 语音识别 (Whisper {model_name})...")
    import whisper
    model = whisper.load_model(model_name)
    result = model.transcribe(str(audio_path), language="zh", verbose=False)
    segments = result.get("segments", [])
    print(f"  → 识别到 {len(segments)} 个片段, 文本预览:")
    for seg in segments[:5]:
        print(f"    [{format_srt_time(seg['start'])} → {format_srt_time(seg['end'])}] {seg['text'].strip()}")
    if len(segments) > 5:
        print(f"    ... 还有 {len(segments)-5} 个片段")
    return segments

def translate_segments(segments):
    """Translate Chinese segments to English"""
    print(f"[2/4] 翻译 {len(segments)} 个片段中文→英文...")
    from deep_translator import GoogleTranslator
    translator = GoogleTranslator(source="zh-CN", target="en")

    translations = []
    for i, seg in enumerate(segments):
        text = seg['text'].strip()
        if not text:
            translations.append("")
            continue
        try:
            en = translator.translate(text)
            translations.append(en)
            if i < 5 or (i+1) % 10 == 0:
                print(f"  [{i+1}/{len(segments)}] ZH: {text}")
                print(f"                   EN: {en}")
        except Exception as e:
            print(f"  ⚠️ 翻译失败 [{i+1}]: {e}")
            translations.append("")
    return translations

def generate_bilingual_srt(segments, translations, output_path):
    """Generate bilingual SRT (Chinese top, English bottom)"""
    print(f"[3/4] 生成双语字幕 → {output_path}")
    with open(output_path, "w", encoding="utf-8") as f:
        for i, (seg, en_text) in enumerate(zip(segments, translations), 1):
            cn = seg['text'].strip()
            if not cn:
                continue

            start = format_srt_time(seg['start'])
            end = format_srt_time(seg['end'])

            f.write(f"{i}\n")
            f.write(f"{start} --> {end}\n")
            # Chinese on top line, English below
            f.write(f"{cn}\n")
            if en_text and en_text != cn:
                f.write(f"{en_text}\n")
            f.write("\n")
    print(f"  → 共 {len([s for s in segments if s['text'].strip()])} 条字幕")

def render_video(input_video, srt_path, output_path):
    """Burn subtitles into video"""
    print(f"[4/4] 烧录字幕 → {output_path}")
    # Convert SRT to ASS for better styling (Chinese bigger, English smaller + below)
    ass_path = output_path.with_suffix(".ass")

    import subprocess
    # First convert SRT to ASS with proper styling
    subprocess.run([
        "ffmpeg", "-y", "-i", str(input_video),
        "-vf", f"subtitles={srt_path}:force_style="
                f"'FontName=SourceHanSansSC,FontSize=18,PrimaryCol=&H00FFFFFF,"
                f"BorderStyle=3,Outline=2,Shadow=1,MarginV=60,Alignment=2'",
        "-c:a", "copy",
        str(output_path),
        "-loglevel", "error"
    ], check=True)
    print(f"  ✅ 完成: {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Nara Charm 双语字幕生成")
    parser.add_argument("video", help="输入视频路径")
    parser.add_argument("--model", default="small", choices=["tiny", "base", "small", "medium", "large", "large-v3"],
                        help="Whisper 模型 (默认 small)")
    parser.add_argument("--output", "-o", help="输出视频路径 (默认自动)")
    args = parser.parse_args()

    input_video = Path(args.video)
    if not input_video.exists():
        print(f"❌ 视频不存在: {input_video}")
        sys.exit(1)

    basename = input_video.stem
    audio_path = VIDEO_DIR / "captions" / f"{basename}_temp.wav"
    srt_path = CAPTIONS_DIR / f"{basename}_bilingual.srt"

    # 0. Extract audio
    print("[0/4] 提取音频...")
    import subprocess
    subprocess.run([
        "ffmpeg", "-y", "-i", str(input_video),
        "-ar", "16000", "-ac", "1", str(audio_path),
        "-loglevel", "error"
    ], check=True)

    # 1. Transcribe
    segments = transcribe_chinese(audio_path, args.model)

    # 2. Translate
    translations = translate_segments(segments)

    # 3. Generate bilingual SRT
    generate_bilingual_srt(segments, translations, srt_path)

    # 4. Render
    if args.output:
        output_path = Path(args.output)
    else:
        output_path = VIDEO_DIR / "exports" / "final" / f"{basename}_bilingual.mp4"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    render_video(input_video, srt_path, output_path)

    # Cleanup
    audio_path.unlink(missing_ok=True)
    print(f"\n✅ 全部完成!")
    print(f"   📄 字幕: {srt_path}")
    print(f"   🎬 视频: {output_path}")

if __name__ == "__main__":
    main()
