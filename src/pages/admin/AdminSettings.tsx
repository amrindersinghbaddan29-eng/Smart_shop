import { useState } from 'react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'SmartShop',
    taxRate: '5',
    shippingFlat: '49',
    freeShippingMin: '999',
    emailFrom: 'support@smartshop.com',
  })
  const [saved, setSaved] = useState(false)

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <h5 className="fw-bold mb-3">Settings</h5>
      <form className="form-card" onSubmit={save} style={{ maxWidth: 560 }}>
        <div className="mb-3"><label className="form-label">Website Name</label><input className="form-control" value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} /></div>
        <div className="row g-3 mb-3">
          <div className="col"><label className="form-label">Tax Rate (%)</label><input className="form-control" value={settings.taxRate} onChange={e => setSettings({ ...settings, taxRate: e.target.value })} /></div>
          <div className="col"><label className="form-label">Flat Shipping</label><input className="form-control" value={settings.shippingFlat} onChange={e => setSettings({ ...settings, shippingFlat: e.target.value })} /></div>
        </div>
        <div className="mb-3"><label className="form-label">Free Shipping Above</label><input className="form-control" value={settings.freeShippingMin} onChange={e => setSettings({ ...settings, freeShippingMin: e.target.value })} /></div>
        <div className="mb-3"><label className="form-label">From Email</label><input className="form-control" value={settings.emailFrom} onChange={e => setSettings({ ...settings, emailFrom: e.target.value })} /></div>
        <button className="btn btn-primary" type="submit">Save Settings</button>
        {saved && <span className="text-success ms-3">Settings saved!</span>}
      </form>
    </>
  )
}
