# 启动指引 & 待决策清单

> Phase 0–2 现状：脚手架已搭好并可运行，占位 SKU 已入库（10 个产品 + 5 系列 + 库存）。
> 真实产品到位后，在 Payload/Admin 后台一对一改 `primaryImage` / `craftStory` / `basePriceCents` 即可。
> 下一步推进**依赖你的几项决策**。请逐项确认。

---

## 一、当前已完成 ✅

| # | 交付物 | 位置 |
|---|---|---|
| 1 | 项目章程 + 路线图 | `README.md` |
| 2 | 品牌名决策（Nara Charm · 莲花 logo） | `docs/brand/NAMING.md` |
| 3 | 技术栈选型报告（2026-06） | `docs/design/TECH_STACK.md` |
| 4 | 设计系统（色彩/字体/组件） | `docs/design/DESIGN_SYSTEM.md` |
| 5 | 数据模型 schema（Drizzle） | `packages/db/schema.ts` + `SCHEMA.md` |
| 6 | 占位 SKU 清单（10 个） | `docs/PLACEHOLDER_SKUS.md` + `scripts/seed-placeholders.ts` |
| 7 | 占位图生成器（品牌色 SVG） | `scripts/generate-placeholders.mjs` |
| 8 | 产品录入模板 | `docs/PRODUCT_TEMPLATE.md` |
| 9 | 视频工作流 + 第 1 条示范视频 | `docs/content/video/WORKFLOW.md` + `001-brand-intro-launch.md` |
| 10 | 运营 SOP（物流/客服/退换货/内容日历） | `docs/ops/SOP.md` |
| 11 | Next.js 16 脚手架（已验证可运行） | `apps/web/` |
| 12 | SEO 基础设施（sitemap/robots/OG/JSON-LD/canonical） | `apps/web/src/app/{sitemap,robots,opengraph-image,icon}.{ts,tsx}` |

**脚手架验证状态**：Next.js 16.2.9 + Turbopack，类型检查零错误，首页 HTTP 200，内容渲染正确。

---

## 二、如何本地运行（你现在就能跑）

```bash
cd /Users/matt/dev/首饰跨境电商
cp apps/web/.env.example apps/web/.env.local   # 先填 DATABASE_URL 等才能用 DB 功能
pnpm dev                                          # 启动 → http://localhost:37000
```

> 不填 `.env.local` 也能看首页（首页是静态占位，未连数据库）。
> 数据库/支付/邮件功能需填环境变量后才能用。

---

## 三、🚨 需你决策的事项（按优先级）

### 🔴 P0 · 立即决定（阻塞后续）

#### 1. 品牌名 ✅ **已定 · Nara Charm**
- 详见 `docs/brand/NAMING.md`
- 域名建议：`naracharm.com`（待注册）

#### 2. 视频策略：是否采纳「AI + 真实」双轨？
- AI 用于：产品美学/穿搭/情绪片/节日场景 ✅
- 真实拍摄用于："how it's made" 手工过程 ⚠️（避免 AI 翻车崩盘信任）
- 详见 `docs/content/video/WORKFLOW.md`
- **我的强烈建议**：采纳双轨。手工过程真实拍，哪怕手机粗糙。

### 🟡 P1 · 本周内决定

#### 3. 替换占位 SKU 为真实产品
- 占位数据已入库（10 个产品 + 5 系列），详见 `docs/PLACEHOLDER_SKUS.md`
- 真实图到位后，在 Admin 后台改 `primaryImage` / `craftStory` / `basePriceCents` 等字段
- 或重新跑 `pnpm db:seed:placeholder` 覆盖

#### 4. 跑通第一条视频（验证 AI 工作流）
- 用 `001-brand-intro-launch.md` 的提示词喂 Seedance 2
- 提供 1 张主打产品效果图（镜头 3 图生视频用）
- 跑通后我们就能批量产出视频内容

### 🟢 P2 · Phase 3 前到位

#### 5. 香港公司 + Stripe 港区账户
- 准备：公司注册证 (CI)、商业登记证 (BR)、银行账户
- Stripe 港区支持香港公司直连
- 第 5 周接支付前必须就绪
- **MVP 阶段**：用 Stripe 测试模式 (test mode) 模拟支付, 不需要真公司

#### 6. 账户注册清单
- [ ] Neon 数据库（免费额度起步）
- [ ] Vercel 账户（部署）
- [ ] Resend 账户（邮件）
- [ ] Plausible（分析，可后置）
- [ ] TikTok / YouTube / Instagram 账号（用品牌名占位）

---

## 四、定价区间确认

我按"手工 + 文化叙事 = 中高毛利"逻辑建议，你可调：

| 类别 | 建议区间 |
|---|---|
| 手机挂链 | $25–45 |
| 项链 | $45–120 |
| 手链 | $35–80 |
| 耳钉 | $25–55 |

→ 认可？或给我你的成本结构，我据此反推定价。

---

## 五、确认后的执行链路

你确认 **品牌名 + 双轨视频策略** 后，我立即：

1. **第 1–2 周**：把首页文案/品牌名替换进去，完善设计系统，搭商品列表/详情页骨架，部署到 Vercel（你可在 preview 看实时进度）
2. **第 3–4 周**：接 Payload CMS 后台，录入你提供的产品，做出可下单的商品页
3. **第 5–7 周**：购物车 + Stripe + 物流 + 邮件
4. **并行**：持续产出视频提示词（你跑 AI 生成），积累内容矩阵

---

## 六、最关键的一句话

> **品牌名 + 双轨视频策略** 是当前两个决策点。定了它们，整个项目就能全速跑起来。
> 产品素材越早给我，独立站和视频就能越早出成果。
