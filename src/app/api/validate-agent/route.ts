import { NextRequest, NextResponse } from 'next/server'

const AIML_API_KEY = process.env.AIML_API_KEY
const AIML_API_URL = 'https://api.aimlapi.com/chat/completions'

export async function POST(request: NextRequest) {
  try {
    const { name, description, category } = await request.json()

    if (!AIML_API_KEY) {
      return NextResponse.json({ error: 'AIML API key not configured' }, { status: 500 })
    }

    // AI validation prompt
    const validationPrompt = `You are an AI content moderator for an agent marketplace. Analyze the following agent submission and determine if it should be approved or denied.

Agent Name: ${name}
Category: ${category}
Description: ${description}

DENY if the agent:
- Contains inappropriate, offensive, or harmful content
- Promotes illegal activities, scams, or fraud
- Has misleading or deceptive descriptions
- Contains spam or low-quality content
- Violates ethical AI guidelines
- Has unclear or irrelevant purpose

APPROVE if the agent:
- Has a clear, legitimate purpose
- Description matches the category
- Follows ethical guidelines
- Provides value to users
- Has professional, appropriate content

Respond in this EXACT JSON format:
{
  "approved": true/false,
  "reason": "Brief explanation of your decision"
}

Only return the JSON, nothing else.`

    const response = await fetch(AIML_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a content moderator. Always respond with valid JSON only.' },
          { role: 'user', content: validationPrompt }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      console.error('AIML API error:', await response.text())
      return NextResponse.json(
        { error: 'Failed to validate agent' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || ''

    // Parse AI response
    try {
      // Extract JSON from response (in case AI adds extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      const validationResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { approved: false, reason: 'Invalid response format' }

      return NextResponse.json({
        approved: validationResult.approved === true,
        reason: validationResult.reason || 'No reason provided'
      })
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse)
      return NextResponse.json({
        approved: false,
        reason: 'Failed to validate agent description. Please try again.'
      })
    }

  } catch (error) {
    console.error('Validation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
