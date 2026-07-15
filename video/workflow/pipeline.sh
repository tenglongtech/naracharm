#!/bin/bash
# ============================================================
# Nara Charm Video Pipeline — 一键流水线
# ============================================================
# 用法:
#   bash workflow/pipeline.sh --url <小红书链接>              # 下载+处理
#   bash workflow/pipeline.sh --file <本地视频> --bgm bgm.mp3 # 处理本地文件
#   bash workflow/pipeline.sh --url <链接> --bgm bgm.mp3     # 全流程
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
URL="" FILE="" BGM=""
PUBLISH_ARGS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url|-u)     URL="$2";   shift 2 ;;
    --file|-f)    FILE="$2";  shift 2 ;;
    --bgm)        BGM="$2";   shift 2 ;;
    --publish)    PUBLISH_ARGS="$2"; shift 2 ;;
    *)            echo "Unknown: $1"; exit 1 ;;
  esac
done

# 1. 下载
if [ -n "$URL" ]; then
  echo "═══ 步骤1: 下载 ═══"
  bash "$SCRIPT_DIR/download.sh" --url "$URL"

  # 找到新下载的文件
  FILE=$(ls -t "$SCRIPT_DIR/../references/source"/*.mp4 2>/dev/null | head -1 || echo "")
  if [ -z "$FILE" ]; then
    echo "❌ 下载失败，请手动放视频到 references/source/"
    exit 1
  fi
  echo "  最新下载: $FILE"
fi

[ -z "$FILE" ] && echo "请提供 --url 或 --file" && exit 1
[ ! -f "$FILE" ] && echo "文件不存在: $FILE" && exit 1

# 2. 处理
echo ""
echo "═══ 步骤2: 处理 ═══"
BGM_ARG=""
[ -n "$BGM" ] && BGM_ARG="--bgm $BGM"
bash "$SCRIPT_DIR/process.sh" "$FILE" $BGM_ARG

# 3. 预览
FINAL_DIR="$SCRIPT_DIR/../exports/final"
BASENAME=$(basename "$FILE" | sed 's/\.[^.]*$//')
echo ""
echo "═══ 步骤3: 预览 ═══"
ls -lh "$FINAL_DIR/${BASENAME}_final.mp4" 2>/dev/null || \
  ls -lh "$FINAL_DIR/" 2>/dev/null | tail -3

# 4. 发布（如指定）
if [ -n "$PUBLISH_ARGS" ]; then
  echo ""
  echo "═══ 步骤4: 发布 ═══"
  bash "$SCRIPT_DIR/publish.sh" "$FINAL_DIR/${BASENAME}_final.mp4" $PUBLISH_ARGS
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ 流水线完成!"
echo "  文件: $FINAL_DIR/${BASENAME}_final.mp4"
echo "═══════════════════════════════════════════════════"
