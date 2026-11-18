'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Tag,
  Popconfirm,
  message,
  Card,
  Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, PictureOutlined } from '@ant-design/icons';
import { ProductImagesModal } from '@/components/admin/product-images-modal';
import { CatalogIntakeModal } from '@/components/admin/catalog-intake-modal';
import {
  getAllProducts,
  getProductById,
  getStudioDraftOptions,
  createStudioProductDraft,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCollections,
} from '@/lib/admin-actions';
import type { AddCatalogProduct } from '@/lib/product-maintenance';
import type { TableColumnsType } from 'antd';

const { Text } = Typography;
type ProductRow = Awaited<ReturnType<typeof getAllProducts>>[number];
type ProductEditor = Awaited<ReturnType<typeof getProductById>>;
type StudioOptions = Awaited<ReturnType<typeof getStudioDraftOptions>>;
type VariantForm = { name: string; priceUsd?: number | null };
type ProductForm = Omit<AddCatalogProduct['fields'], 'basePriceCents' | 'compareAtPriceCents' | 'materials'> & {
  priceUsd: number;
  compareAtUsd?: number | null;
  materialsText?: string;
  initialStock: number;
  stockBySku?: Record<string, number>;
  variantDetails?: Record<string, VariantForm>;
  newVariants?: (VariantForm & { sku: string; quantity: number })[];
  sku?: string;
};

