// Cloudflare D1 Database Client
// This replaces Supabase with D1

export interface Env {
  DB: D1Database
}

export interface WaitlistEntry {
  id: string
  email: string
  name: string | null
  phone: string | null
  zip_code: string | null
  referral_code: string
  referred_by: string | null
  position: number | null
  created_at: string
  updated_at: string
  metadata: string
}

export interface AnalyticsEvent {
  id: string
  event_type: string
  user_id: string | null
  metadata: string
  created_at: string
}

export interface GeneratedContent {
  id: string
  content_type: string
  prompt: string
  generated_text: string | null
  metadata: string
  created_at: string
  updated_at: string
}

// Helper to get D1 from request context
export function getDB(request: Request): D1Database {
  const env = (request as any).env
  if (!env || !env.DB) {
    throw new Error('D1 database not available')
  }
  return env.DB
}
