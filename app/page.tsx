import Link from 'next/link'
import { Logo, Shell, Divider } from './components/ui'

export default function Home() {
  return (
    <Shell>
      <div style={{ marginBottom: '56px' }}><Logo /></div>

      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '9px', letterSpacing: '0.14em', color: 'var(--pink)', textTransform: 'uppercase', marginBottom: '14px' }}>
          Anonymous feedback platform
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '12px' }}>
          Give feedback.<br />Build trust.
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7 }}>
          A safe, anonymous space for your team to grow together.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
        <Link href="/feedback" style={{
          display: 'block', textAlign: 'center', padding: '13px 16px',
          background: 'var(--text-1)', color: 'var(--bg)',
          borderRadius: 'var(--radius-sm)', fontFamily: 'var(--mono)',
          fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textDecoration: 'none',
        }}>
          Give feedback →
        </Link>
        <Link href="/mi-feedback" style={{
          display: 'block', textAlign: 'center', padding: '12px 16px',
          background: 'transparent', color: 'var(--text-2)',
          border: '1px solid var(--border-hi)', borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--mono)', fontSize: '12px', textDecoration: 'none',
        }}>
          View my feedback
        </Link>
      </div>

      <Divider />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>v1.0.0</span>
        <Link href="/admin" style={{ fontSize: '11px', color: 'var(--text-3)', textDecoration: 'none' }}>Admin</Link>
      </div>
    </Shell>
  )
}