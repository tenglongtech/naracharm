'use client';

import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Empty, Spin, Typography } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { getAllOrders } from '@/lib/admin-actions';

const { Text } = Typography;

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setOrders(await getAllOrders());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { title: '订单号', dataIndex: 'number', key: 'number', render: (v: string) => <Text strong>{v}</Text> },
    { title: '顾客邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '金额',
      dataIndex: 'totalCents',
      key: 'total',
      render: (c: number, r: any) => `${r.currency} ${(c / 100).toFixed(2)}`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        const map: Record<string, { color: string; text: string }> = {
          pending: { color: 'default', text: '待处理' },
          paid: { color: 'processing', text: '已支付' },
          fulfilled: { color: 'success', text: '已发货' },
          cancelled: { color: 'error', text: '已取消' },
          refunded: { color: 'warning', text: '已退款' },
        };
        const cfg = map[s] || map.pending;
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'payment',
      render: (s: string) => {
        const map: Record<string, string> = {
          unpaid: 'default',
          paid: 'success',
          refunded: 'warning',
          partially_refunded: 'warning',
        };
        return <Tag color={map[s] || 'default'}>{s}</Tag>;
      },
    },
    {
      title: '物流',
      dataIndex: 'fulfillmentStatus',
      key: 'fulfillment',
      render: (s: string) => {
        const map: Record<string, { color: string; text: string }> = {
          unfulfilled: { color: 'default', text: '未发货' },
          partial: { color: 'processing', text: '部分发货' },
          fulfilled: { color: 'success', text: '已发货' },
        };
        const cfg = map[s] || map.unfulfilled;
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: Date) => new Date(d).toLocaleString('zh-CN'),
    },
  ];

  return (
    <Card
      title={<span style={{ fontFamily: 'Fraunces, serif' }}>订单管理</span>}
      extra={
        <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
      }
    >
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 900 }}
        locale={{ emptyText: <Empty description="暂无订单。去前台下一单测试吧!" /> }}
      />
    </Card>
  );
}
