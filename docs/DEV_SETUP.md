# 本地开发启动指南

> 每次开始工作前，按这个步骤把项目跑起来。

---

## 前置条件（一次性，已配好）

- ✅ PostgreSQL 14（Homebrew 安装，已启动）
- ✅ Node.js 22 + pnpm
- ✅ 项目依赖已安装（`pnpm install`）
- ✅ 数据库已建表 + 种子数据已导入
- ✅ `.env.local` 已配置

---

## 日常启动（3 步）

### 1. 启动 PostgreSQL（如果关机后没自动起）

```bash
brew services start postgresql@14
```

> 如果已经设置开机自启，跳过这步。检查：`brew services list | grep postgres`，状态是 `started` 就不用管。

### 2. 启动开发服务器

```bash
cd /Users/matt/dev/首饰跨境电商
pnpm dev
```

看到：
```
▲ Next.js 16.2.9 (Turbopack)
- Local: http://localhost:37000
✓ Ready in xxx ms
```

> **端口固定**：`pnpm dev` 用 **37000**（前端），Stripe CLI 监听用 **37001**（后端 webhook 转发）。避开 3000/28001 等系统常用端口。

### 3. 打开浏览器

| 地址 | 看什么 |
|---|---|
| http://localhost:37000 | 前台首页 |
| http://localhost:37000/admin | antd 后台 |
| http://localhost:37000/products/amethyst-peace-bracelet | 产品详情页 |
| http://localhost:37000/sitemap.xml | SEO sitemap |
| http://localhost:37000/robots.txt | robots.txt |

---

## 常用命令

在项目根目录 `/Users/matt/dev/首饰跨境电商`：

| 命令 | 作用 |
|---|---|
| `pnpm dev` | 启动前台开发服务器 (localhost:37000) |
| `pnpm --filter web dev:local` | 用自定义域名启动 (需先配 hosts + mkcert，见 LOCAL_DOMAIN_SETUP.md) |
| `pnpm build` | 生产构建（部署前验证） |
| `pnpm --filter web typecheck` | 类型检查 |
| `pnpm --filter web db:studio` | 打开 Drizzle Studio（数据库可视化管理） |
| `pnpm --filter web db:seed` | 重新导入种子数据 |
| `pnpm --filter web db:seed:placeholder` | 导入 10 个占位 SKU + 5 系列 |
| `pnpm --filter web db:generate` | 改了 schema 后生成 migration |
| `pnpm --filter web db:migrate` | 应用 migration 到数据库 |
| `pnpm --filter web gen:placeholders` | 生成 3 个品牌色 SVG 占位图 |

---

## 数据库管理

### 用 Drizzle Studio 可视化看数据

```bash
pnpm --filter web db:studio
```

会打开一个网页，可以直接查看/编辑所有数据表的内容。比后台更底层（能看所有字段）。

### 重置数据库（慎用）

```bash
psql -d naracharm -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
pnpm --filter web db:migrate
pnpm --filter web db:seed
```

> 这会清空所有数据！只在开发环境用。

---

## 停止服务器

在终端按 `Ctrl + C` 即可停止 dev server。

PostgreSQL 会一直后台运行（除非你手动 `brew services stop postgresql@14`）。

---

## 故障排除

### 端口被占用
```bash
lsof -i :37000      # 看谁占了前端
kill -9 <PID>       # 杀掉
```
Stripe CLI 端口冲突 (37001):
```bash
lsof -i :37001      # 看谁占了后端 webhook
kill -9 <PID>       # 杀掉
```

### 数据库连不上
```bash
brew services list | grep postgres    # 确认服务在跑
brew services restart postgresql@14   # 重启
psql -d naracharm -c "SELECT 1;"      # 测试连接
```

### 页面报错 500
1. 看 dev server 终端的错误日志
2. 通常是数据库连接或代码语法问题
3. 截图发我

### 改了 .env.local 不生效
重启 dev server（Ctrl+C 后重新 `pnpm dev`）。
