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
CHECKOUT_STOREFRONT_ORIGIN # 仅在测试站和正式规范域名不同的时候设置
COOKIE_DOMAIN           # 可选。需要在自有子域间共享登录时设为 .naracharm.com
NODE_ENV                # production
```

### 前端 (Cloudflare Pages) env
```
NEXT_PUBLIC_API_URL     # https://api.naracharm.com
NEXT_PUBLIC_SITE_URL    # https://naracharm.com
DATABASE_URL            # 仅执行 pnpm export:data 时使用的只读数据库连接
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY # 可选。兼容尚未提供运行时配置的旧后端
# 其他 NEXT_PUBLIC_* 品牌变量 (参考 apps/web/.env.example)
```

---

## 3. 后端部署 (Contabo 169.58.107.188)

### 发布与数据库迁移

- GitHub Actions 的 `Deploy API to Contabo` 使用提交 SHA 构建服务镜像和迁移镜像。运行前确认服务器已有 `naracharm_naracharm-net` 网络与 `/opt/naracharm/api/.env`。
- 发布脚本按已记录的 Drizzle 迁移历史应用缺少的迁移。空库会初始化。存在业务表但迁移记录缺失，或迁移记录与 SQL 不一致时，发布会停在切换之前。用备份副本核对已经执行的迁移和实际结构，再修复正式库的迁移历史。
- `GET /api/health` 会检查数据库和服务需要的表、字段及订单号序列。HTTP 200 表示就绪。HTTP 503 的响应会用 `schema: pending` 区分可连接但迁移尚未完成的情况。
- 新镜像先在临时回环端口通过健康检查，再接管 `127.0.0.1:37001`。正式端口检查失败时，脚本会恢复之前的容器并等待它重新就绪。成功发布后，上一个容器以 `naracharm-api-previous-<容器 ID>` 保留供回退。
- 后端容器回退会保留已执行的数据库迁移。`0004` 和 `0005` 增加字段及相关表结构，与上一版共用数据库。后续改变旧代码依赖的迁移需单独安排发布顺序。

### Neon → Contabo 数据导出
```bash
# 从 Neon dump (保留订单/库存/auth)
pg_dump "postgresql://neondb_owner:...@...neon.tech/neondb?sslmode=require" -Fc > db.dump
# 恢复到 Contabo
pg_restore -d "postgresql://...@contabo/..." --clean --if-exists db.dump
```

### API 入口（宿主机 Caddy）

发布脚本将 API 容器的端口映射到宿主机的 `127.0.0.1:37001`。同一台 Linux 宿主机上的 Caddy 监听公网 HTTPS，并把 API 请求转发到这个回环地址。

```caddy
api.naracharm.com {
    reverse_proxy 127.0.0.1:37001
}
```

在宿主机访问 `http://127.0.0.1:37001/api/health` 可以验证容器和数据库，再从公网访问 `https://api.naracharm.com/api/health` 验证域名、TLS 和反代。若容器就绪但公网出现 522，核对 Cloudflare 的源站地址和防火墙，并确认 Caddy 正在监听源站的 443 端口。

---

## 4. 前端部署 (Cloudflare Pages)

- 本地预览使用根目录的 `pnpm build:static`。从数据库更新正式发布包时，使用下文的 `pnpm package:catalog`。
- 构建会为本地商品图和编辑图生成适配不同屏幕宽度的 WebP。产物中的 `image` 目录随页面一起发布。原图继续提供给自然搜索、商品 Feed 和分享卡。
- Output dir: `apps/web/out`
- Node version: >= 20
- 绑定 naracharm.com + www (www 301 → apex)
- **`NEXT_PUBLIC_API_URL` 必须指向 Contabo**

### 生成可发布的静态包

```bash
pnpm package:static /tmp/nara-charm-pages.zip
```

