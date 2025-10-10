"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface WaitlistFormProps {
  onSuccess: (position: number, referralCode: string) => void
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Check if user was referred
      const urlParams = new URLSearchParams(window.location.search)
      const referralCode = urlParams.get('ref')

      let referredBy = null
      if (referralCode) {
        const { data: referrer } = await supabase
          .from('waitlist')
          .select('id')
          .eq('referral_code', referralCode)
          .single()

        referredBy = referrer?.id || null
      }

      // Insert the new waitlist entry
      const { data, error: insertError } = await supabase
        .from('waitlist')
        .insert({
          email,
          name: name || null,
          phone: phone || null,
          zip_code: zipCode || null,
          referred_by: referredBy,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Track analytics event
      await supabase.from('analytics_events').insert({
        event_type: 'waitlist_join',
        user_id: data.id,
        metadata: {
          referred: !!referredBy,
          referral_code: referralCode
        }
      })

      onSuccess(data.position || 0, data.referral_code)
    } catch (err: any) {
      if (err.code === '23505') {
        setError('This email is already on the waitlist!')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Join the Waitlist</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Be the first to get exotic snacks delivered to your door
        </p>
      </div>

      <div>
        <Input
          type="email"
          placeholder="Email address *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
      </div>

      <div>
        <Input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <Input
          type="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <Input
          type="text"
          placeholder="ZIP Code (optional)"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          maxLength={5}
          className="w-full"
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !email}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining...
          </>
        ) : (
          'Join Waitlist'
        )}
      </Button>
    </motion.form>
  )
}
