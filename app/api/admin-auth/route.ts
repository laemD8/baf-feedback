import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const correct = process.env.ADMIN_PASSWORD

  if (!correct) return NextResponse.json({ ok: false }, { status: 500 })
  if (password === correct) return NextResponse.json({ ok: true })
  return NextResponse.json({ ok: false }, { status: 401 })
}