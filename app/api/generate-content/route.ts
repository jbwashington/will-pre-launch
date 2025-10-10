import { NextRequest, NextResponse } from 'next/server'
import { generateSocialContent, ContentGenerationParams } from '@/lib/claude-agent'
import { createClient } from '@/lib/supabase/server'

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

    // Save to database
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('generated_content')
      .insert({
        content_type: platform,
        prompt: JSON.stringify(body),
        generated_text: generatedContent,
        metadata: {
          topic,
          trendingKeywords,
          tone,
          length
        }
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      content: generatedContent,
      id: data.id
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

    const supabase = await createClient()
    let query = supabase
      .from('generated_content')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (platform) {
      query = query.eq('content_type', platform)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Fetch content error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
