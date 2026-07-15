# Nara Charm 视频制作工作流

> 从参考视频下载 → 去水印 → 换BGM → 加字幕 → 多平台发布

```
小红书参考 ──→ 下载 ──→ 去水印 ──→ 换BGM ──→ 加字幕 ──→ 导出 ──→ YouTube/IG/TikTok
  (参考)      (raw)   (clean)   (mixed)   (captioned)  (final)     (published)
```

---

## 📁 目录说明

```
video/
├── references/         # 参考视频(原始)
│   ├── source/         #   从小红书下载的原视频(含抖音号水印)
│   ├── downloaded/     #   已下载但未处理
│   └── cleaned/        #   已去水印的参考素材
├── scripts/            # 文案脚本 (每视频一个 .md)
│   └── output/         #   脚本定稿
├── footage/            # 自己拍的原始素材
├── exports/            # 成品视频
│   ├── draft/          #   剪辑草稿
│   ├── final/          #   定稿(母版)
│   ├── youtube/        #   适配 YouTube 16:9
│   ├── instagram/      #   适配 IG 1:1 / 4:5 / 9:16
│   └── shorts/         #   适配 Shorts/Reels 9:16
├── captions/           # 字幕文件 (.srt / .ass)
├── assets/
│   ├── music/          # 原始音乐素材
│   ├── bgm/            # 选定的背景音乐(已裁剪)
│   ├── templates/      # 片头/片尾/转场模板
│   ├── fonts/          # 字体文件
│   └── overlays/       # Logo、水印遮罩等
├── logs/               # 处理日志
├── publish/            # 发布记录
└── workflow/           # 自动化脚本
    ├── install.sh      #   环境安装
    ├── download.sh     #   下载
    ├── process.sh      #   处理流水线
    ├── caption.sh      #   字幕生成
    └── publish.sh      #   发布
```

---

## 🔧 第一步：环境安装

```bash
bash video/workflow/install.sh
```

自动安装: `yt-dlp` / `ffmpeg` / `whisper` / `imagemagick` / Python 依赖

---

## 📥 第二步：下载小红书视频

```bash
# 单个视频
bash video/workflow/download.sh --url "小红书分享链接"

# 批量下载整个主页
bash video/workflow/download.sh --user "用户ID" --limit 20
```

下载的文件自动保存到 `references/source/`，同时记录元数据。

---

## 🧹 第三步：去水印 + 换BGM + 加字幕 (一键)

```bash
# 全自动处理单个视频
bash video/workflow/process.sh references/source/video_xxx.mp4

# 批量处理
bash video/workflow/process.sh references/source/*.mp4
```

处理流程：
1. **去水印** — FFmpeg 裁剪 + 模糊覆盖
2. **提取人声** — Demucs / FFmpeg 人声分离
3. **替换 BGM** — 原人声 + 新背景音乐混音
4. **语音转文字** — Whisper 生成字幕
5. **渲染字幕** — FFmpeg drawtext 烧录字幕
6. **多平台导出** — 自动输出 16:9 / 9:16 / 1:1 比例

> ⚡ 支持断点续传: 每步完成后标记，下次重跑自动跳过已完成步骤。

---

## 📤 第四步：发布到多平台

```bash
# 发布到所有平台
bash video/workflow/publish.sh exports/final/video_xxx.mp4 \
  --title "视频标题" \
  --description "描述" \
  --tags "tag1,tag2" \
  --youtube \
  --instagram \
  --shorts
```

首次使用需配置各平台的 API 凭证（见下方说明）。

---

## 🔐 平台发布配置

### YouTube
1. 前往 [Google Cloud Console](https://console.cloud.google.com)
2. 创建项目 → 启用 YouTube Data API v3
3. 创建 OAuth 2.0 凭据 → 下载 JSON
4. 复制到 `video/publish/youtube-credentials.json`

### Instagram
- 使用 Meta Graph API (需要 Facebook 开发者账号)
- 或者手动发布（推荐初期这样做）

### TikTok
- 使用 TikTok 开发者 API
- 同样推荐初期手动发布

---

## 🎬 实操流程 (单视频)

```bash
# 1. 安装环境 (仅首次)
bash video/workflow/install.sh

# 2. 从小红书下载参考视频
bash video/workflow/download.sh --url "https://xhslink.com/xxx"

# 3. 写文案
#    在 scripts/ 创建 markdown 脚本

# 4. 拍摄自己的素材
#    放到 footage/ 目录

# 5. 一键处理
bash video/workflow/process.sh footage/my_video.mov

# 6. 预览成品
open exports/final/

# 7. 发布
bash video/workflow/publish.sh exports/final/my_video.mp4 --youtube --instagram
```

---

## 📋 视频制作 checklist

- [ ] 找到参考视频 → 下载到 `references/source/`
- [ ] 拆解参考视频结构 → `scripts/` 写文案
- [ ] 拍摄/录制自己的素材 → `footage/`
- [ ] 选择 BGM → `assets/bgm/`
- [ ] 运行 `process.sh` 全自动处理
- [ ] 预览检查字幕 🔍
- [ ] 发布

---

## 参考风格 (格蕾丝 Grace Studio)

> 占位 — 下载了参考视频后将分析其风格参数填入此处
