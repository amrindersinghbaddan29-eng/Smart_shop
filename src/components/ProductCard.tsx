import type { Product } from '../lib/supabase'
import { useCart } from '../lib/cart'
import { Link } from 'react-router-dom'

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const finalPrice = product.price - (product.price * product.discount / 100)
  const stockClass = product.stock === 0 ? 'stock-out' : product.stock < 10 ? 'stock-low' : 'stock-in'
  const stockLabel = product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'In Stock'

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="img-wrap">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        {product.discount > 0 && <span className="discount-badge">-{product.discount}%</span>}
        <span className={`stock-badge ${stockClass}`}>{stockLabel}</span>
      </Link>
      <div className="card-body">
        <div className="product-brand">{product.brand}</div>
        <Link to={`/product/${product.id}`} className="product-name text-dark text-decoration-none">{product.name}</Link>
        <div className="price-row">
          <span className="price-now">₹{finalPrice.toFixed(0)}</span>
          {product.discount > 0 && <span className="price-old">₹{product.price.toFixed(0)}</span>}
        </div>
        <button
          className="btn btn-primary btn-sm w-100 mt-2"
          disabled={product.stock === 0}
          onClick={() => add(product.id)}
        >
          <i className="bi bi-cart-plus me-1"></i> Add to Cart
        </button>
      </div>
    </div>
  )
}
