import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type Product, type Category } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    supabase.from('products').select('*').order('created_at', { ascending: false }).limit(8).then(({ data }) => setProducts(data || []))
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []))
  }, [])

  return (
    <>
      <section className="hero-section">
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="hero-title">Shop Smart, Live Better</h1>
              <p className="hero-subtitle mt-3">Discover amazing deals on electronics, fashion, home essentials and more. Free shipping on orders over ₹999.</p>
              <div className="d-flex gap-3 mt-4">
                <Link to="/shop" className="btn btn-light btn-lg rounded-pill fw-semibold">Shop Now <i className="bi bi-arrow-right ms-1"></i></Link>
                <Link to="/contact" className="btn btn-outline-light btn-lg rounded-pill">Contact Us</Link>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block text-center">
              <i className="bi bi-bag-check-fill" style={{ fontSize: '12rem', opacity: .25 }}></i>
            </div>
          </div>
        </div>
      </section>

      <section className="container my-5">
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-sub">Browse our curated collections</p>
        <div className="row g-3">
          {categories.map(c => (
            <div className="col-6 col-md-4 col-lg-3" key={c.id}>
              <Link to={`/shop?cat=${c.slug}`} className="category-card d-block">
                <img src={c.image_url} alt={c.name} loading="lazy" />
                <div className="overlay"><h4>{c.name}</h4></div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container my-5">
        <div className="d-flex justify-content-between align-items-end mb-3">
          <div>
            <h2 className="section-title">New Arrivals</h2>
            <p className="section-sub mb-0">Fresh products just added</p>
          </div>
          <Link to="/shop" className="btn btn-link">View all <i className="bi bi-arrow-right"></i></Link>
        </div>
        <div className="row g-3">
          {products.map(p => (
            <div className="col-6 col-md-4 col-lg-3" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      <section className="container my-5">
        <div className="row g-3">
          {[
            { icon: 'bi-truck', title: 'Free Shipping', text: 'On orders over ₹999' },
            { icon: 'bi-shield-check', title: 'Secure Payment', text: '100% protected payments' },
            { icon: 'bi-arrow-repeat', title: 'Easy Returns', text: '7-day return policy' },
            { icon: 'bi-headset', title: '24/7 Support', text: 'Dedicated customer care' },
          ].map((f, i) => (
            <div className="col-6 col-lg-3" key={i}>
              <div className="stat-card text-center h-100">
                <div className="stat-icon mx-auto mb-3" style={{ background: 'var(--primary)' }}>
                  <i className={`bi ${f.icon}`}></i>
                </div>
                <h6 className="fw-bold mb-1">{f.title}</h6>
                <p className="text-muted mb-0 small">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
