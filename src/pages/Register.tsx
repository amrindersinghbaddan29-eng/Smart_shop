import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); setLoading(false); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return }
    const { error } = await signUp(form.email, form.password, form.name)
    setLoading(false)
    if (error) setError(error)
    else navigate('/')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <Link to="/" className="shop-logo d-block text-center mb-4">SmartShop</Link>
        <h4 className="fw-bold text-center mb-1">Create Account</h4>
        <p className="text-muted text-center mb-4">Join SmartShop today</p>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="row g-2">
            <div className="col-md-6 mb-3">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Confirm</label>
              <input className="form-control" type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
            </div>
          </div>
          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-3 mb-0">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
