import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('customers').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data) { setFullName(data.full_name || ''); setPhone(data.phone || '') }
      else setFullName((user.user_metadata as any)?.full_name || '')
    })
  }, [user])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const { data } = await supabase.from('customers').select('id').eq('user_id', user.id).maybeSingle()
    if (data) {
      await supabase.from('customers').update({ full_name: fullName, phone }).eq('user_id', user.id)
    } else {
      await supabase.from('customers').insert({ user_id: user.id, full_name: fullName, phone })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="container my-4">
      <h3 className="fw-bold mb-4">My Profile</h3>
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="form-card text-center">
            <div className="stat-icon mx-auto mb-3" style={{ background: 'var(--primary)', width: 90, height: 90, fontSize: '2.5rem' }}>
              <i className="bi bi-person"></i>
            </div>
            <h5 className="fw-bold">{fullName || 'Customer'}</h5>
            <p className="text-muted small">{user?.email}</p>
          </div>
        </div>
        <div className="col-lg-8">
          <form className="form-card" onSubmit={save}>
            <h6 className="fw-bold mb-3">Account Details</h6>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input className="form-control" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" value={user?.email || ''} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit">Save Changes</button>
            {saved && <span className="text-success ms-3">Saved!</span>}
          </form>
        </div>
      </div>
    </div>
  )
}
