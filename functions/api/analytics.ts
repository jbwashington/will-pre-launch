interface Env {
  DB: D1Database
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const body = await context.request.json() as any
    const { event_type, user_id, metadata } = body

    const db = context.env.DB

    await db.prepare(`
      INSERT INTO analytics_events (event_type, user_id, metadata)
      VALUES (?, ?, ?)
    `).bind(
      event_type,
      user_id || null,
      JSON.stringify(metadata || {})
    ).run()

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Analytics tracking error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to track event' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const db = context.env.DB

    // Get analytics summary
    const { total_events } = await db.prepare(
      'SELECT COUNT(*) as total_events FROM analytics_events'
    ).first() as any

    const { total_waitlist } = await db.prepare(
      'SELECT COUNT(*) as total_waitlist FROM waitlist'
    ).first() as any

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          total_events: total_events || 0,
          total_waitlist: total_waitlist || 0
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Fetch analytics error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch analytics' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
