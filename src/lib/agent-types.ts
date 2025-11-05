export type AgentCategory = 
  | "AI"
  | "Utility"
  | "Demo"
  | "Chat"
  | "Analysis"
  | "Trading"
  | "NFT"
  | "DeFi"

export type AgentType = "file" | "endpoint" | "ai" | "inline"

export interface AgentSubmission {
  id: string
  name: string
  description: string
  categories: AgentCategory[]
  pricePerBundle: string // in STT
  queriesPerBundle: number
  receiverAddress: string
  type: AgentType
  
  // For file upload agents
  fileContent?: string
  fileName?: string
  
  // For endpoint agents
  endpoint?: string
  
  // For inline code agents
  inlineCode?: string
  
  // Metadata
  creator: string
  createdAt: string
  featured?: boolean
  verified?: boolean
}

export interface AgentPayment {
  agentId: string
  userAddress: string
  txHash: string
  queriesRemaining: number
  expiresAt?: string
}

export const AGENT_CATEGORIES: AgentCategory[] = [
  "AI",
  "Utility",
  "Demo",
  "Chat",
  "Analysis",
  "Trading",
  "NFT",
  "DeFi"
]

export const STORAGE_KEYS = {
  agents: "somniax_agents",
  agentPayments: "somniax_agent_payments"
}
