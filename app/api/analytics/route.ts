import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface Env {
  DB: D1Database
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, user_id, metadata } = body

    if (!event_type) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      )
    }

    const env = (request as any).env as Env
    if (!env || !env.DB) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    const db = env.DB

    await db.prepare(`
      INSERT INTO analytics_events (event_type, user_id, metadata)
      VALUES (?, ?, ?)
    `).bind(
      event_type,
      user_id || null,
      JSON.stringify(metadata || {})
    ).run()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to track event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get('event_type')
    const limit = parseInt(searchParams.get('limit') || '100')

    const env = (request as any).env as Env
    if (!env || !env.DB) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    const db = env.DB

    // Get events
    let query = `SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT ${limit}`
    if (eventType) {
      query = `SELECT * FROM analytics_events WHERE event_type = '${eventType}' ORDER BY created_at DESC LIMIT ${limit}`
    }

    const { results: data } = await db.prepare(query).all()

    // Get stats
    const { total: totalEvents } = await db.prepare(
      'SELECT COUNT(*) as total FROM analytics_events'
    ).first() as any

    const { total: totalWaitlist } = await db.prepare(
      'SELECT COUNT(*) as total FROM waitlist'
    ).first() as any

    return NextResponse.json({
      success: true,
      data,
      stats: {
        totalEvents,
        totalWaitlist
      }
    })
  } catch (error: any) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
