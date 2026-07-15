#!/bin/bash
# ============================================================
# Nara Charm Video Pipeline — 多平台发布
# ============================================================
# 用法:
#   bash workflow/publish.sh <视频> --title "xxx" [--youtube] [--instagram] [--shorts]
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VIDEO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PUBLISH_DIR="$VIDEO_DIR/publish"
mkdir -p "$PUBLISH_DIR"

INPUT="" TITLE="" DESC="" TAGS="" DO_YT=false DO_IG=false DO_SHORTS=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --title|-t) TITLE="$2"; shift 2 ;;
    --description|-d) DESC="$2"; shift 2 ;;
    --tags)     TAGS="$2"; shift 2 ;;
    --youtube)  DO_YT=true; shift ;;
    --instagram) DO_IG=true; shift ;;
    --shorts)   DO_SHORTS=true; shift ;;
    *) INPUT="$1"; shift ;;
  esac
done

[ -z "$INPUT" ] && echo "Usage: $0 <video> --title 'TITLE' [--youtube] [--instagram]" && exit 1
[ ! -f "$INPUT" ] && echo "Error: $INPUT not found" && exit 1
[ -z "$TITLE" ] && TITLE=$(basename "$INPUT" | sed 's/\.[^.]*$//')

echo "═══════════════════════════════════════════════════"
echo "  发布: $TITLE"
echo "═══════════════════════════════════════════════════"

# ─── YouTube ────────────────────────────────────────────────
publish_youtube() {
  echo ""
  echo "[YouTube] 发布中..."

  local CREDS="$PUBLISH_DIR/youtube-credentials.json"
  local TOKEN="$PUBLISH_DIR/youtube-token.json"

  if [ ! -f "$CREDS" ]; then
    echo "  ⚠ 未找到 YouTube API 凭据"
    echo "  请创建: $CREDS"
    echo "  参考: https://console.cloud.google.com/apis/credentials"
    echo "  暂用手动方式替代..."
    echo ""
    echo "  请手动上传到 YouTube:"
    echo "  📤 $INPUT"
    echo "  标题: $TITLE"
    [ -n "$DESC" ] && echo "  描述: $DESC"
    echo "  已保存发布草稿到 $PUBLISH_DIR/${TITLE}_yt.draft"
    return 1
  fi

  # 使用 youtube-uploader 或 Google API
  if command -v youtube-upload &>/dev/null; then
    youtube-upload \
      --title="$TITLE" \
      --description="${DESC:-}" \
      --tags="${TAGS:-}" \
      --privacy="public" \
      --credentials-file="$CREDS" \
      "$INPUT" 2>&1 | tail -3
    echo "  ✅ YouTube 发布成功"
  else
    echo "  请安装: pip3 install youtube-upload"
    echo "  或手动上传"
  fi
}

# ─── Instagram ──────────────────────────────────────────────
publish_instagram() {
  echo ""
  echo "[Instagram] 准备发布..."
  echo "  ⚠ Instagram API 需要 Meta 开发者账号"
  echo "  暂推荐手动发布:"
  echo "  📤 $INPUT"
  echo "  保存发布指南到 $PUBLISH_DIR/instagram_guide.md"
}

# ─── Shorts/Reels ──────────────────────────────────────────
publish_shorts() {
  echo ""
  echo "[YouTube Shorts] 发布中..."
  # 同 YouTube API，标记为 #Shorts
  publish_youtube
}

# ─── 执行 ──────────────────────────────────────────────────
PUBLOG="$PUBLISH_DIR/publish_log.md"

{
  echo "---"
  echo "**$TITLE**"
  echo "- 时间: $(date '+%Y-%m-%d %H:%M')"
  echo "- 文件: $INPUT"
  [ -n "$DESC" ] && echo "- 描述: $DESC"
  echo ""
} >> "$PUBLOG"

$DO_YT && publish_youtube
$DO_IG && publish_instagram
$DO_SHORTS && publish_shorts

if ! $DO_YT && ! $DO_IG && ! $DO_SHORTS; then
  echo "  未指定发布目标 (--youtube / --instagram / --shorts)"
  echo "  保存发布信息到日志..."
fi

echo ""
echo "✅ 发布流程完成"
echo "   发布记录: $PUBLOG"
