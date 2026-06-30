# 本地域名配置指南 (naracharm.test)

> 目标：用 `https://naracharm.test` 访问前台，`https://naracharm.test/admin` 访问后台。
> 体验完全等同于线上（HTTPS、无端口、真实域名）。
>
> ⚠️ 以下命令需要**在你自己的终端（Terminal）里手动执行**，因为涉及 sudo 权限和系统级安装。
> 每条命令执行成功后再执行下一条。

---

## 第 1 步：配 hosts（让 naracharm.test 指向本机）

在终端执行（会让你输入 Mac 登录密码）：

```bash
echo "127.0.0.1	naracharm.test" | sudo tee -a /etc/hosts
```

**验证**（应该看到 naracharm.test 那一行）：

```bash
grep naracharm /etc/hosts
```

---

## 第 2 步：安装 mkcert（生成可信本地 HTTPS 证书）

```bash
brew install mkcert
brew install nss   # Firefox 兼容，可选但建议装
```

**安装本地 CA 根证书**（一次性，会让你确认安装）：

```bash
mkcert -install
```

> 这一步会在你的系统钥匙串安装一个本地信任的根证书。
> 之后 mkcert 生成的所有证书都会被浏览器信任，不再有"不安全"警告。

---

## 第 3 步：生成项目证书

在**项目根目录**执行：

```bash
cd /Users/matt/dev/首饰跨境电商/apps/web
mkcert naracharm.test localhost 127.0.0.1
```

这会生成两个文件：
- `naracharm.test+2.pem`（证书）
- `naracharm.test+2-key.pem`（私钥）

Next.js 16 的 `--experimental-https` 会自动找 `localhost.pem`，但我们用的是自定义域名，所以要重命名：

```bash
mv "naracharm.test+2.pem" localhost.pem
mv "naracharm.test+2-key.pem" localhost-key.pem
```

---

## 第 4 步：确保证书不进 git

在项目根目录的 `.gitignore` 已经包含了，但确认一下：

```bash
grep -E "pem|cert" /Users/matt/dev/首饰跨境电商/.gitignore
```

如果没有，手动加上（证书是私密文件，不能进仓库）：

```bash
echo -e "\n# 本地 HTTPS 证书\n*.pem" >> /Users/matt/dev/首饰跨境电商/.gitignore
```

---

## 第 5 步：启动开发服务器

用 HTTPS + 自定义域名启动（443 端口，标准 HTTPS 端口）：

```bash
cd /Users/matt/dev/首饰跨境电商
pnpm --filter web dev:local
```

> ⚠️ 443 端口需要权限。如果报权限错误，改用 80 端口的 HTTP 版本：
> ```bash
> pnpm --filter web dev:local-http
> ```
> 然后访问 `http://naracharm.test`（无 https，浏览器会有"不安全"提示但能用）

---

## 第 6 步：访问验证

打开浏览器：

| 地址 | 看什么 |
|---|---|
| **https://naracharm.test** | 前台首页（应该显示 Nara Charm，无安全警告） |
| **https://naracharm.test/admin** | antd 后台（仪表盘，能看到 8 个商品数据） |
| **https://naracharm.test/products/amethyst-peace-bracelet** | 产品详情页 |

**如果浏览器还是显示"不安全"**：说明 mkcert 根证书没装好，重跑 `mkcert -install`。

---

## 故障排除

### 端口被占用
```bash
sudo lsof -i :443   # 看谁占了
sudo lsof -i :80
```

### 域名访问不通
```bash
ping naracharm.test   # 应解析到 127.0.0.1
```

### 证书不信任
```bash
mkcert -uninstall    # 卸载
mkcert -install      # 重装
```

### 想换回 localhost
不用改任何配置，直接 `pnpm dev` 就是原来的 localhost:37000。

---

## 配置说明

改完后的环境：
- 前台：`https://naracharm.test`
- 后台：`https://naracharm.test/admin`
- 数据库：本地 PostgreSQL（naracharm）
- `.env.local` 的 `BETTER_AUTH_URL` 和 `NEXT_PUBLIC_SITE_URL` 已设为 `https://naracharm.test`

后续接 Better Auth / Stripe 时，回调地址都用 `https://naracharm.test`，和线上完全一致。
