import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase, type Product, type Category } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const q = params.get('q') || ''
  const cat = params.get('cat') || ''
  const sort = params.get('sort') || 'new'

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    let query = supabase.from('products').select('*')
    if (q) query = query.ilike('name', `%${q}%`)
    if (cat) {
      const c = categories.find(x => x.slug === cat)
      if (c) query = query.eq('category_id', c.id)
    }
    if (sort === 'price-low') query = query.order('price', { ascending: true })
    else if (sort === 'price-high') query = query.order('price', { ascending: false })
    else query = query.order('created_at', { ascending: false })
    query.then(({ data }) => { setProducts(data || []); setLoading(false) })
  }, [q, cat, sort, categories])

  const update = (key: string, val: string) => {
    const next = new URLSearchParams(params)
    if (val) next.set(key, val); else next.delete(key)
    setParams(next)
  }

  return (
    <div className="container my-4">
      <div className="row g-4">
        <aside className="col-lg-3">
          <div className="form-card sticky-top" style={{ top: 90 }}>
            <h5 className="fw-bold mb-3">Filters</h5>
            <label className="form-label">Category</label>
            <select className="form-select mb-3" value={cat} onChange={e => update('cat', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <label className="form-label">Sort By</label>
            <select className="form-select" value={sort} onChange={e => update('sort', e.target.value)}>
              <option value="new">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </aside>
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">
              {cat ? categories.find(c => c.slug === cat)?.name || 'Shop' : 'All Products'}
              {q && <span className="text-muted"> — "{q}"</span>}
            </h4>
            <span className="text-muted">{products.length} items</span>
          </div>
          {loading ? (
            <div className="empty-state"><div className="spinner-border text-primary"></div></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-search"></i>
              <h5>No products found</h5>
              <p>Try a different search or filter.</p>
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
      </div>
    </div>
  )
}
