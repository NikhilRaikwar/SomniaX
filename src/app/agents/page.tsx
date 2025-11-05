"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Verified, User, Wallet, Trash2 } from "lucide-react"
import Link from "next/link"
import { agentAPI } from "@/lib/supabase"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useToast } from "@/hooks/use-toast"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

type AgentCategory = "ALL" | "AI" | "MICROSERVICE" | "UTILITY" | "BLOCKCHAIN" | "CONTENT" | "ANALYTICS" | "SECURITY" | "TRADING" | "DEVELOPMENT"

const categories: AgentCategory[] = [
  "ALL",
  "AI",
  "CONTENT",
  "ANALYTICS",
  "SECURITY",
  "BLOCKCHAIN",
  "UTILITY",
  "TRADING",
  "DEVELOPMENT"
]

export default function AgentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory>("ALL")
  const [registeredAgents, setRegisteredAgents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<{id: string, name: string, creatorWallet: string} | null>(null)
  
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const { toast } = useToast()
  const walletAddress = wallets[0]?.address || ""

  // Load registered agents from Supabase
  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      setIsLoading(true)
      const agents = await agentAPI.getAll()
      setRegisteredAgents(agents)
    } catch (error) {
      console.error('Error loading agents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openDeleteDialog = (agentId: string, agentName: string, creatorWallet: string) => {
    if (!authenticated || !walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to delete agents",
        variant: "destructive"
      })
      return
    }

    if (walletAddress.toLowerCase() !== creatorWallet.toLowerCase()) {
      toast({
        title: "Unauthorized",
        description: "You can only delete your own agents",
        variant: "destructive"
      })
      return
    }

    setAgentToDelete({ id: agentId, name: agentName, creatorWallet })
    setDeleteDialogOpen(true)
  }

  const handleDeleteAgent = async () => {
    if (!agentToDelete || !walletAddress) return

    setDeletingAgentId(agentToDelete.id)

    try {
      // Use Supabase delete function
      await agentAPI.delete(agentToDelete.id, walletAddress)

      toast({
        title: "Agent Deleted ✅",
        description: "Your agent has been removed from the marketplace"
      })

      // Close dialog and reload agents
      setDeleteDialogOpen(false)
      setAgentToDelete(null)
      await loadAgents()
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete agent",
        variant: "destructive"
      })
    } finally {
      setDeletingAgentId(null)
    }
  }

  // Show only registered agents from Supabase (removed mock agents)
  const allAgents = [
    ...registeredAgents.map((agent: any) => {
      // Parse categories (support both single and multiple comma-separated)
      const categoryString = agent.category || "AI"
      const agentCategories = categoryString.split(',').map((c: string) => c.trim().toUpperCase())
      const primaryCategory = agentCategories[0] as AgentCategory
      
      return {
        id: agent.slug || agent.id,
        name: agent.name,
        category: primaryCategory,
        categories: agentCategories, // Store all categories for filtering
        rating: 5.0,
        reviews: 0,
        success: 100,
        price: `${agent.price_per_query || 0.01} STT/query`,
        status: agent.status === "verified" ? "Verified" : "Pending",
        statusColor: agent.status === "verified" ? "bg-primary" : "bg-muted",
        verified: agent.status === "verified",
        tags: [...agentCategories, "AIML", "GPT-4o"],
        creatorWallet: agent.creator_wallet,
        paymentWallet: agent.payment_wallet,
        description: agent.description,
        pricePerQuery: agent.price_per_query,
        isRegistered: true
      }
    })
  ]

  const filteredAgents = allAgents.filter(agent => {
    if (selectedCategory === "ALL") return true
    // Check if any of the agent's categories match the selected category
    return (agent as any).categories?.includes(selectedCategory)
  })

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4">Agent Directory</h1>
          <p className="text-xl text-muted-foreground">Discover AI agents ready to work for you</p>
        </div>

        {/* Filters */}
        <Card className="p-8 mb-8 bg-card/50 backdrop-blur">
          <div className="text-sm font-bold mb-4 uppercase tracking-wide text-muted-foreground">Filter by Category</div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`font-bold transition-all duration-200 ${
                  selectedCategory === category 
                    ? "bg-primary hover:bg-primary/90 border-2 border-accent shadow-lg shadow-primary/50 scale-110" 
                    : "hover:border-primary/50 hover:shadow-md border-2"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground font-bold">
            {isLoading ? "LOADING AGENTS..." : `${filteredAgents.length} AGENTS FOUND`}
          </p>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading agents from Supabase...</p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No agents found in this category.</p>
            </div>
          ) : (
            filteredAgents.map((agent) => (
            <Card key={agent.id} className="p-6 hover:border-primary transition-all cursor-pointer group bg-card/50 backdrop-blur">
              <div className="flex items-start justify-between mb-4">
                <div className={`px-3 py-1 ${agent.statusColor} text-xs font-black rounded-full ${agent.statusColor === 'bg-accent' ? 'text-black' : 'text-white'}`}>
                  {agent.status}
                </div>
                {agent.verified && (
                  <Verified className="w-5 h-5 text-primary" />
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                {agent.name}
              </h3>
              
              <div className="flex items-center gap-2 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-bold">{agent.rating}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{agent.reviews} reviews</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-accent font-bold">{agent.success}% success</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {agent.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-1 bg-secondary text-xs font-bold rounded border border-border">
                    {tag}
                  </span>
                ))}
              </div>
              
              {(agent as any).creatorWallet && (
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span className="font-mono">{(agent as any).creatorWallet.slice(0, 6)}...{(agent as any).creatorWallet.slice(-4)}</span>
                    <span className="text-muted-foreground/50">Creator</span>
                  </div>
                  {(agent as any).paymentWallet && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Wallet className="w-3 h-3" />
                      <span className="font-mono">{(agent as any).paymentWallet.slice(0, 6)}...{(agent as any).paymentWallet.slice(-4)}</span>
                      <span className="text-muted-foreground/50">Payments</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm font-black text-primary">{agent.price}</div>
                <div className="flex gap-2">
                  {/* Show delete button only if user created this agent */}
                  {authenticated && walletAddress && (agent as any).creatorWallet && 
                   walletAddress.toLowerCase() === (agent as any).creatorWallet.toLowerCase() && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="font-bold"
                      onClick={(e) => {
                        e.preventDefault()
                        openDeleteDialog((agent as any).id || agent.id, agent.name, (agent as any).creatorWallet)
                      }}
                      disabled={deletingAgentId === ((agent as any).id || agent.id)}
                    >
                      {deletingAgentId === ((agent as any).id || agent.id) ? (
                        <span className="flex items-center gap-1">
                          <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                          Deleting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </span>
                      )}
                    </Button>
                  )}
                  <Button size="sm" className="bg-primary hover:bg-primary/90 font-bold" asChild>
                    <Link href={`/agents/${agent.id}`}>Try Agent</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))
          )}
        </div>

        {/* Submit Agent Section */}
        <Card className="bg-gradient-to-br from-primary/20 via-accent/20 to-destructive/20 border-primary/30">
          <div className="p-12 text-center">
            <h2 className="text-4xl font-black mb-4">Are You Building Agents?</h2>
            <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
              Join SomniaX and start earning STT for every query. Submit your AI agent to the marketplace and reach thousands of users.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
              <Card className="p-6 text-left bg-card/50 backdrop-blur">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="font-bold text-xl mb-3">Submit AI Agent</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Have an autonomous AI agent? Get x402 micropayments, on-chain identity, and instant visibility.
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90 font-bold" asChild>
                  <Link href="/submit">Submit Agent →</Link>
                </Button>
              </Card>

              <Card className="p-6 text-left bg-card/50 backdrop-blur">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="font-bold text-xl mb-3">Learn to Build</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  New to agent development? Check our docs and tutorials to get started with Somnia and x402.
                </p>
                <Button variant="outline" className="w-full font-bold border-2">
                  View Docs →
                </Button>
              </Card>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setAgentToDelete(null)
        }}
        onConfirm={handleDeleteAgent}
        agentName={agentToDelete?.name}
        isDeleting={deletingAgentId === agentToDelete?.id}
      />
    </div>
  )
}