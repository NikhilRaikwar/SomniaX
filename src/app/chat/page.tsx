"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Send, Zap, Bot, User, ExternalLink } from "lucide-react"
import { PaymentModal } from "@/components/PaymentModal"
import { usePayment } from "@/hooks/use-payment"
import { PAYMENT_CONFIG } from "@/lib/x402-config"
import { useToast } from "@/hooks/use-toast"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  agents?: any[]
}

export default function ChatPage() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    paymentState,
    isPaymentModalOpen,
    isProcessing: isPaymentProcessing,
    isOnCorrectNetwork,
    currentChainId,
    needsPayment,
    requestPayment,
    closePaymentModal,
    processPayment,
    decrementMessageCount,
    isConnected,
    verificationData,
    isVerifying,
  } = usePayment()
  
  const { toast } = useToast()

  const examplePrompts = [
    "Show me all registered agents in the marketplace",
    "How do I register my own AI agent?",
    "What agents are available for content creation?"
  ]

  const handleSendMessage = async () => {
    if (!message.trim()) return

    // FIRST: Check if wallet is connected
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please sign in and connect your wallet to use SomniaX Chat",
        variant: "destructive",
      })
      return
    }

    // Check if payment is needed
    if (needsPayment()) {
      requestPayment()
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
      // Call AI API
      const response = await fetch("/api/chat/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        agents: data.agents || undefined
      }
      
      setMessages((prev) => [...prev, assistantMessage])
      decrementMessageCount()
      
      toast({
        title: "Message sent",
        description: `${paymentState.messagesRemaining - 1} messages remaining`,
      })
      
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

  const handlePaymentApprove = async () => {
    try {
      await processPayment()
      // Payment successful - state updated, modal closed
      // No toast needed, user can see message count updated
    } catch (error) {
      console.error("Payment error:", error)
      // Error toast is already shown in the PaymentModal component
    }
  }

  return (
    <div className="h-[calc(100vh-121px)] flex flex-col lg:flex-row overflow-hidden">
      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        onApprove={handlePaymentApprove}
        recipientAddress={PAYMENT_CONFIG.recipientAddress}
        amount={PAYMENT_CONFIG.pricePerBundle}
        itemName="SomniaX Chat Pass"
        itemDescription={`${PAYMENT_CONFIG.messagesPerBundle} Messages`}
        network={PAYMENT_CONFIG.network.name}
      />

      {/* Sidebar */}
      <div className="w-full lg:w-80 border-r lg:border-b-0 border-b flex flex-col bg-card/50 backdrop-blur lg:h-full h-auto">
        <div className="p-4 border-b">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
            onClick={() => setMessages([])}
          >
            <span className="mr-2">+</span> New Chat
          </Button>
        </div>
        
        {/* Spacer for large screens */}
        <div className="flex-1 hidden lg:block"></div>
        
        {/* Chat Balance - moved to bottom on large screens */}
        <div className="p-4 lg:mt-auto">
          <Card className="p-4 bg-secondary/50">
            <div className="text-xs font-bold mb-3 uppercase tracking-wide text-muted-foreground">
              Chat Balance
            </div>
            {!isConnected ? (
              /* Not Connected State */
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-muted to-muted-foreground rounded-lg flex items-center justify-center opacity-50">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-black text-2xl text-muted-foreground">0</div>
                    <div className="text-xs text-muted-foreground">Messages left</div>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center mb-3">
                  <p className="text-xs text-muted-foreground">
                    🔒 Connect your wallet to see your message balance
                  </p>
                </div>
              </div>
            ) : (
              /* Connected State */
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-black text-2xl">
                      {paymentState.messagesRemaining}
                    </div>
                    <div className="text-xs text-muted-foreground">Messages left</div>
                  </div>
                </div>
                <Button
                  onClick={requestPayment}
                  disabled={isPaymentProcessing}
                  className="w-full mt-3 bg-primary hover:bg-primary/90"
                  size="sm"
                >
                  {isPaymentProcessing ? "Processing..." : `${needsPayment() ? "Buy" : "Top Up"} 30 Messages • ${PAYMENT_CONFIG.pricePerBundle} STT`}
                </Button>
              </div>
            )}
          </Card>
          
          {/* Network Warning */}
          {isConnected && !isOnCorrectNetwork && (
            <Card className="p-3 mt-3 bg-destructive/10 border-destructive">
              <div className="text-xs font-bold mb-1 text-destructive">
                ⚠️ Wrong Network
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Current: Chain ID {currentChainId || 'Unknown'}
              </div>
              <div className="text-xs text-muted-foreground">
                Switch to <span className="font-bold">Somnia Testnet</span> (ID: {PAYMENT_CONFIG.network.id}) in your wallet
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-0">
            <div className="max-w-2xl text-center space-y-3 sm:space-y-4 lg:space-y-6 w-full px-2">
              <div className="mx-auto mb-2 sm:mb-3 lg:mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <Image 
                  src="/somnialogo.png" 
                  alt="Somnia Logo" 
                  width={60} 
                  height={60}
                  className="h-14 w-14 sm:h-16 sm:w-16 object-contain"
                />
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase">SOMNIAX</span>
              </div>
              
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black mb-2 sm:mb-3 lg:mb-4">Welcome to SomniaX Chat</h1>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-3 sm:mb-4 lg:mb-6">
                Your AI assistant for exploring agents, getting help, and navigating the marketplace.
              </p>

              <div className="space-y-2 lg:space-y-3">
                <div className="text-xs sm:text-sm font-bold text-muted-foreground mb-2 lg:mb-3 uppercase tracking-wide">
                  Try asking...
                </div>
                {examplePrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-5 hover:bg-white hover:text-black hover:border-black hover:shadow-lg transition-all border-2"
                    onClick={() => setMessage(prompt)}
                  >
                    <span className="text-xs sm:text-sm leading-tight break-words">{prompt}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Messages Area */
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
                  className={`max-w-[85%] lg:max-w-2xl ${
                    msg.role === "user"
                      ? ""
                      : ""
                  }`}
                >
                  <div className={`p-3 lg:p-4 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}>
                    <p className="text-xs sm:text-sm leading-relaxed break-words">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {/* Agent Cards */}
                  {msg.agents && msg.agents.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.agents.map((agent: any) => (
                        <Link
                          key={agent.id}
                          href={`/agents/${agent.slug}`}
                          className="block"
                        >
                          <Card className="p-4 hover:border-primary hover:shadow-lg transition-all cursor-pointer bg-card">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm mb-1 truncate">{agent.name}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {agent.description}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded font-semibold">
                                    {agent.category}
                                  </span>
                                  <span className="text-xs font-bold text-primary">
                                    {agent.price_per_query} STT/query
                                  </span>
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
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
        )}

        {/* Input Area */}
        <div className="border-t p-3 lg:p-6 bg-card/50 backdrop-blur">
          <div className="flex items-center gap-2 lg:gap-3 max-w-4xl mx-auto">
            <Input
              placeholder={isConnected ? "Ask me anything about SomniaX agents..." : "Sign in to start chatting..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && isConnected && handleSendMessage()}
              className="flex-1 bg-background border-2 focus:border-primary text-sm"
              disabled={isLoading || !isConnected}
            />
            <Button 
              size="icon" 
              className="shrink-0 bg-primary hover:bg-primary/90"
              disabled={!message.trim() || isLoading || !isConnected}
              onClick={handleSendMessage}
            >
              <Send className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2 lg:mt-3 px-2">
            {!isConnected 
              ? "🔒 Sign in with your wallet to start chatting"
              : needsPayment() 
                ? "⚡ Purchase messages to start chatting" 
                : `💰 ${paymentState.messagesRemaining} messages remaining • ${PAYMENT_CONFIG.pricePerBundle} STT per 30 messages`
            }
          </p>
        </div>
      </div>
    </div>
  )
}