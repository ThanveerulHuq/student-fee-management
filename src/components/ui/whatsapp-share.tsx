"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { format } from "date-fns"
import { createReceiptMessage, openWhatsApp } from "@/lib/utils/whatsapp"

interface WhatsAppShareProps {
  receiptId: string
  receiptNo: string
  studentName: string
  totalAmount: number
  paymentDate: string
  phoneNumber?: string
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export default function WhatsAppShare({
  receiptId,
  receiptNo,
  studentName,
  totalAmount,
  paymentDate,
  phoneNumber,
  className,
  size = "sm",
  variant = "outline"
}: WhatsAppShareProps) {
  const handleWhatsAppShare = () => {
    const receiptUrl = `${window.location.origin}/public-receipt/${receiptId}`
    const message = createReceiptMessage({
      studentName,
      receiptNo,
      totalAmount,
      paymentDate: format(new Date(paymentDate), "dd MMM yyyy"),
      receiptUrl
    })
    
    openWhatsApp(message, phoneNumber)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleWhatsAppShare}
      className={className}
      title={`Share via WhatsApp${phoneNumber ? ` to ${phoneNumber}` : ''}`}
    >
      <Share2 className="h-3 w-3 mr-1" />
      Share
    </Button>
  )
}