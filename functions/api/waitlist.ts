interface Env {
  DB: D1Database
  ANTHROPIC_API_KEY: string
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const body = await context.request.json() as any
    const { email, name, phone, zip_code, referred_by } = body

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const db = context.env.DB

    // Check if email already exists
    const existing = await db.prepare(
      'SELECT id FROM waitlist WHERE email = ?'
    ).bind(email).first()

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'This email is already on the waitlist!' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
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
    ).bind(id).first() as any

    // Track analytics event
    await db.prepare(`
      INSERT INTO analytics_events (event_type, user_id, metadata)
      VALUES (?, ?, ?)
    `).bind(
      'waitlist_join',
      id,
      JSON.stringify({ referred: !!referred_by })
    ).run()

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: entry?.id,
          email: entry?.email,
          position: entry?.position || 0,
          referral_code: entry?.referral_code
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Waitlist signup error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to join waitlist' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const db = context.env.DB

    // Get total count
    const { total } = await db.prepare(
      'SELECT COUNT(*) as total FROM waitlist'
    ).first() as any

    // Get recent entries
    const { results } = await db.prepare(
      'SELECT id, email, position, created_at FROM waitlist ORDER BY created_at DESC LIMIT 10'
    ).all()

    return new Response(
      JSON.stringify({
        success: true,
        total,
        recent: results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Fetch waitlist error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch waitlist' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
