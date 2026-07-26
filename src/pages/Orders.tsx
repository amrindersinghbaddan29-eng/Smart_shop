import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase, type Order } from '../lib/supabase'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      setOrders((data || []) as Order[])
      setLoading(false)
    })
  }, [user])

  if (loading) return <div className="container my-5"><div className="spinner-border text-primary"></div></div>

  return (
    <div className="container my-4">
      <h3 className="fw-bold mb-4">My Orders</h3>
      {orders.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-bag"></i>
          <h4>No orders yet</h4>
          <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="table-card">
          <table className="table">
            <thead><tr><th>Order #</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="fw-semibold">{o.order_number}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>₹{o.grand_total.toFixed(0)}</td>
                  <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
                  <td><Link to={`/orders/${o.id}`} className="btn btn-sm btn-outline-primary">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
