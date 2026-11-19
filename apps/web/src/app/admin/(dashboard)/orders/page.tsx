'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, Empty, Form, Input, Modal, Radio, Spin, Table, Tag, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { getAllOrders } from '@/lib/admin-actions';
import { adminOrderDetails, adminOrderShipments, notifyAdminShipment, saveAdminShipment } from '@/lib/admin-order-fulfillment';
import type { AdminShipment } from '@/lib/order-fulfillment';

const { Text } = Typography;
type OrderRow = Awaited<ReturnType<typeof getAllOrders>>[number];
type PackingDetails = NonNullable<Awaited<ReturnType<typeof adminOrderDetails>>>['packing'];
type ShipmentFields = { carrier: string; trackingNumber: string; trackingUrl?: string; state: 'partial' | 'complete' };

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [packing, setPacking] = useState<PackingDetails | null>(null);
  const [shipments, setShipments] = useState<AdminShipment[]>([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [form] = Form.useForm<ShipmentFields>();
  const selected = orders.find((order) => order.id === selectedId);

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

  async function openOrder(orderId: string) {
    setSelectedId(orderId);
    setPacking(null);
    setShipments([]);
    setFeedback(null);
    setBusy(true);
    try {
      const details = await adminOrderDetails(orderId);
      if (!details) {
        setFeedback({ type: 'error', text: '找不到此订单。请刷新订单列表。' });
        return;
      }
      setPacking(details.packing);
      setShipments(details.shipments);
    } catch {
      setFeedback({ type: 'error', text: '无法读取订单详情。请重试。' });
    } finally {
      setBusy(false);
    }
  }

  function closeOrder() {
    if (busy) return;
    setSelectedId(null);
    setPacking(null);
    setShipments([]);
    setFeedback(null);
    form.resetFields();
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
      render: (_value: unknown, order: OrderRow) => (
        <Button onClick={() => void openOrder(order.id)}>订单详情</Button>
      ),
    },
  ];

  const mayShip = packing && selected && ['paid', 'fulfilled'].includes(selected.status)
    && ['paid', 'partially_refunded'].includes(selected.paymentStatus);
  const address = packing?.shippingAddress;

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
        title={selected ? `订单 ${selected.number}` : '订单详情'}
        open={Boolean(selectedId)} onCancel={closeOrder}
        closable={!busy} mask={{ closable: !busy }} footer={null} width={780}
      >
        {feedback && <Alert className="mb-4" type={feedback.type} title={feedback.text} showIcon />}
        {!packing && busy && <div className="flex justify-center py-8"><Spin aria-label="正在读取订单详情" /></div>}
        {!packing && selectedId && !busy && (
          <Button onClick={() => void openOrder(selectedId)}>重试</Button>
        )}
        {packing && (
          <div className="mb-6 grid gap-4 sm:grid-cols-[3fr_2fr]">
            <section aria-labelledby="order-packing-heading" className="min-w-0 rounded-lg border border-border p-4">
              <h3 id="order-packing-heading" className="mb-2 text-sm font-semibold">商品明细</h3>
              {packing.items.length ? (
                <ul className="divide-y divide-border">
                  {packing.items.map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                      <div className="min-w-0 [overflow-wrap:anywhere]">
                        <strong className="block text-sm">{item.productName}</strong>
                        {item.variantName && <p className="text-sm">{item.variantName}</p>}
                        <p className="mt-1 text-xs text-muted">SKU <span className="font-mono">{item.sku ?? '—'}</span></p>
                      </div>
                      <span className="shrink-0 rounded-md bg-cream px-2 py-1 text-xs tabular-nums">数量 {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted">暂无商品明细。</p>}
            </section>
            <section aria-labelledby="order-address-heading" className="min-w-0 rounded-lg border border-border p-4">
              <h3 id="order-address-heading" className="mb-2 text-sm font-semibold">收货地址</h3>
              {address ? (
                <address className="text-sm leading-relaxed not-italic [overflow-wrap:anywhere]">
                  {[
                    address.name, address.line1, address.line2,
                    [address.city, address.state, address.postalCode].filter(Boolean).join(' '), address.country,
                  ].map((line, index) => line && <p key={index}>{line}</p>)}
                </address>
              ) : <p className="text-sm text-muted">暂无收货地址。</p>}
            </section>
          </div>
        )}
        {packing && <h3 className="mb-2 text-sm font-semibold">包裹与物流</h3>}
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
        ) : packing && <p className="mb-4 text-sm text-muted">暂无物流记录。</p>}

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
