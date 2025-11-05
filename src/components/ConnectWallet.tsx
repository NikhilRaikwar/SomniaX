"use client"

import { usePrivy, useWallets } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { somniaTestnet } from "viem/chains"

export function ConnectWallet() {
  const { ready, authenticated, login, logout, user } = usePrivy()
  const { wallets } = useWallets()
  
  const wallet = wallets[0]
  const address = wallet?.address
  const chainId = wallet?.chainId
  
  const isOnSomnia = chainId === `eip155:${somniaTestnet.id}`

  const handleSwitchNetwork = async () => {
    if (!wallet) return
    try {
      await wallet.switchChain(somniaTestnet.id)
    } catch (error) {
      console.error("Failed to switch network:", error)
    }
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!ready) {
    return (
      <Button disabled className="bg-primary/50">
        Loading...
      </Button>
    )
  }

  if (!authenticated) {
    return (
      <Button onClick={login} className="bg-primary hover:bg-primary/90">
        Sign In
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {wallet && !isOnSomnia && (
        <Button
          onClick={handleSwitchNetwork}
          variant="destructive"
          size="sm"
          className="text-xs"
        >
          Switch to Somnia
        </Button>
      )}
      
      <Card className="px-4 py-2 bg-secondary/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnSomnia ? 'bg-green-500' : 'bg-yellow-500'}`} />
          {address ? (
            <span className="text-sm font-mono">{truncateAddress(address)}</span>
          ) : (
            <span className="text-sm">{user?.email?.address || 'Connected'}</span>
          )}
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  )
}
