'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Logo, Shell, Card, FieldLabel, TextInput, Btn, LivePill, Divider, Eyebrow } from '../components/ui'

const PER_PAGE = 5

export default function AdminPage() {
  const [sesion, setSesion] = useState<any>(null)
  const [historial, setHistorial] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [personas, setPersonas] = useState<any[]>([])
  const [nombre, setNombre] = useState('')
  const [cierre, setCierre] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadBase() }, [])
  useEffect(() => { loadHistorial() }, [pagina])

  async function loadBase() {
    const { data: s } = await supabase.from('sesiones').select('*').eq('activa', true).single()
    const { data: p } = await supabase.from('personas').select('*').order('nombre')
    setSesion(s || null)
    setPersonas(p || [])
    await loadHistorial()
    setLoading(false)
  }

  async function loadHistorial() {
    const from = (pagina - 1) * PER_PAGE
    const { data, count } = await supabase
      .from('sesiones').select('*', { count: 'exact' })
      .eq('activa', false).order('fecha_cierre', { ascending: false })
      .range(from, from + PER_PAGE - 1)
    setHistorial(data || [])
    setTotal(count || 0)
  }

  async function open() {
    if (!nombre.trim()) return
    await supabase.from('sesiones').update({ activa: false }).eq('activa', true)
    await supabase.from('sesiones').insert({
      nombre, activa: true,
      fecha_inicio: new Date().toISOString(),
      ...(cierre ? { fecha_cierre: new Date(cierre).toISOString() } : {})
    })
    setNombre(''); setCierre('')
    loadBase()
  }

  async function close() {
    if (!sesion) return
    await supabase.from('sesiones').update({ activa: false, fecha_cierre: new Date().toISOString() }).eq('id', sesion.id)
    setPagina(1); loadBase()
  }

  const pages = Math.ceil(total / PER_PAGE)

  if (loading) return <Shell><p style={{ color: 'var(--text-3)', fontSize: '12px' }}>Loading...</p></Shell>

  return (
    <Shell>
      <div style={{ marginBottom: '48px' }}><Logo /></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>Admin panel</h1>
        <Link href="/" style={{ fontSize: '11px', color: 'var(--text-3)', textDecoration: 'none' }}>← Home</Link>
      </div>

      {/* Sesión */}
      <Card style={{ marginBottom: '10px' }}>
        <Eyebrow color="var(--text-3)">Current session</Eyebrow>
        {sesion ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '4px' }}>{sesion.nombre}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                  Since {new Date(sesion.fecha_inicio).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {sesion.fecha_cierre && (
                  <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
                    Closes {new Date(sesion.fecha_cierre).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                  </p>
                )}
              </div>
              <LivePill />
            </div>
            <Btn variant="danger" onClick={close}>Close session</Btn>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>No active session.</p>
            <div>
              <FieldLabel>Session name</FieldLabel>
              <TextInput placeholder="e.g. Week of May 28" value={nombre} onChange={(e: any) => setNombre(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Closing date (optional)</FieldLabel>
              <TextInput type="datetime-local" value={cierre} onChange={(e: any) => setCierre(e.target.value)} style={{ colorScheme: 'dark' }} />
            </div>
            <Btn onClick={open} disabled={!nombre.trim()}>Open new session →</Btn>
          </div>
        )}
      </Card>

      {/* PINs */}
      <Card style={{ marginBottom: '10px' }}>
        <Eyebrow color="var(--text-3)">Team PINs</Eyebrow>
        <p style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '18px', lineHeight: 1.6 }}>
          Assign a 4-digit PIN to each member so they can access their feedback.
        </p>
        {personas.map(p => <PinRow key={p.id} persona={p} />)}
      </Card>

      {/* Historial */}
      {total > 0 && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Eyebrow color="var(--text-3)">Session history</Eyebrow>
            <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>{total} total</p>
          </div>
          {historial.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 0',
              borderBottom: i < historial.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>{s.nombre}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                {s.fecha_cierre ? new Date(s.fecha_cierre).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </p>
            </div>
          ))}
          {pages > 1 && (
            <>
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
                  style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '11px', cursor: pagina === 1 ? 'not-allowed' : 'pointer', opacity: pagina === 1 ? 0.3 : 1, fontFamily: 'var(--mono)' }}>
                  ← Prev
                </button>
                <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>{pagina} / {pages}</p>
                <button onClick={() => setPagina(p => Math.min(pages, p + 1))} disabled={pagina === pages}
                  style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '11px', cursor: pagina === pages ? 'not-allowed' : 'pointer', opacity: pagina === pages ? 0.3 : 1, fontFamily: 'var(--mono)' }}>
                  Next →
                </button>
              </div>
            </>
          )}
        </Card>
      )}
    </Shell>
  )
}

function PinRow({ persona }: { persona: any }) {
  const [pin, setPin] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (pin.length !== 4) return
    setSaving(true)
    await fetch('/api/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona_id: persona.id, pin })
    })
    setSaved(true); setSaving(false); setPin('')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <p style={{ flex: 1, fontSize: '13px', color: 'var(--text-2)' }}>{persona.nombre}</p>
      <input
        type="text" inputMode="numeric" maxLength={4} placeholder="····" value={pin}
        onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
        style={{
          width: '56px', background: 'var(--bg-input)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '7px 8px', fontFamily: 'var(--mono)',
          fontSize: '13px', color: 'var(--text-1)', textAlign: 'center', letterSpacing: '0.15em', outline: 'none',
        }}
      />
      <button onClick={save} disabled={pin.length !== 4 || saving}
        style={{
          background: saved ? 'var(--lime-dim)' : 'var(--bg-input)',
          border: saved ? '1px solid #B6FF0033' : '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '7px 12px',
          fontFamily: 'var(--mono)', fontSize: '11px',
          color: saved ? 'var(--lime)' : 'var(--text-2)',
          cursor: pin.length !== 4 ? 'not-allowed' : 'pointer',
          opacity: pin.length !== 4 ? 0.35 : 1, transition: 'all 0.2s', whiteSpace: 'nowrap',
        }}>
        {saved ? '✓ saved' : saving ? '...' : 'save'}
      </button>
    </div>
  )
}