'use server';

import { z } from 'zod';
import { requireAdmin } from './auth';
import { listOrderShipments, recordShipment, sendShipmentNotice, ShipmentError } from './order-fulfillment';

export async function adminOrderShipments(orderId: string) {
  await requireAdmin();
  const id = z.uuid().parse(orderId);
  return listOrderShipments(id);
}

export async function saveAdminShipment(input: {
  orderId: string; carrier: string; trackingNumber: string; trackingUrl?: string; complete: boolean;
}) {
  await requireAdmin();
  try {
    const result = await recordShipment(input);
    return { ok: true as const, ...result };
  } catch (error) {
    if (error instanceof ShipmentError) return { ok: false as const, error: error.message };
    console.error('Order shipment could not be recorded', error instanceof Error ? error.name : 'Unknown error');
    return { ok: false as const, error: '保存物流失败，请重试。' };
  }
}

export async function notifyAdminShipment(shipmentId: string) {
  await requireAdmin();
  try {
    return { ok: true as const, status: await sendShipmentNotice(shipmentId) };
  } catch (error) {
    if (error instanceof ShipmentError) return { ok: false as const, error: error.message };
    console.error('Shipment email could not be sent', error instanceof Error ? error.name : 'Unknown error');
    return { ok: false as const, error: '发货通知发送失败，物流记录已保存。' };
  }
}