发布包使用当前目录快照，默认编译 `https://naracharm.com` 和 `https://api.naracharm.com`，也可通过命令环境中的 `NEXT_PUBLIC_SITE_URL` 与 `NEXT_PUBLIC_API_URL` 指定公开 HTTPS origin。打包使用 Node.js 22 和 Python 3.11 或更新版本。打包在独立目录编译，验证通过后写入 ZIP 和同目录的 `*.report.json`。报告记录可索引文章、在售商品、设计预览、Feed 数目和 ZIP 的 SHA-256。

检查还会沿静态 HTML 中的站内链接从首页遍历。站点地图内的页面都需要能通过这条路径访问，报告中的 `maxInternalLinkDepth` 记录所需链接步数的最大值。

正式域名切换前，保存当前公网站点地图，然后将它交给同一次打包检查。

```bash
curl -fSs https://naracharm.com/sitemap.xml -o /tmp/nara-previous-sitemap.xml
pnpm package:static /tmp/nara-charm-pages.zip --previous-sitemap /tmp/nara-previous-sitemap.xml
```

`pnpm package:catalog` 同样支持 `--previous-sitemap`。旧网址需要继续出现在新版站点地图中，或保留可访问的 `noindex` 存档页。网址消失或仍可索引却遗漏在新版地图中时，检查会失败。报告中的 `previousSitemap` 记录这两种已保留网址的数量。

搜索引擎可以请求购物车、结账、登录和账户等公开页面，以读取页面上的 `noindex`。后台和 API 路径仍使用抓取限制。

### 从后台目录生成发布包

在命令环境中提供 `STOREFRONT_EXPORT_DATABASE_URL` 后，从项目根目录运行：

```bash
pnpm package:catalog /tmp/nara-charm-pages.zip
```

导出使用一次 PostgreSQL 只读事务，商品、变体、库存、确认的实拍和系列读取自同一时点。只读角色需要对 `products`、`collections`、`product_variants`、`inventory`、`product_images`、`variant_images`、`product_reviews` 和 `blog_comments` 有查询权限。数据库连接只交给导出进程。站内商品页、站点地图和购物 Feed 都从这份暂存快照生成。本地实拍图应位于 `apps/web/public/products/photos`，也可使用后台已确认的公开 HTTPS 图片地址。

导出和验证成功后，才会更新目标 ZIP 与报告。数据库无法连接、没有上架商品或构建检查失败时，继续使用上一版发布包。仓库中的目录快照和本地预览目录由各自的常规命令更新。

用 `pnpm package:catalog` 刷新正式目录时，新增网址须有后台标记为实拍的商品图或 SKU 图。若发现只有占位图片的旧测试商品，导出会列出对应 slug 并保留上一版快照。已在目录快照中的商品可继续使用现有图片。

旧后台不可用且在线结账暂停时，可用已核对的商品表制作候选发布包。命令在隔离目录合并 `publish` 和 `photo` 行，随后执行常规图片和 SEO 审计。验收包通过后，保留用于发布的 CSV 和对应图片，后续构建沿用该批次，直到已确认的商品变更并入目录快照。

```sh
NEXT_PUBLIC_CHECKOUT_ENABLED=false pnpm package:static /tmp/nara-catalog-candidate.zip \
  --catalog-intake "$PWD/nara-studio-intake.csv" --previous-sitemap /tmp/previous-release/sitemap.xml
```

打包时会检查已确认的站内实拍。缺失、无法读取或扩展名与图像格式不匹配的文件会阻止生成新包，日志会列出对应款式。对短边低于 500 像素或使用动态 GIF 的实拍，日志给出 Merchant Center 提示。外部图片可在批量预检表中打开和查看尺寸。

不同款式引用同一个外部图片地址，或使用内容完全相同的站内实拍时，打包会提示核对涉及的款式。确认同一张图确实能展示每款后，可以继续使用。

前台默认为询价模式。商品页链接到咨询表单，在线付款和 Google 购物报价暂停。解压后用 `pnpm verify:release --exported-site /tmp/nara-pages-release` 验证此模式的公开页面和站点地图。

