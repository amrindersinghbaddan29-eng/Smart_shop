import { useEffect, useState } from 'react'
import { supabase, type ContactMessage } from '../../lib/supabase'

export default function AdminMessages() {
  const [msgs, setMsgs] = useState<ContactMessage[]>([])

  const load = async () => {
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    setMsgs((data || []) as ContactMessage[])
  }
  useEffect(() => { load() }, [])

  const markReplied = async (id: string) => {
    await supabase.from('contact_messages').update({ replied: true }).eq('id', id)
    await load()
  }

  return (
    <>
      <h5 className="fw-bold mb-3">Customer Messages</h5>
      <div className="row g-3">
        {msgs.length === 0 ? (
          <div className="col-12"><div className="empty-state"><i className="bi bi-envelope"></i><p>No messages yet.</p></div></div>
        ) : msgs.map(m => (
          <div className="col-12" key={m.id}>
            <div className="form-card">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="fw-bold mb-1">{m.subject}</h6>
                  <small className="text-muted">From {m.name} · {m.email} · {new Date(m.created_at).toLocaleString()}</small>
                </div>
                {m.replied ? <span className="status-pill status-Delivered">Replied</span> : <span className="status-pill status-Pending">New</span>}
              </div>
              <p className="mt-2 mb-2">{m.message}</p>
              {!m.replied && <button className="btn btn-sm btn-outline-primary" onClick={() => markReplied(m.id)}>Mark as Replied</button>}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
