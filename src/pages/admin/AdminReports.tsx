import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminReports() {
  const [data, setData] = useState({ revenue: 0, orders: 0, products: 0, lowStock: [] as any[], topProducts: [] as any[] })

  useEffect(() => {
    (async () => {
      const { data: orders } = await supabase.from('orders').select('*')
      const revenue = (orders || []).reduce((s: number, o: any) => s + Number(o.grand_total), 0)
      const { data: products } = await supabase.from('products').select('*')
      const lowStock = (products || []).filter((p: any) => p.stock < 10).sort((a: any, b: any) => a.stock - b.stock)
      const { data: items } = await supabase.from('order_items').select('name, quantity, price')
      const map = new Map<string, number>()
      ;(items || []).forEach((it: any) => map.set(it.name, (map.get(it.name) || 0) + it.quantity))
      const topProducts = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
      setData({ revenue, orders: orders?.length || 0, products: products?.length || 0, lowStock, topProducts })
    })()
  }, [])

  return (
    <>
      <h5 className="fw-bold mb-3">Reports & Analytics</h5>
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4"><div className="stat-card"><div className="stat-value">₹{data.revenue.toLocaleString('en-IN')}</div><div className="stat-label">Total Revenue</div></div></div>
        <div className="col-6 col-md-4"><div className="stat-card"><div className="stat-value">{data.orders}</div><div className="stat-label">Total Orders</div></div></div>
        <div className="col-6 col-md-4"><div className="stat-card"><div className="stat-value">{data.products}</div><div className="stat-label">Total Products</div></div></div>
      </div>
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="chart-card">
            <h6 className="fw-bold mb-3">Low Stock Alert</h6>
            {data.lowStock.length === 0 ? <p className="text-muted">All products well stocked.</p> : (
              <div className="d-flex flex-column gap-2">
                {data.lowStock.map((p: any) => (
                  <div key={p.id} className="d-flex justify-content-between">
                    <span className="small">{p.name}</span>
                    <span className={`small fw-bold ${p.stock === 0 ? 'text-danger' : 'text-warning'}`}>{p.stock} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="chart-card">
            <h6 className="fw-bold mb-3">Top Products by Units Sold</h6>
            {data.topProducts.length === 0 ? <p className="text-muted">No sales yet.</p> : (
              <div className="d-flex flex-column gap-2">
                {data.topProducts.map(([name, qty]: any, i: number) => (
                  <div key={i} className="d-flex justify-content-between">
                    <span className="small">{name}</span>
                    <span className="small fw-bold">{qty} units</span>
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
