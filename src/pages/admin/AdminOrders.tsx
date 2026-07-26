import { useEffect, useState } from 'react'
import { supabase, type Order } from '../../lib/supabase'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('')

  const load = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders((data || []) as Order[])
  }
  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    await load()
  }

  const filtered = filter ? orders.filter(o => o.status === filter) : orders

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Manage Orders</h5>
        <select className="form-select" style={{ maxWidth: 200 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <div className="table-card">
        <table className="table">
          <thead><tr><th>Order #</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th>Update</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted">No orders</td></tr>
            ) : filtered.map(o => (
              <tr key={o.id}>
                <td className="fw-semibold">{o.order_number}</td>
                <td>₹{o.grand_total.toFixed(0)}</td>
                <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
                <td className="small">{o.payment_method}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  <select className="form-select form-select-sm" style={{ maxWidth: 140 }} value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
