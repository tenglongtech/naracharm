'use client';

import { Button, Card, Space, Typography, Table, Tag } from 'antd';
import { SmileOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * antd 渲染验证页
 * 如果这个页面能正常显示 antd 组件(按钮/卡片/表格),说明 antd 集成成功。
 */
export default function AdminTestPage() {
  return (
    <div style={{ padding: 24, background: '#FAF7F1', minHeight: '100vh' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>
            <SmileOutlined /> Nara Charm 后台 · antd 集成验证
          </Title>
          <Text type="secondary">
            如果你看到这个页面有正常样式(砖红按钮/卡片/表格),说明 antd 在 Next.js 16 下工作正常。
          </Text>

          <Space>
            <Button type="primary" icon={<ShoppingCartOutlined />}>
              主按钮 (砖红)
            </Button>
            <Button>默认按钮</Button>
            <Button danger>危险按钮</Button>
            <Button type="dashed">虚线按钮</Button>
          </Space>

          <Table
            dataSource={[
              { key: '1', name: 'Amethyst Peace Bracelet', price: '$38', stock: 24, status: 'active' },
              { key: '2', name: 'Strawberry Quartz Bracelet', price: '$42', stock: 5, status: 'low' },
              { key: '3', name: 'Obsidian Guard Charm', price: '$28', stock: 0, status: 'out' },
            ]}
            columns={[
              { title: '商品名', dataIndex: 'name', key: 'name' },
              { title: '价格', dataIndex: 'price', key: 'price' },
              { title: '库存', dataIndex: 'stock', key: 'stock' },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (s: string) => {
                  const map: Record<string, { color: string; text: string }> = {
                    active: { color: 'green', text: '在售' },
                    low: { color: 'orange', text: '低库存' },
                    out: { color: 'red', text: '缺货' },
                  };
                  const cfg = map[s] || map.active;
                  return <Tag color={cfg.color}>{cfg.text}</Tag>;
                },
              },
            ]}
            pagination={false}
          />
        </Space>
      </Card>
    </div>
  );
}
