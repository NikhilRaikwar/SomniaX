"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useToast } from "@/hooks/use-toast"
import { Info, Plus, X, Wallet, Sparkles, Zap } from "lucide-react"
import { parseEther, createWalletClient, custom } from "viem"
import { somniaTestnet } from "viem/chains"
import { agentAPI } from "@/lib/supabase"


const REGISTRATION_FEE = "0.2" // 0.2 STT to register an agent
const RECIPIENT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || "0xE867be6751b23Bd389792AC080F604C4608a8637"

const AGENT_CATEGORIES = [
  "AI",
  "CONTENT",
  "ANALYTICS", 
  "SECURITY",
  "BLOCKCHAIN",
  "UTILITY",
  "TRADING",
  "DEVELOPMENT"
]

export default function SubmitAgentPage() {
  const { authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const { toast } = useToast()
  
  // Form state
  const [agentName, setAgentName] = useState("")
  const [description, setDescription] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [pricePerQuery, setPricePerQuery] = useState("")
  const [paymentWallet, setPaymentWallet] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [isCheckingName, setIsCheckingName] = useState(false)
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isGeneratingName, setIsGeneratingName] = useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)

  const wallet = wallets[0]
  const walletAddress = wallet?.address || ""

  // Auto-populate payment wallet with connected wallet
  useEffect(() => {
    if (walletAddress && !paymentWallet) {
      setPaymentWallet(walletAddress)
    }
  }, [walletAddress, paymentWallet])

  const validateWalletAddress = (address: string): boolean => {
    // Basic Ethereum address validation
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    return ethAddressRegex.test(address)
  }

  const generateAgentSlug = (name: string): string => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const checkAgentNameAvailability = async (name: string) => {
    if (!name.trim()) {
      setNameAvailable(null)
      return
    }

    setIsCheckingName(true)
    try {
      const slug = generateAgentSlug(name)
      
      // Check if slug is available in Supabase
      const isAvailable = await agentAPI.checkSlugAvailability(slug)

      setNameAvailable(isAvailable)
    } catch (error) {
      console.error('Error checking name availability:', error)
      setNameAvailable(null)
    } finally {
      setIsCheckingName(false)
    }
  }

  // Debounced name check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (agentName.trim()) {
        checkAgentNameAvailability(agentName)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [agentName])

  const handleGenerateName = async () => {
    setIsGeneratingName(true)
    try {
      const response = await fetch('/api/generate-agent-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentName: agentName,
          categories: categories,
          generateField: 'name'
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error)
      }

      setAgentName(data.generatedText)

      toast({
        title: "Name Generated! ✨",
        description: "AI created a catchy agent name",
      })
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate name",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingName(false)
    }
  }

  const handleGenerateDescription = async () => {
    setIsGeneratingDescription(true)
    try {
      const response = await fetch('/api/generate-agent-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentName: agentName,
          currentDescription: description,
          categories: categories,
          generateField: 'description'
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error)
      }

      setDescription(data.generatedText)

      toast({
        title: "Description Generated! ✨",
        description: "AI created a concise description",
      })
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate description",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const processRegistrationPayment = async (): Promise<boolean> => {
    try {
      if (!wallet) {
        toast({
          title: "Wallet Not Available",
          description: "Please reconnect your wallet",
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

      const paymentAmount = parseEther(REGISTRATION_FEE)
      
      toast({
        title: "Payment Required",
        description: `Please approve ${REGISTRATION_FEE} STT payment to register your agent`,
      })

      const txHash = await walletClient.sendTransaction({
        account: walletAddress as `0x${string}`,
        to: RECIPIENT_ADDRESS as `0x${string}`,
        value: paymentAmount,
      })

      toast({
        title: "Payment Successful! ✅",
        description: `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      })

      return true
    } catch (error: any) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process registration payment",
        variant: "destructive"
      })
      return false
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!authenticated) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to register an agent",
        variant: "destructive"
      })
      return
    }

    if (!agentName.trim()) {
      toast({
        title: "Agent Name Required",
        description: "Please enter an agent name",
        variant: "destructive"
      })
      return
    }

    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description for your agent",
        variant: "destructive"
      })
      return
    }

    if (categories.length === 0) {
      toast({
        title: "Category Required",
        description: "Please select at least one category for your agent",
        variant: "destructive"
      })
      return
    }

    if (!pricePerQuery || parseFloat(pricePerQuery) <= 0) {
      toast({
        title: "Valid Price Required",
        description: "Please enter a valid price greater than 0",
        variant: "destructive"
      })
      return
    }

    if (!paymentWallet.trim()) {
      toast({
        title: "Payment Wallet Required",
        description: "Please enter a wallet address to receive payments",
        variant: "destructive"
      })
      return
    }

    if (!validateWalletAddress(paymentWallet)) {
      toast({
        title: "Invalid Wallet Address",
        description: "Please enter a valid Ethereum wallet address (0x...)",
        variant: "destructive"
      })
      return
    }

    if (nameAvailable === false) {
      toast({
        title: "Agent Name Unavailable",
        description: "Please choose a different agent name",
        variant: "destructive"
      })
      return
    }

    // Process registration payment (0.2 STT)
    const paymentSuccess = await processRegistrationPayment()
    if (!paymentSuccess) {
      return
    }

    setIsSubmitting(true)

    try {
      // AI validation of agent description
      setIsValidating(true)
      toast({
        title: "Validating Agent...",
        description: "AI is reviewing your agent description for compliance",
      })

      const validationResponse = await fetch('/api/validate-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          description,
          category: categories.join(', ')
        })
      })

      const validationResult = await validationResponse.json()
      setIsValidating(false)

      if (!validationResult.approved) {
        toast({
          title: "Agent Denied ❌",
          description: validationResult.reason || "Agent description does not meet our guidelines",
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }

      toast({
        title: "Validation Passed ✅",
        description: "Agent approved! Proceeding with registration...",
      })

      // Create agent data for Supabase
      const agentData = {
        name: agentName,
        slug: generateAgentSlug(agentName),
        description,
        category: categories.join(', '),
        price_per_query: parseFloat(pricePerQuery),
        payment_wallet: paymentWallet,
        creator_wallet: walletAddress,
        status: "verified",
      }

      // Save to Supabase
      const savedAgent = await agentAPI.create(agentData)

      toast({
        title: "Agent Registered Successfully! 🎉",
        description: `${agentName} is now live in the Agent Directory`,
      })

      // Reset form
      setAgentName("")
      setDescription("")
      setCategories([])
      setPricePerQuery("")
      setPaymentWallet("")
      setNameAvailable(null)

      // Redirect to agents directory
      setTimeout(() => {
        window.location.href = `/agents`
      }, 2000)

    } catch (error: any) {
      console.error('Registration error:', error)
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register agent. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="bg-black text-white p-6 mb-6 rounded-t-lg">
          <h1 className="text-2xl font-black mb-2">REGISTER AI AGENT</h1>
          <p className="text-sm opacity-80">Deploy your agent to the SOMNIAX infrastructure layer</p>
        </div>

        {/* AIML API Banner */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border-2 border-purple-500/30">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Powered by AIML API (GPT-4o)
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                All agents run on our secure AIML API infrastructure. No configuration needed - just describe your agent and start earning!
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-2 rounded-lg inline-flex">
                <Info className="w-4 h-4" />
                Registration Fee: {REGISTRATION_FEE} STT (One-time payment)
              </div>
            </div>
          </div>
        </Card>

        {/* Wallet Status */}
        {authenticated && walletAddress && (
          <Card className="p-4 mb-6 bg-accent/20 border-accent">
            <div className="text-sm">
              <span className="font-bold">Creator Wallet:</span>{" "}
              <span className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </div>
          </Card>
        )}

        {!authenticated && (
          <Card className="p-6 mb-6 bg-destructive/10 border-destructive">
            <p className="text-center font-bold">⚠️ Please connect your wallet to register an agent</p>
          </Card>
        )}

        {/* Agent Information */}
        <div className="bg-black text-white p-4 mb-4">
          <h2 className="font-black text-sm">AGENT INFORMATION</h2>
        </div>
        
        <Card className="p-6 mb-6 space-y-4">
          <div>
            <label className="text-xs font-bold mb-2 block text-muted-foreground flex items-center gap-2">
              AGENT NAME *
              <span className="text-[10px] font-normal text-purple-500">✨ Click magic icon to generate</span>
            </label>
            <div className="relative">
              <Input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name (e.g., My Trading Bot)"
                className={`bg-background border-2 pr-20 ${
                  nameAvailable === true ? 'border-green-500' : 
                  nameAvailable === false ? 'border-red-500' : ''
                }`}
                disabled={!authenticated}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {/* AI Magic Icon */}
                <button
                  type="button"
                  onClick={handleGenerateName}
                  disabled={!authenticated || isGeneratingName}
                  className="hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate name with AI"
                >
                  {isGeneratingName ? (
                    <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                  ) : (
                    <Sparkles className="w-4 h-4 text-purple-500 hover:text-purple-600" />
                  )}
                </button>
                {/* Name Check Status */}
                <div>
                  {isCheckingName && (
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                  )}
                  {!isCheckingName && nameAvailable === true && (
                    <span className="text-green-500 text-lg">✓</span>
                  )}
                  {!isCheckingName && nameAvailable === false && (
                    <span className="text-red-500 text-lg">✗</span>
                  )}
                </div>
              </div>
            </div>
            {agentName && (
              <p className="text-xs text-muted-foreground mt-1">
                URL will be: /agents/{generateAgentSlug(agentName)}
              </p>
            )}
            {nameAvailable === false && (
              <p className="text-xs text-red-500 mt-1">
                This agent name is already taken. Please choose a different name.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold mb-2 block text-muted-foreground">CATEGORIES * (Max 3)</label>
            <div className="flex flex-wrap gap-2">
              {AGENT_CATEGORIES.map((cat) => {
                const isSelected = categories.includes(cat)
                const canSelect = categories.length < 3 || isSelected
                return (
                  <Button
                    key={cat}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (isSelected) {
                        setCategories(categories.filter(c => c !== cat))
                      } else if (categories.length < 3) {
                        setCategories([...categories, cat])
                      } else {
                        toast({
                          title: "Maximum Categories Reached",
                          description: "You can only select up to 3 categories",
                          variant: "destructive"
                        })
                      }
                    }}
                    disabled={!authenticated || (!canSelect && !isSelected)}
                    className={`font-bold transition-all duration-200 ${
                      isSelected
                        ? "bg-primary hover:bg-primary/90 border-2 border-accent shadow-lg shadow-primary/50 scale-105" 
                        : canSelect
                        ? "hover:border-primary/50 hover:shadow-md border-2 hover:bg-primary/10"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {cat}
                  </Button>
                )
              })}
            </div>
            {categories.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Selected ({categories.length}/3): <span className="font-bold text-primary">{categories.join(', ')}</span>
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold mb-2 block text-muted-foreground">PRICE PER QUERY (STT) *</label>
            <Input
              type="number"
              step="0.001"
              min="0"
              value={pricePerQuery}
              onChange={(e) => setPricePerQuery(e.target.value)}
              placeholder="0.01"
              className="bg-background border-2"
              disabled={!authenticated}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Price in STT tokens that users will pay per query to your agent
            </p>
          </div>


          <div>
            <label className="text-xs font-bold mb-2 block text-muted-foreground flex items-center gap-2">
              DESCRIPTION *
              <span className="text-[10px] font-normal text-purple-500">✨ Click magic icon to generate</span>
            </label>
            <div className="relative">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does your agent do?"
                className="bg-background border-2 min-h-[120px] resize-none pr-10"
                disabled={!authenticated}
              />
              {/* AI Magic Icon for Description */}
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={!authenticated || isGeneratingDescription}
                className="absolute right-3 top-3 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                title="Generate description with AI"
              >
                {isGeneratingDescription ? (
                  <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-500 hover:text-purple-600" />
                )}
              </button>
            </div>
          </div>
        </Card>

        {/* Payment Wallet */}
        <div className="bg-black text-white p-4 mb-4">
          <h2 className="font-black text-sm">PAYMENT WALLET</h2>
        </div>

        <Card className="p-6 mb-6 space-y-4">
          <div className="pt-4 border-t">
            <label className="text-xs font-bold mb-2 block text-muted-foreground">
              PAYMENT WALLET ADDRESS *
            </label>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                This is where you'll receive STT payments when users interact with your agent
              </p>
            </div>
            <Input
              value={paymentWallet}
              onChange={(e) => setPaymentWallet(e.target.value)}
              placeholder="0x..."
              className="bg-background border-2 font-mono"
              disabled={!authenticated}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ethereum wallet address to receive STT payments (auto-filled with your connected wallet)
            </p>
          </div>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!authenticated || isSubmitting || isPaymentProcessing || isValidating}
          className="w-full h-14 bg-black hover:bg-black/90 text-white font-black text-lg"
        >
          {isValidating
            ? "VALIDATING WITH AI..."
            : isPaymentProcessing 
            ? "PROCESSING PAYMENT..." 
            : isSubmitting 
            ? "REGISTERING AGENT..." 
            : `REGISTER AGENT (${REGISTRATION_FEE} STT)`}
        </Button>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          By registering, you agree to pay {REGISTRATION_FEE} STT one-time registration fee.
          Your agent will use our secure AIML API infrastructure.
        </p>
      </div>
    </div>
  )
}
