import { NextRequest, NextResponse } from 'next/server'
import { generateSocialContent, ContentGenerationParams } from '@/lib/claude-agent'

export const runtime = 'edge'

interface Env {
  DB: D1Database
  ANTHROPIC_API_KEY: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, topic, trendingKeywords, tone, length }: ContentGenerationParams = body

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    // Generate content using Claude
    const generatedContent = await generateSocialContent({
      platform,
      topic,
      trendingKeywords,
      tone,
      length
    })

    // Save to D1 database
    const env = (request as any).env as Env
    if (!env || !env.DB) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    const db = env.DB
    const id = crypto.randomUUID()

    await db.prepare(`
      INSERT INTO generated_content (id, content_type, prompt, generated_text, metadata)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      id,
      platform,
      JSON.stringify(body),
      generatedContent,
      JSON.stringify({ topic, trendingKeywords, tone, length })
    ).run()

    return NextResponse.json({
      success: true,
      content: generatedContent,
      id
    })
  } catch (error: any) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    const env = (request as any).env as Env
    if (!env || !env.DB) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    const db = env.DB

    let query = 'SELECT * FROM generated_content ORDER BY created_at DESC LIMIT 10'
    if (platform) {
      query = `SELECT * FROM generated_content WHERE content_type = '${platform}' ORDER BY created_at DESC LIMIT 10`
    }

    const { results: data } = await db.prepare(query).all()

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Fetch content error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
