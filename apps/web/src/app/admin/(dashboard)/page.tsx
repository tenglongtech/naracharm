'use client';

import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Alert, Spin, Empty } from 'antd';
import {
  ShoppingOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  DollarOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { getDashboardStats, getAllProducts, getAllOrders } from '@/lib/admin-actions';

type Stats = Awaited<ReturnType<typeof getDashboardStats>>;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, allProducts, orders] = await Promise.all([
          getDashboardStats(),
          getAllProducts(),
          getAllOrders(),
        ]);
        setStats(s);
        setLowStockProducts(allProducts.filter((p: any) => p.stock <= 10));
        setRecentOrders(orders.slice(0, 5));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: 24 }}>仪表盘</h2>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={stats.productCount}
              prefix={<ShoppingOutlined style={{ color: '#C4745A' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={stats.orderCount}
              prefix={<ShoppingCartOutlined style={{ color: '#3A2E2B' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="顾客总数"
              value={stats.customerCount}
              prefix={<TeamOutlined style={{ color: '#D4AF37' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="销售额 (USD)"
              value={stats.revenueCents / 100}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 低库存预警 */}
      {stats.lowStock > 0 && (
        <Alert
          style={{ marginTop: 24 }}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message={`${stats.lowStock} 个商品库存不足,请及时补货`}
          description={
            lowStockProducts.length > 0 ? (
              <span>
                低库存商品:
                {lowStockProducts.slice(0, 5).map((p) => ` ${p.name} (${p.stock})`).join(' · ')}
              </span>
            ) : null
          }
        />
      )}

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* 最近订单 */}
        <Col xs={24} lg={14}>
          <Card title="最近订单" size="small">
            {recentOrders.length > 0 ? (
              <Table
                dataSource={recentOrders}
                rowKey="id"
                size="small"
                pagination={false}
                columns={[
                  { title: '订单号', dataIndex: 'number', key: 'number' },
                  {
                    title: '金额',
                    dataIndex: 'totalCents',
                    key: 'total',
                    render: (c: number) => `$${(c / 100).toFixed(2)}`,
                  },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    render: (s: string) => {
                      const colors: Record<string, string> = {
                        pending: 'default',
                        paid: 'processing',
                        fulfilled: 'success',
                        cancelled: 'error',
                      };
                      return <Tag color={colors[s] || 'default'}>{s}</Tag>;
                    },
                  },
                ]}
              />
            ) : (
              <Empty description="暂无订单" />
            )}
          </Card>
        </Col>

        {/* 快捷信息 */}
        <Col xs={24} lg={10}>
          <Card title="店铺状态" size="small">
            <Statistic title="活跃优惠券" value={stats.activeDiscounts} />
            <div style={{ marginTop: 16, color: '#999', fontSize: 12 }}>
              最后更新: {new Date().toLocaleString('zh-CN')}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
