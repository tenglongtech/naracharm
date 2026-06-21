import Link from 'next/link';

/** /account/orders - 历史订单 */
const ORDERS = [
  { id: 'NC-10042', date: 'Jun 21, 2026', items: 3, total: '$98.00', status: 'Crafting' },
  { id: 'NC-10038', date: 'May 12, 2026', items: 1, total: '$68.00', status: 'Delivered' },
  { id: 'NC-10025', date: 'Apr 03, 2026', items: 2, total: '$74.00', status: 'Delivered' },
];

export default function OrdersPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">My Orders</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ORDERS.map((o) => (
              <tr key={o.id} className="hover:bg-surface/50">
                <td className="px-5 py-4">
                  <Link href={`/order/${o.id}`} className="font-medium text-brand hover:underline">{o.id}</Link>
                </td>
                <td className="px-5 py-4 text-muted">{o.date}</td>
                <td className="px-5 py-4 text-muted">{o.items}</td>
                <td className="px-5 py-4 tabular-nums">{o.total}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs ${o.status === 'Delivered' ? 'bg-brand/10 text-brand' : 'bg-gold/15 text-ink'}`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
