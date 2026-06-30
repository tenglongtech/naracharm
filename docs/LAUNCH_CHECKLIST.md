# 上线检查清单 · Launch Checklist

> 目标：本周内上线。按此清单逐项确认。
> ⭐ 标记的项**必须由你提供真实信息**，否则法律/SEO 有风险。

---

## 一、⭐ 必须你提供的信息（一次性收集）

请把以下信息发给我，我批量填入全站：

### 域名 & 品牌
- [ ] **主域名**：__________（如 naracharm.com）
- [ ] 品牌英文名：Nara Charm（确认）
- [ ] Slogan：Jewelry with Spirit · Stories in Every Piece（确认或修改）

### 公司法定信息（写进条款页，法律要求）
- [ ] **公司英文名**：__________（如 Nara Charm Limited）
- [ ] **公司注册地址**：__________（香港地址，英文）
- [ ] **公司注册号**（如有）：__________（BR 号，可选）
- [ ] **联系邮箱**：__________（如 hello@xxx.com）
- [ ] **客服邮箱**：__________（同上或单独）
- [ ] **隐私事务邮箱**：__________（GDPR 要求，可同客服邮箱）
- [ ] **退货寄回地址**：__________（香港仓地址，可与公司地址同）

### 社交媒体账号
- [ ] Instagram：__________（用户名，如 naracharm）
- [ ] TikTok：__________
- [ ] YouTube：__________
- [ ] Pinterest：__________（可选）

### 支付 & 邮件密钥（已在 .env.local 配置占位，需替换为真实）
- [ ] Stripe：`sk_live_xxx` + `pk_live_xxx`（生产）或 `sk_test_xxx`（测试）
- [ ] Resend：`re_xxx`（API key）
- [ ] Stripe Webhook Secret：`whsec_xxx`（Stripe dashboard 配置后获得）

---

## 二、我做的工作（不依赖你的信息）

### ✅ 已完成
- [x] SEO 基础：metadata / OG / Twitter Card / sitemap.ts / robots.ts
- [x] 结构化数据：Organization JSON-LD（全站）+ Product JSON-LD（产品页）
- [x] OG 图片 + favicon（icon.tsx / opengraph-image.tsx）
- [x] 法律条款页框架：Shipping / Returns / Privacy / Terms / FAQ / Contact / Size Guide
- [x] 404 页面（品牌化）
- [x] 移动端响应式 + 汉堡菜单
- [x] 性能：图片优化（next/image + AVIF/WebP）

### 🔲 待做（拿到你的信息后）
- [ ] 全站域名/邮箱/公司信息对齐（.env + 条款页 + JSON-LD）
- [ ] footer 社媒链接填真实账号
- [ ] terms/privacy 加公司法定信息区块
- [ ] privacy 加"数据控制者"信息（GDPR）
- [ ] canonical URL 用真实域名
- [ ] Stripe/Resend 密钥填入 .env（生产环境变量）
- [ ] 生产构建验证（next build）
- [ ] Vercel 部署 + 域名绑定

---

## 三、上线前最终检查（部署后做）

### 技术
- [ ] 生产构建无错误（`pnpm build`）
- [ ] 所有页面 200（无 404/500）
- [ ] HTTPS 生效（Vercel 自动）
- [ ] 移动端测试（手机访问）
- [ ] 速度测试（Lighthouse）
- [ ] sitemap.xml 可访问
- [ ] robots.txt 可访问

### 业务
- [ ] 注册→登录→浏览→加购→结账→支付→邮件→后台看订单 全流程通
- [ ] Stripe 测试卡支付成功（4242 4242 4242 4242）
- [ ] 订单确认邮件收到
- [ ] 后台能看订单 + 发货
- [ ] 优惠码可用
- [ ] 图片上传可用

### SEO（上线后 1-2 周验证）
- [ ] Google Search Console 提交 sitemap
- [ ] Google 搜索 site:你的域名 确认收录
- [ ] 社交分享预览图正确（OG 图）
- [ ] 结构化数据验证（Search Console 的 Rich Results）

### 法律
- [ ] 条款页含真实公司信息
- [ ] 隐私政策含数据控制者信息
- [ ] Cookie 政策（如适用）
- [ ] 退换货政策符合目标市场法律
- [ ] 关税说明（欧洲 VAT 等）

---

## 四、上线后立即做

- [ ] Google Search Console 验证域名 + 提交 sitemap
- [ ] Plausible 分析接入
- [ ] 社媒账号发布第一条内容
- [ ] 监控 Stripe webhook 正常工作
- [ ] 监控 Vercel 无异常
