import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase, type Order, type OrderItem } from '../lib/supabase'

const STAGES = ['Pending', 'Processing', 'Shipped', 'Delivered']

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])

  useEffect(() => {
    if (!user || !id) return
    supabase.from('orders').select('*').eq('id', id).maybeSingle().then(({ data }) => setOrder(data as Order | null))
    supabase.from('order_items').select('*').eq('order_id', id).then(({ data }) => setItems((data || []) as OrderItem[]))
  }, [user, id])

  if (!order) return <div className="container my-5"><div className="spinner-border text-primary"></div></div>

  const currentStage = STAGES.indexOf(order.status)
  const cancelled = order.status === 'Cancelled'

  const cancelOrder = async () => {
    await supabase.from('orders').update({ status: 'Cancelled' }).eq('id', id)
    setOrder({ ...order, status: 'Cancelled' })
  }

  return (
    <div className="container my-4">
      <nav className="mb-3 small">
        <Link to="/orders">My Orders</Link> / <span className="text-muted">{order.order_number}</span>
      </nav>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="form-card mb-3">
            <div className="d-flex justify-content-between">
              <div>
                <h5 className="fw-bold">Order {order.order_number}</h5>
                <small className="text-muted">Placed on {new Date(order.created_at).toLocaleString()}</small>
              </div>
              <span className={`status-pill status-${order.status}`}>{order.status}</span>
            </div>
          </div>
          <div className="form-card mb-3">
            <h6 className="fw-bold mb-3">Order Tracking</h6>
            {cancelled ? (
              <div className="alert alert-danger">This order was cancelled.</div>
            ) : (
              <div className="timeline">
                {STAGES.map((s, i) => (
                  <div className={`timeline-item ${i < currentStage ? 'done' : i === currentStage ? 'active' : ''}`} key={s}>
                    <div className="fw-semibold">{s}</div>
                    <small className="text-muted">
                      {i < currentStage ? 'Completed' : i === currentStage ? 'In progress' : 'Pending'}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="table-card">
            <table className="table">
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id}>
                    <td>
                      <div className="d-flex gap-2 align-items-center">
                        <img src={it.image_url} alt={it.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} />
                        <span>{it.name}</span>
                      </div>
                    </td>
                    <td>{it.quantity}</td>
                    <td>₹{it.price.toFixed(0)}</td>
                    <td>₹{(it.price * it.quantity).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="form-card mb-3">
            <h6 className="fw-bold mb-3">Shipping Address</h6>
            <p className="mb-0">{order.shipping_address}</p>
          </div>
          <div className="form-card mb-3">
            <h6 className="fw-bold mb-3">Payment</h6>
            <p className="mb-1">Method: <strong>{order.payment_method}</strong></p>
            <p className="mb-0 text-muted text-capitalize">Status: Success</p>
          </div>
          <div className="form-card">
            <h6 className="fw-bold mb-3">Summary</h6>
            <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>₹{order.total.toFixed(0)}</span></div>
            <div className="d-flex justify-content-between mb-2"><span>Tax</span><span>₹{order.tax.toFixed(0)}</span></div>
            <div className="d-flex justify-content-between mb-2"><span>Shipping</span><span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span></div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>₹{order.grand_total.toFixed(0)}</span></div>
          </div>
          {!cancelled && order.status !== 'Delivered' && (
            <button className="btn btn-outline-danger w-100 mt-3" onClick={cancelOrder}>Cancel Order</button>
          )}
        </div>
      </div>
    </div>
  )
}
