'use client';

import { useEffect, useState } from 'react';
import { Card, Table, Button, Empty } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { getAllCustomers } from '@/lib/admin-actions';

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setCustomers(await getAllCustomers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    {
      title: '顾客',
      key: 'name',
      render: (_: any, r: any) => `${r.firstName || ''} ${r.lastName || ''}`.trim() || '-',
    },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '订单数', dataIndex: 'orderCount', key: 'orderCount' },
    {
      title: '累计消费',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (c: number) => `$${(c / 100).toFixed(2)}`,
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: Date) => new Date(d).toLocaleDateString('zh-CN'),
    },
  ];

  return (
    <Card
      title={<span style={{ fontFamily: 'Fraunces, serif' }}>顾客管理</span>}
      extra={<Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>}
    >
      <Table
        dataSource={customers}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: <Empty description="暂无顾客。接入会员注册后会有数据。" /> }}
      />
    </Card>
  );
}
