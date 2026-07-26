import { useEffect, useState } from 'react'
import { supabase, type Product, type Category } from '../../lib/supabase'

const empty = { name: '', sku: '', description: '', price: '', discount: '0', stock: '', brand: '', image_url: '', category_id: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<any>(empty)
  const [editing, setEditing] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts((data || []) as Product[])
  }
  useEffect(() => {
    load()
    supabase.from('categories').select('*').then(({ data }) => setCategories((data || []) as Category[]))
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      price: Number(form.price),
      discount: Number(form.discount),
      stock: Number(form.stock),
      availability: Number(form.stock) > 0,
    }
    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing)
    } else {
      await supabase.from('products').insert(payload)
    }
    setForm(empty); setEditing(null); await load()
  }

  const edit = (p: Product) => {
    setEditing(p.id)
    setForm({ name: p.name, sku: p.sku, description: p.description, price: p.price, discount: p.discount, stock: p.stock, brand: p.brand, image_url: p.image_url, category_id: p.category_id })
  }

  const del = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    await load()
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Manage Products</h5>
        <input className="form-control" style={{ maxWidth: 260 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="row g-4">
        <div className="col-lg-4">
          <form className="form-card" onSubmit={save}>
            <h6 className="fw-bold mb-3">{editing ? 'Edit Product' : 'Add Product'}</h6>
            <div className="mb-2"><input className="form-control" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="row g-2 mb-2">
              <div className="col"><input className="form-control" placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required /></div>
              <div className="col"><input className="form-control" placeholder="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
            </div>
            <div className="mb-2"><textarea className="form-control" placeholder="Description" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea></div>
            <div className="row g-2 mb-2">
              <div className="col"><input className="form-control" type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
              <div className="col"><input className="form-control" type="number" placeholder="Discount %" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} /></div>
            </div>
            <div className="row g-2 mb-2">
              <div className="col"><input className="form-control" type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required /></div>
              <div className="col">
                <select className="form-select" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-3"><input className="form-control" placeholder="Image URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} /></div>
            <button className="btn btn-primary" type="submit">{editing ? 'Update' : 'Add'}</button>
            {editing && <button className="btn btn-link" onClick={() => { setEditing(null); setForm(empty) }}>Cancel</button>}
          </form>
        </div>
        <div className="col-lg-8">
          <div className="table-card">
            <table className="table">
              <thead><tr><th>Product</th><th>SKU</th><th>Price</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="d-flex gap-2 align-items-center">
                        <img src={p.image_url} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />
                        <span className="small">{p.name}</span>
                      </div>
                    </td>
                    <td className="small">{p.sku}</td>
                    <td>₹{p.price.toFixed(0)}</td>
                    <td>{p.stock === 0 ? <span className="text-danger">0</span> : p.stock < 10 ? <span className="text-warning">{p.stock}</span> : p.stock}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => edit(p)}><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => del(p.id)}><i className="bi bi-trash"></i></button>
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
