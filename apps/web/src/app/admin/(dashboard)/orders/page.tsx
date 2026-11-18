'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, Empty, Form, Input, Modal, Radio, Table, Tag, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { getAllOrders } from '@/lib/admin-actions';
import { adminOrderShipments, notifyAdminShipment, saveAdminShipment } from '@/lib/admin-order-fulfillment';
import type { AdminShipment } from '@/lib/order-fulfillment';

const { Text } = Typography;
type OrderRow = Awaited<ReturnType<typeof getAllOrders>>[number];
type ShipmentFields = { carrier: string; trackingNumber: string; trackingUrl?: string; state: 'partial' | 'complete' };

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [shipments, setShipments] = useState<AdminShipment[]>([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [form] = Form.useForm<ShipmentFields>();

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

  async function openShipments(order: OrderRow) {
    setSelected(order);
    setShipments([]);
    setFeedback(null);
    setBusy(true);
    try {
      setShipments(await adminOrderShipments(order.id));
    } catch {
      setFeedback({ type: 'error', text: '无法读取物流记录。关闭后可重新打开。' });
    } finally {
      setBusy(false);
    }
  }

  async function saveShipment(fields: ShipmentFields) {
    if (!selected) return;
    const { id: orderId } = selected;
    setBusy(true);
    setFeedback(null);
    try {
      const { state, ...draft } = fields;
      const result = await saveAdminShipment({ orderId, ...draft, complete: state === 'complete' });
      if (!result.ok) {
        setFeedback({ type: 'error', text: result.error });
        return;
      }
      form.resetFields();
      setFeedback({ type: 'success', text: result.existed ? '已使用这张运单的现有物流记录。' : '物流已保存，顾客可以查看。' });
      await load();
      setShipments(await adminOrderShipments(orderId));
    } catch {
      setFeedback({ type: 'error', text: '无法确认最新物流状态。请重新打开核对。' });
    } finally {
      setBusy(false);
    }
  }

  async function notify(shipmentId: string) {
    if (!selected) return;
    setBusy(true);
    setFeedback(null);
    try {
      const result = await notifyAdminShipment(shipmentId);
      if (!result.ok) {
        setFeedback({ type: 'error', text: result.error });
        return;
      }
      if (result.status === 'unconfigured') {
        setFeedback({ type: 'warning', text: '邮件服务尚未配置，物流记录已保存。' });
        return;
      }
      setShipments(await adminOrderShipments(selected.id));
      setFeedback({ type: 'success', text: '发货通知已提交给邮件服务。' });
    } catch {
      setFeedback({ type: 'error', text: '无法确认邮件状态。请核对记录后重试。' });
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    { title: '订单号', dataIndex: 'number', key: 'number', render: (v: string) => <Text strong>{v}</Text> },
    { title: '顾客邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '金额',
      dataIndex: 'totalCents',
      key: 'total',
      render: (c: number, r: OrderRow) => `${r.currency} ${(c / 100).toFixed(2)}`,
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
    {
      title: '操作', key: 'actions',
      render: (_value: unknown, order: OrderRow) => <Button onClick={() => void openShipments(order)}>查看物流</Button>,
    },
  ];

  const mayShip = selected && ['paid', 'fulfilled'].includes(selected.status)
    && ['paid', 'partially_refunded'].includes(selected.paymentStatus);

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
      <Modal
        title={selected ? `订单 ${selected.number} 的物流` : '订单物流'}
        open={Boolean(selected)} onCancel={() => { if (!busy) setSelected(null); }}
        closable={!busy} mask={{ closable: !busy }} footer={null} width={640}
      >
        {feedback && <Alert className="mb-4" type={feedback.type} title={feedback.text} showIcon />}
        {shipments.length > 0 ? (
          <ul className="mb-5 divide-y divide-border">
            {shipments.map((shipment) => (
              <li key={shipment.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <strong>{shipment.carrier}</strong>
                  <p className="break-words text-sm">{shipment.trackingNumber}</p>
                </div>
                {shipment.noticeSent ? <Tag color="success">通知已提交</Tag>
                  : <Button disabled={busy || !mayShip} onClick={() => void notify(shipment.id)}>发送发货通知</Button>}
              </li>
            ))}
          </ul>
        ) : <p className="mb-4 text-sm text-muted">{busy ? '正在读取物流记录…' : '暂无物流记录。'}</p>}

        {mayShip && (
          <Form layout="vertical" form={form} onFinish={saveShipment} disabled={busy} preserve={false}>
            <Form.Item label="承运商" name="carrier" rules={[{ required: true, whitespace: true }]}>
              <Input maxLength={80} />
            </Form.Item>
            <Form.Item label="运单号" name="trackingNumber" rules={[{ required: true, whitespace: true }]}>
              <Input maxLength={120} />
            </Form.Item>
            <Form.Item label="HTTPS 物流网址（可选）" name="trackingUrl">
              <Input maxLength={1200} />
            </Form.Item>
            <Form.Item label="发货进度" name="state" rules={[{ required: true }]}>
              <Radio.Group options={[{ value: 'partial', label: '还有商品待发货' }, { value: 'complete', label: '全部商品已发出' }]} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={busy}>保存物流</Button>
          </Form>
        )}
      </Modal>
    </Card>
  );
}
