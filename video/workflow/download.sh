#!/bin/bash
# ============================================================
# Nara Charm Video Pipeline — 小红书视频下载
# ============================================================
# 用法:
#   bash workflow/download.sh --url <小红书分享链接>     # 单个视频
#   bash workflow/download.sh --user <用户ID> --limit 5  # 批量下载主页
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VIDEO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="$VIDEO_DIR/references/source"
XHS_DIR="$VIDEO_DIR/XHS-Downloader"
mkdir -p "$SOURCE_DIR"

# 颜色
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${CYAN}[i]${NC} $1"; }

# 解析参数
URL=""
USER_ID=""
LIMIT=10

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url|-u)    URL="$2";     shift 2 ;;
    --user|-U)   USER_ID="$2"; shift 2 ;;
    --limit|-l)  LIMIT="$2";   shift 2 ;;
    *)           err "未知参数: $1"; exit 1 ;;
  esac
done

# ─── 方法1: XHS-Downloader (推荐 — 无水印原视频) ────────────
download_with_xhsdl() {
  local url="$1"
  local filename="$2"

  info "尝试 XHS-Downloader (无水印原视频)..."
  if [ ! -d "$XHS_DIR" ]; then
    warn "XHS-Downloader 未安装，跳过"
    return 1
  fi

  # 用 Playwright 获取临时 cookies 再喂给 XHS-Downloader
  local cookies=""
  if command -v node &>/dev/null && [ -f "$SCRIPT_DIR/get_cookies.mjs" ]; then
    cd "$VIDEO_DIR"
    cookies=$(node "$SCRIPT_DIR/get_cookies.mjs" 2>/dev/null || echo "")
  fi

  cd "$XHS_DIR"
  local result
  if [ -n "$cookies" ]; then
    result=$(uv run python main.py -u "$url" --cookie "$cookies" --work_path "$SOURCE_DIR" --language "zh_CN" 2>&1)
  else
    result=$(uv run python main.py -u "$url" --work_path "$SOURCE_DIR" --language "zh_CN" 2>&1)
  fi
  echo "$result" | tail -3

  # 检查是否下载成功
  local downloaded
  downloaded=$(ls -t "$SOURCE_DIR"/*.mp4 2>/dev/null | head -1 || echo "")
  if [ -n "$downloaded" ]; then
    log "无水印下载成功: $downloaded"
    echo "$downloaded"
    return 0
  fi
  return 1
}

# ─── 方法2: yt-dlp (备用) ──────────────────────────────────
download_with_ytdlp() {
  local url="$1"
  local filename="$2"

  info "尝试 yt-dlp 下载..."
  yt-dlp \
    --no-playlist \
    --write-info-json \
    --output "$SOURCE_DIR/${filename}.%(ext)s" \
    --restrict-filenames \
    --user-agent "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)" \
    --add-header "Referer: https://www.xiaohongshu.com" \
    "$url" 2>&1 | tail -3

  local result_file
  result_file=$(ls "$SOURCE_DIR/${filename}".* 2>/dev/null | grep -v '.json' | head -1 || echo "")
  if [ -n "$result_file" ]; then
    log "下载成功: $result_file"
    echo "$result_file"
    return 0
  else
    warn "yt-dlp 下载失败，换备用方法..."
    return 1
  fi
}

# ─── 方法2: xhs-dl (Node.js) ──────────────────────────────
download_with_xhsdl() {
  local url="$1"
  local idx="$2"

  if ! command -v xhs-dl &>/dev/null; then
    warn "xhs-dl 未安装，跳过"
    return 1
  fi

  info "尝试 xhs-dl 下载..."
  cd "$SOURCE_DIR"
  xhs-dl "$url" --no-watermark 2>&1 | tail -3

  local result_file
  result_file=$(ls -t "$SOURCE_DIR"/*.mp4 2>/dev/null | head -1 || echo "")
  if [ -n "$result_file" ]; then
    log "xhs-dl 下载成功: $result_file"
    echo "$result_file"
    return 0
  fi
  return 1
}

# ─── 方法3: API 代理下载 ────────────────────────────────────
download_with_api() {
  local url="$1"
  local filename="$2"

  info "尝试 API 代理下载..."
  
  # 提取笔记 ID
  local note_id=""
  if [[ "$url" =~ explore/([a-f0-9]{24}) ]]; then
    note_id="${BASH_REMATCH[1]}"
  elif [[ "$url" =~ /note/([a-f0-9]{24}) ]]; then
    note_id="${BASH_REMATCH[1]}"
  fi

  if [ -z "$note_id" ]; then
    warn "无法从链接提取笔记 ID，请手动下载"
    return 1
  fi

  info "笔记 ID: $note_id"
  info "小红书链接格式: https://www.xiaohongshu.com/explore/$note_id"
  info "请手动打开上述链接下载视频，保存到: $SOURCE_DIR/${filename}.mp4"
  
  # 尝试通过第三方解析 API
  local api_url="https://xhscrawler.com/api/v1/note/$note_id" 2>/dev/null || true
  warn "自动下载受限，建议手动操作"
  return 1
}

# ─── 单个视频下载 ────────────────────────────────────────────
download_single() {
  local url="$1"
  local timestamp
  timestamp=$(date +%Y%m%d_%H%M%S)
  local filename="xhs_$timestamp"

  echo ""
  echo "═══════════════════════════════════════════════════"
  echo "  下载: $url"
  echo "═══════════════════════════════════════════════════"

  # 优先 XHS-Downloader (无水印), 再试 yt-dlp, 最后 API
  local result=""
  result=$(download_with_xhsdl "$url" "$filename" || true)

  if [ -z "$result" ] || [ ! -f "$result" ]; then
    result=$(download_with_ytdlp "$url" "$filename" || true)
  fi

  if [ -z "$result" ] || [ ! -f "$result" ]; then
    result=$(download_with_api "$url" "$filename" || true)
  fi

  if [ -n "$result" ] && [ -f "$result" ]; then
    local filesize
    filesize=$(du -h "$result" | cut -f1)
    local duration
    duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$result" 2>/dev/null | xargs printf "%.0f" 2>/dev/null || echo "?")
    
    log "下载完成: $(basename "$result")"
    info "  大小: $filesize"
    info "  时长: ${duration}s"
    return 0
  else
    warn "下载未完成，请手动下载视频到: $SOURCE_DIR"
    return 1
  fi
}

# ─── 批量下载用户主页 ────────────────────────────────────────
download_user() {
  local user_id="$1"
  local limit="$2"
  
  info "批量下载用户视频: $user_id (最多 $limit 个)"
  
  # 通过 yt-dlp 尝试
  yt-dlp \
    --playlist-end "$limit" \
    --write-info-json \
    --output "$SOURCE_DIR/%(id)s.%(ext)s" \
    --user-agent "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)" \
    "https://www.xiaohongshu.com/user/profile/$user_id" 2>&1 | tail -5 || true
  
  warn "批量下载受限，建议逐个下载:"
  info "1. 打开 https://www.xiaohongshu.com/user/profile/$user_id"
  info "2. 点击视频 → 复制链接 → 用 --url 下载"
}

# ─── 主入口 ──────────────────────────────────────────────────
if [ -n "$URL" ]; then
  download_single "$URL"
elif [ -n "$USER_ID" ]; then
  download_user "$USER_ID" "$LIMIT"
else
  echo ""
  echo "用法:"
  echo "  bash workflow/download.sh --url <小红书链接>"
  echo "  bash workflow/download.sh --user <用户ID> --limit 10"
  echo ""
  echo "示例:"
  echo "  bash workflow/download.sh --url 'https://xhslink.com/m/xxx'"
  echo "  bash workflow/download.sh --user '66ec01d00000000009019c22' --limit 5"
  echo ""
  echo "下载失败? 手动下载后放入: $SOURCE_DIR"
  echo ""
fi
