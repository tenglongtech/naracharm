# 数据模型 Schema 设计

> 用 Drizzle ORM + PostgreSQL (Neon)。
> 本文件是设计说明（字段含义/关系），实际可运行代码见 `schema.ts`。

## 实体关系总览

```
Collection (1) ───< (N) Product (1) ───< (N) ProductVariant (SKU)
                         │                      │
                         │                      └──< (N) VariantImage
                         │                      └──< (1) Inventory
                         │
                         └──< (N) ProductImage

Customer (1) ───< (N) Order (1) ───< (N) OrderLine >── ProductVariant
                  │
                  ├──< (N) OrderFulfillment（发货记录）
                  └──< (N) OrderEvent（状态变更日志）

Cart (1) ───< (N) CartLine >── ProductVariant

Discount（优惠券）─< Order（应用记录）

Category：手机挂链 / 项链 / 手链 / 耳钉（枚举）
```

---

## 核心表

### 1. `categories` —— 类别（枚举型，预置 4 类）

实际上做成**枚举常量**而非表，避免过度设计：

```ts
export const PRODUCT_CATEGORIES = [
  'phone-charm',   // 手机挂链
  'necklace',      // 项链
  'bracelet',      // 手链
  'earrings',      // 耳钉
] as const;
```

### 2. `collections` —— 系列（如"藏银系列""蒙古编绳系列"）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| slug | text unique | URL 友好标识 |
| name | text | 系列名 |
| description | text | 系列描述（含文化叙事） |
| heritage | text | 文化来源（tibetan/mongol/tai/southwest/han/fusion） |
| image_url | text | 系列封面 |
| sort_order | int | 排序 |
| is_featured | bool | 是否首页推荐 |
| created_at / updated_at | timestamptz | |

### 3. `products` —— 商品（SPU）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| slug | text unique | |
| name | text | 商品名 |
| subtitle | text | 副标题 |
| description | text | 详细描述（含工艺故事） |
| category | enum | phone-charm/necklace/bracelet/earrings |
| collection_id | uuid FK → collections | 所属系列（可空） |
| heritage | text | 主文化来源 |
| materials | text[] | 材质（925银/黄铜/丝绸/编绳...） |
| base_price_cents | int | 基础价格（分，USD） |
| compare_at_price_cents | int | 划线价（制造折扣感） |
| status | enum | draft/active/archived |
| is_featured | bool | 首页推荐 |
| craft_story | text | 工艺故事（视频/详情页用） |
| care_notes | text | 保养说明 |
| seo_title / seo_description | text | SEO 元数据 |
| created_at / updated_at | timestamptz | |

### 4. `product_variants` —— 商品变体（SKU）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| product_id | uuid FK → products | |
| sku | text unique | 库存编码 |
| name | text | 变体名（如"红绳版""银色版"） |
| options | jsonb | 规格选项（颜色/尺寸/材质） |
| price_cents | int | 该变体价格（覆盖 base_price） |
| weight_grams | int | 重量（算运费用） |
| created_at / updated_at | timestamptz | |

### 5. `inventory` —— 库存（与变体 1:1）

| 字段 | 类型 | 说明 |
|---|---|---|
| variant_id | uuid PK/FK → product_variants | |
| quantity | int | 可售库存 |
| reserved | int | 已锁定（下单未付款） |
| allow_backorder | bool | 是否允许缺货下单（预售） |
| low_stock_threshold | int | 低库存阈值（后台提醒） |
| updated_at | timestamptz | |

> **库存计算**：可售 = `quantity - reserved`。用 Postgres 行锁保证并发安全。

### 6. `product_images` / `variant_images` —— 图片

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| product_id / variant_id | uuid FK | |
| url | text | CDN/Payload Media URL |
| alt_text | text | 无障碍+SEO |
| sort_order | int | |
| is_primary | bool | 主图 |

---

## 交易相关表

### 7. `customers` —— 客户

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| email | text unique | |
| first_name / last_name | text | |
| auth_user_id | text | 关联 Better Auth 用户（可空，游客下单） |
| default_shipping_address_id | uuid FK → addresses | |
| created_at / updated_at | timestamptz | |

