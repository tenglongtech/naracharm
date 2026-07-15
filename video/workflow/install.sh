#!/bin/bash
# ============================================================
# Nara Charm Video Pipeline — 环境安装脚本
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "📦 正在安装 Nara Charm 视频工作流环境..."
echo ""

# 1. Homebrew 包
echo "==> 检查 Homebrew 包..."
BREW_PKGS=("ffmpeg" "imagemagick" "yt-dlp")
for pkg in "${BREW_PKGS[@]}"; do
  if brew list "$pkg" &>/dev/null 2>&1; then
    echo "  ✅ $pkg 已安装"
  else
    echo "  ⏳ 安装 $pkg..."
    brew install "$pkg"
  fi
done

# 2. yt-dlp 更新（确保最新支持小红书）
echo "==> 更新 yt-dlp..."
yt-dlp -U 2>/dev/null || true

# 3. Python 依赖
echo "==> 安装 Python 依赖..."
PIP_PKGS=(
  "openai-whisper"
  "moviepy"
  "pillow"
  "requests"
)

for pkg in "${PIP_PKGS[@]}"; do
  if python3 -c "import ${pkg//-/_}" &>/dev/null 2>&1; then
    echo "  ✅ $pkg 已安装"
  else
    echo "  ⏳ 安装 $pkg..."
    pip3 install "$pkg" --quiet
  fi
done

# 4. Node 依赖 (xhs-dl)
echo "==> 检查 xhs-dl (小红书下载器)..."
if npm ls -g xhs-dl &>/dev/null 2>&1; then
  echo "  ✅ xhs-dl 已安装"
else
  echo "  ⏳ 安装 xhs-dl..."
  npm install -g xhs-dl 2>/dev/null || echo "  ⚠️  xhs-dl 安装失败，可以用 download.sh 的 API 模式代替"
fi

# 5. 验证
echo ""
echo "==> 验证安装..."
for cmd in ffmpeg magick yt-dlp python3; do
  if which "$cmd" &>/dev/null; then
    echo "  ✅ $cmd"
  else
    echo "  ❌ $cmd — 未找到"
  fi
done

echo ""
echo "✅ 环境安装完成!"
echo ""
echo "下一步:"
echo "  bash workflow/download.sh --url <小红书链接>"
