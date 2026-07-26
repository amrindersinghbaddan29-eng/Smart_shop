import { useEffect, useState } from 'react'
import { supabase, type Category } from '../../lib/supabase'

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([])
  const [form, setForm] = useState({ name: '', slug: '', image_url: '' })
  const [editing, setEditing] = useState<string | null>(null)

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCats((data || []) as Category[])
  }
  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') }
    if (editing) await supabase.from('categories').update(payload).eq('id', editing)
    else await supabase.from('categories').insert(payload)
    setForm({ name: '', slug: '', image_url: '' }); setEditing(null); await load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await supabase.from('categories').delete().eq('id', id); await load()
  }

  return (
    <>
      <h5 className="fw-bold mb-3">Manage Categories</h5>
      <div className="row g-4">
        <div className="col-lg-4">
          <form className="form-card" onSubmit={save}>
            <h6 className="fw-bold mb-3">{editing ? 'Edit Category' : 'Add Category'}</h6>
            <div className="mb-2"><input className="form-control" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="mb-2"><input className="form-control" placeholder="Slug (auto)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="mb-3"><input className="form-control" placeholder="Image URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} /></div>
            <button className="btn btn-primary" type="submit">{editing ? 'Update' : 'Add'}</button>
            {editing && <button className="btn btn-link" onClick={() => { setEditing(null); setForm({ name: '', slug: '', image_url: '' }) }}>Cancel</button>}
          </form>
        </div>
        <div className="col-lg-8">
          <div className="row g-3">
            {cats.map(c => (
              <div className="col-6 col-md-4" key={c.id}>
                <div className="form-card">
                  <img src={c.image_url} alt={c.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10 }} />
                  <h6 className="fw-bold mt-2 mb-2">{c.name}</h6>
                  <small className="text-muted d-block mb-2">/{c.slug}</small>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => { setEditing(c.id); setForm({ name: c.name, slug: c.slug, image_url: c.image_url || '' }) }}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => del(c.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
