'use client'

import Image from 'next/image'
import { useState, useRef, useEffect, type ReactNode, type CSSProperties, type ButtonHTMLAttributes } from 'react'

export function Logo() {
  return (
    <Image
      src="/logo-baf.png"
      alt="BAF"
      width={140}
      height={140}
      style={{
        objectFit: 'contain',
        objectPosition: 'left center',
        mixBlendMode: 'screen',
      }}
      priority
    />
  )
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {children}
      </div>
    </main>
  )
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-hi)',
      borderRadius: 'var(--radius)',
      padding: '24px',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p style={{
      fontSize: '9px',
      letterSpacing: '0.14em',
      color: 'var(--text-3)',
      textTransform: 'uppercase',
      marginBottom: '8px',
    }}>
      {children}
    </p>
  )
}

export function TextInput({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { style?: CSSProperties }) {
  return (
    <input
      style={{
        width: '100%',
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '11px 14px',
        fontSize: '13px',
        color: 'var(--text-1)',
        outline: 'none',
        fontFamily: 'var(--mono)',
        ...style,
      }}
      {...props}
    />
  )
}

export function TextArea({ style, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { style?: CSSProperties }) {
  return (
    <textarea
      style={{
        width: '100%',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-hi)',
        borderRadius: 'var(--radius-sm)',
        padding: '11px 14px',
        fontSize: '13px',
        color: 'var(--text-1)',
        outline: 'none',
        fontFamily: 'var(--mono)',
        resize: 'none',
        minHeight: '120px',
        lineHeight: 1.7,
        ...style,
      }}
      {...props}
    />
  )
}

// Custom select — no native browser styling
export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
}: {
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'var(--bg-input)',
          border: `1px solid ${open ? 'var(--border-hi)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '11px 14px',
          fontSize: '13px',
          color: selected ? 'var(--text-1)' : 'var(--text-3)',
          fontFamily: 'var(--mono)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <span style={{
          color: 'var(--text-3)',
          fontSize: '10px',
          transition: 'transform 0.15s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-hi)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          zIndex: 100,
          maxHeight: '200px',
          overflowY: 'auto',
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: opt.value === value ? 'var(--bg-input)' : 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                color: opt.value === value ? 'var(--text-1)' : 'var(--text-2)',
                fontSize: '13px',
                fontFamily: 'var(--mono)',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// PIN input con celdas individuales
export function PinInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus()
      onChange(value.slice(0, i - 1))
    }
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const digit = e.target.value.replace(/\D/g, '').slice(-1)
    const next = (value.slice(0, i) + digit + value.slice(i + 1)).slice(0, 4)
    onChange(next)
    if (digit && i < 3) inputs.current[i + 1]?.focus()
  }

  function handleFocus(i: number) {
    // Focus the first empty cell, or last filled
    const firstEmpty = value.length < 4 ? value.length : 3
    if (i > firstEmpty) inputs.current[firstEmpty]?.focus()
  }

  const cellStyle = (i: number): CSSProperties => ({
    width: '60px',
    height: '64px',
    background: 'var(--bg-input)',
    border: `1px solid ${value.length === i ? 'var(--border-hi)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-sm)',
    textAlign: 'center',
    fontSize: '22px',
    color: 'var(--text-1)',
    fontFamily: 'var(--mono)',
    outline: 'none',
    caretColor: 'transparent',
  })

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
      {[0, 1, 2, 3].map(i => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ? '●' : ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onFocus={() => handleFocus(i)}
          style={cellStyle(i)}
        />
      ))}
    </div>
  )
}

type BtnVariant = 'primary' | 'ghost' | 'danger'

export function Btn({
  variant = 'primary',
  children,
  style,
  ...props
}: {
  variant?: BtnVariant
  children: ReactNode
  style?: CSSProperties
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const map: Record<BtnVariant, CSSProperties> = {
    primary: { background: 'var(--text-1)', color: 'var(--bg)', border: 'none' },
    ghost:   { background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border-hi)' },
    danger:  { background: 'var(--pink-dim)', color: 'var(--pink)', border: '1px solid #EB51FF33' },
  }
  return (
    <button style={{
      width: '100%',
      padding: '12px 16px',
      borderRadius: 'var(--radius-sm)',
      fontSize: '12px',
      fontWeight: 700,
      letterSpacing: '0.05em',
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      opacity: props.disabled ? 0.35 : 1,
      fontFamily: 'var(--mono)',
      transition: 'opacity 0.15s',
      ...map[variant],
      ...style,
    }} {...props}>
      {children}
    </button>
  )
}

export function LivePill() {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      border: '1px solid #B6FF0022',
      borderRadius: '20px',
      padding: '3px 10px',
      fontSize: '9px',
      color: 'var(--lime)',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    }}>
      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--lime)' }} />
      Live
    </div>
  )
}

export function Divider() {
  return <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />
}

export function Eyebrow({ children, color = 'var(--pink)' }: { children: ReactNode; color?: string }) {
  return (
    <p style={{
      fontSize: '9px',
      letterSpacing: '0.14em',
      color,
      textTransform: 'uppercase',
      marginBottom: '10px',
    }}>
      {children}
    </p>
  )
}

export function BackLink({ href }: { href: string }) {
  return (
    <a href={href} style={{
      fontSize: '11px',
      color: 'var(--text-3)',
      textDecoration: 'none',
      fontFamily: 'var(--mono)',
    }}>
      ← Home
    </a>
  )
}