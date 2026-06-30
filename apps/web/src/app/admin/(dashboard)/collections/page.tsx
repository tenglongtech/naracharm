'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Popconfirm,
  message,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAllCollections, createCollection, updateCollection, deleteCollection } from '@/lib/admin-actions';

export default function CollectionsAdmin() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [messageApi, msgCtx] = message.useMessage();

  const load = async () => {
    setLoading(true);
    try {
      setCollections(await getAllCollections());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isFeatured: false, sortOrder: 0, heritage: 'fusion' });
    setModalOpen(true);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    form.setFieldsValue(r);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const data = { ...values, slug: values.slug || slugify(values.name) };
    if (editing) {
      await updateCollection(editing.id, data);
      messageApi.success('系列已更新');
    } else {
      await createCollection(data);
      messageApi.success('系列已创建');
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteCollection(id);
    messageApi.success('系列已删除');
    load();
  };

  const columns = [
    { title: '系列名', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    {
      title: '文化',
      dataIndex: 'heritage',
      key: 'heritage',
      render: (h: string) => <Tag>{h}</Tag>,
    },
    { title: '商品数', dataIndex: 'productCount', key: 'productCount' },
    {
      title: '推荐',
      dataIndex: 'isFeatured',
      key: 'featured',
      render: (f: boolean) => (f ? <Tag color="gold">推荐</Tag> : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
          <Popconfirm title="删除此系列?系列下商品不会被删除。" onConfirm={() => handleDelete(r.id)}>
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
        title={<span style={{ fontFamily: 'Fraunces, serif' }}>系列管理</span>}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增系列</Button>
          </Space>
        }
      >
        <Table dataSource={collections} columns={columns} rowKey="id" loading={loading} pagination={false} />
      </Card>

      <Modal
        title={editing ? '编辑系列' : '新增系列'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="系列名" rules={[{ required: true }]}>
            <Input placeholder="Crystal Collection" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" tooltip="留空自动生成">
            <Input placeholder="crystal" />
          </Form.Item>
          <Form.Item name="heritage" label="文化来源">
            <Select
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
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序" initialValue={0}>
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="isFeatured" label="首页推荐" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
