import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface Env {
  DB: D1Database
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, phone, zip_code, referred_by } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Access D1 from Cloudflare Pages context
    const env = (request as any).env as Env
    if (!env || !env.DB) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    const db = env.DB

    // Check if email already exists
    const existing = await db.prepare(
      'SELECT id FROM waitlist WHERE email = ?'
    ).bind(email).first()

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist!' },
        { status: 409 }
      )
    }

    // Insert new waitlist entry
    const id = crypto.randomUUID()
    const referralCode = Math.random().toString(36).substring(2, 10)

    await db.prepare(`
      INSERT INTO waitlist (id, email, name, phone, zip_code, referral_code, referred_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      email,
      name || null,
      phone || null,
      zip_code || null,
      referralCode,
      referred_by || null
    ).run()

    // Get the created entry with position
    const entry = await db.prepare(
      'SELECT * FROM waitlist WHERE id = ?'
    ).bind(id).first()

    // Track analytics event
    await db.prepare(`
      INSERT INTO analytics_events (event_type, user_id, metadata)
      VALUES (?, ?, ?)
    `).bind(
      'waitlist_join',
      id,
      JSON.stringify({ referred: !!referred_by })
    ).run()

    return NextResponse.json({
      success: true,
      data: {
        id: entry?.id,
        email: entry?.email,
        position: entry?.position || 0,
        referral_code: entry?.referral_code
      }
    })
  } catch (error: any) {
    console.error('Waitlist signup error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const env = (request as any).env as Env
    if (!env || !env.DB) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    const db = env.DB

    // Get total count
    const { total } = await db.prepare(
      'SELECT COUNT(*) as total FROM waitlist'
    ).first() as any

    // Get recent entries
    const { results } = await db.prepare(
      'SELECT id, email, position, created_at FROM waitlist ORDER BY created_at DESC LIMIT 10'
    ).all()

    return NextResponse.json({
      success: true,
      total,
      recent: results
    })
  } catch (error: any) {
    console.error('Fetch waitlist error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch waitlist' },
      { status: 500 }
    )
  }
}
