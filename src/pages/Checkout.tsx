import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { supabase, type Address } from '../lib/supabase'

export default function Checkout() {
  const { items } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddr, setSelectedAddr] = useState<string>('')
  const [payment, setPayment] = useState('cod')
  const [placing, setPlacing] = useState(false)

  const subtotal = items.reduce((s, i) => s + (i.product.price - i.product.price * i.product.discount / 100) * i.quantity, 0)
  const tax = subtotal * 0.05
  const shipping = subtotal > 999 ? 0 : 49
  const total = subtotal + tax + shipping

  useEffect(() => {
    if (!user) return
    supabase.from('addresses').select('*').eq('user_id', user.id).then(({ data }) => {
      const a = (data || []) as Address[]
      setAddresses(a)
      const def = a.find(x => x.is_default) || a[0]
      if (def) setSelectedAddr(def.id)
    })
  }, [user])

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const placeOrder = async () => {
    if (!user || !selectedAddr) return
    setPlacing(true)
    const addr = addresses.find(a => a.id === selectedAddr)!
    const orderNumber = `ORD${Date.now().toString().slice(-8)}`
    const { data: order } = await supabase.from('orders').insert({
      user_id: user.id,
      order_number: orderNumber,
      total: subtotal,
      tax,
      shipping,
      grand_total: total,
      status: 'Processing',
      payment_method: payment,
      shipping_address: `${addr.full_name}, ${addr.address_line}, ${addr.city}, ${addr.state} - ${addr.pincode}, Phone: ${addr.phone}`,
    }).select().single()
    if (!order) { setPlacing(false); return }
    await supabase.from('order_items').insert(items.map(i => ({
      order_id: order.id,
      product_id: i.product_id,
      name: i.product.name,
      price: i.product.price - i.product.price * i.product.discount / 100,
      quantity: i.quantity,
      image_url: i.product.image_url,
    })))
    await supabase.from('payments').insert({
      order_id: order.id,
      amount: total,
      method: payment,
      status: 'Success',
      transaction_id: `TXN${Date.now()}`,
    })
    for (const i of items) {
      await supabase.from('products').update({ stock: Math.max(0, i.product.stock - i.quantity) }).eq('id', i.product_id)
    }
    await supabase.from('cart').delete().eq('user_id', user.id)
    navigate('/order-success')
  }

  return (
    <div className="container my-4">
      <h3 className="fw-bold mb-4">Checkout</h3>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="form-card mb-3">
            <h6 className="fw-bold mb-3">Shipping Address</h6>
            {addresses.length === 0 ? (
              <p className="text-muted">No address found. <a href="/addresses">Add one</a>.</p>
            ) : (
              <div className="row g-2">
                {addresses.map(a => (
                  <div className="col-12" key={a.id}>
                    <label className="d-flex gap-2 p-3 rounded border" style={{ cursor: 'pointer', borderColor: selectedAddr === a.id ? 'var(--primary)' : 'var(--gray-300)' }}>
                      <input type="radio" name="addr" checked={selectedAddr === a.id} onChange={() => setSelectedAddr(a.id)} />
                      <div>
                        <div className="fw-semibold">{a.full_name}</div>
                        <small className="text-muted">{a.address_line}, {a.city}, {a.state} - {a.pincode}</small><br />
                        <small className="text-muted">Phone: {a.phone}</small>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-card">
            <h6 className="fw-bold mb-3">Payment Method</h6>
            <div className="row g-2">
              {[
                { id: 'cod', label: 'Cash on Delivery', icon: 'bi-cash-coin' },
                { id: 'card', label: 'Credit / Debit Card', icon: 'bi-credit-card' },
                { id: 'upi', label: 'UPI', icon: 'bi-phone' },
                { id: 'netbanking', label: 'Net Banking', icon: 'bi-bank' },
              ].map(m => (
                <div className="col-6 col-md-3" key={m.id}>
                  <label className="d-flex flex-column align-items-center p-3 rounded border text-center" style={{ cursor: 'pointer', borderColor: payment === m.id ? 'var(--primary)' : 'var(--gray-300)' }}>
                    <input type="radio" name="pay" className="d-none" checked={payment === m.id} onChange={() => setPayment(m.id)} />
                    <i className={`bi ${m.icon}`} style={{ fontSize: '1.8rem' }}></i>
                    <small className="mt-2">{m.label}</small>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="form-card">
            <h6 className="fw-bold mb-3">Order Summary</h6>
            {items.map(i => (
              <div className="d-flex justify-content-between mb-2" key={i.id}>
                <span className="small">{i.product.name} × {i.quantity}</span>
                <span className="small">₹{((i.product.price - i.product.price * i.product.discount / 100) * i.quantity).toFixed(0)}</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
            <div className="d-flex justify-content-between mb-2"><span>Tax (5%)</span><span>₹{tax.toFixed(0)}</span></div>
            <div className="d-flex justify-content-between mb-2"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
            <button className="btn btn-primary w-100 mt-3" disabled={placing || !selectedAddr} onClick={placeOrder}>
              {placing ? <span className="spinner-border spinner-border-sm"></span> : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
