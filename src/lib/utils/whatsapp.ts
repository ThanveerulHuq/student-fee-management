/**
 * WhatsApp utility functions for message creation and sharing
 */

import { getSchoolConfigFromEnv } from "../schools/config"

const schoolConfig = getSchoolConfigFromEnv()

/**
 * Formats phone number for WhatsApp URLs
 * @param phoneNumber - Raw phone number string
 * @returns Formatted phone number for WhatsApp (without + prefix)
 */
export function formatPhoneForWhatsApp(phoneNumber: string): string {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return ''
  }

  // Remove spaces, dashes, and special characters except +
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
  
  return formattedPhone
}

/**
 * Validates if a phone number is valid for WhatsApp
 * @param phoneNumber - Raw phone number string
 * @returns true if valid, false otherwise
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return false
  }
  
  const formatted = formatPhoneForWhatsApp(phoneNumber)
  return formatted.length >= 10
}

/**
 * Creates WhatsApp URL with message
 * @param message - Message to send
 * @param phoneNumber - Optional phone number to send to
 * @returns WhatsApp URL
 */
export function createWhatsAppUrl(message: string, phoneNumber?: string): string {
  const encodedMessage = encodeURIComponent(message)
  
  if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
    return `https://wa.me/?text=${encodedMessage}`
  }
  
  const formattedPhone = formatPhoneForWhatsApp(phoneNumber)
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
}

/**
 * Opens WhatsApp with message
 * @param message - Message to send
 * @param phoneNumber - Optional phone number to send to
 */
export function openWhatsApp(message: string, phoneNumber?: string): void {
  const url = createWhatsAppUrl(message, phoneNumber)
  window.open(url, '_blank')
}

/**
 * Creates a receipt sharing message
 * @param options - Receipt details
 * @returns Formatted message string
 */
export function createReceiptMessage(options: {
  studentName: string
  receiptNo: string
  totalAmount: number
  paymentDate: string
  receiptUrl: string
}): string {
  const { studentName, receiptNo, totalAmount, paymentDate, receiptUrl } = options
  
  return `Receipt for ${studentName}
Receipt No: ${receiptNo}
Amount: ₹${totalAmount.toLocaleString()}
Date: ${paymentDate}

View receipt: ${receiptUrl}

Thank you,
${schoolConfig.shortName}
`
}

/**
 * Creates a fee reminder message
 * @param options - Fee reminder details
 * @returns Formatted message string
 */
export function createFeeReminderMessage(options: {
  studentName: string
  fatherName: string
  academicYear: string
  outstandingAmount: number
  feeDetails: Array<{ name: string; outstandingAmount: number }>
  schoolName?: string
}): string {
  const { 
    studentName, 
    fatherName, 
    academicYear, 
    outstandingAmount, 
    feeDetails, 
    schoolName = schoolConfig.shortName
  } = options
  
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`
  
  return `Dear ${fatherName},

This is a fee reminder for ${studentName} for academic year ${academicYear}.

Outstanding Amount: ${formatCurrency(outstandingAmount)}

Fee Details:
${feeDetails
  .filter(fee => fee.outstandingAmount > 0)
  .map(fee => `• ${fee.name}: ${formatCurrency(fee.outstandingAmount)}`)
  .join('\n')}

Please pay at your earliest convenience.

Thank you,
${schoolName}`
}