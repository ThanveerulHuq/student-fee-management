// Utility functions for receipt generation and fee calculations
import { db } from "@/lib/database"

export function generateReceiptNumber(academicYear: string, sequenceNumber: number): string {
  return `${academicYear}-${sequenceNumber}`
}

export async function getNextReceiptSequence(academicYear: string): Promise<number> {
  await db.connect()
  
  const result = await db.receiptSequence.findOneAndUpdate(
    { academicYear },
    { $inc: { lastSequence: 1 } },
    { 
      new: true, 
      upsert: true,
      setDefaultsOnInsert: true
    }
  )
  
  return result?.lastSequence || 1
}


export function calculateOutstandingBalance(
  totalFee: number,
  paidFee: {
    schoolFeePaid: number
    bookFeePaid: number
    uniformFeePaid: number
    islamicStudiesPaid: number
    vanFeePaid: number
  }
) {
  const totalPaid = 
    paidFee.schoolFeePaid +
    paidFee.bookFeePaid +
    paidFee.uniformFeePaid +
    paidFee.islamicStudiesPaid +
    paidFee.vanFeePaid

  return Math.max(0, totalFee - totalPaid)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}