"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, X } from "lucide-react"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  agentName?: string
  isDeleting?: boolean
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  agentName = "this agent",
  isDeleting = false
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog Box */}
      <Card className="relative w-full max-w-md bg-card border-4 border-destructive shadow-2xl shadow-destructive/50 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-destructive text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-black tracking-tight uppercase">
              CONFIRM DELETE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            disabled={isDeleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4">
            <p className="text-sm font-bold text-center mb-3">
              ⚠️ WARNING: THIS ACTION CANNOT BE UNDONE
            </p>
            <p className="text-muted-foreground text-center">
              Are you sure you want to permanently delete{" "}
              <span className="font-black text-foreground">{agentName}</span>?
            </p>
          </div>

          {/* Retro Status Display */}
          <div className="bg-black text-accent p-3 rounded-lg font-mono text-xs border-2 border-accent/50">
            <div className="flex items-center justify-between mb-1">
              <span>ACTION:</span>
              <span className="text-destructive font-black">DELETE AGENT</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span>STATUS:</span>
              <span className="text-white font-black">PENDING CONFIRMATION</span>
            </div>
            <div className="flex items-center justify-between">
              <span>REVERSIBLE:</span>
              <span className="text-destructive font-black">NO</span>
            </div>
          </div>

          {/* Consequences List */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              This will:
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-destructive font-bold">•</span>
                <span>Remove the agent from the marketplace</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive font-bold">•</span>
                <span>Delete all agent data permanently</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive font-bold">•</span>
                <span>Stop all future queries to this agent</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 font-bold border-2 hover:bg-secondary"
              onClick={onClose}
              disabled={isDeleting}
            >
              CANCEL
            </Button>
            <Button
              variant="destructive"
              className="flex-1 font-black border-2 border-destructive bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/30"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  DELETING...
                </span>
              ) : (
                "DELETE AGENT"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
