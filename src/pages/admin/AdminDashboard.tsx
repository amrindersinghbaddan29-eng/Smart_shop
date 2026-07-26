import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0, pending: 0, delivered: 0, cancelled: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      const [{ count: products }, { count: orders }, { count: customers }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
      ])
      const { data: allOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      const rev = (allOrders || []).reduce((s: number, o: any) => s + Number(o.grand_total), 0)
      setStats({
        products: products || 0,
        orders: orders || 0,
        customers: customers || 0,
        revenue: rev,
        pending: (allOrders || []).filter((o: any) => o.status === 'Pending' || o.status === 'Processing').length,
        delivered: (allOrders || []).filter((o: any) => o.status === 'Delivered').length,
        cancelled: (allOrders || []).filter((o: any) => o.status === 'Cancelled').length,
      })
      setRecentOrders((allOrders || []).slice(0, 5))
      const { data: items } = await supabase.from('order_items').select('name, quantity, price')
      const map = new Map<string, { qty: number; rev: number }>()
      ;(items || []).forEach((it: any) => {
        const cur = map.get(it.name) || { qty: 0, rev: 0 }
        cur.qty += it.quantity; cur.rev += it.quantity * Number(it.price)
        map.set(it.name, cur)
      })
      setTopProducts(Array.from(map.entries()).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5))
    })()
  }, [])

  const cards = [
    { label: 'Total Products', value: stats.products, icon: 'bi-box-seam', color: 'var(--primary)' },
    { label: 'Total Orders', value: stats.orders, icon: 'bi-bag-check', color: 'var(--accent)' },
    { label: 'Total Customers', value: stats.customers, icon: 'bi-people', color: 'var(--success)' },
    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: 'bi-currency-rupee', color: '#6610f2' },
    { label: 'Pending Orders', value: stats.pending, icon: 'bi-hourglass-split', color: 'var(--warning)' },
    { label: 'Delivered', value: stats.delivered, icon: 'bi-check-circle', color: 'var(--success)' },
    { label: 'Cancelled', value: stats.cancelled, icon: 'bi-x-circle', color: 'var(--danger)' },
  ]

  return (
    <>
      <div className="row g-3 mb-4">
        {cards.map((c, i) => (
          <div className="col-6 col-md-4 col-xl-3" key={i}>
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-value">{c.value}</div>
                  <div className="stat-label">{c.label}</div>
                </div>
                <div className="stat-icon" style={{ background: c.color }}><i className={`bi ${c.icon}`}></i></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-7">
          <div className="chart-card">
            <h6 className="fw-bold mb-3">Monthly Sales</h6>
            <div className="d-flex align-items-end gap-2" style={{ height: 220 }}>
              {[40, 65, 50, 80, 55, 90, 70, 100, 60, 85, 75, 95].map((h, i) => (
                <div key={i} className="flex-fill d-flex flex-column align-items-center gap-1">
                  <div style={{ width: '100%', height: `${h}%`, background: 'linear-gradient(to top, var(--primary), #6610f2)', borderRadius: '6px 6px 0 0', minHeight: 8 }}></div>
                  <small className="text-muted">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="chart-card">
            <h6 className="fw-bold mb-3">Order Status</h6>
            <div className="d-flex flex-column gap-3">
              {[
                { label: 'Pending', val: stats.pending, color: 'var(--warning)' },
                { label: 'Delivered', val: stats.delivered, color: 'var(--success)' },
                { label: 'Cancelled', val: stats.cancelled, color: 'var(--danger)' },
              ].map(s => {
                const pct = stats.orders ? (s.val / stats.orders) * 100 : 0
                return (
                  <div key={s.label}>
                    <div className="d-flex justify-content-between mb-1"><small>{s.label}</small><small>{s.val}</small></div>
                    <div style={{ height: 10, background: 'var(--gray-200)', borderRadius: 50, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: s.color }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="table-card">
            <div className="p-3 border-bottom"><h6 className="fw-bold mb-0">Recent Orders</h6></div>
            <table className="table">
              <thead><tr><th>Order #</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-muted">No orders yet</td></tr>
                ) : recentOrders.map(o => (
                  <tr key={o.id}>
                    <td className="fw-semibold">{o.order_number}</td>
                    <td>₹{Number(o.grand_total).toFixed(0)}</td>
                    <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="chart-card">
            <h6 className="fw-bold mb-3">Top Selling Products</h6>
            {topProducts.length === 0 ? (
              <p className="text-muted text-center">No sales data</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {topProducts.map(([name, d]: any, i: number) => (
                  <div key={i} className="d-flex justify-content-between">
                    <span className="small">{name}</span>
                    <span className="small fw-semibold">{d.qty} sold · ₹{d.rev.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
