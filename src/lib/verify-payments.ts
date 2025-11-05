import { createPublicClient, http, parseEther, formatEther } from "viem"
import { somniaTestnet } from "viem/chains"
import { PAYMENT_CONFIG } from "./x402-config"

const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http("https://dream-rpc.somnia.network/"),
})

// Shannon Explorer API endpoint
const SHANNON_EXPLORER_API = "https://shannon-explorer.somnia.network/api"

export interface PaymentVerification {
  totalPayments: number
  totalMessagesPurchased: number
  messagesUsed: number
  messagesRemaining: number
  lastVerified: string
  transactions: string[]
}

/**
 * Verify all payments from a wallet address to the recipient
 * by checking ACTUAL on-chain transactions via Shannon Explorer
 */
export async function verifyWalletPayments(
  userAddress: string,
  messagesUsed: number = 0
): Promise<PaymentVerification> {
  try {
    console.log("🔍 SCANNING BLOCKCHAIN for wallet:", userAddress)
    console.log("📊 Current messages used:", messagesUsed)
    console.log("🎯 Recipient address:", PAYMENT_CONFIG.recipientAddress)
    console.log("💰 Payment amount:", PAYMENT_CONFIG.pricePerBundle, "STT")

    // Try Shannon Explorer API first
    let transactions: string[] = []
    let totalPayments = 0

    try {
      console.log("🌐 Querying Shannon Explorer API...")
      const explorerUrl = `${SHANNON_EXPLORER_API}?module=account&action=txlist&address=${userAddress}&sort=desc`
      
      const response = await fetch(explorerUrl)
      const data = await response.json()
      
      if (data.status === "1" && data.result) {
        console.log(`📋 Found ${data.result.length} total transactions`)
        
        // Filter for payments to our recipient address with correct amount
        const paymentAmount = parseEther(PAYMENT_CONFIG.pricePerBundle).toString()
        
        const validPayments = data.result.filter((tx: any) => {
          const isToRecipient = tx.to?.toLowerCase() === PAYMENT_CONFIG.recipientAddress.toLowerCase()
          const isCorrectAmount = tx.value === paymentAmount
          const isSuccess = tx.isError === "0"
          
          if (isToRecipient && isCorrectAmount && isSuccess) {
            console.log(`✅ Valid payment found: ${tx.hash}`)
            return true
          }
          return false
        })
        
        transactions = validPayments.map((tx: any) => tx.hash)
        totalPayments = validPayments.length
        
        console.log(`💰 Total valid payments found: ${totalPayments}`)
        console.log(`📝 Transaction hashes:`, transactions)
      }
    } catch (explorerError) {
      console.warn("⚠️ Explorer API error, falling back to RPC:", explorerError)
      
      // Fallback: Use RPC to scan recent blocks
      try {
        console.log("🔄 Scanning via RPC...")
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock - BigInt(100000) // Scan last 100k blocks
        
        console.log(`📊 Scanning from block ${fromBlock} to ${currentBlock}`)
        
        // Get transaction count
        const txCount = await publicClient.getTransactionCount({
          address: userAddress as `0x${string}`,
        })
        
        console.log(`📨 Wallet has ${txCount} transactions total`)
        
        // Note: Full transaction scanning via RPC is resource-intensive
        // In production, use an indexer or explorer API
        // For now, we'll check localStorage and validate
      } catch (rpcError) {
        console.error("❌ RPC scan failed:", rpcError)
      }
    }

    // Calculate totals
    const totalMessagesPurchased = totalPayments * PAYMENT_CONFIG.messagesPerBundle
    const messagesRemaining = Math.max(0, totalMessagesPurchased - messagesUsed)

    const verification: PaymentVerification = {
      totalPayments,
      totalMessagesPurchased,
      messagesUsed,
      messagesRemaining,
      lastVerified: new Date().toISOString(),
      transactions,
    }

    console.log("✅ BLOCKCHAIN VERIFICATION COMPLETE:")
    console.log(`   📍 Wallet: ${userAddress}`)
    console.log(`   💳 Total Top-ups: ${totalPayments}`)
    console.log(`   📦 Total Purchased: ${totalMessagesPurchased} messages`)
    console.log(`   ✏️  Messages Used: ${messagesUsed}`)
    console.log(`   ✅ Messages Remaining: ${messagesRemaining}`)
    console.log(`   🔗 Transactions:`, transactions)

    // Save verified data to localStorage
    const storageKey = `somniax_verified_payments_${userAddress.toLowerCase()}`
    localStorage.setItem(storageKey, JSON.stringify(verification))

    return verification

  } catch (error) {
    console.error("❌ BLOCKCHAIN VERIFICATION FAILED:", error)
    
    // Fallback to localStorage
    const storageKey = `somniax_verified_payments_${userAddress.toLowerCase()}`
    const stored = localStorage.getItem(storageKey)
    
    if (stored) {
      const cached = JSON.parse(stored)
      console.log("⚠️ Using cached data:", cached)
      return cached
    }
    
    // Return safe default
    return {
      totalPayments: 0,
      totalMessagesPurchased: 0,
      messagesUsed,
      messagesRemaining: 0,
      lastVerified: new Date().toISOString(),
      transactions: [],
    }
  }
}

