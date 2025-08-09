"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import LoaderWrapper from "@/components/ui/loader-wrapper"
import ReceiptRenderer from "@/components/receipts/ReceiptRenderer"
import { getSchoolConfigFromEnv } from "@/lib/schools/config"

interface PaymentReceipt {
  id: string
  receiptNo: string
  paymentDate: string
  totalAmount: number
  paymentMethod: string
  remarks?: string
  createdBy: string
  status: string
  
  student: {
    admissionNo: string
    name: string
    fatherName: string
    phone: string
    class: string
    status: string
  }
  
  academicYear: {
    year: string
    startDate: string
    endDate: string
    isActive: boolean
  }
  
  paymentBreakdown: Array<{
    feeType: string
    amount: number
    feeBalance: number
  }>
  
  calculatedData: {
    totalAnnualFee: number
    totalScholarshipApplied: number
    netAnnualFee: number
    totalPaidSoFar: number
    remainingBalance: number
    feeStatus: string
  }
  
  currentFeeStatus: {
    fees: Array<{
      templateName: string
      total: number
      paid: number
      outstanding: number
      isCompulsory: boolean
    }>
    scholarships: Array<{
      templateName: string
      amount: number
      type: string
    }>
    totals: {
      fees: {
        total: number
        paid: number
        due: number
      }
      scholarships: {
        applied: number
      }
      netAmount: {
        total: number
        paid: number
        due: number
      }
    }
  }

  recentPayments: Array<{
    id: string
    receiptNo: string
    paymentDate: string
    totalAmount: number
    paymentMethod: string
  }>
}

interface PublicReceiptPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PublicReceiptPage({ params }: PublicReceiptPageProps) {
  const [receiptId, setReceiptId] = useState<string>("")
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const schoolConfig = getSchoolConfigFromEnv()

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params
      setReceiptId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  const fetchReceipt = useCallback(async () => {
    if (!receiptId) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/public-receipts/${receiptId}`)
      if (response.ok) {
        const data = await response.json()
        setReceipt(data)
      } else if (response.status === 404) {
        setError("Receipt not found")
      } else {
        setError("Failed to load receipt")
      }
    } catch (error) {
      console.error("Error fetching receipt:", error)
      setError("Failed to load receipt")
    } finally {
      setLoading(false)
    }
  }, [receiptId])

  useEffect(() => {
    fetchReceipt()
  }, [fetchReceipt])

  if (loading) {
    return <LoaderWrapper fullScreen label="Loading receipt..." />
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{error || "Receipt not found"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden">
        <div className="bg-white shadow-sm border-b px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Fee Receipt</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 print:max-w-full print:py-0 print:px-2">
        <style jsx global>{`
          @media print {
            @page {
              size: A4;
              margin: 0.5in;
            }
            
            /* Hide everything except receipt content */
            body * {
              visibility: hidden;
            }
            
            .receipt-container,
            .receipt-container * {
              visibility: visible;
            }
            
            /* Position receipt content at top of page */
            .receipt-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              page-break-inside: avoid;
            }
            
            /* Ensure print only shows receipt content */
            header, nav, .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
        
        {/* Single Receipt */}
        <div className="receipt-container">
          <ReceiptRenderer receipt={receipt} schoolConfig={schoolConfig} />
        </div>
      </main>
    </div>
  )
}