function initialProductForm(editor: ProductEditor | null): Partial<ProductForm> {
  if (!editor) return { category: 'bracelet', status: 'draft', isFeatured: false, priceUsd: 0, initialStock: 0 };
  const { product, variants } = editor;
  return {
    ...product,
    priceUsd: product.basePriceCents / 100,
    compareAtUsd: product.compareAtPriceCents == null ? null : product.compareAtPriceCents / 100,
    materialsText: product.materials?.join('\n'),
    initialStock: 0,
    stockBySku: Object.fromEntries(variants.map(({ id, quantity }) => [id, quantity])),
    variantDetails: Object.fromEntries(variants.map(({ id, name, priceCents }) => [
      id, { name, priceUsd: priceCents == null ? null : priceCents / 100 },
    ])),
  };
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [collections, setCollections] = useState<Awaited<ReturnType<typeof getAllCollections>>>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductEditor | null>(null);
  const [saving, setSaving] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [studioLoading, setStudioLoading] = useState(false);
  const [studioOptions, setStudioOptions] = useState<StudioOptions>([]);
  const [studioSlug, setStudioSlug] = useState<string>();
  const [imagesModal, setImagesModal] = useState<{ productId: string; productName: string } | null>(null);
  const [form] = Form.useForm<ProductForm>();
  const [messageApi, msgCtx] = message.useMessage();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cols] = await Promise.all([getAllProducts(), getAllCollections()]);
      setProducts(prods);
      setCollections(cols);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      const editor = await getProductById(id);
      setEditing(editor);
      setModalOpen(true);
    } catch {
      messageApi.error('无法读取商品。请刷新后重试。');
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields().catch(() => undefined);
    if (!values) return;
    const { priceUsd, compareAtUsd, materialsText, initialStock, stockBySku, variantDetails, newVariants, sku, ...product } = values;
    const fields = {
      ...product,
      slug: values.slug || slugify(values.name),
      collectionId: values.collectionId ?? null,
      heritage: values.heritage?.trim() || null,
      basePriceCents: Math.round(priceUsd * 100),
      compareAtPriceCents: compareAtUsd == null ? null : Math.round(compareAtUsd * 100),
      materials: materialsText?.split('\n').map((item) => item.trim()).filter(Boolean) ?? null,
    };
    setSaving(true);
    try {
      const stockEdits = editing?.variants.flatMap(({ id, quantity }) => {
        const desired = stockBySku?.[id];
        return desired !== undefined && desired !== quantity ? [{ variantId: id, quantity: desired, expectedQuantity: quantity }] : [];
      });
      const variantEdits = editing?.variants.flatMap(({ id, name, priceCents }) => {
        const detail = variantDetails?.[id];
        if (!detail) return [];
        const nextName = detail.name.trim();
        const nextPrice = detail.priceUsd == null ? null : Math.round(detail.priceUsd * 100);
        return nextName !== name || nextPrice !== priceCents ? [{
          variantId: id, name: nextName, priceCents: nextPrice, expectedName: name, expectedPriceCents: priceCents,
        }] : [];
      });
      const additions = newVariants?.map(({ sku, name, priceUsd, quantity }) => ({
        sku: sku.trim(), name: name.trim(), priceCents: priceUsd == null ? null : Math.round(priceUsd * 100), quantity,
      }));
      const result = editing ? await updateProduct(editing.product.id, {
        fields, stockEdits, variantEdits, newVariants: additions, initialStock: editing.variants.length ? undefined : initialStock,
      })
        : await createProduct({ fields, initialStock, sku: sku?.trim() || undefined });
      if (!result.ok) {
        messageApi.error(result.error);
        return;
      }
      messageApi.success(editing ? '商品已更新' : '商品已创建');
      setModalOpen(false);
      await loadData();
    } catch {
      messageApi.error('操作失败。请刷新后重试。');
    } finally {
      setSaving(false);
    }
  };

  const openStudio = async () => {
    setStudioSlug(undefined);
    setStudioLoading(true);
    setStudioOpen(true);
    try {
      setStudioOptions(await getStudioDraftOptions());
    } catch {
      setStudioOptions([]);
      messageApi.error('无法读取设计预览。请重新打开。');
    } finally {
      setStudioLoading(false);
    }
  };

  const submitStudio = async () => {
    if (!studioSlug) return;
    setSaving(true);
    try {
      const result = await createStudioProductDraft(studioSlug);
      if (!result.ok) {
        messageApi.error(result.error);
        return;
      }
      setStudioOpen(false);
      messageApi.success('草稿已建立。请补充实物资料。');
      await loadData();
      await openEdit(result.id);
    } catch {
      messageApi.error('无法建立草稿。请刷新后重试。');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    messageApi.success('商品已删除');
    loadData();
  };

  const toggleStatus = async (record: ProductRow) => {
    const newStatus = record.status === 'active' ? 'archived' : 'active';
    const result = await updateProduct(record.id, { fields: { status: newStatus } });
    if (!result.ok) {
      messageApi.error(result.error);
      return;
    }
    messageApi.success(newStatus === 'active' ? '已上架' : '已下架');
    loadData();
  };

  const columns: TableColumnsType<ProductRow> = [
    {
      title: '商品名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          {r.subtitle && <Text type="secondary" style={{ fontSize: 12 }}>{r.subtitle}</Text>}
        </Space>
      ),
    },
    { title: '系列', dataIndex: 'collectionName', key: 'collection', render: (v: string) => v || '-' },
    {
      title: '品类',
      dataIndex: 'category',
      key: 'category',
      render: (c: string) => {
        const map: Record<string, string> = {
          'phone-charm': '手机挂链',
          necklace: '项链',
          bracelet: '手链',
          earrings: '耳钉',
        };
        return map[c] || c;
      },
    },
    {
      title: '价格',
      dataIndex: 'basePriceCents',
      key: 'price',
      render: (cents: number, r) => (
        <Space direction="vertical" size={0}>
          <Text>${(cents / 100).toFixed(2)}</Text>
          {r.compareAtPriceCents != null && (
            <Text delete type="secondary" style={{ fontSize: 12 }}>
              ${(r.compareAtPriceCents / 100).toFixed(2)}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (s: number) => (
        <Tag color={s === 0 ? 'red' : s <= 5 ? 'orange' : 'green'}>{s}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        const map: Record<string, { color: string; text: string }> = {
          active: { color: 'success', text: '在售' },
          draft: { color: 'default', text: '草稿' },
          archived: { color: 'warning', text: '已下架' },
        };
        const cfg = map[s] || map.draft;
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record.id)}>编辑</Button>
          <Button size="small" icon={<PictureOutlined />} onClick={() => setImagesModal({ productId: record.id, productName: record.name })}>图片</Button>
          <Button size="small" onClick={() => toggleStatus(record)}>
            {record.status === 'active' ? '下架' : '上架'}
          </Button>
          <Popconfirm title="确定删除此商品?" onConfirm={() => handleDelete(record.id)} okText="删除" cancelText="取消">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {msgCtx}
      <Card
        title={<span style={{ fontFamily: 'Fraunces, serif' }}>商品管理</span>}
        extra={
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
            <Button onClick={() => setIntakeOpen(true)}>批量导入</Button>
            <Button onClick={openStudio}>从设计预览建草稿</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增商品</Button>
          </Space>
        }
      >
        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </Card>

      {intakeOpen && <CatalogIntakeModal onClose={() => setIntakeOpen(false)} onSaved={({ drafts, published, photos }) => {
        setIntakeOpen(false);
        messageApi.success(`已应用批次。草稿 ${drafts} 款，上架 ${published} 款，实拍 ${photos} 张。`);
        void loadData();
      }} />}

      <Modal
        title="从设计预览建草稿"
        open={studioOpen}
        onOk={submitStudio}
        onCancel={() => setStudioOpen(false)}
        okText="建立草稿"
        cancelText="取消"
        confirmLoading={saving}
        okButtonProps={{ disabled: !studioSlug || studioLoading }}
      >
        <p className="mb-4 text-sm text-muted">草稿会沿用设计名称、系列和原网址。填入实物资料和库存后，可将状态设为在售。</p>
        <Select
          aria-label="选择设计预览"
          className="w-full"
          loading={studioLoading}
          placeholder="按名称或系列查找"
          showSearch={{ optionFilterProp: 'label' }}
          value={studioSlug}
          onChange={setStudioSlug}
          options={studioOptions.map(({ slug, name, collectionName }) => ({ value: slug, label: `${name} · ${collectionName}` }))}
        />
      </Modal>

      {modalOpen && <Modal
        title={editing ? '编辑商品' : '新增商品'}
        open
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={640}
        okText="保存"
        cancelText="取消"
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" clearOnDestroy initialValues={initialProductForm(editing)}>
          <Form.Item name="name" label="商品名" rules={[{ required: true }]}>
            <Input placeholder="例:Amethyst Peace Bracelet" />
          </Form.Item>
          <Form.Item name="subtitle" label="副标题">
            <Input placeholder="例:Natural amethyst · the stone of calm" />
          </Form.Item>
          <Form.Item name="slug" label="商品网址标识" tooltip={editing?.studioDesign ? '保留设计预览的原网址。' : '可从商品名自动生成。'}>
            <Input readOnly={editing?.studioDesign} placeholder="amethyst-peace-bracelet" />
          </Form.Item>
          <Space style={{ display: 'flex' }}>
            <Form.Item name="category" label="品类" rules={[{ required: true }]} style={{ width: 160 }}>
              <Select
                options={[
                  { value: 'bracelet', label: '手链' },
                  { value: 'necklace', label: '项链' },
                  { value: 'phone-charm', label: '手机挂链' },
                  { value: 'earrings', label: '耳钉' },
                ]}
              />
            </Form.Item>
            <Form.Item name="heritage" label="文化来源" style={{ width: 160 }}>
              <Select
                allowClear
                options={[
                  { value: 'tibetan', label: '藏' },
                  { value: 'mongol', label: '蒙古' },
                  { value: 'southwest', label: '西南' },
                  { value: 'tai', label: '泰' },
                  { value: 'han', label: '汉' },
                  { value: 'fusion', label: '融合' },
                ]}
              />
            </Form.Item>
            <Form.Item name="collectionId" label="系列" style={{ width: 200 }}>
              <Select
                allowClear
                options={collections.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }}>
            <Form.Item name="priceUsd" label="售价 (USD)" rules={[{ required: true }]}>
              <InputNumber min={0} precision={2} style={{ width: 140 }} prefix="$" />
            </Form.Item>
            <Form.Item name="compareAtUsd" label="划线价 (USD)" tooltip="制造折扣感,留空则无">
              <InputNumber min={0} precision={2} style={{ width: 140 }} prefix="$" />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="简短描述">
            <Input.TextArea rows={2} placeholder="Natural amethyst beads hand-strung with Miao silver accents." />
          </Form.Item>
          <Form.Item name="craftStory" label="工艺故事" tooltip="详情页的 Craft Story 区块">
            <Input.TextArea rows={3} placeholder="Amethyst has been worn for calm across cultures..." />
          </Form.Item>
          <Form.Item name="materialsText" label="实物材质（每行一项）">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="careNotes" label="保养说明">
            <Input.TextArea rows={2} />
          </Form.Item>
          {editing?.variants.length ? (
            <div className="space-y-3">
              {editing.variants.map(({ id, sku, reserved }) => (
                <fieldset key={id} className="grid gap-x-3 border border-border px-3 sm:grid-cols-3">
                  <legend className="px-2 font-medium">{sku}</legend>
                  <Form.Item name={['variantDetails', id, 'name']} label="规格名称" rules={[{ required: true, whitespace: true }]}>
                    <Input maxLength={160} />
                  </Form.Item>
                  <Form.Item name={['variantDetails', id, 'priceUsd']} label="规格价 (USD)">
                    <InputNumber min={0.01} precision={2} placeholder="使用商品售价" className="w-full" />
                  </Form.Item>
                  <Form.Item name={['stockBySku', id]} label="库存" extra={`待付款预留 ${reserved} 件`} rules={[{ required: true }]}>
                    <InputNumber min={reserved} precision={0} className="w-full" />
                  </Form.Item>
                </fieldset>
              ))}
            </div>
          ) : (
            <Space wrap>
              {!editing && <Form.Item name="sku" label="SKU" tooltip="可按商品网址自动生成。"><Input /></Form.Item>}
              <Form.Item name="initialStock" label="初始库存" rules={[{ required: true }]}>
                <InputNumber min={0} precision={0} />
              </Form.Item>
            </Space>
          )}
          {editing && (
            <Form.List name="newVariants">
              {(items, { add, remove }) => (
                <div className="my-4 space-y-3">
                  {items.map(({ key, name }, index) => (
                    <fieldset key={key} className="grid gap-x-3 border border-border px-3 sm:grid-cols-2">
                      <legend className="px-2 font-medium">新增规格 {index + 1}</legend>
                      <Form.Item name={[name, 'sku']} label="新 SKU" rules={[{ required: true, whitespace: true }]}>
                        <Input maxLength={160} />
                      </Form.Item>
                      <Form.Item name={[name, 'name']} label="新规格名称" rules={[{ required: true, whitespace: true }]}>
                        <Input maxLength={160} />
                      </Form.Item>
                      <Form.Item name={[name, 'priceUsd']} label="新规格价 (USD)">
                        <InputNumber min={0.01} precision={2} placeholder="使用商品售价" className="w-full" />
                      </Form.Item>
                      <Form.Item name={[name, 'quantity']} label="新规格库存" rules={[{ required: true }]}>
                        <InputNumber min={0} precision={0} className="w-full" />
                      </Form.Item>
                      <Button className="mb-3 w-fit" onClick={() => remove(name)}>移除此规格</Button>
                    </fieldset>
                  ))}
                  <Button icon={<PlusOutlined />} onClick={() => add({ quantity: 0 })}>添加 SKU 规格</Button>
                </div>
              )}
            </Form.List>
          )}
          <Space style={{ display: 'flex' }}>
            <Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'draft', label: '草稿' },
                  { value: 'active', label: '在售' },
                  { value: 'archived', label: '已下架' },
                ]}
              />
            </Form.Item>
            <Form.Item name="isFeatured" label="首页推荐" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>}

      {/* 图片管理 Modal */}
      <ProductImagesModal
        productId={imagesModal?.productId ?? null}
        productName={imagesModal?.productName ?? ''}
        open={!!imagesModal}
        onClose={() => setImagesModal(null)}
      />
    </div>
  );
}

// 工具: 生成 slug
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
