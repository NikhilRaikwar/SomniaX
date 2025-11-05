"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="container max-w-3xl">
        {/* Retro Header */}
        <div className="bg-black text-white p-6 mb-6 rounded-t-lg border-4 border-black">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-accent animate-pulse" />
            <h1 className="text-4xl font-black tracking-tight">404 ERROR</h1>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="p-12 text-center bg-card border-4 border-primary shadow-2xl shadow-primary/20">
          <div className="space-y-6">
            {/* Retro 404 Display */}
            <div className="relative">
              <div className="text-[120px] md:text-[180px] font-black leading-none bg-gradient-to-r from-primary via-accent to-destructive bg-clip-text text-transparent animate-pulse">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[120px] md:text-[180px] font-black leading-none opacity-10 blur-sm">
                  404
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3 max-w-xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide">
                PAGE NOT FOUND
              </h2>
              <p className="text-muted-foreground text-lg">
                Oops! This agent seems to have gone offline. The page you're looking for doesn't exist in our marketplace.
              </p>
            </div>

            {/* Retro Status Display */}
            <div className="bg-black text-accent p-4 rounded-lg font-mono text-sm max-w-md mx-auto border-2 border-accent/50">
              <div className="flex items-center justify-between mb-1">
                <span>STATUS:</span>
                <span className="text-destructive font-black">NOT FOUND</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span>ERROR CODE:</span>
                <span className="text-white font-black">404</span>
              </div>
              <div className="flex items-center justify-between">
                <span>SYSTEM:</span>
                <span className="text-primary font-black">SOMNIAX</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white font-black text-lg px-8 border-2 border-accent shadow-lg shadow-primary/30"
                asChild
              >
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  GO HOME
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="font-black text-lg px-8 border-2 border-primary hover:bg-primary/10"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                GO BACK
              </Button>
            </div>

            {/* Additional Links */}
            <div className="pt-6 border-t border-border mt-8">
              <p className="text-sm text-muted-foreground mb-4 font-bold">
                Looking for something specific?
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link 
                  href="/agents" 
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Browse Agents
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link 
                  href="/submit" 
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Submit Agent
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link 
                  href="/chat" 
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Chat with AI
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p className="font-mono">
            SOMNIAX AGENT MARKETPLACE • POWERED BY x402 PROTOCOL
          </p>
        </div>
      </div>
    </div>
  )
}
