import { Link } from 'react-router-dom'

export default function OrderSuccess() {
  return (
    <div className="container my-5">
      <div className="form-card text-center mx-auto" style={{ maxWidth: 540 }}>
        <div className="stat-icon mx-auto mb-3" style={{ background: 'var(--success)', width: 80, height: 80, fontSize: '2.5rem' }}>
          <i className="bi bi-check-lg"></i>
        </div>
        <h3 className="fw-bold">Order Placed Successfully!</h3>
        <p className="text-muted">Thank you for your purchase. We'll send you a confirmation shortly.</p>
        <div className="d-flex gap-2 justify-content-center mt-3">
          <Link to="/orders" className="btn btn-primary">View My Orders</Link>
          <Link to="/shop" className="btn btn-outline-primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
