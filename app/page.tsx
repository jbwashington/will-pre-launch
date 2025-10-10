"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import confetti from "canvas-confetti"
import { Sparkles, Users, Gift, Share2, TrendingUp } from "lucide-react"
import { WaitlistForm } from "@/components/waitlist-form"
import { ShareDialog } from "@/components/share-dialog"

export default function Home() {
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [userPosition, setUserPosition] = useState<number | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  const handleJoinSuccess = (position: number, code: string) => {
    setUserPosition(position)
    setReferralCode(code)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo/Brand */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">Will's Exotic Snacks</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                NYC's Hottest
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Exotic Snack Delivery
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              From the barber chair to your doorstep. Will's bringing you the
              <span className="font-bold text-orange-600"> world's most fire snacks</span> -
              coming to NYC neighborhoods soon.
            </p>

            {/* CTA Section */}
            {!userPosition ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {!showWaitlist ? (
                  <Button
                    onClick={() => setShowWaitlist(true)}
                    size="lg"
                    className="text-lg px-8 py-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-xl"
                  >
                    Join the Waitlist
                    <Users className="ml-2 w-5 h-5" />
                  </Button>
                ) : (
                  <WaitlistForm onSuccess={handleJoinSuccess} />
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white mb-4">
                    <Gift className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">You're In!</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    You're #{userPosition} on the waitlist
                  </p>
                  <div className="bg-orange-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium mb-2">Your Referral Code</p>
                    <p className="text-2xl font-bold font-mono text-orange-600">
                      {referralCode}
                    </p>
                  </div>
                  <ShareDialog referralCode={referralCode!} position={userPosition} />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Exotic Selection",
                description: "Rare snacks from around the world, curated by Will himself"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Trending Flavors",
                description: "Stay ahead with viral TikTok and YouTube snack trends"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Community Driven",
                description: "Join NYC's growing exotic snack community"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Join the Movement
            </h2>
            <p className="text-xl opacity-90">
              Be part of NYC's exotic snack revolution
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
