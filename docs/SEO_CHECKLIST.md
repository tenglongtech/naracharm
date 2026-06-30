# SEO 现状与未来清单

> 截至 2026-06-25 · 与 Nara Charm 独立站同步
> "✅" = 已实现 / "🔲" = 未做

---

## 0. 技术 SEO (基础) · 100% ✅

| 项 | 状态 | 位置 |
|---|---|---|
| Sitemap (商品/系列/故事/博客分片) | ✅ | `app/sitemap.ts` |
| robots.txt (屏蔽 /admin /api /account) | ✅ | `app/robots.ts` |
| JSON-LD: Organization (全站) | ✅ | `app/layout.tsx` |
| JSON-LD: WebSite + SearchAction (首页) | ✅ | `app/page.tsx` |
| JSON-LD: Product (PDP) | ✅ | `app/products/[slug]/page.tsx` |
| JSON-LD: CollectionPage + ItemList (系列页) | ✅ | `app/collections/[slug]/page.tsx` |
| JSON-LD: BreadcrumbList (内容页) | ✅ | `components/breadcrumb.tsx` |
| JSON-LD: FAQPage (FAQ) | ✅ | `app/faq/page.tsx` |
| JSON-LD: Article (故事详情) | ✅ | `app/stories/[slug]/page.tsx` |
| OG image (1200×630 品牌色) | ✅ | `app/opengraph-image.tsx` |
| Twitter card meta | ✅ | `app/layout.tsx` |
| Canonical URL (per page) | ✅ | 每个 page.tsx 的 `alternates.canonical` |
| Favicon (动态生成) | ✅ | `app/icon.tsx` |
| 移动端 viewport | ✅ | `app/layout.tsx` viewport |
| HTTPS / 部署平台原生 | ✅ | Vercel |

---

## 1. 内容 SEO · 80% ✅

| 项 | 状态 | 备注 |
|---|---|---|
| 首页文案 + 故事卡 | ✅ | 6 大区块 + 3 个故事卡 |
| 商品详情页 (10 占位) | ✅ | craft_story / seoTitle / seoDescription |
| 系列详情页 (6 个) | ✅ | 含 collection_narratives |
| 故事库 (6 个故事) | ✅ | `/stories` + `/stories/[slug]` |
| 工艺页 `/our-craft` | ✅ | 4 步 + 5 脉络 + 4 原则 |
| 礼物指南 `/gift-guide` | ✅ | 8 场合 + 3 预算 |
| FAQ 页 `/faq` | ✅ | 6 大类 21 个 Q/A + JSON-LD |
| **Blog Collection** | 🔲 | Phase 2 (每周 1–2 篇 SEO 文) |
| **About 页** | 🔲 | 品牌故事 / 团队 / 联系方式 |
| **Contact 页** | 🔲 | 简洁表单 + 邮箱 |

---

## 2. 关键词策略 · 60%