### 8. `addresses` —— 地址

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| customer_id | uuid FK | |
| line1 / line2 / city / state / postal_code / country_code | text | |
| phone | text | |
| is_default | bool | |

### 9. `orders` —— 订单

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| number | text unique | 人类可读订单号（如 SS-10001） |
| customer_id | uuid FK（可空，游客） | |
| email | text | 下单邮箱（即使游客也要） |
| status | enum | pending/paid/fulfilled/cancelled/refunded |
| payment_status | enum | unpaid/paid/refunded/partially_refunded |
| fulfillment_status | enum | unfulfilled/partial/fulfilled |
| currency | text | USD |
| subtotal_cents / shipping_cents / tax_cents / discount_cents / total_cents | int | 金额拆分 |
| shipping_address | jsonb | 下单时快照 |
| billing_address | jsonb | |
| stripe_checkout_session_id | text | |
| stripe_payment_intent_id | text | |
| discount_id | uuid FK（可空） | |
| placed_at / paid_at / fulfilled_at | timestamptz | |
| created_at / updated_at | timestamptz | |

### 10. `order_lines` —— 订单明细

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK | |
| variant_id | uuid FK（可软引用，订单后商品可能下架） | |
| product_name | text | 快照（防商品改名） |
| variant_name | text | 快照 |
| sku | text | 快照 |
| unit_price_cents | int | 下单时价格快照 |
| quantity | int | |
| image_url | text | 快照 |

### 11. `order_fulfillments` —— 发货记录

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK | |
| carrier | text | 4PX/EMS/DHL/... |
| tracking_number | text | |
| tracking_url | text | |
| shipped_at | timestamptz | |

### 12. `order_events` —— 订单事件日志

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK | |
| type | text | status_changed/payment_received/... |
| payload | jsonb | |
| created_at | timestamptz | |

---

## 购物车

### 13. `carts` / `cart_lines`

| carts 字段 | 说明 |
|---|---|
| id | uuid PK |
| customer_id | FK（可空） |
| guest_token | text（游客购物车 cookie 关联） |
| created_at / updated_at | |

| cart_lines 字段 | 说明 |
|---|---|
| id | uuid PK |
| cart_id | FK |
| variant_id | FK |
| quantity | int |

---

## 营销相关表

### 14. `discounts` —— 优惠券

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| code | text unique | |
| type | enum | percentage/fixed_amount/free_shipping |
| value | int | 百分比(0-100) 或金额(分) |
| min_subtotal_cents | int | 门槛 |
| usage_limit | int | 总用次数（可空） |
| used_count | int | |
| starts_at / ends_at | timestamptz | |
| status | enum | active/expired/disabled |

### 15. `abandoned_carts` —— 弃单挽回追踪

| 字段 | 说明 |
|---|---|
| id | uuid PK |
| cart_id / email | |
| recovery_email_sent_at / recovered_at | |
| created_at | |

---

## 关键设计决策

1. **金额用整数分（cents）**：避免浮点误差，全链路整数运算，展示时 / 100
2. **价格快照**：order_lines 存下单时价格/名称，防商品后续改价/改名/下架影响历史订单
3. **地址快照**：orders 存 jsonb 地址，不引用 addresses 表（地址可删改）
4. **库存并发安全**：扣库存用 Postgres `SELECT ... FOR UPDATE` 行锁
5. **游客下单**：customer_id 可空，靠 email 标识，付款后可邀请注册合并
6. **软引用 variant**：order_lines 存 variant_id 但商品下架不删记录
7. **UUID 主键**：避免自增 ID 暴露订单量，利于隐私与未来分库

---

## 迁移与种子

- `drizzle-kit generate` 生成 migration
- `drizzle-kit migrate` 应用
- `scripts/seed.ts`：预置 4 个类别、示例 collection、demo 商品（开发用）

## 与 Payload CMS 的关系

- 商品/订单/客户表用 **Payload Collection** 管理（Payload 自动建表 + Admin UI）
- Payload 的 Postgres adapter 直连 Neon
- Drizzle 用于 Payload 之外的查询优化（如前台商品页直接 Drizzle 查询，绕过 Payload Local API 以求性能）
- 二者共享同一 Neon 数据库实例
