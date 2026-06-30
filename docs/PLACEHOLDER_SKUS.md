# 占位 SKU 清单 (v2 · 10 个)

> 这些是站点"可看可测"用的占位数据，**严格按 `STORY_DOCTRINE` 四层故事写**，真实产品到位后在 Admin 后台一对一改 `primaryImage` / `craftStory` / `basePriceCents` / `materials` / `seoTitle` / `seoDescription` 即可，前台 + SEO + 视频脚本不会塌。
>
> **替换流程**：
> 1. 你拍/找好真实效果图（建议 1000×1000 或 1200×1200 jpg）
> 2. 放到 `apps/web/public/products/`（覆盖同名 `p01.jpg` ... `p21.jpg`）
> 3. Admin 后台改商品的 `craftStory` / `materials` / `seoTitle` / `seoDescription`（如果想精细）
> 4. 简单情况：图一换，其他字段不动，30 秒搞定

---

## 系列 (6 个)

| slug | 名称 | 脉络 | featured |
|---|---|---|---|
| `tibetan-silver` | Tibetan Silver | tibetan | ✅ |
| `mongolian-steppe` | Mongolian Steppe | mongol | ✅ |
| `southwest-filigree` | Southwest Filigree | southwest | ✅ |
| `han-jade` | Han Jade | han | ✅ |
| `tai-silk` | Thai Silk | tai | ✅ |
| `caravan-fusion` | Caravan Fusion | fusion | ✅ |

---

## 产品 (10 个)

| # | slug | 名称 | 类别 | 脉络 | 价格 | featured | 主图 |
|---|---|---|---|---|---|---|---|
| 1 | `tibetan-amulet-925-bracelet` | Tibetan Amulet 925 Bracelet | bracelet | tibetan | $58 | ✅ | p01 |
| 2 | `mongolian-road-knot-cord` | Mongolian Road Knot Cord | bracelet | mongol | $42 | ✅ | p02 |
| 3 | `miao-filigree-drop-earrings` | Miao Filigree Drop Earrings | earrings | southwest | $68 | ✅ | p03 |
| 4 | `han-jade-lotus-pendant` | Han Jade Lotus Pendant | necklace | han | $96 | ✅ | p04 |
| 5 | `tai-silk-cord-phone-charm` | Thai Silk Cord Phone Charm | phone-charm | tai | $32 | ✅ | p05 |
| 6 | `hadas-knot-red-cord` | Hada Knot Red Cord | bracelet | tibetan | $38 | ⬜ | p06 |
| 7 | `obsidian-guardian-charm` | Obsidian Guardian Charm | phone-charm | mongol | $28 | ⬜ | p09 |
| 8 | `caravan-fusion-necklace` | Caravan Fusion Necklace | necklace | fusion | $118 | ✅ | p10 |
| 9 | `amethyst-calm-bracelet` | Amethyst Calm Bracelet | bracelet | tibetan | $44 | ⬜ | p11 |
| 10 | `rose-quartz-tenderness-bracelet` | Rose Quartz Tenderness Bracelet | bracelet | tibetan | $44 | ⬜ | p12 |

**价格分布**：$28 / $32 / $38 / $42 / $44 / $44 / $58 / $68 / $96 / $118 → 客单价均值 ≈ $56

**free shipping 阈值**：$120（与全站一致，详见 `docs/ops/SOP.md`）

---

## 数据规模

- 6 collection
- 10 product
- 10 product_variant (1:1 default)
- 10 inventory (库存 50–100 / 件，总库存 593 件)
- 22 product_images (2-3 张 / 商品)

---

## SEO 字段

每个商品都有：
- `seoTitle` （60 字符内，关键词前置）
- `seoDescription` （155 字符内，含品牌词 + 长尾词）
- `craftStory` （4 层叙事，140 词英文）
- `materials` （3–5 项，结构化）
- `careNotes` （2–3 条保养要点）

---

## 真实图替换清单

替换 10 个主图时，文件名保持一致即可：

```
p01.jpg → Tibetan Amulet 925 Bracelet
p02.jpg → Mongolian Road Knot Cord
p03.jpg → Miao Filigree Drop Earrings
p04.jpg → Han Jade Lotus Pendant
p05.jpg → Thai Silk Cord Phone Charm
p06.jpg → Hada Knot Red Cord
p09.jpg → Obsidian Guardian Charm
p10.jpg → Caravan Fusion Necklace
p11.jpg → Amethyst Calm Bracelet
p12.jpg → Rose Quartz Tenderness Bracelet
```

副图（p07/p08/p13–p21）作为产品多角度图，可一并替换为更全的拍摄。

---

## 占位图 (3 个 SVG)

`pnpm gen:placeholders` 生成 3 个品牌色 SVG，用于：
- 未来新 SKU 占位
- 商品图缺失兜底
- 营销活动占位

文件：`apps/web/public/products/placeholder-01.svg` ... `placeholder-03.svg`
