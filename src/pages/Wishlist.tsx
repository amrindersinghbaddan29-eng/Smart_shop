import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase, type Product } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (!user) return
    supabase.from('wishlist').select('product:products(*)').eq('user_id', user.id).then(({ data }) => {
      setProducts((data || []).map((r: any) => r.product))
    })
  }, [user])

  return (
    <div className="container my-4">
      <h3 className="fw-bold mb-4">My Wishlist</h3>
      {products.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-heart"></i>
          <h4>Your wishlist is empty</h4>
          <Link to="/shop" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="row g-3">
          {products.map(p => (
            <div className="col-6 col-md-4 col-lg-3" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
