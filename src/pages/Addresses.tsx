import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { supabase, type Address } from '../lib/supabase'

export default function Addresses() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [form, setForm] = useState({ full_name: '', phone: '', address_line: '', city: '', state: '', pincode: '' })
  const [editing, setEditing] = useState<string | null>(null)

  const load = async () => {
    if (!user) return
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id)
    setAddresses((data || []) as Address[])
  }
  useEffect(() => { load() }, [user])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (editing) {
      await supabase.from('addresses').update(form).eq('id', editing)
    } else {
      await supabase.from('addresses').insert({ ...form, user_id: user.id })
    }
    setForm({ full_name: '', phone: '', address_line: '', city: '', state: '', pincode: '' })
    setEditing(null)
    await load()
  }

  const edit = (a: Address) => {
    setEditing(a.id)
    setForm({ full_name: a.full_name, phone: a.phone, address_line: a.address_line, city: a.city, state: a.state, pincode: a.pincode })
  }

  const del = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id)
    await load()
  }

  return (
    <div className="container my-4">
      <h3 className="fw-bold mb-4">My Addresses</h3>
      <div className="row g-4">
        <div className="col-lg-5">
          <form className="form-card" onSubmit={save}>
            <h6 className="fw-bold mb-3">{editing ? 'Edit Address' : 'Add New Address'}</h6>
            <div className="mb-2"><input className="form-control" placeholder="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required /></div>
            <div className="mb-2"><input className="form-control" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
            <div className="mb-2"><input className="form-control" placeholder="Address Line" value={form.address_line} onChange={e => setForm({ ...form, address_line: e.target.value })} required /></div>
            <div className="row g-2 mb-2">
              <div className="col"><input className="form-control" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required /></div>
              <div className="col"><input className="form-control" placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required /></div>
            </div>
            <div className="mb-3"><input className="form-control" placeholder="Pincode" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} required /></div>
            <button className="btn btn-primary" type="submit">{editing ? 'Update' : 'Add Address'}</button>
            {editing && <button className="btn btn-link" onClick={() => { setEditing(null); setForm({ full_name: '', phone: '', address_line: '', city: '', state: '', pincode: '' }) }}>Cancel</button>}
          </form>
        </div>
        <div className="col-lg-7">
          {addresses.length === 0 ? (
            <div className="empty-state"><i className="bi bi-geo-alt"></i><p>No addresses yet.</p></div>
          ) : (
            <div className="row g-3">
              {addresses.map(a => (
                <div className="col-12" key={a.id}>
                  <div className="form-card d-flex justify-content-between">
                    <div>
                      <div className="fw-semibold">{a.full_name}</div>
                      <small className="text-muted">{a.address_line}, {a.city}, {a.state} - {a.pincode}</small><br />
                      <small className="text-muted">Phone: {a.phone}</small>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => edit(a)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => del(a.id)}>Delete</button>
                    </div>
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
