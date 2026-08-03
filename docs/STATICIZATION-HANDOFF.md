# Nara Charm 静态化 · 运维交接物

> 状态：代码已改造完成（Phase A–D 安全部分），等待运维执行部署
> 日期：2026-08-03

---

## 1. 当前进度（已完成）

| Phase | 内容 | 状态 |
|-------|------|------|
| A | 导出 products/collections/reviews/comments 到 JSON + storefront 切源 | ✅ 已提交 |
| B | 购物车 localStorage + 解耦 header DB 依赖 | ✅ 已提交 |
| C | 评价/评论指外部 API + 静态兜底 + auth baseURL | ✅ 已提交 |
| D(安全) | 内容页 force-static + 构建脚本 + metadata routes | ✅ 已提交 |
| D(切换) | `output: export` 配置 | ⏳ **待后端就绪后提交** |
| 6/7 | Contabo 后端 + Cloudflare Pages 部署 | ⏳ 运维执行 |

**关键规则：`output: 'export'` 切换必须在 Contabo 后端上线并 `NEXT_PUBLIC_API_URL` 指向它之后才能提交。** 在此之前 Vercel 一直安全运行 SSR 模式。

---

## 2. 环境变量清单

### 后端 (Contabo) `.env`
```
DATABASE_URL            # Contabo 自建 Postgres
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL       # hello@naracharm.com
SUPPORT_EMAIL
BETTER_AUTH_SECRET      # 32+ 随机串
BETTER_AUTH_URL         # https://api.naracharm.com
NEXT_PUBLIC_API_URL     # https://api.naracharm.com
NEXT_PUBLIC_SITE_URL    # https://naracharm.com
COOKIE_DOMAIN           # .naracharm.com
NODE_ENV                # production
```

### 前端 (Cloudflare Pages) env
```
NEXT_PUBLIC_API_URL     # https://api.naracharm.com
NEXT_PUBLIC_SITE_URL    # https://naracharm.com
DATABASE_URL            # 只读 Neon/Contabo 连接 (export-storefront 构建时需要)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# 其他 NEXT_PUBLIC_* 品牌变量 (参考 apps/web/.env.example)
```

---

## 3. 后端部署 (Contabo 169.58.107.188)

### 数据库迁移
```bash
# 在 Contabo 上建 Postgres (Docker)
# 然后跑 drizzle 迁移 (所有表 + better-auth 表 + order_number_seq):
cd apps/web && DATABASE_URL="postgresql://..." npx drizzle-kit migrate
```

### Neon → Contabo 数据导出
```bash
# 从 Neon dump (保留订单/库存/auth)
pg_dump "postgresql://neondb_owner:...@...neon.tech/neondb?sslmode=require" -Fc > db.dump
# 恢复到 Contabo
pg_restore -d "postgresql://...@contabo/..." --clean --if-exists db.dump
```

### 启动方式 (Docker + Caddy)
```yaml
# docker-compose.yml (示例)
services:
  api:
    build: .
    environment:
      - DATABASE_URL=...
      - STRIPE_SECRET_KEY=...
      - BETTER_AUTH_URL=https://api.naracharm.com
      - BETTER_AUTH_SECRET=...
    ports:
      - "127.0.0.1:37001:37001"
  caddy:
    image: caddy:2
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
```
```caddy
# Caddyfile
api.naracharm.com {
    reverse_proxy localhost:37001
    header Access-Control-Allow-Origin https://naracharm.com
    header Access-Control-Allow-Credentials true
}
www.naracharm.com { redir https://naracharm.com{uri} permanent }
```

---

## 4. 前端部署 (Cloudflare Pages)

- Build command: `pnpm build` (root, 已配置 export:data 先跑)
- Output dir: `apps/web/out`
- Node version: >= 20
- 绑定 naracharm.com + www (www 301 → apex)
- **`NEXT_PUBLIC_API_URL` 必须指向 Contabo**

### 完成切换时的最后一步 (需运维)
在 `apps/web/next.config.ts` 加:
```ts
output: 'export',
images: { unoptimized: true },
```
然后本地验证 `pnpm build` 产出 `out/` 后部署。**DNS 切换放最后**,先在测试 URL 验证静态站 + Contabo staging 后端全链路。

---

## 5. 已知风险与注意

1. **库存快照**: products.json 的 stock 是构建时快照;真实校验在后端 `/api/checkout`。
2. **占位图**: 10 个产品仍用 placeholder SVG,会固化进构建产物(不阻塞)。
3. **跨源 auth**: 需 `cookieDomain: '.naracharm.com'` + `secure: true`;登录/账户跨源在 DNS 切换前显式测试。
4. **评价静态兜底已就绪**: 后端崩了评价/评论仍显示构建时数据。
5. **回滚**: Vercel 保留最后绿色部署;Neon 留只读一周。

---

## 6. 验证清单

- [ ] `pnpm build` 成功产出 `apps/web/out/` (含 sitemap.xml, robots.txt)
- [ ] 静态站 首页/产品/博客/合集 正常展示
- [ ] 评价/评论: 静态兜底显示;断开后端不白屏
- [ ] Stripe 测试卡 4242 走通 checkout (经 Contabo API)
- [ ] 登录/账户跨源可访问
- [ ] Cloudflare Pages + Contabo DNS 切换后全链路可用
