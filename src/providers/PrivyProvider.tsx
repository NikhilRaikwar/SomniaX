"use client"

import { PrivyProvider as Privy } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http } from 'viem'
import { somniaTestnet } from 'viem/chains'
import { createConfig } from '@privy-io/wagmi'

const queryClient = new QueryClient()

const privyConfig = createConfig({
  chains: [somniaTestnet],
  transports: {
    [somniaTestnet.id]: http(),
  },
})

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <Privy
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['email', 'wallet', 'google'],
        appearance: {
          theme: 'dark',
          accentColor: '#7b3ff2',
          logo: '/somnialogo.png',
          landingHeader: 'Welcome to SomniaX',
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        defaultChain: somniaTestnet,
        supportedChains: [somniaTestnet],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={privyConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </Privy>
  )
}
