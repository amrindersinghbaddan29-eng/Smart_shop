import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase, type Product, type Review } from '../lib/supabase'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { add } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [qty, setQty] = useState(1)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    if (!id) return
    supabase.from('products').select('*').eq('id', id).maybeSingle().then(({ data }) => setProduct(data as Product | null))
    supabase.from('reviews').select('*').eq('product_id', id).eq('approved', true).then(({ data }) => setReviews(data || []))
  }, [id])

  if (!product) return <div className="container my-5"><div className="spinner-border text-primary"></div></div>

  const finalPrice = product.price - (product.price * product.discount / 100)
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0'

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id) return
    await supabase.from('reviews').insert({ product_id: id, user_id: user.id, rating: newRating, comment: newComment })
    setNewComment('')
    const { data } = await supabase.from('reviews').select('*').eq('product_id', id).eq('approved', true)
    setReviews(data || [])
  }

  return (
    <div className="container my-4">
      <nav className="mb-3 small">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span className="text-muted">{product.name}</span>
      </nav>
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="form-card p-0 overflow-hidden">
            <img src={product.image_url} alt={product.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
          </div>
        </div>
        <div className="col-lg-7">
          <div className="product-brand">{product.brand}</div>
          <h2 className="fw-bold mb-2">{product.name}</h2>
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="rating-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <i key={i} className={`bi ${i < Math.round(+avgRating) ? 'bi-star-fill' : 'bi-star'}`}></i>
              ))}
            </span>
            <span className="text-muted small">{avgRating} ({reviews.length} reviews)</span>
            <span className="text-muted small">· SKU: {product.sku}</span>
          </div>
          <div className="price-row mb-3">
            <span className="price-now" style={{ fontSize: '2rem' }}>₹{finalPrice.toFixed(0)}</span>
            {product.discount > 0 && <span className="price-old" style={{ fontSize: '1.1rem' }}>₹{product.price.toFixed(0)}</span>}
            {product.discount > 0 && <span className="badge bg-success-subtle text-success">{product.discount}% OFF</span>}
          </div>
          <p className="text-muted mb-3">{product.description}</p>
          <div className="mb-3">
            {product.stock === 0 ? (
              <span className="status-pill status-Cancelled">Out of Stock</span>
            ) : product.stock < 10 ? (
              <span className="status-pill status-Pending">Only {product.stock} left!</span>
            ) : (
              <span className="status-pill status-Delivered">In Stock</span>
            )}
          </div>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="input-group" style={{ width: 140 }}>
              <button className="btn btn-outline-secondary" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <input className="form-control text-center" value={qty} readOnly />
              <button className="btn btn-outline-secondary" onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button className="btn btn-primary flex-grow-1" disabled={product.stock === 0} onClick={() => add(product.id, qty)}>
              <i className="bi bi-cart-plus me-1"></i> Add to Cart
            </button>
            <button className="btn btn-accent" disabled={product.stock === 0} onClick={() => { add(product.id, qty); navigate('/checkout') }}>
              Buy Now
            </button>
          </div>
          <hr />
          <div className="row text-muted small">
            <div className="col-6"><i className="bi bi-truck me-2"></i>Free delivery over ₹999</div>
            <div className="col-6"><i className="bi bi-arrow-repeat me-2"></i>7-day returns</div>
            <div className="col-6"><i className="bi bi-shield-check me-2"></i>Warranty included</div>
            <div className="col-6"><i className="bi bi-credit-card me-2"></i>Secure checkout</div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-4">
        <div className="col-12">
          <h4 className="fw-bold mb-3">Customer Reviews</h4>
          {user && (
            <form onSubmit={submitReview} className="form-card mb-4">
              <h6 className="fw-bold">Write a Review</h6>
              <div className="mb-2">
                <label className="form-label">Rating</label>
                <div className="d-flex gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button type="button" key={n} className="btn btn-link p-0" onClick={() => setNewRating(n)}>
                      <i className={`bi ${n <= newRating ? 'bi-star-fill' : 'bi-star'} rating-stars`} style={{ fontSize: '1.5rem' }}></i>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Comment</label>
                <textarea className="form-control" rows={3} value={newComment} onChange={e => setNewComment(e.target.value)} required></textarea>
              </div>
              <button className="btn btn-primary" type="submit">Submit Review</button>
            </form>
          )}
          {reviews.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-chat-square-text"></i>
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="row g-3">
              {reviews.map(r => (
                <div className="col-12" key={r.id}>
                  <div className="form-card">
                    <div className="d-flex justify-content-between">
                      <span className="rating-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i key={i} className={`bi ${i < r.rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                        ))}
                      </span>
                      <small className="text-muted">{new Date(r.created_at).toLocaleDateString()}</small>
                    </div>
                    <p className="mt-2 mb-0">{r.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
