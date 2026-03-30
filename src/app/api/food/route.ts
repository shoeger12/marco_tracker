import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Return nutritional information for: "${query}".
Respond with ONLY a valid JSON object — no markdown, no extra text.
Format:
{
  "name": "Food Name",
  "servingSize": "serving description",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number
}
All macro values should be in grams (except calories). Use typical/standard serving sizes.`,
        },
      ],
    })

    const text =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip any accidental markdown fences
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(cleaned)

    return NextResponse.json(data)
  } catch (err) {
    console.error('Food API error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch nutritional info' },
      { status: 500 }
    )
  }
}