| 类 | 数量 | 状态 |
|---|---|---|
| 商品核心长尾词 (PDP title) | 10 | ✅ 每个 PDP 都有 |
| 系列核心词 (Collection page title) | 6 | ✅ |
| 工艺/选购指南词 (Blog 必备) | ~20 | 🔲 缺 Blog |
| 节日礼物词 (Christmas/Mother's Day) | 4 | 🔲 需要时再做 |
| 地域词 (Tibetan / Miao / Thai jewelry) | 5 | ✅ 在故事 + 系列页 |

**蓝海长尾词示例**（已埋但需 Blog 支撑）：
- "handmade tibetan silver bracelet" (KD < 30)
- "miao silver filigree earrings" (KD < 20)
- "boho phone charm natural stone" (KD < 25)
- "fusion silver necklace silk road" (KD < 20)

---

## 3. 技术性能 · 50%

| 项 | 状态 | 备注 |
|---|---|---|
| Next.js 16 RSC + Turbopack | ✅ | 构建快 |
| Image optimization (AVIF/WebP) | ✅ | next.config + `<Image>` |
| 字体 swap (Inter/Fraunces) | ✅ | display: swap |
| 静态预生成 (商品/故事) | ✅ | generateStaticParams |
| Lighthouse 性能 ≥ 90 | 🔲 | 上线后实测 |
| Core Web Vitals (LCP/CLS/INP) | 🔲 | Vercel Analytics 监控 |
| 减少客户端 JS (client components) | ✅ | RSC 优先 |
| Service Worker / 离线缓存 | ❌ | 不做 (PWA 价值低) |
| CDN (Vercel Edge) | ✅ | 部署后自动 |

---

## 4. 链接与权重 · 30%

| 项 | 状态 | 备注 |
|---|---|---|
| 内部链接结构 | ✅ | header / footer / breadcrumb |
| Footer 链接到全部核心页 | ✅ | 含 collections 类别 |
| PDP → 故事页 | ✅ | 已加 "Pieces from this story" |
| Blog → 商品 | 🔲 | 缺 Blog |
| 商品 → 同系列商品 | ✅ | PDP 底部 "You may also like" |
| 外链策略 (Pinterest/Reddit/Etsy 副店) | 🔲 | 上线后做 |
| 内部锚文本多样性 | 🔲 | 部分页面 H2 文本可优化 |

---

## 5. 国际化与 hreflang · 0% (按计划推迟)

| 阶段 | 状态 | 备注 |
|---|---|---|
| 多语言 (next-intl 集成) | 🔲 | Phase 2 决策后做 |
| hreflang 标签 | 🔲 | 跟随 i18n |
| 本地化货币 (Stripe 多币种) | 🔲 | 跟随 i18n |
| 本地化内容 (EU 法语/德语博客) | 🔲 | 跟随 i18n |

**当前 P0 市场** = 英文 + USD + 欧美 (US/UK/CA/AU)，一个站打天下。

---

## 6. 富片段 / Rich Results 资格

| 类型 | 状态 | 触发页 |
|---|---|---|
| Product rich result | ✅ | PDP |
| FAQ rich result | ✅ | `/faq` |
| Breadcrumb | ✅ | 内容页 + PDP |
| Article | ✅ | `/stories/[slug]` |
| Review / Rating stars | 🔲 | 加评价系统后 |
| Video | 🔲 | 上线视频后 |
| LocalBusiness | ❌ | 不适用 (我们是电商) |
| Organization | ✅ | 全站 |
| Sitelinks Searchbox | 🔲 | Google 自动生成,需 brand 搜索量 |

---

## 7. 分析与监控 · 40%

| 项 | 状态 | 备注 |
|---|---|---|
| Plausible (隐私友好) | 🔲 | `.env` 已留位,需注册账号 |
| Vercel Analytics | 🔲 | 部署后自动 |
| Google Search Console | 🔲 | 上线后接入 (提交 sitemap) |
| Bing Webmaster | 🔲 | 上线后接入 (Bing 占欧美搜索 10%) |
| 关键事件埋点 (add_to_cart / purchase) | 🔲 | 用 Plausible custom events |
| 错误监控 (Sentry) | 🔲 | Phase 4 |

---

## 8. 信任 / 合规 · 30%

| 项 | 状态 | 备注 |
|---|---|---|
| 隐私政策 `/privacy` | 🔲 | LegalPage 模板有,内容待填 |
| 服务条款 `/terms` | 🔲 | 同上 |
| 退换货政策 `/returns` | 🔲 | 同上 |
| 运输政策 `/shipping` | 🔲 | 同上 |
| GDPR 数据导出/删除接口 | 🔲 | Phase 4 (欧盟前必做) |
| Cookie 同意条 | 🔲 | Plausible 不需,但留位 |
| 材质安全披露 (925 银 / 含镍) | 🔲 | 每个 PDP 加 material_safety 字段 |

---

## 9. 内容营销 (Blog) · 🔲 0%

**最关键的下一步**。每周 1–2 篇 SEO 博客，抓长尾词。

| 类别 | 目标 | 数量 |
|---|---|---|
| 工艺科普 | "what is tibetan silver" / "miao filigree" / "mongolian knot" | 5 篇 |
| 选购指南 | "how to choose crystal bracelet" / "tibetan silver vs sterling" | 5 篇 |
| 搭配美学 | "boho jewelry styling 2026" / "how to stack bracelets" | 5 篇 |
| 节日礼物 | "mothers day handmade jewelry" / "boho christmas gifts" | 按月 |
| 品牌故事 | "what is nara charm" / "silk road jewelry" | 3 篇 |

**技术实现**：Drizzle 加 `posts` 表 + Payload-style admin (其实直接 Drizzle 录入即可) + `/blog/[slug]` 渲染。

---

## 10. 行动优先级 (PM 视角)

| 优先级 | 事项 | 预计工时 |
|---|---|---|
| **P0** | Blog Collection (schema + admin + 5 篇示范文) | 2 天 |
| **P0** | 隐私/条款/退换货/运输 页面内容 (LegalPage 已有) | 半天 |
| **P0** | About / Contact 页内容 | 半天 |
| P1 | Plausible 注册 + 接入 | 1 小时 |
| P1 | Google Search Console 提交 sitemap | 1 小时 |
| P1 | 评价系统 (PDP 真实评分) | 1 天 |
| P2 | i18n 集成 (next-intl + en.json) | 1 天 |
| P2 | 多币种 (Stripe 自动切) | 半天 |
| P3 | 外链建设 (Pinterest / Etsy 副店) | 持续 |

---

## 11. 一句话总结

**技术 SEO 100% 就绪** · **基础内容 80%** · **Blog 0%（最关键缺口）** · **信任页面占位** · **分析 40%**
→ 上线前必做：Blog + 信任页内容 + Plausible + Search Console 提交
