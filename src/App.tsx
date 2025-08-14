
import React, { useEffect, useState } from 'react'

declare global {
  interface Window { api: any }
}

export default function App() {
  const [apiKey, setApiKey] = useState('')
  const [assets, setAssets] = useState<any[]>([])

  useEffect(() => { window.api.getApiKey().then((k: string) => setApiKey(k || '')) }, [])

  const saveKey = async () => { await window.api.setApiKey(apiKey); alert('API-Key gespeichert') }
  const loadAssets = async () => { const list = await window.api.listAssets(); setAssets(list || []) }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', height:'100vh', fontFamily:'system-ui, sans-serif' }}>
      <aside style={{ background:'#f3f4f6', padding:'16px' }}>
        <h3 style={{ marginTop:0, color:'#155724' }}>Bitpanda Balancer</h3>
        <button style={btn(false)}>Dashboard</button>
        <button style={btn(false)}>Assets verwalten</button>
        <button style={btn(false)}>Asset-Liste</button>
        <button style={btn(true)}>Rebalancing</button>
        <button style={btn(false)}>Historie</button>
        <button style={btn(false)}>Einstellungen</button>
      </aside>
      <main style={{ padding:'20px' }}>
        <h2>Quick Start</h2>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Bitpanda API-Key" style={{ flex:1, padding:8 }} />
          <button onClick={saveKey} style={btn(false)}>Speichern</button>
        </div>
        <div style={{ marginTop:16 }}>
          <button onClick={loadAssets} style={btn(false)}>Assets laden</button>
          <pre style={{ background:'#111', color:'#0f0', padding:12, marginTop:8, maxHeight:300, overflow:'auto' }}>{JSON.stringify(assets, null, 2)}</pre>
        </div>
      </main>
    </div>
  )
}

function btn(active:boolean): React.CSSProperties {
  return {
    padding:'10px 12px', margin:'6px 0', width:'100%',
    background: active ? '#155724' : '#D4EDDA',
    color: active ? '#fff' : '#155724',
    border:'1.5px solid #155724', borderRadius:10, cursor:'pointer', fontWeight:600
  }
}
