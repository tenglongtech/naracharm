# 设计系统 Design System

> 基于"手工民族融合首饰"定位的视觉语言。品牌名确认后微调，但调性已定。
> 实现代号在 `apps/web/src/styles/`，使用 Tailwind CSS v4 + CSS 变量。

## 1. 设计原则

1. **克制的丰盛**——民族色用得克制，留白充足，避免"旅游纪念品"的廉价感
2. **手工质感优先**——纹理、自然光、不完美感比光滑精致更符合品牌
3. **文化叙事可读**——每个视觉元素都要能讲一个工艺故事
4. **欧美审美的现代骨架**——版式用现代极简（Grid + 大留白），文化元素作为内容填充
5. **移动端优先**——欧美移动端流量为主，首饰决策常在手机上完成

---

## 2. 色彩系统

### 主色板（民族色 + 克制底色）

| 名称 | HEX | 用途 |
|---|---|---|
### 主色板（温暖复古调 · 以设计稿为准）

| 名称 | HEX | 用途 |
|---|---|---|
| **Terracotta 砖红** | `#C4745A` | 主品牌色/强调色，CTA 按钮、链接、标签、价格强调 |
| **Espresso 深棕** | `#3A2E2B` | 主文字色；深色区块底（页脚、品牌理念区） |
| **Cocoa 中棕** | `#6B4F47` | 次要文字、说明文、深色区块内的次级文字 |
| **Gold 金** | `#D4AF37` | 金属点缀，装饰线、图标、徽章、分割线 |
| **Cream 奶白** | `#FAF7F1` | 主背景色，温暖不刺眼的米白 |
| **Sand 沙色** | `#F3EDE2` | 卡片底色、系列卡片、商品卡背景 |
| **Border 边线** | `#E8DFD0` | 卡片描边、分割线（浅色版） |

### Tailwind 变量

```css
:root {
  --color-brand: #C4745A;       /* terracotta 砖红 */
  --color-accent: #C4745A;      /* 同 brand，主强调 */
  --color-gold: #D4AF37;        /* gold 金 */
  --color-ink: #3A2E2B;         /* espresso 深棕 - 主文字/深色区块底 */
  --color-muted: #6B4F47;       /* cocoa 中棕 - 次要文字 */
  --color-bg: #FAF7F1;          /* cream 奶白 - 主背景 */
  --color-surface: #F3EDE2;     /* sand 沙色 - 卡片底 */
  --color-border: #E8DFD0;      /* 浅边线 */
}
```

**使用纪律**：
- 背景大面积只用 Cream / Sand（温暖米白系）
- Terracotta 砖红用于 CTA 按钮、链接、强调，不超过单屏 15% 面积
- 深色区块（页脚、品牌理念）用 Espresso 深棕做底，配 Cream/Cocoa 文字
- Gold 金色只用于线条、图标、徽章、装饰，不用于大面积
- 整体走"温暖、复古、手工感"，避免高饱和度撞色和锐利的纯黑纯白

---

## 3. 字体系统

| 用途 | 字体 | 备注 |
|---|---|---|
| 展示标题 | **Fraunces**（衬线，Google Fonts） | 文化感、有手工呼吸感的衬线，比 Playfair 更柔 |
| 正文/UI | **Inter**（无衬线，Google Fonts） | 现代清晰，欧美电商标配 |
| 装饰小字 | **Fraunces Italic** | 价格、系列名、引用句 |

```css
--font-display: 'Fraunces', Georgia, serif;
--font-sans: 'Inter', system-ui, sans-serif;
```

**字号阶梯**（移动端优先）：

| Token | 移动 | 桌面 | 用途 |
|---|---|---|---|
| display | 40px | 72px | Hero 大标题 |
| h1 | 30px | 48px | 页面标题 |
| h2 | 24px | 36px | 区块标题 |
| h3 | 20px | 24px | 卡片标题 |
| body | 16px | 16px | 正文 |
| small | 14px | 14px | 说明 |
| caption | 12px | 12px | 标签/徽章 |

---

## 4. 间距与圆角

```css
--radius-sm: 2px;   /* 标签、徽章 */
--radius-md: 4px;   /* 按钮、输入框 */
--radius-lg: 8px;   /* 卡片 */
--radius-full: 9999px;
```

**纪律**：圆角统一偏小（2–8px）——传达"匠人克制感"，不用大圆角（避免廉价"软糖感"）。

---

## 5. 影像风格

### 产品图
- **白底产品图**：纯白 `#FFFFFF` 或 Paper 底，用于列表/详情主图
- **场景图**：自然光、生活化（手腕特写、颈间特写、桌面摆拍）
- **质感图**：手工纹理特写（编织、银饰氧化纹理、丝线）

### 背景
- 民族织物、木纹、亚麻、石材——作为产品图的氛围底
- **避免**：渐变背景、纯色块、塑料感

### 摄影 SOP
详见 `docs/ops/PHOTOGRAPHY.md`（Phase 1 产出），核心：
- 自然侧光（窗边），避免硬光
- 手机即可，多角度（正面/45°/佩戴/特写/对比物）
- 后期：暖白平衡、轻微去饱和、增强纹理

---

## 6. Moodboard 关键词（收集参考图时用）

英文搜索关键词（Pinterest/Behance 找参考）：
- `ethnic jewelry brand minimal`
- `artisanal craft branding earthy`
- `boho editorial photography natural light`
- `Tibetan silver jewelry modern`
- `Mongolian craft branding`
- `silk road brand identity`
- `cottagecore jewelry lookbook`
- `brass jewelry product photography texture`

参考品牌（看它们的视觉语言，不抄）：
- Mejuri（现代极简骨架）
- Gorjana（轻盈手工艺）
- Ana Luisa（环保叙事）
- 藏式/苗银品牌的工艺感呈现

---

## 7. 组件风格指引

| 组件 | 风格 |
|---|---|
| 按钮 | 实心 CTA = Indigo 或 Cinnabar，圆角 4px，hover 轻微下沉；次按钮 = 描边 Brass |
| 卡片 | Paper 底，1px Brass 描边，无阴影或极轻阴影；不用 Material 大阴影 |
| 徽章 | 圆角 2px，小写或小型大写，Cinnabar/Ochre 底白字 |
| 分割线 | 细金线（Brass 1px）或点状民族纹样 |
| 图片 | 直角或 4px 圆角，不用圆形（除非头像） |

---

## 8. 品牌叙事元素（贯穿全站）

- **工艺来源标签**：每个商品页显示 heritage 标签（如 "Tibetan Silver · 藏银"）
- **材质徽章**：925 Silver / Brass / Silk Cord 等小徽章
- **故事区块**：详情页固定有 "The Craft Story" 区块
- **首页"工艺地图"**：视觉化展示中/泰/藏/蒙/西南的工艺来源
