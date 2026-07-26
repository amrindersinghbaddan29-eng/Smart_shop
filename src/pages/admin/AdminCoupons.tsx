import { useEffect, useState } from 'react'
import { supabase, type Coupon } from '../../lib/supabase'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', min_order: '0', expiry_date: '' })
  const [editing, setEditing] = useState<string | null>(null)

  const load = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    setCoupons((data || []) as Coupon[])
  }
  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, value: Number(form.value), min_order: Number(form.min_order), expiry_date: form.expiry_date || null }
    if (editing) await supabase.from('coupons').update(payload).eq('id', editing)
    else await supabase.from('coupons').insert(payload)
    setForm({ code: '', type: 'percentage', value: '', min_order: '0', expiry_date: '' }); setEditing(null); await load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    await supabase.from('coupons').delete().eq('id', id); await load()
  }

  return (
    <>
      <h5 className="fw-bold mb-3">Manage Coupons</h5>
      <div className="row g-4">
        <div className="col-lg-4">
          <form className="form-card" onSubmit={save}>
            <h6 className="fw-bold mb-3">{editing ? 'Edit Coupon' : 'Add Coupon'}</h6>
            <div className="mb-2"><input className="form-control" placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required /></div>
            <div className="row g-2 mb-2">
              <div className="col">
                <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
              </div>
              <div className="col"><input className="form-control" type="number" placeholder="Value" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required /></div>
            </div>
            <div className="mb-2"><input className="form-control" type="number" placeholder="Min Order" value={form.min_order} onChange={e => setForm({ ...form, min_order: e.target.value })} /></div>
            <div className="mb-3"><input className="form-control" type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} /></div>
            <button className="btn btn-primary" type="submit">{editing ? 'Update' : 'Add'}</button>
            {editing && <button className="btn btn-link" onClick={() => { setEditing(null); setForm({ code: '', type: 'percentage', value: '', min_order: '0', expiry_date: '' }) }}>Cancel</button>}
          </form>
        </div>
        <div className="col-lg-8">
          <div className="table-card">
            <table className="table">
              <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Expiry</th><th></th></tr></thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id}>
                    <td className="fw-bold">{c.code}</td>
                    <td>{c.type}</td>
                    <td>{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                    <td>₹{c.min_order}</td>
                    <td>{c.expiry_date || '—'}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setEditing(c.id); setForm({ code: c.code, type: c.type, value: String(c.value), min_order: String(c.min_order), expiry_date: c.expiry_date || '' }) }}><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => del(c.id)}><i className="bi bi-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
