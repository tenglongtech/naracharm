# naracharm 前端静态化 + 后端 API 改造方案

> 状态：方案已确认，待开发执行
> 日期：2026-08-03
> 目标：把 naracharm 从 SSR+数据库 改造成「前端静态（Cloudflare Pages）+ 后端 API（RackNerd 服务器）」

---

## 👥 分工

| 角色 | 职责 |
|------|------|
| **本地开发 agent** | 执行第一步~第五步（改代码、切数据源、配置、动态功能改造） |
| **运维（Claude 主会话）** | 执行第六步~第七步（后端部署 RackNerd、前端部署 Cloudflare Pages）、最终验收 |

> 开发 agent 只需要把代码改好并提交 git；**部署由运维统一操作**。

## 🎯 目标架构

```
Cloudflare Pages (纯静态)                     RackNerd 服务器 (后端 API + 数据库)
├── 首页/产品/合集/博客/内容页                  ├── checkout API (Stripe)
├── products/[slug] 静态生成                  ├── stripe-webhook
├── collections/[slug] 静态生成                ├── auth (Better Auth)
├── blog/stories 静态生成                      ├── reviews/comments API
├── sitemap.xml 预生成                         ├── admin 后台
├── 购物车 = localStorage (前端)                ├── 数据库 (Postgres 自建)
└── 订单/登录页面壳 → 调 API →                 └── Caddy 反代
```

### 已确认决策
- **购物车**：前端 **localStorage** 实现，结账时一次性提交订单到后端 API
- **后端**：API + 数据库**全迁 RackNerd**（169.58.107.188），自建 Postgres（脱离 Neon）
- **前端**：Cloudflare Pages（Git 自动部署）；**后端**：RackNerd Docker

---

## 📦 第一步：导出静态数据（核心）

### 新增 `scripts/export-storefront.ts`

连接数据库，复用 `apps/web/src/lib/storefront.ts` 的查询逻辑，导出两份 JSON：

**`apps/web/src/data/products.json`** — 所有 active 产品的 `StorefrontProduct[]`：
```
id, slug, name, subtitle, description, category, heritage, materials,
basePriceCents, compareAtPriceCents, isFeatured, craftStory, careNotes,
collectionSlug, collectionName, primaryImage, images[], stock, seoTitle, seoDescription
```

**`apps/web/src/data/collections.json`** — `StorefrontCollection[]`：
```
id, slug, name, heritage, description, isFeatured, productCount
```

> ⚠️ 目前 `scripts/` 下没有导出脚本（全是 seed 脚本），需新建。
> 复用 `storefront.ts` 的 JOIN + 图片合并逻辑。

---

## 🔄 第二步：切换数据源

### 新建 `apps/web/src/lib/storefront-data.ts`

读取静态 JSON，暴露相同的数据。

### 改造 `apps/web/src/lib/storefront.ts`

从"查 DB"改为"读静态 JSON"，**保持函数签名不变**（调用方页面零改动）：
- `getActiveProducts()` → 返回 products.json
- `getAllCollections()` → 返回 collections.json
- `getProductBySlug` / `getProductsByCollection` / `getProductsByCategory` → 内存过滤（已如此实现，天然兼容）

---

## 🗑️ 第三步：移除强制动态

删除以下页面首行的 `export const dynamic = "force-dynamic"`：

| 页面 | 路径 |
|------|------|
| 首页 | `app/page.tsx` |
| 产品详情 | `app/products/[slug]/page.tsx` |
| 合集列表 | `app/collections/page.tsx` |
| 合集详情 | `app/collections/[slug]/page.tsx` |
| 畅销榜 | `app/best-sellers/page.tsx` |
| 博客详情 | `app/blog/[slug]/page.tsx` |
| Sitemap | `app/sitemap.ts` |

> 这些页面大多已有 `generateStaticParams()`，移除 dynamic 后即静态化。

---

## ⚙️ 第四步：配置静态导出

### 改 `apps/web/next.config.ts`

```ts
const nextConfig = {
  reactStrictMode: true,
  output: 'export',              // 新增：静态导出
  images: { unoptimized: true }, // 关键：静态模式不能用 next/image 优化
}
```

