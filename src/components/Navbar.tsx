import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  )

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/shop?q=${encodeURIComponent(q)}`)
  }

  return (
    <nav className="shop-navbar">
      <div className="container d-flex align-items-center gap-3 gap-lg-4">
        <Link to="/" className="shop-logo">SmartShop</Link>
        <form onSubmit={onSearch} className="flex-grow-1 d-none d-lg-block" style={{ maxWidth: 480 }}>
          <input className="shop-search" placeholder="Search products..." value={q} onChange={e => setQ(e.target.value)} />
        </form>
        <div className="d-flex align-items-center gap-2 ms-auto">
          <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
            <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'}`}></i>
          </button>
          <Link to="/cart" className="icon-btn" title="Cart">
            <i className="bi bi-bag"></i>
            {count > 0 && <span className="badge-cart">{count}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/orders" className="icon-btn" title="My Orders"><i className="bi bi-bag-check"></i></Link>
              <Link to="/profile" className="icon-btn" title="Profile"><i className="bi bi-person"></i></Link>
              {isAdmin && <Link to="/admin" className="btn btn-accent btn-sm">Admin</Link>}
              <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={signOut}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm rounded-pill">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
