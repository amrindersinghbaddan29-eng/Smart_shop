import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([])

  useEffect(() => {
    supabase.from('customers').select('*').order('created_at', { ascending: false }).then(({ data }) => setCustomers(data || []))
  }, [])

  return (
    <>
      <h5 className="fw-bold mb-3">Customers</h5>
      <div className="table-card">
        <table className="table">
          <thead><tr><th>Name</th><th>Phone</th><th>Joined</th></tr></thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan={3} className="text-center text-muted">No customers yet</td></tr>
            ) : customers.map(c => (
              <tr key={c.id}>
                <td className="fw-semibold">{c.full_name || '—'}</td>
                <td>{c.phone || '—'}</td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