### ⚠️ 注意
- `next/image` 大量使用（fill/sizes/avif/webp）→ 需 `unoptimized: true`，确认图片路径 CDN 可访问
- `app/api/*` 与 export **不兼容** → 不导出（后端单独部署）
- `sitemap.ts` 动态生成在 export 下会报错 → 需预生成

---

## 🔌 第五步：处理动态功能

### API routes（迁移到独立后端）
```
app/api/checkout
app/api/stripe-webhook
app/api/auth/[...all]
app/api/reviews
app/api/comments
app/api/admin/upload
app/api/discount/validate
```

### 前端壳（保留页面，改为调外部 API）
- `cart` / `checkout` / `login` / `register` / `account` 页面保留壳，改为 client 组件
- `reviews-section` / `comments-section` 改指向后端 API 域（环境变量 `NEXT_PUBLIC_API_URL`）

### 购物车（localStorage）
- 当前 `cart-actions.ts` + `cart-cookie.ts` 是 DB-backed → 改为纯前端 localStorage
- 结账时一次性提交订单到后端 API

---

## 🖥️ 第六步：后端 API 部署（RackNerd）— 运维执行

> ⏳ 本步骤由**运维（Claude 主会话）**执行，开发 agent 只需确保代码支持。

1. API routes 抽成独立 Node/Next standalone 服务
2. **数据库**：在 RackNerd 自建 **Postgres**（Docker），迁移 Neon 数据
3. Docker Compose 部署 + Caddy 反代
4. 环境变量（DATABASE_URL、STRIPE keys、AUTH_SECRET 等）放服务器 .env

服务器信息：
```
RackNerd: 169.58.107.188
登录: ssh -i ~/.ssh/id_ed25519_server root@169.58.107.188
```

### 开发 agent 需要准备（给运维的交接物）
- [ ] 后端服务如何启动（Dockerfile / 启动命令）
- [ ] 需要的环境变量清单（DATABASE_URL、STRIPE keys、AUTH_SECRET 等）
- [ ] 数据库迁移 SQL（schema）或迁移脚本
- [ ] Neon 数据导出/迁移方式
- [ ] API 端口和健康检查端点

---

## ☁️ 第七步：前端部署（Cloudflare Pages）— 运维执行

> ⏳ 本步骤由**运维（Claude 主会话）**执行。

1. 连接 GitHub `tenglongtech/naracharm` → Cloudflare Pages
2. 构建命令 `pnpm --filter web build`，输出目录 `apps/web/out`
3. 绑定 naracharm.com + www（www 301 跳转）
4. 前端环境变量 `NEXT_PUBLIC_API_URL=https://api.naracharm.com`（或服务器域名）

---

## 📄 涉及文件清单

| 文件 | 操作 |
|------|------|
| `scripts/export-storefront.ts` | 🔨 新建：导出 DB 到 JSON |
| `apps/web/src/lib/storefront-data.ts` | 🔨 新建：读 JSON |
| `apps/web/src/lib/storefront.ts` | ✏️ 改：切数据源 |
| `apps/web/next.config.ts` | ✏️ 改：加 output/export + unoptimized |
| 7 个页面（见第三步） | ✏️ 改：删 force-dynamic |
| `apps/web/src/data/products.json` | 📄 生成 |
| `apps/web/src/data/collections.json` | 📄 生成 |
| API routes + 动态页面 | 🔄 迁移到独立后端 |

---

## ⚠️ 风险与注意

1. **库存快照**：`stock` 是构建时快照，展示层会过期；真实库存校验放后端 checkout
2. **next/image**：最大改造点，需全局 `unoptimized`
3. **购物车**：DB-backed 复杂，需改成前端 localStorage
4. **后台 admin**：完整 DB 应用，不可静态化，保留后端
5. **构建需 DATABASE_URL**：导出脚本在构建时连 DB 拉数据
6. **sitemap.ts**：动态生成在 export 下会报错，需预生成

---

## ✅ 验收标准

- [ ] `pnpm --filter web build` 成功产出 `out/`
- [ ] 静态站首页/产品页/博客页正常展示数据
- [ ] API 功能（订单/支付/登录）通过后端域名可调通
- [ ] 部署到 Cloudflare Pages 后 naracharm.com 秒开
- [ ] 购物车 localStorage 可加购/结算
