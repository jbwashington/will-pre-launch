"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Users, Video, Image as ImageIcon } from "lucide-react"

interface GeneratedContent {
  id: string
  content_type: string
  generated_text: string
  created_at: string
  metadata: any
}

export default function Dashboard() {
  const [platform, setPlatform] = useState<'tiktok' | 'youtube' | 'instagram' | 'commercial'>('tiktok')
  const [loading, setLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [contentHistory, setContentHistory] = useState<GeneratedContent[]>([])
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    fetchContentHistory()
    fetchAnalytics()
  }, [])

  const fetchContentHistory = async () => {
    try {
      const response = await fetch('/api/generate-content')
      const data = await response.json()
      if (data.success) {
        setContentHistory(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch content history:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics')
      const data = await response.json()
      if (data.success) {
        setAnalytics(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  const handleGenerateContent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          topic: 'exotic snacks',
          tone: 'energetic',
          length: 'medium',
          trendingKeywords: ['nyc', 'exotic', 'viral', 'foodie']
        })
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedContent(data.content)
        fetchContentHistory()
      }
    } catch (error) {
      console.error('Failed to generate content:', error)
    } finally {
      setLoading(false)
    }
  }

  const platforms = [
    { id: 'tiktok', name: 'TikTok', icon: <Video className="w-5 h-5" />, color: 'from-pink-500 to-purple-500' },
    { id: 'youtube', name: 'YouTube', icon: <Video className="w-5 h-5" />, color: 'from-red-500 to-red-600' },
    { id: 'instagram', name: 'Instagram', icon: <ImageIcon className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { id: 'commercial', name: 'Commercial', icon: <Sparkles className="w-5 h-5" />, color: 'from-orange-500 to-red-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Content Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Generate viral social media content powered by Claude AI
          </p>
        </motion.div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-orange-600" />
                <h3 className="font-semibold">Total Waitlist</h3>
              </div>
              <p className="text-3xl font-bold">{analytics.totalWaitlist || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold">Total Events</h3>
              </div>
              <p className="text-3xl font-bold">{analytics.totalEvents || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold">Content Generated</h3>
              </div>
              <p className="text-3xl font-bold">{contentHistory.length}</p>
            </motion.div>
          </div>
        )}

        {/* Content Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-4">Generate Content</h2>

            {/* Platform Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id as any)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    platform === p.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {p.icon}
                    <span className="font-semibold">{p.name}</span>
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={handleGenerateContent}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {loading ? (
                <>Generating...</>
              ) : (
                <>
                  <Sparkles className="mr-2 w-5 h-5" />
                  Generate {platform.charAt(0).toUpperCase() + platform.slice(1)} Content
                </>
              )}
            </Button>

            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <h3 className="font-semibold mb-2">Generated Content:</h3>
                <p className="whitespace-pre-wrap text-sm">{generatedContent}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Content History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-4">Recent Content</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {contentHistory.map((content) => (
                <div
                  key={content.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                      {content.content_type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(content.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-3">{content.generated_text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
