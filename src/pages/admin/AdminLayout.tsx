import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

const links = [
  { to: '/admin', label: 'Dashboard', icon: 'bi-speedometer2', end: true },
  { to: '/admin/products', label: 'Products', icon: 'bi-box-seam' },
  { to: '/admin/categories', label: 'Categories', icon: 'bi-tags' },
  { to: '/admin/orders', label: 'Orders', icon: 'bi-bag-check' },
  { to: '/admin/customers', label: 'Customers', icon: 'bi-people' },
  { to: '/admin/coupons', label: 'Coupons', icon: 'bi-ticket-perforated' },
  { to: '/admin/messages', label: 'Messages', icon: 'bi-envelope' },
  { to: '/admin/reports', label: 'Reports', icon: 'bi-graph-up' },
  { to: '/admin/settings', label: 'Settings', icon: 'bi-gear' },
]

export default function AdminLayout() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div className="admin-wrapper">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">SmartShop Admin</div>
        <nav className="nav flex-column mt-2">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <i className={`bi ${l.icon}`}></i> {l.label}
            </NavLink>
          ))}
          <button className="nav-link text-start border-0 bg-transparent w-100" onClick={() => { signOut(); navigate('/') }}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </nav>
      </aside>
      <div className="admin-main">
        <div className="admin-topbar">
          <button className="icon-btn d-lg-none" onClick={() => setOpen(!open)}><i className="bi bi-list"></i></button>
          <h4 className="fw-bold mb-0">Admin Dashboard</h4>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small d-none d-sm-block">{user?.email}</span>
            <div className="stat-icon" style={{ background: 'var(--primary)', width: 40, height: 40, fontSize: '1rem' }}>
              <i className="bi bi-person"></i>
            </div>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
