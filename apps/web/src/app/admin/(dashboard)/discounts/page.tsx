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
  InputNumber,
  Select,
  DatePicker,
  Popconfirm,
  message,
  Tag,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAllDiscounts, createDiscount, deleteDiscount } from '@/lib/admin-actions';

export default function DiscountsAdmin() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, msgCtx] = message.useMessage();

  const load = async () => {
    setLoading(true);
    try {
      setDiscounts(await getAllDiscounts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const data = {
      code: values.code.toUpperCase(),
      type: values.type,
      value: values.value,
      minSubtotalCents: values.minUsd ? Math.round(values.minUsd * 100) : null,
      usageLimit: values.usageLimit || null,
      status: 'active' as const,
      startsAt: values.range?.[0] || null,
      endsAt: values.range?.[1] || null,
    };
    await createDiscount(data);
    messageApi.success('优惠券已创建');
    setModalOpen(false);
    form.resetFields();
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteDiscount(id);
    messageApi.success('已删除');
    load();
  };

  const columns = [
    { title: '码', dataIndex: 'code', key: 'code', render: (c: string) => <Tag color="volcano">{c}</Tag> },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (t: string) => ({ percentage: '百分比', fixed_amount: '固定金额', free_shipping: '免邮' }[t] || t),
    },
    {
      title: '优惠值',
      dataIndex: 'value',
      key: 'value',
      render: (v: number, r: any) =>
        r.type === 'percentage' ? `${v}%` : r.type === 'fixed_amount' ? `$${(v / 100).toFixed(2)}` : '免运费',
    },
    {
      title: '门槛',
      dataIndex: 'minSubtotalCents',
      key: 'min',
      render: (c: number) => (c ? `$${(c / 100).toFixed(2)}` : '无'),
    },
    {
      title: '使用次数',
      key: 'usage',
      render: (_: any, r: any) => `${r.usedCount} / ${r.usageLimit || '∞'}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => <Tag color={s === 'active' ? 'success' : 'default'}>{s}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, r: any) => (
        <Popconfirm title="删除此优惠券?" onConfirm={() => handleDelete(r.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      {msgCtx}
      <Card
        title={<span style={{ fontFamily: 'Fraunces, serif' }}>优惠券管理</span>}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
              新建优惠券
            </Button>
          </Space>
        }
      >
        <Table dataSource={discounts} columns={columns} rowKey="id" loading={loading} pagination={false} />
      </Card>

      <Modal
        title="新建优惠券"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="优惠码" rules={[{ required: true }]}>
            <Input placeholder="WELCOME10" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]} initialValue="percentage">
            <Select
              options={[
                { value: 'percentage', label: '百分比折扣' },
                { value: 'fixed_amount', label: '固定金额减免' },
                { value: 'free_shipping', label: '免运费' },
              ]}
            />
          </Form.Item>
          <Form.Item name="value" label="优惠值" rules={[{ required: true }]} tooltip="百分比填 0-100;固定金额填美元">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="minUsd" label="最低消费 (USD)" tooltip="留空则无门槛">
            <InputNumber min={0} prefix="$" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="usageLimit" label="使用次数上限" tooltip="留空则不限">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="range" label="有效期" tooltip="留空则永久有效">
            <DatePicker.RangePicker showTime />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
