import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ContentGenerationParams {
  platform: 'tiktok' | 'youtube' | 'instagram' | 'commercial'
  topic?: string
  trendingKeywords?: string[]
  tone?: 'funny' | 'professional' | 'energetic' | 'casual'
  length?: 'short' | 'medium' | 'long'
}

export async function generateSocialContent(params: ContentGenerationParams): Promise<string> {
  const {
    platform,
    topic = 'exotic snacks',
    trendingKeywords = [],
    tone = 'energetic',
    length = 'short'
  } = params

  const platformGuidelines = {
    tiktok: {
      maxLength: 150,
      style: 'Short, punchy, use trending sounds/hashtags, hook in first 3 seconds',
      format: 'Video script with scene descriptions'
    },
    youtube: {
      maxLength: 500,
      style: 'Engaging storytelling, value-driven, clear CTA',
      format: 'Video outline with intro, body, and outro'
    },
    instagram: {
      maxLength: 200,
      style: 'Visual-first, aesthetic, lifestyle-focused',
      format: 'Caption with hashtag strategy'
    },
    commercial: {
      maxLength: 300,
      style: 'Professional, brand-focused, persuasive',
      format: '30-second commercial script'
    }
  }

  const guidelines = platformGuidelines[platform]
  const keywordContext = trendingKeywords.length > 0
    ? `Trending keywords to incorporate: ${trendingKeywords.join(', ')}`
    : ''

  const prompt = `You are a social media content creator for Will's Exotic Snacks, a new exotic snack delivery service in NYC run by Will the Barber.

Brand Voice: ${tone}, authentic, community-driven, trendy

Create ${platform} content about ${topic} that:
- Follows ${platform} best practices: ${guidelines.style}
- Maximum length: ${guidelines.maxLength} words
- Format: ${guidelines.format}
- ${keywordContext}

The content should:
1. Hook attention immediately
2. Highlight the exotic/unique nature of the snacks
3. Create FOMO (fear of missing out)
4. Include a clear call to action (join waitlist)
5. Use NYC local references when appropriate
6. Feel authentic to Will's personality as a barber turned snack curator

Generate the content now:`

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: prompt
    }]
  })

  const content = message.content[0]
  return content.type === 'text' ? content.text : ''
}

export async function getTrendingTopics(): Promise<string[]> {
  // In a real implementation, this would call a trending topics API
  // For now, returning some NYC and snack-related trending topics
  return [
    'exotic snacks nyc',
    'viral food trends',
    'tiktok snacks',
    'international candy',
    'nyc foodie',
    'snack haul',
    'mukbang',
    'food review',
    'rare snacks',
    'brooklyn eats'
  ]
}

export async function optimizeForSEO(content: string): Promise<{
  title: string
  description: string
  keywords: string[]
  hashtags: string[]
}> {
  const prompt = `Analyze this content and generate SEO-optimized metadata:

Content: ${content}

Generate:
1. An engaging, SEO-optimized title (max 60 characters)
2. A compelling meta description (max 160 characters)
3. 10 relevant keywords
4. 10 trending hashtags for social media

Format as JSON.`

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: prompt
    }]
  })

  const content_text = message.content[0]
  const text = content_text.type === 'text' ? content_text.text : '{}'

  try {
    return JSON.parse(text)
  } catch {
    return {
      title: 'Will\'s Exotic Snacks - NYC\'s Hottest Snack Delivery',
      description: 'Join the waitlist for NYC\'s most exclusive exotic snack delivery service.',
      keywords: ['exotic snacks', 'nyc snacks', 'snack delivery', 'will the barber'],
      hashtags: ['#ExoticSnacks', '#NYCFood', '#SnackDelivery', '#Foodie']
    }
  }
}
