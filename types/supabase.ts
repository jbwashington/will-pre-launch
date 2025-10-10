export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      waitlist: {
        Row: {
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
          metadata: Json
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          phone?: string | null
          zip_code?: string | null
          referral_code?: string
          referred_by?: string | null
          position?: number | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone?: string | null
          zip_code?: string | null
          referral_code?: string
          referred_by?: string | null
          position?: number | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      analytics_events: {
        Row: {
          id: string
          event_type: string
          user_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          user_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          user_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      generated_content: {
        Row: {
          id: string
          content_type: string
          prompt: string
          generated_text: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_type: string
          prompt: string
          generated_text?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_type?: string
          prompt?: string
          generated_text?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
