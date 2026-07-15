#!/bin/bash
# ============================================================
# Nara Charm Video Pipeline — 核心处理 (去水印+换BGM+加字幕)
# ============================================================
# 用法:
#   bash workflow/process.sh <源视频>                    # 全自动处理
#   bash workflow/process.sh <源视频> --bgm music.mp3   # 指定BGM
#   bash workflow/process.sh <源视频> --skip-watermark  # 跳过某步
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VIDEO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CLEAN_DIR="$VIDEO_DIR/references/cleaned"
EXPORT_DIR="$VIDEO_DIR/exports"
CAPTIONS_DIR="$VIDEO_DIR/captions"
BGM_DIR="$VIDEO_DIR/assets/bgm"
LOGS_DIR="$VIDEO_DIR/logs"
mkdir -p "$CLEAN_DIR" "$EXPORT_DIR/draft" "$EXPORT_DIR/final" "$LOGS_DIR"

INPUT=""
BGM=""
SKIP_WATERMARK=false   # 需要去水印时用 --skip-watermark; XHS-Downloader 源默认不带印
SKIP_SUBTITLE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --bgm)      BGM="$2";      shift 2 ;;
    --skip-watermark)  SKIP_WATERMARK=true;  shift ;;
    --skip-subtitle)   SKIP_SUBTITLE=true;   shift ;;
    *)           INPUT="$1";   shift ;;
  esac
done

[ -z "$INPUT" ] && echo "Usage: $0 <video> [--bgm music.mp3] [--skip-watermark] [--skip-subtitle]" && exit 1
[ ! -f "$INPUT" ] && echo "Error: $INPUT not found" && exit 1

BASENAME=$(basename "$INPUT" | sed 's/\.[^.]*$//')
LOG="$LOGS_DIR/${BASENAME}.log"

echo "═══════════════════════════════════════════════════"
echo "  处理: $INPUT"
echo "  输出: $EXPORT_DIR/final/${BASENAME}_final.mp4"
echo "═══════════════════════════════════════════════════"

# ==========================================================
# STEP 1: 检测视频信息
# ==========================================================
detect_info() {
  echo ""
  echo "[1/5] 检测视频信息..."
  local info
  info=$(ffprobe -v error -show_entries stream=width,height,codec_name \
    -of csv=p=0 "$INPUT" 2>&1 | head -1)

  WIDTH=$(ffprobe -v error -show_entries stream=width -of csv=p=0 "$INPUT" 2>/dev/null | head -1)
  HEIGHT=$(ffprobe -v error -show_entries stream=height -of csv=p=0 "$INPUT" 2>/dev/null | head -1)
  DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$INPUT" 2>/dev/null | xargs printf "%.0f" 2>/dev/null || echo "?")

  echo "  📐 ${WIDTH}x${HEIGHT} | ⏱ ${DURATION}s"
}

# ==========================================================
# STEP 2: 去水印
# ==========================================================
remove_watermark() {
  if [ "$SKIP_WATERMARK" = true ]; then
    echo "[2/5] ⏭ 跳过去水印"
    cp "$INPUT" "$CLEAN_DIR/${BASENAME}_clean.mp4"
    return
  fi

  echo "[2/5] 去水印..."
  local output="$CLEAN_DIR/${BASENAME}_clean.mp4"

  # 检测常见水印位置（小红书右下角或右上角）
  # 策略: 检测右下角区域是否有静态水印，模糊覆盖
  # 更精确: 用 FFmpeg delogo 或覆盖模糊矩形
  ffmpeg -y -i "$INPUT" \
    -vf "drawbox=x=iw-150:y=ih-40:w=140:h=35:color=black@0.7:t=fill" \
    -c:v libx264 -crf 23 -preset fast \
    -c:a copy \
    "$output" -loglevel error

  echo "  ✅ 去水印完成: $output"
}

