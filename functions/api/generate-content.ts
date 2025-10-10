import Anthropic from '@anthropic-ai/sdk'

interface Env {
  DB: D1Database
  ANTHROPIC_API_KEY: string
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const body = await context.request.json() as any
    const { platform, topic, trending_keywords, tone, length } = body

    // Initialize Claude AI
    const client = new Anthropic({
      apiKey: context.env.ANTHROPIC_API_KEY
    })

    // Create platform-specific prompt
    const prompt = `Generate ${platform} content for Will the Barber's Exotic Snacks delivery service in NYC.

Topic: ${topic}
Trending Keywords: ${trending_keywords || 'exotic snacks, NYC delivery, unique flavors'}
Tone: ${tone || 'energetic'}
Length: ${length || 'medium'}

Create engaging ${platform}-specific content that:
- Captures attention in the first 2 seconds
- Highlights exotic snacks and unique flavors
- Includes a strong call-to-action
- Uses trending keywords naturally
- Optimized for ${platform}'s format and audience

Return the content in this JSON format:
{
  "content": "the main content/script",
  "hashtags": ["list", "of", "hashtags"],
  "visual_suggestions": "brief description of visuals",
  "hook": "attention-grabbing opening line"
}`

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const generatedContent = message.content[0].type === 'text'
      ? message.content[0].text
      : ''

    // Parse the generated content
    let parsedContent
    try {
      parsedContent = JSON.parse(generatedContent)
    } catch {
      parsedContent = {
        content: generatedContent,
        hashtags: [],
        visual_suggestions: '',
        hook: ''
      }
    }

    // Store in database
    const db = context.env.DB
    const id = crypto.randomUUID()

    await db.prepare(`
      INSERT INTO generated_content (id, platform, content, metadata)
      VALUES (?, ?, ?, ?)
    `).bind(
      id,
      platform,
      generatedContent,
      JSON.stringify({
        topic,
        trending_keywords,
        tone,
        length
      })
    ).run()

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedContent,
        id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Content generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate content' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
