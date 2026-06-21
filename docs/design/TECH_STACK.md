# 技术栈详情

> 基于 2026-06 调研的行业最佳实践。本文档是开发期技术决策依据。
>
> ⭐ **最终决策已定**：见 [`BACKEND.md`](./BACKEND.md)（含成本、职责分工、行动项）。
> 本文档为技术细节参考，BACKEND.md 为决策依据。

## 选型总表

| 层 | 选型 | 版本 | 备选 |
|---|---|---|---|
| 框架 | Next.js (App Router + RSC) | 16.x | — |
| 运行时 | React | 19.2 | — |
| 样式 | Tailwind CSS | v4 | — |
| 数据库 | Neon (Serverless PostgreSQL) | — | Supabase / Turso(SQLite) |
| ORM | Drizzle ORM | — | Prisma 7 |
| 后台/CMS | Payload CMS (Postgres adapter) | 3.x | Sanity / 自研 |
| 认证（会员） | Better Auth | — | Clerk / Auth.js |
| 认证（后台） | Payload 内置 auth | — | — |
| 支付 | Stripe Embedded Checkout | — | PayPal Orders v2 / Braintree |
| 邮件 | Resend + React Email | — | Postmark / AWS SES |
| 部署 | Vercel | — | Fly.io / AWS |
| 分析 | Plausible + Vercel Analytics | — | PostHog / GA4 |
| 国际化 | next-intl | — | — |

---

## 1. Next.js 16 关键特性利用

- **App Router + RSC**：商品列表/详情页服务端渲染保 SEO
- **Cache Components**（'use cache' 指令）：静态商品外壳 + 动态库存/价格混合缓存
- **Turbopack**：生产级稳定，构建/热更新更快
- **React Compiler**：减少手写 memo
- **Adapter API 稳定**：降低 Vercel 锁定，便于未来迁移

**使用原则**：
- 只读页（商品页/列表/博客）→ RSC
- 变更操作（加购/结账/登录）→ Server Actions
- 交互密集组件（购物车抽屉/筛选器）→ Client Component（最小化）

---

## 2. 数据库：Neon + Drizzle

### 为何 Neon
- **scale-to-zero**：初期低流量省钱（免费额度 + 按需）
- **DB 分支**：可随代码分支建数据库副本，适合自研电商迭代与预览环境
- **Vercel 原生集成**：一键连接
- **PostgreSQL 强事务**：订单/库存/优惠券需强一致

### 为何 Drizzle（而非 Prisma）
- TS 原生 schema，无 codegen 步骤，迭代更快
- bundle 小，Edge/serverless 友好
- 性能基准优于 Prisma（约 10x）
- 2026 社区趋势首选

### 连接方式
- `@neondatabase/serverless` 驱动（HTTP/WebSocket，适配 serverless 冷启动）
- Drizzle Kit 做 schema → migration

---

## 3. Payload CMS 3.x（后台 + 数据源）

### 为何 Payload（而非 Sanity / 自研）
- **原生 Next.js App Router 插件**：Admin UI + API 路由都跑在 Next.js 应用内，无需独立服务器
- **Local API**：Server Component 直接读写数据库，零网络跳转，SEO/性能极佳
- **TS schema-as-code**：字段定义即类型，强类型
- **Postgres adapter**：直连 Neon，不另起库
- **内置 auth + access control**：卖家后台登录直接复用

### 承载内容
- Collection：Product / ProductVariant / Collection / Order / Customer / Media / Discount
- Global：SiteConfig（品牌信息/公告栏/物流时效）/ Navigation

---

## 4. 认证

### 卖家后台
- **Payload 内置 auth**（admin 角色权限）即可，无需额外方案

### C 端会员
- **Better Auth**（主推荐）：自托管、无 MAU 成本、TS 强类型、可自定义会员/订单关联逻辑
- 备选 Clerk（想最快上线、不在意按 MAU 付费）

---

## 5. 支付：Stripe Embedded Checkout

### 接入方式
- **Embedded Checkout**（iframe 嵌入结账页）：保留品牌体验 + 低 PCI 负担（SAQ-A）+ 官方维护 UI
- 内置开启 PayPal / Apple Pay / Google Pay / Klarna（欧洲），一个集成覆盖多支付方式

### 香港公司收款
- Stripe 港区支持香港公司主体直连
- 货币：可设 USD 结账（欧美主市场），结算到 HKD 账户
- 需准备：香港公司注册证 (CI)、商业登记证 (BR)、银行账户（港币/多币种）

### 关键工程纪律
1. **Webhook 签名验证必做**：用 `stripe.webhooks.constructEvent` 验证，同步订单状态
2. 不要只信前端 `onSuccess` 回调
3. 幂等处理：同一 `checkout.session.completed` 重复推送不重复发货

---

## 6. 邮件：Resend + React Email

### 模板清单
- 订单确认（order_confirmation）
- 发货通知（shipping_update）
- 弃单挽回（abandoned_cart，24h/72h 两触点）
- 欢迎邮件（welcome）
- 优惠券发放（discount）

### 迁移路径
- 量起来或投递率成瓶颈 → Postmark（投递率优先）/ AWS SES（成本优先）
- 模板层（React Email）不变

---

## 7. 部署：Vercel

### 初期
- Pro $20/月 + 1TB 带宽 + 10M 边缘请求
- 零配置部署、Preview Deployment、Speed Insights

### 监控与迁移
- 设带宽/请求阈值告警（如 80% Pro 套餐）
- 超阈值前评估迁移 Fly.io（scale-to-zero，注意冷启动）/ AWS（最便宜）
- Next.js 16 Adapter API 让迁移更平滑

---

## 8. SEO 与分析

### SEO
- App Router RSC 服务端渲染
- metadata API 生成 title/description/OG
- `generateStaticParams` 预生成商品页
- JSON-LD：Product / Offer / BreadcrumbList / Organization
- `app/sitemap.ts` + `app/robots.ts`（Next.js 16 原生）
- `<Image>` AVIF/WebP + 延迟加载

### 分析
- **Plausible**：隐私优先、GDPR 友好、轻量（欧洲市场刚需）
- **Vercel Analytics**：免费、Speed Insights 看 Core Web Vitals
- 可选 PostHog：漏斗/留存/A/B 测试

---

## 9. 国际化（i18n）

- **next-intl**：与 App Router 集成最好的 i18n 方案
- 初期只英文，预留中/欧多语言结构
- 货币：初期 USD，预留 EUR/GBP

---

## 工程纪律（避坑清单）

1. ✅ Stripe webhook 签名验证，不依赖前端回调
2. ✅ Payload 直连 Neon，不起独立数据库
3. ✅ Vercel 带宽/请求阈值告警
4. ✅ 欧洲必支持 PayPal（Stripe Embedded 内置）
5. ✅ GDPR：Plausible 优于 GA4；预留数据导出/删除接口
6. ✅ 订单/库存事务用 Postgres 强一致，不用最终一致
7. ✅ 图片用 Next.js `<Image>` + 下一代格式
8. ✅ 环境变量分 dev/preview/prod 三套（Vercel）
