import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error)
    else navigate('/')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <Link to="/" className="shop-logo d-block text-center mb-4">SmartShop</Link>
        <h4 className="fw-bold text-center mb-1">Welcome Back</h4>
        <p className="text-muted text-center mb-4">Sign in to your account</p>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Sign In'}
          </button>
        </form>
        <p className="text-center mt-3 mb-0">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
        <hr className="my-3" />
        <p className="text-muted small text-center mb-0">
          Admin? Use <strong>admin@smartshop.com</strong> to access the dashboard after registering.
        </p>
      </div>
    </div>
  )
}
