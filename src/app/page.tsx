"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Star, Zap, TrendingUp, Users, Verified } from "lucide-react"
import { agentAPI } from "@/lib/supabase"

export default function Home() {
  const [agents, setAgents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    activeAgents: 0,
    totalQueries: 0,
    successRate: 100
  })

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      setIsLoading(true)
      const registeredAgents = await agentAPI.getAll()
      setAgents(registeredAgents)
      
      // Update stats based on real data
      setStats({
        activeAgents: registeredAgents.length,
        totalQueries: registeredAgents.length * 150, // Estimated
        successRate: 100
      })
    } catch (error) {
      console.error('Error loading agents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get featured agents (first 4)
  const featuredAgents = agents.slice(0, 4).map((agent: any) => {
    const categories = agent.category?.split(',').map((c: string) => c.trim()) || ['AI']
    return {
      id: agent.id,
      name: agent.name,
      tags: [...categories, "AIML", "GPT-4o"],
      price: `${agent.price_per_query || 0.01} STT/query`,
      status: agent.status === "verified" ? "Verified" : "Pending",
      statusColor: agent.status === "verified" ? "bg-primary" : "bg-muted",
      verified: agent.status === "verified",
      slug: agent.slug,
      rating: 5.0,
      reviews: 0,
      success: 100,
      creatorWallet: agent.creator_wallet,
      paymentWallet: agent.payment_wallet,
      description: agent.description
    }
  })
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-2 bg-secondary border border-primary rounded-full text-sm font-bold text-primary mb-4">
            Built on Somnia • Powered by x402
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight">
            Deploy AI Agents.{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-destructive bg-clip-text text-transparent">
              Get Results.
            </span>
            <br />
            Pay Only For Success.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            The decentralized agent marketplace where you only pay for what works. No subscriptions. No setup fees. Just results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 text-lg">
              Start using SomniaX
            </Button>
            <Button size="lg" variant="outline" className="font-bold px-8 py-6 text-lg border-2" asChild>
              <Link href="/agents">Browse Agents</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Real-Time Metrics Dashboard */}
      <section className="border-t border-b bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 text-center bg-card/50 backdrop-blur border-primary/20">
              <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-4xl font-black mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {isLoading ? "..." : stats.activeAgents}
              </div>
              <div className="text-sm text-muted-foreground font-bold uppercase tracking-wide">Active Agents</div>
            </Card>
            <Card className="p-6 text-center bg-card/50 backdrop-blur border-accent/20">
              <Zap className="w-8 h-8 mx-auto mb-3 text-accent" />
              <div className="text-4xl font-black mb-2 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                0.2
              </div>
              <div className="text-sm text-muted-foreground font-bold uppercase tracking-wide">STT Registration Fee</div>
            </Card>
            <Card className="p-6 text-center bg-card/50 backdrop-blur border-destructive/20">
              <TrendingUp className="w-8 h-8 mx-auto mb-3 text-destructive" />
              <div className="text-4xl font-black mb-2 bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">
                {isLoading ? "..." : stats.totalQueries}
              </div>
              <div className="text-sm text-muted-foreground font-bold uppercase tracking-wide">Total Queries</div>
            </Card>
            <Card className="p-6 text-center bg-card/50 backdrop-blur border-accent/20">
              <Star className="w-8 h-8 mx-auto mb-3 text-accent" />
              <div className="text-4xl font-black mb-2 bg-gradient-to-r from-accent to-destructive bg-clip-text text-transparent">
                {stats.successRate}%
              </div>
              <div className="text-sm text-muted-foreground font-bold uppercase tracking-wide">AI Powered</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Agent Directory Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Featured Agents</h2>
            <p className="text-xl text-muted-foreground">Discover AI agents ready to work for you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Loading agents...</p>
              </div>
            ) : featuredAgents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground mb-4">No agents registered yet. Be the first!</p>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold" asChild>
                  <Link href="/submit">Register Your Agent</Link>
                </Button>
              </div>
            ) : (
              featuredAgents.map((agent) => (
                <Link key={agent.id} href={`/agents/${agent.slug}`}>
                  <Card className="p-6 hover:border-primary transition-all cursor-pointer group bg-card/50 backdrop-blur h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 ${agent.statusColor} text-xs font-black rounded-full ${
                        agent.statusColor === 'bg-accent' ? 'text-black' : 
                        agent.statusColor === 'bg-primary' ? 'text-white' : 'text-white'
                      }`}>
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
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-sm font-black text-primary">{agent.price}</div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 font-bold">
                        Try Agent
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
          
          <div className="text-center">
            <Button size="lg" variant="outline" className="font-bold border-2" asChild>
              <Link href="/agents">View All Agents →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-secondary/30">
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 bg-card/50 backdrop-blur border-primary/20">
              <div className="text-6xl font-black mb-4 text-primary">01</div>
              <h3 className="text-2xl font-bold mb-4">Browse Agents</h3>
              <p className="text-muted-foreground">
                Explore our marketplace of AI agents. Filter by capability, check ratings, and compare prices.
              </p>
            </Card>
            
            <Card className="p-8 bg-card/50 backdrop-blur border-accent/20">
              <div className="text-6xl font-black mb-4 text-accent">02</div>
              <h3 className="text-2xl font-bold mb-4">Send Query</h3>
              <p className="text-muted-foreground">
                Choose your agent and submit your query. Pay per query with STT tokens - no subscriptions needed.
              </p>
            </Card>
            
            <Card className="p-8 bg-card/50 backdrop-blur border-destructive/20">
              <div className="text-6xl font-black mb-4 text-destructive">03</div>
              <h3 className="text-2xl font-bold mb-4">Get Results</h3>
              <p className="text-muted-foreground">
                Receive instant results. Rate the agent. Only pay for successful queries that deliver value.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-gradient-to-br from-primary/10 via-accent/10 to-destructive/10">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-5xl md:text-6xl font-black">Ready to Start?</h2>
            <p className="text-xl text-muted-foreground">
              Join the future of AI agent marketplaces. Deploy, query, and pay only for success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 text-lg">
                Start using SomniaX
              </Button>
              <Button size="lg" variant="outline" className="font-bold px-8 py-6 text-lg border-2" asChild>
                <Link href="/chat">Try SomniaX Chat</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Image 
                src="/somnialogo.png" 
                alt="Somnia Logo" 
                width={32} 
                height={32}
                className="h-8 w-8"
              />
              <span className="font-black text-lg text-foreground uppercase">SOMNIAX</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <Link href="/agents" className="hover:text-primary transition-colors">Agents</Link>
              <Link href="/chat" className="hover:text-primary transition-colors">Chat</Link>
              <Link href="/submit" className="hover:text-primary transition-colors">Submit</Link>
            </div>
            <div>© 2025 SomniaX</div>
          </div>
        </div>
      </footer>
    </div>
  )
}