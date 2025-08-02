"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { format } from "date-fns"

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
    const receiptUrl = `${window.location.origin}/receipts/${receiptId}`
    const message = encodeURIComponent(
      `Receipt for ${studentName}\nReceipt No: ${receiptNo}\nAmount: ₹${totalAmount.toLocaleString()}\nDate: ${format(new Date(paymentDate), "dd MMM yyyy")}\n\nView receipt: ${receiptUrl}`
    )
    
    // Check if phone number is available
    if (!phoneNumber || phoneNumber.trim() === '') {
      // Fallback to general WhatsApp share if no phone number
      const whatsappUrl = `https://wa.me/?text=${message}`
      window.open(whatsappUrl, '_blank')
      return
    }
    
    // Format phone number for WhatsApp (remove spaces, dashes, and special characters)
    let formattedPhone = phoneNumber.replace(/[^\d+]/g, '')
    
    // If number doesn't start with +, assume it's Indian number and add +91
    if (!formattedPhone.startsWith('+')) {
      // Remove leading 0 if present and add +91 for Indian numbers
      formattedPhone = formattedPhone.startsWith('0') ? formattedPhone.substring(1) : formattedPhone
      formattedPhone = `91${formattedPhone}`
    } else {
      // Remove + from the beginning
      formattedPhone = formattedPhone.substring(1)
    }
    
    // Validate phone number length (should be at least 10 digits for most countries)
    if (formattedPhone.length < 10) {
      // Fallback to general WhatsApp share if invalid phone number
      const whatsappUrl = `https://wa.me/?text=${message}`
      window.open(whatsappUrl, '_blank')
      return
    }
    
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`
    window.open(whatsappUrl, '_blank')
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