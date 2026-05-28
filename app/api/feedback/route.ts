import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function POST(request: NextRequest) {
  try {
    const { para_persona_id, texto, sesion_id } = await request.json()

    if (!para_persona_id || !texto || !sesion_id) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Transformar con Claude
    const mensaje = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Eres un coach de equipos experto en comunicación no violenta. Recibiste este feedback anónimo sobre una persona de un equipo:

"${texto}"

Reescríbelo de forma constructiva, cordial y orientada al crecimiento profesional.
Estructura tu respuesta exactamente así:

**Observación:** (describe lo que se percibe, sin juicio ni ataque personal)

**Oportunidad de mejora:** (qué podría trabajar esta persona)

**Paso de acción sugerido:** (algo concreto, alcanzable y específico)

Responde solo con el feedback transformado, sin introducción ni explicación adicional.`
      }]
    })

    const textoTransformado = mensaje.content[0].type === 'text'
      ? mensaje.content[0].text
      : texto

    // Guardar SOLO el texto transformado — el original nunca toca la base de datos
    const { error } = await supabase
      .from('feedbacks')
      .insert({
        sesion_id,
        para_persona_id,
        texto_procesado: textoTransformado
      })

    if (error) {
      console.error('Error guardando en Supabase:', error)
      return NextResponse.json(
        { error: 'Error guardando el feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Error en /api/feedback:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}