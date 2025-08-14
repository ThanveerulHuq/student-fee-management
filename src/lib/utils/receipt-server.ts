// Server-side utility functions for receipt generation (database-dependent)
"use server"

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