账号和订单查询可独立于支付开启。源站恢复并验证登录和订单查询后，以 `NEXT_PUBLIC_CUSTOMER_SERVICES_ENABLED=true` 构建即可恢复这些入口。关闭时，收藏清单继续使用访客设备中的本地数据，旧账号和订单查询网址显示服务状态。

需要恢复线上支付时，以 `NEXT_PUBLIC_CHECKOUT_ENABLED=true` 构建。前台通过 `GET /api/checkout?config=1` 获取 Stripe 公钥，并检查后端返回 `quoteReview: true`。后端的 `STRIPE_PUBLISHABLE_KEY` 应与 `STRIPE_SECRET_KEY` 属于同一个 Stripe 账户和环境。

从仓库根目录运行 `pnpm verify:release` 检查公网 API、数据库迁移、Stripe 环境、匿名会话接口和浏览器跨域预检。命令只发送 GET 和 OPTIONS 请求。测试后台可通过 `--api-origin`、`--site-origin` 和 `--stripe-mode test` 指定目标。

上传前，用 `pnpm verify:release --catalog-export /tmp/nara-pages-release` 比对解压包与正式 API 的当前目录。整款商品漏导出或仍保留下架商品时会列出商品网址；规格遗漏、下架、变价或售罄会列出具体 SKU。目录数据由一次查询读取，有货和售罄的上架商品都纳入检查。

上传后，改用 `pnpm verify:release --exported-site /tmp/nara-pages-release`。命令对比公网的站点地图和购物 Feed，再逐页核对地图中每个网址的 HTTP 响应、robots.txt 许可、索引指令、规范链接、主标题、网页标题和描述。询价模式还会核对正式商品的结构化数据，确保其中没有在线购买报价。开启支付时，脚本会额外核对后台与正式商品页上的 SKU、价格和可用状态。Stripe 测试环境的付款及登录浏览器验收单独执行。

