import { NextRequest, NextResponse } from 'next/server'

const AIML_API_KEY = process.env.AIML_API_KEY!
const AIML_API_URL = 'https://api.aimlapi.com/chat/completions'

export async function POST(request: NextRequest) {
  try {
    const { currentName, currentDescription, categories, generateField } = await request.json()

    let prompt = ''

    // Generate only name
    if (generateField === 'name') {
      const context = []
      if (currentName) context.push(`Current name idea: ${currentName}`)
      if (categories && categories.length > 0) context.push(`Categories: ${categories.join(', ')}`)

      prompt = context.length > 0
        ? `You are an AI assistant helping to create agent names for a marketplace.

${context.join('\n')}

Based on the above, generate a catchy, professional agent name (max 5 words).
Make it compelling, memorable, and relevant to the categories.

Respond with ONLY the agent name, no JSON, no quotes, no explanation.`
        : `Generate a catchy, professional AI agent name (max 5 words).
Make it compelling and memorable.

Respond with ONLY the agent name, no JSON, no quotes, no explanation.`
    }
    // Generate only description
    else if (generateField === 'description') {
      const context = []
      if (currentDescription) {
        context.push(`Current description: ${currentDescription}`)
      } else if (currentName) {
        context.push(`Agent name: ${currentName}`)
      }
      if (categories && categories.length > 0) context.push(`Categories: ${categories.join(', ')}`)

      prompt = context.length > 0
        ? `You are an AI assistant helping to create agent descriptions for a marketplace.

${context.join('\n')}

Based on the above information, write a concise description explaining what this agent does.
Maximum 2 lines, around 20-30 words. Focus on the agent's value proposition.

Respond with ONLY the description text, no JSON, no quotes, no labels.`
        : `Write a concise description for a general-purpose AI agent.
Maximum 2 lines, around 20-30 words. Make it compelling and clear.

Respond with ONLY the description text, no JSON, no quotes, no labels.`
    } else {
      throw new Error('Invalid generateField parameter')
    }

    const response = await fetch(AIML_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate agent information')
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content.trim()

    // Clean up the response (remove quotes if present)
    let cleanedResponse = aiResponse
      .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
      .replace(/^[•\-*]\s*/g, '') // Remove bullet points
      .trim()

    return NextResponse.json({
      success: true,
      generatedText: cleanedResponse,
      field: generateField
    })

  } catch (error: any) {
    console.error('Generate agent info error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to generate agent information' 
      },
      { status: 500 }
    )
  }
}
