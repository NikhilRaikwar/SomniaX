import { NextRequest, NextResponse } from "next/server"
import { aimlClient } from "@/lib/aiml-client"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Query validation
function validateQuery(query: string): { valid: boolean; error?: string } {
  const trimmed = query.trim()
  
  // Check minimum length
  if (trimmed.length < 3) {
    return { valid: false, error: "Query too short. Please ask a meaningful question." }
  }
  
  // Check maximum length
  if (trimmed.length > 1000) {
    return { valid: false, error: "Query too long. Please keep it under 1000 characters." }
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /^(.)\1{10,}$/, // Repeated characters
    /^test+$/i,
    /^asdf+$/i,
  ]
  
  for (const pattern of spamPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: "Invalid query detected. Please ask a real question." }
    }
  }
  
  return { valid: true }
}

// System context for AI about SomniaX
const SYSTEM_CONTEXT = `You are SomniaX AI Assistant, an intelligent agent marketplace assistant built on Somnia blockchain.

Your knowledge:
- SomniaX is an AI agent marketplace on Somnia Testnet
- Users can submit their own AI agents and earn STT tokens
- The platform uses x402 micropayment protocol
- Payment is 0.1 STT for 30 message queries
- Users can browse agents in categories: AI, Utility, Demo, Chat, Analysis, Trading, NFT, DeFi
- Agents can be AI-powered (like you), API endpoints, or custom code
- The platform is built with Next.js, Privy auth, and Viem
- Somnia is a high-performance EVM blockchain

When users ask about:
- "What agents are available?" - Mention the categories and that they can check the Agent Directory
- "How do I submit an agent?" - Direct them to Submit Agent page
- "How does payment work?" - Explain x402 micropayments with STT
- General questions - Answer helpfully based on your knowledge

Be friendly, concise, and helpful. Use emojis occasionally 🚀`

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }
    
    // Validate query
    const validation = validateQuery(message)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    // Check if user is asking about agents
    const agentKeywords = ['agent', 'show', 'list', 'find', 'get', 'what', 'tell me', 'display', 'available']
    const isAgentQuery = agentKeywords.some(keyword => message.toLowerCase().includes(keyword))

    let agents = []
    let systemContext = ''

    if (isAgentQuery) {
      // Fetch agents from Supabase
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data && data.length > 0) {
        agents = data
        systemContext = `\n\nCurrent registered agents in the marketplace:\n${agents.map((a: any) => 
          `- ${a.name} (${a.category}): ${a.description} - Price: ${a.price_per_query} STT per query`
        ).join('\n')}`
      }
    }

    const systemPrompt = `You are SomniaX Assistant, a helpful AI for the SomniaX Agent Marketplace.
You help users discover AI agents, learn about the platform, and navigate the marketplace.

The SomniaX marketplace allows users to:
- Browse and use AI agents created by others
- Register their own AI agents (costs 0.2 STT)
- Pay per query to use agents (price set by agent creator)
- Earn money by creating useful agents

KEY INSTRUCTIONS:
1. When users ask about agents, describe the available agents and tell them you'll show them cards below
2. When users ask how to register, explain the process clearly
3. Be helpful, concise, and guide users to explore or register agents

${SYSTEM_CONTEXT}${systemContext}`

    // Generate AI response using AIML GPT-4o
    const response = await aimlClient.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ])
    
    return NextResponse.json({
      success: true,
      response,
      agents: agents.length > 0 ? agents : undefined
    })
    
  } catch (error) {
    console.error("AI Chat error:", error)
    return NextResponse.json(
      { error: "Failed to generate response. Please try again." },
      { status: 500 }
    )
  }
}
