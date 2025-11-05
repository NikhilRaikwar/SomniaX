import { Address } from "viem"

// Somnia Testnet Configuration (Shannon Testnet)
export const SOMNIA_TESTNET = {
  id: 50312,
  name: "Somnia Testnet",
  nativeCurrency: {
    name: "STT",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://dream-rpc.somnia.network"],
    },
    public: {
      http: ["https://dream-rpc.somnia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Somnia Shannon Explorer",
      url: "https://shannon-explorer.somnia.network",
    },
  },
  testnet: true,
} as const

// Payment Configuration
export const PAYMENT_CONFIG = {
  // Recipient address for payments (Your business wallet)
  recipientAddress: (process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || 
    "0xE867be6751b23Bd389792AC080F604C4608a8637") as Address,
  
  // Price per 30 messages in STT (0.1 STT)
  pricePerBundle: "0.1",
  
  // Number of messages per payment
  messagesPerBundle: 30,
  
  // Token details (native STT token on Somnia)
  tokenSymbol: "STT",
  tokenDecimals: 18,
  
  // Network
  network: SOMNIA_TESTNET,
} as const

// Storage keys for local state (per user)
export const STORAGE_KEYS = {
  messageCount: (address: string) => `somniax_message_count_${address.toLowerCase()}`,
  lastPaymentHash: (address: string) => `somniax_last_payment_hash_${address.toLowerCase()}`,
  accessExpiry: (address: string) => `somniax_access_expiry_${address.toLowerCase()}`,
} as const

// Payment types
export interface PaymentRequirements {
  scheme: "exact"
  network: string
  maxAmountRequired: string
  resource: string
  description: string
  payTo: Address
  maxTimeoutSeconds: number
  asset: Address | null
}

export interface PaymentState {
  isPaid: boolean
  messagesRemaining: number
  lastPaymentHash?: string
  expiresAt?: number
}

// Helper to check if payment is valid
export function isPaymentValid(state: PaymentState): boolean {
  return state.isPaid && state.messagesRemaining > 0
}

// Helper to parse Wei to STT
export function weiToSTT(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(4)
}

// Helper to parse STT to Wei
export function sttToWei(stt: string): bigint {
  return BigInt(Math.floor(parseFloat(stt) * 1e18))
}