# ==========================================================
# STEP 3: 替换背景音乐
# ==========================================================
replace_bgm() {
  echo "[3/5] 替换背景音乐..."
  local clean_input="$CLEAN_DIR/${BASENAME}_clean.mp4"
  local bgm_file="$BGM"
  local mixed="$EXPORT_DIR/draft/${BASENAME}_mixed.mp4"

  # 如果没有指定 BGM，从 bgm 目录选第一个
  if [ -z "$bgm_file" ]; then
    bgm_file=$(ls "$BGM_DIR"/*.{mp3,wav,aac,m4a} 2>/dev/null | head -1 || echo "")
  fi

  if [ -z "$bgm_file" ] || [ ! -f "$bgm_file" ]; then
    echo "  ⚠ 未找到 BGM，跳过此步"
    cp "$clean_input" "$mixed"
    return
  fi

  echo "  🎵 BGM: $bgm_file"

  # 获取视频时长以裁剪 BGM
  local dur
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$clean_input" | xargs printf "%.0f" 2>/dev/null || echo 30)

  # 获取原视频音量，决定人声保留比例
  local vol_orig="-10dB"

  # 混音: 原视频人声(降原音量) + 新BGM
  # 先用 amix: 原音量0.7 + BGM音量1.2
  ffmpeg -y -i "$clean_input" \
    -i "$bgm_file" \
    -filter_complex "[0:a]volume=${vol_orig}[a1]; \
                     [1:a]volume=1.2,aloop=loop=-1:size=2e9,atrim=duration=${dur}[a2]; \
                     [a1][a2]amix=inputs=2:duration=first:dropout_transition=2[out]" \
    -map 0:v -map "[out]" -c:v copy -c:a aac -b:a 192k \
    "$mixed" -loglevel error 2>&1 | tail -2

  # 如果混音失败，用简单替换
  if [ ! -f "$mixed" ] || [ ! -s "$mixed" ]; then
    echo "  ⚠ 高级混音失败，使用简单替换..."
    ffmpeg -y -i "$clean_input" -i "$bgm_file" \
      -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 \
      -shortest "$mixed" -loglevel error
  fi

  echo "  ✅ 混音完成: $mixed"
}

# ==========================================================
# STEP 4: 生成字幕
# ==========================================================
generate_subtitles() {
  if [ "$SKIP_SUBTITLE" = true ]; then
    echo "[4/5] ⏭ 跳过字幕"
    return
  fi

  echo "[4/5] 生成字幕..."
  bash "$SCRIPT_DIR/caption.sh" "$EXPORT_DIR/draft/${BASENAME}_mixed.mp4" || true
}

# ==========================================================
# STEP 5: 渲染字幕 + 导出多平台
# ==========================================================
render_final() {
  echo "[5/5] 渲染最终视频..."
  local mixed="$EXPORT_DIR/draft/${BASENAME}_mixed.mp4"
  local srt_file="$CAPTIONS_DIR/${BASENAME}.srt"
  local final="$EXPORT_DIR/final/${BASENAME}_final.mp4"
  local youtube="$EXPORT_DIR/youtube/${BASENAME}_yt.mp4"
  local shorts="$EXPORT_DIR/shorts/${BASENAME}_shorts.mp4"

  if [ -f "$srt_file" ] && [ ! "$SKIP_SUBTITLE" = true ]; then
    echo "  🔤 烧录字幕..."
    # 将 SRT 转为 ASS 以便更好的样式控制
    ffmpeg -y -i "$mixed" \
      -vf "subtitles=$srt_file:force_style='FontName=Inter,FontSize=16,PrimaryCol=&H00FFFFFF,BorderStyle=3,Outline=1,Shadow=0,MarginV=40,Alignment=2'" \
      -c:a copy "$final" -loglevel error
  else
    cp "$mixed" "$final"
  fi

  echo "  ✅ 最终输出: $final"

  # 导出多平台版本
  local w="${WIDTH:-1080}" h="${HEIGHT:-1920}"

  # 16:9 (YouTube)
  if [ "$w" -ge "$h" ]; then
    ffmpeg -y -i "$final" -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
      -c:a copy "$youtube" -loglevel error
    echo "  📺 YouTube 16:9 → $youtube"
  fi

  # 9:16 (Shorts/Reels/TikTok)
  if [ "$h" -ge "$w" ]; then
    ffmpeg -y -i "$final" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
      -c:a copy "$shorts" -loglevel error
    echo "  📱 Shorts 9:16 → $shorts"
  fi
}

# ==========================================================
# 运行流水线
# ==========================================================
START_TS=$(date +%s)

detect_info
remove_watermark
replace_bgm
generate_subtitles
render_final

END_TS=$(date +%s)
DUR=$((END_TS - START_TS))

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ 处理完成! 用时 ${DUR}s"
echo "  📁 最终文件: $EXPORT_DIR/final/${BASENAME}_final.mp4"
echo "═══════════════════════════════════════════════════"
echo "导出文件:"
ls -lh "$EXPORT_DIR/final/${BASENAME}_"* 2>/dev/null || true
ls -lh "$EXPORT_DIR/youtube/${BASENAME}_"* 2>/dev/null || true
ls -lh "$EXPORT_DIR/shorts/${BASENAME}_"* 2>/dev/null || true
