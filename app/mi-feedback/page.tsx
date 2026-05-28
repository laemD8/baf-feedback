'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Logo, Shell, Card, FieldLabel, Select, Btn, PinInput, Divider, Eyebrow } from '../components/ui'

type Step = 'select' | 'pin' | 'result'

export default function MyFeedbackPage() {
  const [personas, setPersonas] = useState<any[]>([])
  const [sesiones, setSesiones] = useState<any[]>([])
  const [sesionActiva, setSesionActiva] = useState<any>(null)
  const [personaId, setPersonaId] = useState('')
  const [sesionId, setSesionId] = useState('')
  const [pin, setPin] = useState('')
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [persona, setPersona] = useState<any>(null)
  const [step, setStep] = useState<Step>('select')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: p } = await supabase.from('personas').select('*').order('nombre')
    const { data: s } = await supabase.from('sesiones').select('*').eq('activa', false).order('fecha_cierre', { ascending: false })
    const { data: sa } = await supabase.from('sesiones').select('*').eq('activa', true).single()
    setPersonas(p || [])
    setSesiones(s || [])
    setSesionActiva(sa || null)
  }

  async function next() {
    if (!personaId || !sesionId) { setError('Select your name and a session.'); return }
    setError('')
    setStep('pin')
  }

  async function verify() {
    if (pin.length !== 4) { setError('PIN must be 4 digits.'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/pin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona_id: personaId, pin })
    })
    const result = await res.json()
    if (result.sin_pin) { setError('No PIN configured. Ask your admin.'); setLoading(false); return }
    if (!result.valido) { setError('Incorrect PIN.'); setLoading(false); return }
    const { data } = await supabase
      .from('feedbacks').select('*')
      .eq('para_persona_id', personaId)
      .eq('sesion_id', sesionId)
      .order('created_at', { ascending: true })
    setFeedbacks(data || [])
    setPersona(personas.find(p => p.id === parseInt(personaId)))
    setStep('result')
    setLoading(false)
  }

  const personaOptions = personas.map(p => ({ value: String(p.id), label: p.nombre }))
  const sessionOptions = sesiones.map(s => ({
    value: String(s.id),
    label: `${s.nombre} — ${new Date(s.fecha_cierre).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }))

  return (
    <Shell>

      <div style={{ marginBottom: '40px' }}>
        <Logo />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--text-1)',
          letterSpacing: '-0.01em',
        }}>
          My feedback
        </h1>
        <Link href="/" style={{ fontSize: '11px', color: 'var(--text-3)', textDecoration: 'none' }}>
          ← Home
        </Link>
      </div>

      {step === 'select' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {sesionActiva && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '16px 20px',
            }}>
              <p style={{
                fontSize: '9px', letterSpacing: '0.1em',
                color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '6px',
              }}>
                Session in progress
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.7 }}>
                "{sesionActiva.nombre}" is open. Results available once the admin closes it.
              </p>
            </div>
          )}

          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <FieldLabel>Who are you?</FieldLabel>
                <Select
                  value={personaId}
                  onChange={setPersonaId}
                  placeholder="Select your name..."
                  options={personaOptions}
                />
              </div>

              {sesiones.length > 0 ? (
                <>
                  <div>
                    <FieldLabel>Which session?</FieldLabel>
                    <Select
                      value={sesionId}
                      onChange={setSesionId}
                      placeholder="Select a session..."
                      options={sessionOptions}
                    />
                  </div>
                  {error && (
                    <p style={{ fontSize: '11px', color: 'var(--pink)' }}>{error}</p>
                  )}
                  <Btn onClick={next}>Continue →</Btn>
                </>
              ) : (
                <p style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.6 }}>
                  No closed sessions yet. Check back after the admin closes the current session.
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {step === 'pin' && (
        <Card>
          <Eyebrow color="var(--text-3)">Verification</Eyebrow>
          <h2 style={{
            fontSize: '18px', fontWeight: 700,
            color: 'var(--text-1)', marginBottom: '6px',
          }}>
            Enter your PIN
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '28px' }}>
            4-digit code assigned by your admin.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <PinInput value={pin} onChange={setPin} />
            {error && (
              <p style={{ fontSize: '11px', color: 'var(--pink)', textAlign: 'center' }}>{error}</p>
            )}
            <Btn onClick={verify} disabled={loading || pin.length !== 4}>
              {loading ? 'Verifying...' : 'View my feedback →'}
            </Btn>
            <button
              onClick={() => { setStep('select'); setPin(''); setError('') }}
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-3)', fontSize: '11px',
                cursor: 'pointer', fontFamily: 'var(--mono)', padding: '6px',
              }}
            >
              ← Back
            </button>
          </div>
        </Card>
      )}

      {step === 'result' && (
        <Card>
          <Eyebrow>Feedback results</Eyebrow>
          <h2 style={{
            fontSize: '18px', fontWeight: 700,
            color: 'var(--text-1)', marginBottom: '4px',
          }}>
            {persona?.nombre}
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '24px' }}>
            {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} received
          </p>

          {feedbacks.length > 0 ? feedbacks.map((fb, i) => (
            <div key={fb.id} style={{
              paddingTop: i === 0 ? 0 : '20px',
              paddingBottom: '20px',
              borderBottom: i < feedbacks.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <p style={{
                fontSize: '9px', letterSpacing: '0.1em',
                color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '10px',
              }}>
                #{String(i + 1).padStart(2, '0')}
              </p>
              <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.8 }}>
                <ReactMarkdown
                  components={{
                    strong: ({ children }) => (
                      <span style={{ color: 'var(--text-1)', fontWeight: 700 }}>{children}</span>
                    ),
                    p: ({ children }) => (
                      <p style={{ marginBottom: '8px' }}>{children}</p>
                    ),
                  }}
                >
                  {fb.texto_procesado}
                </ReactMarkdown>
              </div>
            </div>
          )) : (
            <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>
              No feedback received this session.
            </p>
          )}

          <Divider />
          <button
            onClick={() => { setStep('select'); setPin(''); setFeedbacks([]) }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-3)', fontSize: '11px',
              cursor: 'pointer', fontFamily: 'var(--mono)', padding: 0,
            }}
          >
            ← View another session
          </button>
        </Card>
      )}

    </Shell>
  )
}