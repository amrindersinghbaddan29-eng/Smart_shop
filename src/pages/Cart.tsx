import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../lib/cart'
import { supabase, type Coupon } from '../lib/supabase'

export default function Cart() {
  const { items, update, remove, loading } = useCart()
  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [couponError, setCouponError] = useState('')

  const subtotal = items.reduce((s, i) => s + (i.product.price - i.product.price * i.product.discount / 100) * i.quantity, 0)
  const discount = coupon
    ? coupon.type === 'percentage' ? subtotal * coupon.value / 100 : coupon.value
    : 0
  const tax = (subtotal - discount) * 0.05
  const shipping = subtotal > 999 ? 0 : 49
  const total = subtotal - discount + tax + shipping

  const applyCoupon = async () => {
    setCouponError('')
    if (!couponCode) return
    const { data } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).eq('active', true).maybeSingle()
    if (!data) { setCouponError('Invalid coupon code'); setCoupon(null); return }
    if (subtotal < (data as Coupon).min_order) { setCouponError(`Minimum order ₹${(data as Coupon).min_order} required`); setCoupon(null); return }
    setCoupon(data as Coupon)
  }

  if (loading) return <div className="container my-5"><div className="spinner-border text-primary"></div></div>

  if (items.length === 0) {
    return (
      <div className="container my-5">
        <div className="empty-state">
          <i className="bi bi-cart-x"></i>
          <h4>Your cart is empty</h4>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container my-4">
      <h3 className="fw-bold mb-4">Shopping Cart</h3>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="table-card">
            <table className="table align-middle">
              <thead>
                <tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const fp = item.product.price - item.product.price * item.product.discount / 100
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img src={item.product.image_url} alt={item.product.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10 }} />
                          <div>
                            <div className="fw-semibold">{item.product.name}</div>
                            <small className="text-muted">{item.product.brand}</small>
                          </div>
                        </div>
                      </td>
                      <td>₹{fp.toFixed(0)}</td>
                      <td>
                        <div className="input-group input-group-sm" style={{ width: 110 }}>
                          <button className="btn btn-outline-secondary" onClick={() => update(item.id, item.quantity - 1)}>-</button>
                          <input className="form-control text-center" value={item.quantity} readOnly />
                          <button className="btn btn-outline-secondary" onClick={() => update(item.id, item.quantity + 1)}>+</button>
                        </div>
                      </td>
                      <td className="fw-bold">₹{(fp * item.quantity).toFixed(0)}</td>
                      <td><button className="btn btn-link text-danger" onClick={() => remove(item.id)}><i className="bi bi-trash"></i></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="form-card">
            <h5 className="fw-bold mb-3">Order Summary</h5>
            <div className="d-flex gap-2 mb-3">
              <input className="form-control" placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
              <button className="btn btn-outline-primary" onClick={applyCoupon}>Apply</button>
            </div>
            {couponError && <small className="text-danger d-block mb-2">{couponError}</small>}
            {coupon && <small className="text-success d-block mb-2">Coupon "{coupon.code}" applied!</small>}
            <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
            {discount > 0 && <div className="d-flex justify-content-between text-success mb-2"><span>Discount</span><span>-₹{discount.toFixed(0)}</span></div>}
            <div className="d-flex justify-content-between mb-2"><span>Tax (5%)</span><span>₹{tax.toFixed(0)}</span></div>
            <div className="d-flex justify-content-between mb-2"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
            <button className="btn btn-primary w-100 mt-3" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
            <Link to="/shop" className="btn btn-link w-100 mt-2">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