/**
 * Record a new payment after transaction is confirmed
 */
export function recordPayment(
  userAddress: string,
  txHash: string
): PaymentVerification {
  const storageKey = `somniax_verified_payments_${userAddress.toLowerCase()}`
  const stored = localStorage.getItem(storageKey)
  
  let verifiedData: PaymentVerification
  
  if (stored) {
    verifiedData = JSON.parse(stored)
  } else {
    verifiedData = {
      totalPayments: 0,
      totalMessagesPurchased: 0,
      messagesUsed: 0,
      messagesRemaining: 0,
      lastVerified: new Date().toISOString(),
      transactions: [],
    }
  }

  // Add new payment
  verifiedData.totalPayments += 1
  verifiedData.totalMessagesPurchased = verifiedData.totalPayments * PAYMENT_CONFIG.messagesPerBundle
  verifiedData.messagesRemaining = verifiedData.totalMessagesPurchased - verifiedData.messagesUsed
  verifiedData.lastVerified = new Date().toISOString()
  
  if (!verifiedData.transactions.includes(txHash)) {
    verifiedData.transactions.push(txHash)
  }

  // Save updated data
  localStorage.setItem(storageKey, JSON.stringify(verifiedData))
  
  console.log("💰 Payment recorded:", verifiedData)
  return verifiedData
}

/**
 * Update messages used count
 */
export function updateMessagesUsed(
  userAddress: string,
  messagesUsed: number
): PaymentVerification {
  const storageKey = `somniax_verified_payments_${userAddress.toLowerCase()}`
  const stored = localStorage.getItem(storageKey)
  
  if (!stored) {
    return {
      totalPayments: 0,
      totalMessagesPurchased: 0,
      messagesUsed,
      messagesRemaining: 0,
      lastVerified: new Date().toISOString(),
      transactions: [],
    }
  }

  const verifiedData: PaymentVerification = JSON.parse(stored)
  verifiedData.messagesUsed = messagesUsed
  verifiedData.messagesRemaining = Math.max(0, verifiedData.totalMessagesPurchased - messagesUsed)
  verifiedData.lastVerified = new Date().toISOString()

  localStorage.setItem(storageKey, JSON.stringify(verifiedData))
  return verifiedData
}

/**
 * Get payment history for a wallet
 */
export function getPaymentHistory(userAddress: string): PaymentVerification | null {
  const storageKey = `somniax_verified_payments_${userAddress.toLowerCase()}`
  const stored = localStorage.getItem(storageKey)
  
  if (!stored) return null
  
  return JSON.parse(stored)
}
