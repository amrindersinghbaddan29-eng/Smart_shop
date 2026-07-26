import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('contact_messages').insert(form)
    setSent(true)
    setForm({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="container my-5">
      <div className="row g-4">
        <div className="col-lg-5">
          <h2 className="fw-bold">Get in Touch</h2>
          <p className="text-muted">Have a question or feedback? We'd love to hear from you.</p>
          <div className="d-flex flex-column gap-3 mt-4">
            <div className="d-flex gap-3 align-items-center">
              <div className="stat-icon" style={{ background: 'var(--primary)', width: 48, height: 48 }}><i className="bi bi-geo-alt"></i></div>
              <div><div className="fw-semibold">Address</div><small className="text-muted">123 Market Street, Mumbai</small></div>
            </div>
            <div className="d-flex gap-3 align-items-center">
              <div className="stat-icon" style={{ background: 'var(--accent)', width: 48, height: 48 }}><i className="bi bi-envelope"></i></div>
              <div><div className="fw-semibold">Email</div><small className="text-muted">support@smartshop.com</small></div>
            </div>
            <div className="d-flex gap-3 align-items-center">
              <div className="stat-icon" style={{ background: 'var(--success)', width: 48, height: 48 }}><i className="bi bi-telephone"></i></div>
              <div><div className="fw-semibold">Phone</div><small className="text-muted">+91 98765 43210</small></div>
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <form className="form-card" onSubmit={submit}>
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="col-12"><label className="form-label">Subject</label><input className="form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required /></div>
              <div className="col-12"><label className="form-label">Message</label><textarea className="form-control" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required></textarea></div>
              <div className="col-12"><button className="btn btn-primary" type="submit">Send Message</button>
                {sent && <span className="text-success ms-3">Message sent! We'll get back soon.</span>}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
