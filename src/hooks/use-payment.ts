"use client"

import { useState, useEffect, useCallback } from "react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { parseEther, createWalletClient, custom, formatEther, createPublicClient, http } from "viem"
import { somniaTestnet } from "viem/chains"
import { PAYMENT_CONFIG, STORAGE_KEYS, PaymentState, isPaymentValid } from "@/lib/x402-config"
import { verifyWalletPayments, recordPayment, updateMessagesUsed, type PaymentVerification } from "@/lib/verify-payments"

// Public client for reading blockchain data
const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http("https://dream-rpc.somnia.network/"),
})

export function usePayment() {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  
  const wallet = wallets[0]
  const address = wallet?.address as `0x${string}` | undefined
  const chainId = wallet?.chainId ? parseInt(wallet.chainId.split(':')[1]) : undefined
  const isConnected = authenticated && !!wallet
  const isOnSomnia = chainId === somniaTestnet.id
  
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isPaid: false,
    messagesRemaining: 0,
  })
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [verificationData, setVerificationData] = useState<PaymentVerification | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  // Load payment state and verify on-chain when wallet connects
  useEffect(() => {
    async function loadAndVerify() {
      if (typeof window !== "undefined" && address) {
        setIsVerifying(true)
        
        // Get messages remaining from localStorage
        const stored = localStorage.getItem(STORAGE_KEYS.messageCount(address))
        const messagesRemaining = stored ? parseInt(stored, 10) : 0
        
        // Quick display of localStorage data
        setPaymentState({
          isPaid: messagesRemaining > 0,
          messagesRemaining,
          lastPaymentHash: undefined,
        })
        
        // NOW: Verify on blockchain (get REAL payment count)
        try {
          console.log("🔍 Starting blockchain verification...")
          
          // Calculate how many messages were actually used from localStorage
          // We'll update this after we get the real count from blockchain
          const verification = await verifyWalletPayments(address, 0)
          setVerificationData(verification)
          
          // Calculate actual messages used based on blockchain data
          const totalPurchasedFromBlockchain = verification.totalPayments * PAYMENT_CONFIG.messagesPerBundle
          const actualMessagesUsed = Math.max(0, totalPurchasedFromBlockchain - messagesRemaining)
          
          // Update verification with correct usage
          verification.messagesUsed = actualMessagesUsed
          verification.messagesRemaining = totalPurchasedFromBlockchain - actualMessagesUsed
          setVerificationData(verification)
          
          console.log("🔍 Verification complete:", verification)
          console.log(`   Total payments: ${verification.totalPayments}`)
          console.log(`   Total purchased: ${verification.totalMessagesPurchased} messages`)
          console.log(`   Messages used: ${verification.messagesUsed}`)
          console.log(`   Messages remaining: ${verification.messagesRemaining}`)
          
          // Update state with verified data
          setPaymentState({
            isPaid: verification.messagesRemaining > 0,
            messagesRemaining: verification.messagesRemaining,
            lastPaymentHash: verification.transactions[verification.transactions.length - 1] as `0x${string}` || undefined,
          })
          
          // Update localStorage with verified count
          localStorage.setItem(STORAGE_KEYS.messageCount(address), verification.messagesRemaining.toString())
        } catch (error) {
          console.error("Verification failed:", error)
        } finally {
          setIsVerifying(false)
        }
      } else {
        // No wallet connected, show 0 messages
        setPaymentState({
          isPaid: false,
          messagesRemaining: 0,
          lastPaymentHash: undefined,
        })
        setVerificationData(null)
        setIsVerifying(false)
      }
    }
    
    loadAndVerify()
  }, [address])

  // Save payment state to localStorage (per wallet)
  const savePaymentState = useCallback((state: PaymentState) => {
    if (typeof window !== "undefined" && address) {
      localStorage.setItem(STORAGE_KEYS.messageCount(address), state.messagesRemaining.toString())
      if (state.lastPaymentHash) {
        localStorage.setItem(STORAGE_KEYS.lastPaymentHash(address), state.lastPaymentHash)
      }
      setPaymentState(state)
    }
  }, [address])

  // Process payment
  const processPayment = useCallback(async () => {
    console.log("processPayment called")
    console.log("isConnected:", isConnected, "address:", address)
    console.log("current chain:", chainId)
    console.log("target chain:", PAYMENT_CONFIG.network.id)
    console.log("isProcessing:", isProcessing)
    
    // Get current message count from localStorage (most up-to-date, per wallet)
    const currentCount = typeof window !== "undefined" && address
      ? parseInt(localStorage.getItem(STORAGE_KEYS.messageCount(address)) || "0", 10)
      : paymentState.messagesRemaining
    
    console.log("Current messages from storage for", address, ":", currentCount)
    
    // Prevent double-click
    if (isProcessing) {
      console.log("Already processing payment, ignoring...")
      return
    }
    
    if (!isConnected || !address) {
      const error = new Error("Wallet not connected. Please connect your wallet first.")
      console.error(error)
      throw error
    }

    // Check if on correct network BEFORE processing
    if (!isOnSomnia) {
      const error = new Error(
        `Wrong Network!\n\n` +
        `Current: Chain ID ${chainId || 'Unknown'}\n` +
        `Required: Somnia Testnet (Chain ID: ${PAYMENT_CONFIG.network.id})\n\n` +
        `Please switch your wallet to Somnia Testnet and try again.`
      )
      console.error(error)
      throw error
    }

    setIsProcessing(true)
    
    try {
      // Check wallet is available
      if (!wallet) {
        const error = new Error("Wallet not available. Please reconnect your wallet.")
        console.error(error)
        throw error
      }
      
      console.log("Sending transaction...")
      console.log("To:", PAYMENT_CONFIG.recipientAddress)
      console.log("Value:", PAYMENT_CONFIG.pricePerBundle, "STT")
      console.log("Chain ID:", PAYMENT_CONFIG.network.id)
      
      // Check wallet balance BEFORE payment
      const balanceBefore = await publicClient.getBalance({
        address: address!,
      })
      const balanceBeforeSTT = formatEther(balanceBefore)
      console.log("💰 WALLET BALANCE BEFORE:", balanceBeforeSTT, "STT")
      
      // Parse the payment amount
      const paymentAmount = parseEther(PAYMENT_CONFIG.pricePerBundle)
      console.log("💸 PAYMENT AMOUNT (wei):", paymentAmount.toString())
      console.log("💸 PAYMENT AMOUNT (STT):", formatEther(paymentAmount), "STT")
      
      // Get Privy wallet provider
      const provider = await wallet.getEthereumProvider()
      
      // Create wallet client from Privy provider
      const walletClient = createWalletClient({
        chain: somniaTestnet,
        transport: custom(provider),
      })
      
      console.log("🚀 SENDING TRANSACTION WITH:")
      console.log("   From:", address)
      console.log("   To:", PAYMENT_CONFIG.recipientAddress)
      console.log("   Value (wei):", paymentAmount.toString())
      console.log("   Value (STT):", formatEther(paymentAmount), "STT")
      
      // Send native STT payment using wallet client
      const txHash = await walletClient.sendTransaction({
        account: address!,
        to: PAYMENT_CONFIG.recipientAddress as `0x${string}`,
        value: paymentAmount, // Use the parsed value
        chain: PAYMENT_CONFIG.network,
      })
      
      console.log("✅ Transaction confirmed! Hash:", txHash)
      
      // Wait a bit for balance to update
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check wallet balance AFTER payment
      const balanceAfter = await publicClient.getBalance({
        address: address!,
      })
      const balanceAfterSTT = formatEther(balanceAfter)
      const amountSpent = Number(balanceBeforeSTT) - Number(balanceAfterSTT)
      
      console.log("💰 WALLET BALANCE AFTER:", balanceAfterSTT, "STT")
      console.log("💸 AMOUNT SPENT:", amountSpent.toFixed(4), "STT (includes gas)")
      console.log("📉 BALANCE CHANGE:", Number(balanceBeforeSTT).toFixed(4), "STT →", Number(balanceAfterSTT).toFixed(4), "STT")

      console.log("Transaction sent! Hash:", txHash)
      setLastTxHash(txHash)

      // Record payment in verification system
      if (address) {
        const verification = recordPayment(address, txHash)
        setVerificationData(verification)
        console.log("💰 Payment recorded in verification system")
        console.log(`   Total payments: ${verification.totalPayments}`)
        console.log(`   Total messages: ${verification.totalMessagesPurchased}`)
      }

      // Update state optimistically - ADD messages to existing count from localStorage
      const newMessageCount = currentCount + PAYMENT_CONFIG.messagesPerBundle
      console.log(`Adding ${PAYMENT_CONFIG.messagesPerBundle} to ${currentCount} = ${newMessageCount}`)
      
      const newState: PaymentState = {
        isPaid: true,
        messagesRemaining: newMessageCount,
        lastPaymentHash: txHash,
      }
      
      savePaymentState(newState)
      setIsPaymentModalOpen(false)
      
      console.log("Payment state updated, modal closed")
      return txHash
    } catch (error: any) {
      console.error("Payment transaction failed:", error)
      
      // Better error message for chain mismatch
      if (error?.message?.includes("does not match the target chain")) {
        throw new Error(`Please switch your wallet to Somnia Testnet (Chain ID: ${PAYMENT_CONFIG.network.id})`)
      }
      
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [isConnected, address, chainId, wallet, isProcessing, isOnSomnia, savePaymentState])

  // Decrement message count (per wallet)
  const decrementMessageCount = useCallback(() => {
    if (!address) return
    
    setPaymentState((prev) => {
      const newCount = Math.max(0, prev.messagesRemaining - 1)
      const newState = {
        ...prev,
        messagesRemaining: newCount,
        isPaid: newCount > 0,
      }
      
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.messageCount(address), newCount.toString())
        
        // Update verification system with messages used
        if (verificationData) {
          const messagesUsed = verificationData.totalMessagesPurchased - newCount
          updateMessagesUsed(address, messagesUsed)
        }
      }
      
      return newState
    })
  }, [address, verificationData])

  // Check if user needs to pay
  const needsPayment = useCallback(() => {
    return !isPaymentValid(paymentState)
  }, [paymentState])

  // Open payment modal
  const requestPayment = useCallback(() => {
    setIsPaymentModalOpen(true)
  }, [])

  // Close payment modal
  const closePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false)
  }, [])

  return {
    paymentState,
    isPaymentModalOpen,
    isProcessing,
    isOnCorrectNetwork: isOnSomnia,
    currentChainId: chainId,
    needsPayment,
    requestPayment,
    closePaymentModal,
    processPayment,
    decrementMessageCount,
    isConnected,
    verificationData,
    isVerifying,
  }
}
