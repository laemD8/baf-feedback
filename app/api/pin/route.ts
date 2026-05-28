import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function hashPin(pin: string): string {
  return createHash('sha256').update(pin + 'baf-salt-2024').digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { persona_id, pin } = await request.json()

    if (!persona_id || !pin || pin.length !== 4) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 })
    }

    const { error } = await supabase
      .from('personas')
      .update({ pin_hash: hashPin(pin) })
      .eq('id', persona_id)

    if (error) {
      return NextResponse.json({ error: 'Error saving PIN' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { persona_id, pin } = await request.json()

    const { data, error } = await supabase
      .from('personas')
      .select('pin_hash')
      .eq('id', persona_id)
      .single()

    if (error || !data) {
      return NextResponse.json({ valido: false })
    }

    if (!data.pin_hash) {
      return NextResponse.json({ valido: false, sin_pin: true })
    }

    const valido = data.pin_hash === hashPin(pin)
    return NextResponse.json({ valido })

  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}