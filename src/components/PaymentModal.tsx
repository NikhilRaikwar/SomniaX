"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onApprove: () => Promise<void>
  recipientAddress: string
  amount: string
  itemName: string
  itemDescription: string
  network: string
}

export function PaymentModal({
  isOpen,
  onClose,
  onApprove,
  recipientAddress,
  amount,
  itemName,
  itemDescription,
  network,
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Address copied successfully",
    })
  }

  const handleApprove = async () => {
    console.log("Approve button clicked!")
    setIsProcessing(true)
    try {
      console.log("Calling onApprove...")
      await onApprove()
      console.log("Payment successful!")
    } catch (error) {
      console.error("Payment failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const truncateAddress = (address: string) => {
    if (address.length < 12) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-xl p-0 overflow-hidden border-2 gap-0"
        showCloseButton={false}
      >
        {/* Accessibility - hidden but readable by screen readers */}
        <DialogTitle className="sr-only">Payment Invoice</DialogTitle>
        <DialogDescription className="sr-only">
          Pay {amount} STT to purchase {itemDescription} for SomniaX Chat
        </DialogDescription>
        
        {/* Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold uppercase tracking-wider">Payment Invoice</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-white/10 px-3 py-1 rounded">
              X402 PROTOCOL
            </span>
            <button
              onClick={onClose}
              className="hover:bg-white/10 rounded p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-white">
          {/* Why Payment */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
              Why Payment?
            </h3>
            <p className="text-sm leading-relaxed font-mono text-gray-800">
              SomniaX uses X402 micropayments for trustless AI sessions. Pay only for
              what you use ({amount} STT per 30 messages). No subscriptions.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Item */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Item
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-gray-900">{itemName}</span>
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded uppercase">
                {itemDescription}
              </span>
            </div>
          </div>

          {/* To */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400">
              To
            </h3>
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-gray-900">{truncateAddress(recipientAddress)}</span>
              <button
                onClick={() => handleCopy(recipientAddress)}
                className="p-1.5 hover:bg-gray-100 rounded border border-gray-300 transition-colors"
                title="Copy address"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => window.open(`https://shannon-explorer.somnia.network/address/${recipientAddress}`, '_blank')}
                className="p-1.5 hover:bg-gray-100 rounded border border-gray-300 transition-colors"
                title="View on explorer"
              >
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Total */}
          <div className="flex items-end justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Total
            </h3>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">${amount}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">STT</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-0 border-t-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing}
            className="h-16 rounded-none border-r uppercase tracking-wider font-bold text-base hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApprove}
            disabled={isProcessing}
            className="h-16 rounded-none bg-black hover:bg-gray-800 text-white uppercase tracking-wider font-bold text-base cursor-pointer"
          >
            {isProcessing ? "Processing..." : "Approve"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
