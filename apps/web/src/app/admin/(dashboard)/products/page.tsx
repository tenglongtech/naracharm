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
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCollections,
} from '@/lib/admin-actions';

const { Text } = Typography;

export default function ProductsAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [imagesModal, setImagesModal] = useState<{ productId: string; productName: string } | null>(null);
  const [form] = Form.useForm();
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
    form.resetFields();
    form.setFieldsValue({ category: 'bracelet', status: 'draft', isFeatured: false, basePriceCents: 3800 });
    setModalOpen(true);
  };

  const openEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      basePriceCents: record.basePriceCents,
      compareAtPriceCents: record.compareAtPriceCents,
      collectionId: record.collectionId,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 价格转整数分
      const data = {
        ...values,
        slug: values.slug || slugify(values.name),
        basePriceCents: Math.round(values.priceUsd * 100),
        compareAtPriceCents: values.compareAtUsd ? Math.round(values.compareAtUsd * 100) : null,
      };
      delete (data as any).priceUsd;
      delete (data as any).compareAtUsd;

      if (editing) {
        await updateProduct(editing.id, data);
        messageApi.success('商品已更新');
      } else {
        await createProduct(data);
        messageApi.success('商品已创建');
      }
      setModalOpen(false);
      loadData();
    } catch (e: any) {
      if (e?.errorFields) return; // 表单校验失败,不关弹窗
      messageApi.error('操作失败: ' + (e?.message || '未知错误'));
    }
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    messageApi.success('商品已删除');
    loadData();
  };

  const toggleStatus = async (record: any) => {
    const newStatus = record.status === 'active' ? 'archived' : 'active';
    await updateProduct(record.id, { status: newStatus });
    messageApi.success(newStatus === 'active' ? '已上架' : '已下架');
    loadData();
  };

  const columns = [
    {
      title: '商品名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, r: any) => (
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
      render: (cents: number, r: any) => (
        <Space direction="vertical" size={0}>
          <Text>${(cents / 100).toFixed(2)}</Text>
          {r.compareAtPriceCents && (
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
      render: (_: any, record: any) => (
        <Space size="small" wrap>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
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
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
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

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editing ? '编辑商品' : '新增商品'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={640}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="商品名" rules={[{ required: true }]}>
            <Input placeholder="例:Amethyst Peace Bracelet" />
          </Form.Item>
          <Form.Item name="subtitle" label="副标题">
            <Input placeholder="例:Natural amethyst · the stone of calm" />
          </Form.Item>
          <Form.Item name="slug" label="URL标识(slug)" tooltip="留空将自动从商品名生成">
            <Input placeholder="amethyst-peace-bracelet" />
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
      </Modal>

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