正式站的 IndexNow 验证文件存放在本地 `apps/web/public/indexnow-*.txt`，随静态包上传，文件名和内容应通过私密渠道交接。换机器发布前，先恢复同一份验证文件。发布完成后可按 [IndexNow 协议](https://www.indexnow.org/documentation) 通知支持该协议的搜索引擎，提交本次新增或实质更新的正式网址。其响应只确认接收或等待验证，实际收录需在搜索引擎后台查看。

新版前台随结账请求提交顾客看到的商品小计、运费和折扣。金额有变动时，后端先返回最新明细，顾客确认后才创建付款会话。新后端仍接受旧前台的请求格式。

后台订单页可按包裹保存承运商、运单号和可选的 HTTPS 跟踪网址，再单独提交发货邮件。邮件服务确认接收后，后台记录该包裹的通知状态。配置好 Resend 后，使用测试订单验收确认邮件和发货通知。

新确认邮件及发货邮件含 180 天有效的订单跟踪链接。后端默认用现有 `BETTER_AUTH_SECRET` 签名，也可配置单独的 `ORDER_TRACKING_SECRET`，至少 32 个字符。多副本应使用同一份签名配置。更换签名密钥会导致此前发出的链接失效。

GitHub Actions 的 `Verify static storefront` 在 PR、主分支更新或手动触发时执行相同的构建和检查，结果可在任务的 Artifacts 下载。发布时解压 ZIP，将解压目录作为 Wrangler 的上传目录。Cloudflare Pages 的控制台拖放限额为 1,000 个文件，本项目使用 Wrangler。`_headers` 为分享图设置 PNG 类型，并让 Pages 默认域名和预览域名返回 `X-Robots-Tag: noindex`。

### 性能数据

正式站已移除返回 522 的旧 Plausible 脚本。发布包只验证浏览器资源及页面行为。查看真实访客的 Core Web Vitals 时，使用 Google PageSpeed Insights 的真实用户数据，或在已启用 Web Analytics 的 Cloudflare 项目中查看。记录统计区间、设备和页面范围，自动化浏览器测试的结果单独记录。

### 站内询价

正式域名的发布包默认包含 `_worker.js` 和 `_routes.json`，询价入口由 Cloudflare Pages 的 `/api/inquiries` 处理。用 `wrangler.toml` 绑定正式环境的 D1 数据库，保留 Pages 项目中的 `INQUIRY_RATE_SECRET` 密钥。将发布包解压至发布目录的 `site/`，再将配置放到 `site/` 的同级目录。配置文件与密钥均应留在公开资产目录之外。

```sh
staging_dir=$(mktemp -d)
cp cloudflare/inquiries/wrangler.toml "$staging_dir/wrangler.toml"
unzip /tmp/nara-charm-pages.zip -d "$staging_dir/site"
(cd "$staging_dir" && npx wrangler pages deploy ./site --project-name naracharm --branch main)
```

在 Cloudflare 控制台打开 **D1 SQL Database → naracharm-inquiries → Console**。通过 `pending_inquiries` 查看最近的待处理询价，从新到旧排列。询价只在已授权的 Cloudflare 账号内查看。系统目前没有邮件通知，回复客户需使用商家自己的发信渠道。

```sql
SELECT * FROM pending_inquiries LIMIT 50;
```

处理后，可在同一控制台把对应记录的 `reviewed_at` 更新为当前时间。记录按询价编号定位，避免修改其他记录。

```sql
UPDATE inquiries
SET reviewed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '在此填入需要标记的询价编号' AND reviewed_at IS NULL;
```

浏览器可将带内容版本的脚本、样式、字体和响应式 WebP 缓存一年。打包会用 WebP 编码结果核对文件名的版本。HTML、站点地图、商品 Feed 和可原址替换的图片沿用 Pages 默认的重新验证策略。

### 测试站验收

静态构建在独立目录里运行，成功后生成 `apps/web/out`。用 `python3 scripts/audit-static-storefront.py` 核对导出的规范网址、站内链接、图片资源和商品 Feed。部署测试站和测试后端后，验证 Stripe 测试付款和跨域账户登录，再安排正式域名切换。

---

## 5. 已知风险与注意

1. 商品页先显示构建时价格与库存，再从 `/api/catalog/offer?slug=<商品 slug>` 读取各 SKU 的当前售价和可购数量。该接口不可用时保留页面已知状态，付款前由 `/api/checkout` 再次核对。站点地图和 Google 购物 Feed 仍使用同一份构建快照。调整价格或库存后，需要重新导出目录并发布以同步搜索数据。
2. 购物 Feed 使用后台确认的实拍。`/google-feed.xml` 与商品页使用同一份目录快照。各 SKU 链接预选对应规格，并输出该规格的价格、库存和实拍。没有专属实拍的 SKU 可使用通用实拍。两者都缺少时，该 SKU 不进入购物 Feed。
3. **跨源登录**：应用根据配置的店铺域名处理 CORS。Caddy 直接转发应用的预检与会话响应。需要跨源登录的预览站与后端放在同一个 HTTPS 站点下，例如同为 `naracharm.com` 的子域。前端的 `NEXT_PUBLIC_API_URL` 指向实际接收会话的后端。
4. **评价静态兜底已就绪**: 后端崩了评价/评论仍显示构建时数据。
5. **回滚**：API 发布后保留前一版容器。Cloudflare Pages 前端回退使用其部署记录。

---

## 6. 验证清单

- [ ] `pnpm build:static` 生成 `apps/web/out/`，包含 sitemap.xml、robots.txt 和 google-feed.xml。
- [ ] 静态站 首页/产品/博客/合集 正常展示
- [ ] 评价/评论: 静态兜底显示;断开后端不白屏
- [ ] Stripe 测试卡 4242 走通 checkout (经 Contabo API)
- [ ] 先验证 Contabo 发布任务完成迁移，且公网 `/api/health` 返回 HTTP 200 和 `schema: ready`，再切换使用新 API 的前端。
- [ ] 验证跨源注册、登录、退出、资料修改和支付后订单记录。游客订单通过确认页和订单客服查询。
- [ ] Cloudflare Pages + Contabo DNS 切换后全链路可用
