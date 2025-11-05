import { NextRequest, NextResponse } from 'next/server'

const AIML_API_KEY = process.env.AIML_API_KEY
const AIML_API_URL = 'https://api.aimlapi.com/chat/completions'

export async function POST(request: NextRequest) {
  try {
    const { message, agentName, agentDescription, context } = await request.json()

    if (!AIML_API_KEY) {
      return NextResponse.json({ error: 'AIML API key not configured' }, { status: 500 })
    }

    // Build system prompt for the agent with strict role enforcement
    const systemPrompt = agentName 
      ? `You are ${agentName}. ${agentDescription || 'You are a helpful AI assistant.'}

CRITICAL RULES:
1. ONLY respond to queries directly related to your purpose and description
2. If a user asks something unrelated (like math problems, general chat, greetings, or topics outside your specialty), politely decline and remind them of your specific purpose
3. Stay strictly within your role and specialization
4. Do NOT answer questions like "hi", "hello", "2+2", "write shayari", or any general queries unless they relate to your specific function
5. Always redirect off-topic queries back to your core purpose

Example responses for off-topic queries:
- "I'm ${agentName}, specialized in ${agentDescription}. I can only help with queries related to my specific function. Please ask me something about my specialty."
- "That's outside my scope. I'm designed specifically for ${agentDescription}. How can I help you with that?"

Now respond as this agent would, staying strictly true to your specialized purpose.`
      : 'You are a helpful AI assistant on the SomniaX platform that helps users with AI agents and blockchain-related questions.'

    // Build messages array with context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(context || []).map((msg: any) => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message }
    ]

    const response = await fetch(AIML_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('AIML API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to get AI response' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response.'

    return NextResponse.json({ response: aiResponse })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}