# 手工民族融合首饰 · 跨境电商独立站

> **定位**：面向欧美市场的手工民族融合首饰品牌 + TikTok/YouTube 内容矩阵
> **品牌名**：**Nara Charm** · 莲花 logo · `Jewelry with Spirit · Stories in Every Piece`
> **文化脉络**：中国 / 泰 / 藏 / 蒙古 / 西南少数民族——单品或融合风格，手工制作为主
> **品类**：手机挂链 · 项链 · 手链 · 耳钉
> **收款**：香港公司 + Stripe 港区 ｜ **物流**：国内制作 + 国际直邮
> **节奏**：8–12 周完整上线

---

## 0. 当前状态（Phase 0–2 · 脚手架 + 占位 SKU）

| 事项 | 状态 | 说明 |
|---|---|---|
| 品牌名 | ✅ **Nara Charm** | 莲花 logo · 详见 [`docs/brand/NAMING.md`](docs/brand/NAMING.md) |
| 域名 | ⏳ 待注册 | naracharm.com 优先（详见 `docs/brand/NAMING.md`） |
| 收款主体 | ⏳ 待注册 | 香港公司 + Stripe 港区（**MVP 阶段用 Stripe 测试模式**） |
| 产品素材 | ✅ 占位数据已入库 | 10 SKU + 5 系列 · [`docs/PLACEHOLDER_SKUS.md`](docs/PLACEHOLDER_SKUS.md) |
| 技术栈 | ✅ 已定 | 见第三节 |
| 视频策略 | ⏳ 待确认 | 建议「AI + 真实」双轨 |

详见 [`docs/STARTUP.md`](docs/STARTUP.md)

---

## 1. 项目目录结构

```
.
├── apps/
│   └── web/                  # Next.js 16 独立站 + Payload CMS
│       └── src/{app,components,lib,styles}
├── packages/
│   ├── db/                   # Drizzle schema + 迁移（product/variant/order/...）
│   ├── video/                # AI 视频提示词库 + 脚本模板
│   └── emails/               # React Email 模板
├── docs/
│   ├── brand/                # 品牌名决策 / 命名理由 / 域名
│   ├── design/               # 设计 token / moodboard / 视觉规范
│   ├── ops/                  # 物流 / 客服 / 退换货 / 内容日历 SOP
│   └── content/video/        # 视频脚本 + 提示词 + 发布文案
├── assets/
│   ├── products/             # 产品效果图（你提供）
│   └── moodboard/            # 视觉参考图
└── scripts/                  # 初始化 / 数据录入 / 构建脚本
```

---

## 2. 技术栈（2026-06 最新最优组合）

| 层 | 选型 | 关键理由 |
|---|---|---|
| 框架 | **Next.js 16** (App Router + RSC) | 当前主流；RSC 保 SEO；Cache Components 优化静态+动态混合 |
| 数据库 | **Neon** (Serverless PostgreSQL) | scale-to-zero 省钱、DB 分支利迭代、强事务 |
| ORM | **Drizzle ORM** | TS 原生、无 codegen、Edge 友好 |
| 后台/CMS | **Payload CMS 3.x** (Postgres adapter) | 原生嵌进 Next.js、Admin 内嵌、Local API 零延迟 |
| 认证 | **Better Auth**（会员）+ Payload 内置 auth（后台） | 自托管无 MAU 成本 |
| 支付 | **Stripe Embedded Checkout**（含 PayPal） | 官方主推、港区可直连、低 PCI |
| 邮件 | **Resend + React Email** | DX 最佳 |
| 部署 | **Vercel** | 生态原生、零配置 |
| 分析 | **Plausible + Vercel Analytics** | 隐私优先（GDPR）+ Web Vitals |
| SEO | RSC + metadata + **JSON-LD** + sitemap | 2026 电商 SEO 最佳实践 |

**工程纪律**：① Stripe webhook 必须签名验证 ② Payload 直连 Neon 不另起库 ③ 设 Vercel 带宽告警 ④ 欧洲必支持 PayPal ⑤ GDPR 预留数据接口

完整选型报告见 [`docs/design/TECH_STACK.md`](docs/design/TECH_STACK.md)

---

## 3. 分阶段路线图

| 阶段 | 时间 | 目标 |
|---|---|---|
| **Phase 0** | 第 0 周 | 准备：品牌名、素材、账户、脚手架、数据模型、第一条视频示范 |
| **Phase 1** | 第 1–2 周 | 独立站骨架 + 设计系统 + 首页 |
| **Phase 2** | 第 3–4 周 | 商品系统（Payload）+ 商品页 + 首批 SKU 录入 |
| **Phase 3** | 第 5–7 周 | 购物车 + Stripe 结账 + 物流 + 邮件 |
| **Phase 4** | 第 8–9 周 | SEO + 会员 + 优惠券 + 弃单挽回 |
| **Phase 5** | 第 10–11 周 | 视频内容矩阵（首批 6–10 条） |
| **Phase 6** | 第 12 周 | 上线 + 监控 + 迭代 |

---

## 4. 视频内容策略（核心）

**工作流**：你提供效果图+名称+描述 → 我产出 AI 提示词+脚本+文案 → 你喂 AI/Seedance 2 生成 → 发布

**⚠️ 双轨策略（待你确认）**：
- **AI 视频** → 产品美学/穿搭/品牌情绪/节日场景（无真实性风险，AI 擅长）
- **真实拍摄** → "how it's made" 手工过程（守住手工品牌信任资产，哪怕手机随手拍）

详见 [`docs/content/video/WORKFLOW.md`](docs/content/video/WORKFLOW.md)

---

## 5. 关键文档索引

> ⭐ **品牌灵魂**：每件首饰都要有故事——这是贯穿全站文案、视频、详情页的核心纲领。
> 详见 [`docs/brand/STORY_DOCTRINE.md`](docs/brand/STORY_DOCTRINE.md)

### 品牌
- ⭐ **故事纲领（灵魂文档）**：[`docs/brand/STORY_DOCTRINE.md`](docs/brand/STORY_DOCTRINE.md)
- 品牌名决策：[`docs/brand/NAMING.md`](docs/brand/NAMING.md)

### 技术 & 设计
- 技术栈详情：[`docs/design/TECH_STACK.md`](docs/design/TECH_STACK.md)
- ⭐ **后端架构决策**：[`docs/design/BACKEND.md`](docs/design/BACKEND.md)
- 设计系统：[`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md)
- 数据模型：[`packages/db/SCHEMA.md`](packages/db/SCHEMA.md)
- 图片生成 prompt 清单：[`docs/design/IMAGE_PROMPTS.md`](docs/design/IMAGE_PROMPTS.md)

### 运营 & 内容
- ⭐ **后台使用手册（给你看）**：[`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md)
- ⭐ **本地开发启动指南**：[`docs/DEV_SETUP.md`](docs/DEV_SETUP.md)
- 产品录入模板（**含故事字段**）：[`docs/PRODUCT_TEMPLATE.md`](docs/PRODUCT_TEMPLATE.md)
- 视频工作流（**故事驱动脚本**）：[`docs/content/video/WORKFLOW.md`](docs/content/video/WORKFLOW.md)
- 运营 SOP：[`docs/ops/SOP.md`](docs/ops/SOP.md)
- 本地域名配置（可选）：[`docs/LOCAL_DOMAIN_SETUP.md`](docs/LOCAL_DOMAIN_SETUP.md)

### 启动
- 启动指引 & 待决策清单：[`docs/STARTUP.md`](docs/STARTUP.md)
