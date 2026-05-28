'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Logo, Shell, Card, FieldLabel, Select, TextArea, Btn, LivePill, Eyebrow } from '../components/ui'

export default function FeedbackPage() {
  const [personas, setPersonas] = useState<any[]>([])
  const [sesion, setSesion] = useState<any>(null)
  const [paraId, setParaId] = useState('')
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: p } = await supabase.from('personas').select('*').order('nombre')
    const { data: s } = await supabase.from('sesiones').select('*').eq('activa', true).single()
    setPersonas(p || [])
    setSesion(s || null)
    setLoading(false)
  }

  async function send() {
    if (!paraId || !texto.trim()) {
      setError('Select a person and write your feedback.')
      return
    }
    setEnviando(true)
    setError('')
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ para_persona_id: paraId, texto, sesion_id: sesion.id })
    })
    if (res.ok) { setEnviado(true); setTexto(''); setParaId('') }
    else setError('Something went wrong. Try again.')
    setEnviando(false)
  }

  if (loading) return (
    <Shell>
      <div style={{ marginBottom: '40px' }}><Logo /></div>
      <p style={{ color: 'var(--text-3)', fontSize: '12px' }}>Loading...</p>
    </Shell>
  )

  if (!sesion) return (
    <Shell>
      <div style={{ marginBottom: '40px' }}><Logo /></div>
      <Card>
        <Eyebrow color="var(--text-3)">No active session</Eyebrow>
        <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '20px' }}>
          No feedback session is open right now. Wait for an admin to open one.
        </p>
        <Link href="/" style={{ fontSize: '11px', color: 'var(--text-3)', textDecoration: 'none' }}>← Home</Link>
      </Card>
    </Shell>
  )

  if (enviado) return (
    <Shell>
      <div style={{ marginBottom: '40px' }}><Logo /></div>
      <Card>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'var(--lime-dim)', border: '1px solid #B6FF0033',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--lime)', fontSize: '16px', marginBottom: '20px',
        }}>✓</div>
        <Eyebrow color="var(--lime)">Feedback sent</Eyebrow>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px' }}>
          Done.
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '24px' }}>
          Your message was processed by AI and delivered anonymously.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Btn onClick={() => setEnviado(false)}>Send more feedback →</Btn>
          <Link href="/" style={{
            display: 'block', textAlign: 'center',
            fontSize: '11px', color: 'var(--text-3)', textDecoration: 'none', padding: '8px',
          }}>← Home</Link>
        </div>
      </Card>
    </Shell>
  )

  return (
    <Shell>

      <div style={{ marginBottom: '40px' }}>
        <Logo />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
      }}>
        <div>
          <p style={{
            fontSize: '9px',
            letterSpacing: '0.12em',
            color: 'var(--text-3)',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}>
            Anonymous feedback
          </p>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-1)',
            letterSpacing: '-0.01em',
          }}>
            {sesion.nombre}
          </h1>
        </div>
        <LivePill />
      </div>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <FieldLabel>Who is this for?</FieldLabel>
            <Select
              value={paraId}
              onChange={setParaId}
              placeholder="Select a person..."
              options={personas.map(p => ({ value: String(p.id), label: p.nombre }))}
            />
          </div>

          <div>
            <FieldLabel>Your message</FieldLabel>
            <TextArea
              value={texto}
              onChange={(e: any) => setTexto(e.target.value)}
              placeholder="Be honest. AI rewrites your message constructively before delivery."
            />
          </div>

          {error && (
            <p style={{ fontSize: '11px', color: 'var(--pink)' }}>{error}</p>
          )}

          <p style={{ fontSize: '10px', color: 'var(--text-3)', lineHeight: 1.6 }}>
            Your identity is never stored. Raw text never touches the database.
          </p>

          <Btn onClick={send} disabled={enviando}>
            {enviando ? 'Processing...' : 'Send feedback →'}
          </Btn>
        </div>
      </Card>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Link href="/" style={{ fontSize: '11px', color: 'var(--text-3)', textDecoration: 'none' }}>
          ← Home
        </Link>
      </div>

    </Shell>
  )
}