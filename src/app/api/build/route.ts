import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { name, ingredients } = await req.json()

    if (!name || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: 'Missing name or ingredients' }, { status: 400 })
    }

    const ingredientList = ingredients
      .filter((i: string) => i.trim())
      .map((i: string, idx: number) => `${idx + 1}. ${i}`)
      .join('\n')

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Calculate the total combined nutritional information for a dish called "${name}" made from these ingredients:

${ingredientList}

Add up the macros from every ingredient and return the TOTAL for the whole dish.
Respond with ONLY a valid JSON object — no markdown, no extra text.
Format:
{
  "name": "${name}",
  "servingSize": "full recipe (X ingredients)",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "breakdown": [
    { "ingredient": "ingredient name", "calories": number, "protein": number, "carbs": number, "fat": number }
  ]
}
All macro values in grams except calories (kcal). Use standard nutritional values.`,
        },
      ],
    })

    const text =
      message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(cleaned)

    return NextResponse.json(data)
  } catch (err) {
    console.error('Build API error:', err)
    return NextResponse.json(
      { error: 'Failed to calculate macros' },
      { status: 500 }
    )
  }
}
