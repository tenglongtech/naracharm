# 2026-09-22 旧图逐张审计

审计方法：逐张打开 22 个 JPEG 文件；核对全部 22 款商品的主图与相册，检查占位 SVG 引用，并用 SHA-256 核实重复文件。新图为按文字规格生成的设计示意，不能替代实物验货。

2026-09-23 更新：20 款旧商品已有匹配文字规格的设计示意图；Amethyst Calm 与 Amethyst Peace 共用一张符合两款材质描述的示意图。Rose Quartz 缺少可信的粉晶图；Hematite 生成图呈明显亮面，与原商品“matte”描述不符，两款现展示待补图状态，避免继续展示错误商品图。六款 Studio Edit 均有独立示意图和计划价格，但库存为零、暂不可购买。后续应以实物拍摄替换所有设计示意图，并确认新款实物规格与库存后开放购买。

| 文件 | 观察 | 引用它的商品 |
|---|---|---|
| 1782366103303-8op2lp.jpg | 红白蓝珠串手机挂饰，莲花吊坠；与 p01 构图相近 | 未被当前商品数据引用 |
| p01.jpg | 红白蓝珠串手机挂饰，带流苏；不是手链 | Tibetan Amulet 925 Bracelet、Amethyst Peace Bracelet |
| p02.jpg | 红白蓝珠串项链；不是编绳手链 | Mongolian Road Knot Cord、Strawberry Quartz Bracelet |
| p03.jpg | 金色彩珠花朵耳饰；不是银色花丝 | Miao Filigree Drop Earrings、Rose Quartz Bracelet |
| p04.jpg | 红珠绿松石手链；不是玉石吊坠或黑曜石挂饰 | Han Jade Lotus Pendant、Obsidian Guard Phone Charm |
| p05.jpg | 蓝色珠串金属链项链；不是丝绳手机挂饰 | Thai Silk Cord Phone Charm |
| p06.jpg | 红珠绿松石手链；不是红绳或混合水晶 | Hada Knot Red Cord、Mixed Crystal Bracelet |
| p07.jpg | 金色珍珠红珠手链；与银色/紫晶描述不符 | Tibetan Amulet 925 Bracelet、Amethyst Peace Bracelet |
| p08.jpg | 与 p06 相同的红珠手链 | Mongolian Road Knot Cord、Strawberry Quartz Bracelet |
| p09.jpg | 金色珍珠红珠挂饰；不是黑曜石或玉珠手链 | Obsidian Guardian Charm、Lotus Jade Bracelet |
| p10.jpg | 与 p05 相同的蓝珠项链 | Caravan Fusion Necklace、Rose Quartz Bracelet |
| p11.jpg | 与 p06 相同的红珠手链；不是紫晶 | Amethyst Calm Bracelet、Obsidian Guard Phone Charm |
| p12.jpg | 与 p09 相同的金色珍珠挂饰 | Mixed Crystal Bracelet |
| p13.jpg | 与 p05 相同的蓝珠项链 | Tibetan Amulet 925 Bracelet、Amethyst Peace Bracelet |
| p14.jpg | 与 p03 相同的金色耳饰 | Miao Filigree Drop Earrings、Strawberry Quartz Bracelet |
| p15.jpg | 极小模糊图块，无法辨识商品 | Han Jade Lotus Pendant、Cinnabar Cord Phone Charm |
| p16.jpg | 与 p07 相同的金色珍珠手链 | Thai Silk Cord Phone Charm、Lotus Jade Bracelet |
| p17.jpg | 金色珍珠红珠项链；不是银色丝绳吊坠 | Caravan Fusion Necklace、Obsidian Guard Phone Charm |
| p18.jpg | 红白蓝彩珠银色耳饰；不是单色花丝 | Miao Filigree Drop Earrings |
| p19.jpg | 与 p17 相同的金色珍珠项链；不是绿松石手链 | Hada Knot Red Cord、Turquoise Sky Bracelet |
| p20.jpg | 与 p09 相同的金色珍珠挂饰 | Obsidian Guardian Charm、Cinnabar Cord Phone Charm |
| p21.jpg | 红白蓝珠串手链；不是项链或纯绿松石手链 | Caravan Fusion Necklace、Turquoise Sky Bracelet |

## 商品逐款结论

| 商品 | 原主图 | 处理 |
|---|---|---|
| Tibetan Amulet 925 Bracelet | /products/p01.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Mongolian Road Knot Cord | /products/p02.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Miao Filigree Drop Earrings | /products/p03.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Han Jade Lotus Pendant | /products/p04.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Thai Silk Cord Phone Charm | /products/p05.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Hada Knot Red Cord | /products/p06.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Obsidian Guardian Charm | /products/p09.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Caravan Fusion Necklace | /products/p10.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Amethyst Calm Bracelet | /products/p11.jpg | 使用符合紫晶与银色隔珠描述的设计示意，与 Amethyst Peace 共用；移除旧相册错配 |
| Amethyst Peace Bracelet | /products/p01.jpg | 按文字规格重做；移除旧相册错配 |
| Strawberry Quartz Bracelet | /products/p02.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Rose Quartz Bracelet | /products/p03.jpg | 旧图为金色耳饰；当前隐藏图片并显示待补图状态，等待粉晶专属示意图 |
| Obsidian Guard Phone Charm | /products/p04.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Mixed Crystal Bracelet | /products/p06.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Lotus Jade Bracelet | /products/p09.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Cinnabar Cord Phone Charm | /products/p15.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Turquoise Sky Bracelet | /products/p19.jpg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Amethyst Drop Earrings | /products/placeholder-01.svg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Citrine Abundance Bracelet | /products/placeholder-01.svg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Howlite Turquoise Bracelet | /products/placeholder-01.svg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |
| Hematite Men's Bracelet | /products/placeholder-01.svg | 生成图与“matte”描述不符；当前隐藏图片并显示待补图状态 |
| Unakite Balance Bracelet | /products/placeholder-01.svg | 按该款文字规格独立重做；移除旧相册错配；新图路径按商品 slug 唯一绑定 |

## 字节完全相同的图片

- 1782366103303-8op2lp.jpg, p01.jpg
- p03.jpg, p14.jpg, p15.jpg
- p05.jpg, p10.jpg, p13.jpg
- p06.jpg, p08.jpg, p11.jpg
- p07.jpg, p16.jpg
- p09.jpg, p12.jpg, p20.jpg
- p17.jpg, p19.jpg

## 内容页

此前博客没有实际 heroImage 图片；礼品指南等页面复用商品图，因此会继承商品错配。本次新增搭配、送礼、保养 3 张专用内容图，首页文章卡、博客列表、文章页和礼品指南共用同一语义映射。其他文章没有合适的图时不硬塞配图。

占位 SVG：5 款商品都引用 placeholder-01.svg，全部替换为独立设计图。placeholder-02.svg 与 placeholder-03.svg 未被当前商品目录引用。

## 2026-11-19 复核

2026-08-03 的目录备份含 22 条商品记录。仓库的「产品图片」文件没有可用于确认商品实物的来源说明或 SKU 对照。当前 Amethyst Calm 使用独立的方形示意图，Amethyst Peace 沿用原图。两款现有记录均列出 8 毫米紫水晶圆珠、银色饰珠和弹力绳，插图不用于确认两款实物的差别。
