/**
 * AIML API Client for GPT-4o
 * OpenAI-compatible API
 */

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export class AIMLClient {
  private apiKey: string
  private baseURL: string

  constructor(apiKey: string = process.env.AIML_API_KEY || "") {
    this.apiKey = apiKey
    this.baseURL = "https://api.aimlapi.com/v1"
  }

  async chat(messages: ChatMessage[], model: string = "gpt-4o"): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
        }),
      })

      if (!response.ok) {
        throw new Error(`AIML API error: ${response.statusText}`)
      }

      const data: ChatCompletionResponse = await response.json()
      return data.choices[0].message.content

    } catch (error) {
      console.error("AIML API error:", error)
      throw error
    }
  }

  async generateAgentResponse(userQuery: string, agentContext?: string): Promise<string> {
    const messages: ChatMessage[] = []

    if (agentContext) {
      messages.push({
        role: "system",
        content: agentContext,
      })
    }

    messages.push({
      role: "user",
      content: userQuery,
    })

    return this.chat(messages)
  }
}

export const aimlClient = new AIMLClient()
