"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Send, Paperclip, Bot, User, ArrowLeft, Wallet, Sparkles } from "lucide-react"
import Link from "next/link"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useToast } from "@/hooks/use-toast"
import { parseEther, createWalletClient, custom } from "viem"
import { somniaTestnet } from "viem/chains"
import { agentAPI } from "@/lib/supabase"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AgentChatPage() {
  const params = useParams()
  const agentSlug = params.slug as string
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [agent, setAgent] = useState<any>(null)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const { toast } = useToast()

  const wallet = wallets[0]
  const walletAddress = wallet?.address || ""

  useEffect(() => {
    const loadAgent = async () => {
      try {
        const mockAgents = [
          {
            id: "1",
            slug: "ai-content-writer",
            name: "AI Content Writer",
            description: "Advanced AI assistant for content creation, SEO optimization, and copywriting.",
            paymentWallet: "0xE867be6751b23Bd389792AC080F604C4608a8637",
            pricePerQuery: 0.01
          },
          {
            id: "2", 
            slug: "smart-contract-auditor",
            name: "Smart Contract Auditor",
            description: "Security-focused AI for smart contract auditing and vulnerability detection.",
            paymentWallet: "0xE867be6751b23Bd389792AC080F604C4608a8637",
            pricePerQuery: 0.02
          },
          {
            id: "3",
            slug: "nft-generator-bot",
            name: "NFT Generator Bot", 
            description: "Creative AI for generating NFT concepts, metadata, and artwork descriptions.",
            paymentWallet: "0xE867be6751b23Bd389792AC080F604C4608a8637",
            pricePerQuery: 0.01
          },
          {
            id: "4",
            slug: "trading-signal-ai",
            name: "Trading Signal AI",
            description: "Financial AI for market analysis, trading signals, and investment insights.",
            paymentWallet: "0xE867be6751b23Bd389792AC080F604C4608a8637",
            pricePerQuery: 0.03
          },
          {
            id: "5",
            slug: "code-review-agent",
            name: "Code Review Agent",
            description: "Development AI for code review, best practices, and optimization suggestions.",
            paymentWallet: "0xE867be6751b23Bd389792AC080F604C4608a8637",
            pricePerQuery: 0.02
          },
          {
            id: "6",
            slug: "gas-optimizer",
            name: "Gas Optimizer",
            description: "Blockchain AI for gas optimization, smart contract efficiency, and cost reduction.",
            paymentWallet: "0xE867be6751b23Bd389792AC080F604C4608a8637",
            pricePerQuery: 0.015
          }
        ]

        // Try to find agent in mock data first
        let foundAgent = mockAgents.find(a => a.slug === agentSlug)
        
        // If not found in mock data, try Supabase
        if (!foundAgent) {
          try {
            const supabaseAgent = await agentAPI.getBySlug(agentSlug)
            if (supabaseAgent) {
              foundAgent = {
                id: supabaseAgent.id,
                slug: supabaseAgent.slug,
                name: supabaseAgent.name,
                description: supabaseAgent.description,
                paymentWallet: supabaseAgent.payment_wallet,
                pricePerQuery: supabaseAgent.price_per_query
              }
            }
          } catch (error) {
            console.error('Error fetching agent from Supabase:', error)
          }
        }
        
        if (foundAgent) {
          setAgent(foundAgent)
          // Add welcome message
          setMessages([{
            role: "assistant",
            content: `Hello! I'm ${foundAgent.name}. ${foundAgent.description} How can I help you today?`,
            timestamp: new Date()
          }])
        }
      } catch (error) {
        console.error('Error loading agent:', error)
      }
    }
    
    loadAgent()
  }, [agentSlug])

  const processX402Payment = async (): Promise<boolean> => {
    try {
      if (!wallet) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to chat with agents",
          variant: "destructive"
        })
        return false
      }

      if (!agent?.paymentWallet) {
        toast({
          title: "Payment Configuration Error",
          description: "Agent payment wallet not configured",
          variant: "destructive"
        })
        return false
      }

      setIsPaymentProcessing(true)
      
      const provider = await wallet.getEthereumProvider()
      const walletClient = createWalletClient({
        chain: somniaTestnet,
        transport: custom(provider),
      })

      const paymentAmount = parseEther(agent.pricePerQuery.toString())
      
      toast({
        title: "X402 Payment Required",
        description: `Paying ${agent.pricePerQuery} STT to ${agent.name}`,
      })

      const txHash = await walletClient.sendTransaction({
        account: walletAddress as `0x${string}`,
        to: agent.paymentWallet as `0x${string}`,
        value: paymentAmount,
      })

      toast({
        title: "Payment Successful! ✅",
        description: `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      })

      return true
    } catch (error: any) {
      console.error("X402 Payment error:", error)
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process X402 payment",
        variant: "destructive"
      })
      return false
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    // FIRST: Check if wallet is connected
    if (!authenticated) {
      toast({
        title: "Wallet Not Connected",
        description: "Please sign in and connect your wallet to chat with agents",
        variant: "destructive",
      })
      return
    }

    // Process X402 payment per query
    const paymentSuccess = await processX402Payment()
    if (!paymentSuccess) {
      return
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    }
    
    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)

    try {
      // Call AI API with agent context
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage.content,
          agentName: agent?.name,
          agentDescription: agent?.description,
          context: messages.slice(-5)
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, assistantMessage])
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
          <Link href="/agents">
            <Button>← Back to Agents</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-121px)] flex flex-col lg:flex-row overflow-hidden">
      {/* Agent Header */}
      <div className="w-full lg:w-80 border-r lg:border-b-0 border-b flex flex-col bg-card/50 backdrop-blur lg:h-full h-auto">
        <div className="p-4 border-b bg-black text-white">
          <Link href="/agents">
            <Button variant="ghost" size="sm" className="text-white hover:text-black hover:bg-white mb-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Agents
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="font-black text-lg">{agent.name}</h1>
            <p className="text-sm opacity-80 mt-2">{agent.description}</p>
            <div className="flex items-center justify-center gap-2 mt-3 text-xs">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="font-bold">Powered by AIML API (GPT-4o)</span>
            </div>
          </div>
        </div>
        
        {/* Agent Pricing Info */}
        <div className="p-4">
          <Card className="p-4 bg-secondary/50">
            <div className="text-xs font-bold mb-3 uppercase tracking-wide text-muted-foreground">
              Payment Info
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-black text-lg text-primary">
                    {agent.pricePerQuery} STT
                  </div>
                  <div className="text-xs text-muted-foreground">Per query</div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <div><strong>Agent:</strong> {agent.name}</div>
                <div><strong>Payment to:</strong> {agent.paymentWallet?.slice(0, 6)}...{agent.paymentWallet?.slice(-4)}</div>
                <div><strong>Network:</strong> Somnia Testnet</div>
              </div>
              
              {!authenticated && (
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">
                    🔒 Connect wallet to chat with {agent.name}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-6 space-y-4 lg:space-y-6 min-h-0">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2 lg:gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] lg:max-w-2xl p-3 lg:p-4 rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-xs sm:text-sm leading-relaxed break-words">{msg.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-accent to-destructive flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 lg:gap-4 justify-start">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="bg-muted p-3 lg:p-4 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-3 lg:p-6 bg-card/50 backdrop-blur">
          <div className="flex items-center gap-2 lg:gap-3 max-w-4xl mx-auto">
            <Button variant="ghost" size="icon" className="shrink-0 hidden sm:flex">
              <Paperclip className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            <Input
              placeholder={authenticated ? `Ask ${agent.name} anything...` : "Sign in to start chatting..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && authenticated && handleSendMessage()}
              className="flex-1 bg-background border-2 focus:border-primary text-sm"
              disabled={isLoading || !authenticated}
            />
            <Button 
              size="icon" 
              className="shrink-0 bg-primary hover:bg-primary/90"
              disabled={!message.trim() || isLoading || !authenticated || isPaymentProcessing}
              onClick={handleSendMessage}
            >
              {isPaymentProcessing ? (
                <Wallet className="w-4 h-4 animate-pulse" />
              ) : isLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Send className="h-4 w-4 lg:h-5 lg:w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2 lg:mt-3 px-2">
            {!authenticated 
              ? "🔒 Sign in with your wallet to chat with this agent"
              : `💰 Each message costs ${agent.pricePerQuery} STT • Paid directly to ${agent.name}`
            }
          </p>
        </div>
      </div>
    </div>
  )
}