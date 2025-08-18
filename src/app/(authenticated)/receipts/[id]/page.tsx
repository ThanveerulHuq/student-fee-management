"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

import { 
  Printer,
  ArrowLeft
} from "lucide-react"
import LoaderWrapper from "@/components/ui/loader-wrapper"
import WhatsAppShare from "@/components/ui/whatsapp-share"
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

interface ReceiptPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ReceiptPage({ params }: ReceiptPageProps) {
  const router = useRouter()
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
      const response = await fetch(`/api/receipts/${receiptId}`)
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

  const handlePrint = () => {
    window.print()
  }


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

  const ReceiptContent = () => (
    <ReceiptRenderer receipt={receipt} schoolConfig={schoolConfig} />
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden">
        <div className="bg-white shadow-sm border-b px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/fees/collect')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Fee Receipt</h1>
            </div>
            <div className="flex items-center space-x-2">
              <WhatsAppShare
                receiptId={receipt.id}
                receiptNo={receipt.receiptNo}
                studentName={receipt.student.name}
                totalAmount={receipt.totalAmount}
                paymentDate={receipt.paymentDate}
                phoneNumber={receipt.student.phone}
                size="default"
              />
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
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
              margin: 0.3in;
            }
            
            /* Hide everything except receipt content */
            body * {
              visibility: hidden;
            }
            
            .receipt-container,
            .receipt-container *,
            .receipt-separator {
              visibility: visible;
            }
            
            /* Enhanced font scaling for server environments */
            .receipt-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              page-break-inside: avoid;
              height: 47vh;
              margin-bottom: 0.5vh;
              zoom: 1.15;
              transform-origin: top left;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            /* Force larger minimum font sizes for print */
            .receipt-container * {
              font-size: max(10px, 1em) !important;
              line-height: 1.1 !important;
            }
            
            /* Scale up specific text elements */
            .receipt-container .text-xs {
              font-size: 10px !important;
            }
            
            .receipt-container .text-sm {
              font-size: 12px !important;
            }
            
            .receipt-container .text-lg {
              font-size: 14px !important;
            }
            
            /* Table content scaling */
            .receipt-container table {
              font-size: 10px !important;
            }
            
            .receipt-container table td,
            .receipt-container table th {
              padding: 2px 4px !important;
              font-size: 10px !important;
            }
            
            /* Header and important text scaling */
            .receipt-container .font-black {
              font-size: 11px !important;
              font-weight: 900 !important;
            }
            
            .receipt-container .font-extrabold {
              font-size: 11px !important;
              font-weight: 800 !important;
            }
            
            .receipt-separator {
              position: absolute;
              left: 0;
              top: 49vh;
              width: 100%;
              border-top: 2px dashed black;
              margin: 1vh 0;
              page-break-before: avoid;
              visibility: visible;
            }
            
            .receipt-container:last-of-type {
              top: 47.5vh;
              margin-top: 0;
            }
            
            /* Ensure print only shows receipt content */
            header, nav, .print\\:hidden {
              display: none !important;
            }
            
            /* Improve border visibility */
            .receipt-container .border-black {
              border-color: #000000 !important;
              border-width: 1px !important;
            }
            
            .receipt-container .border-2 {
              border-width: 2px !important;
            }
            
            .receipt-container .border-4 {
              border-width: 3px !important;
            }
          }
        `}</style>
        
        {/* First Receipt */}
        <div className="receipt-container">
          <ReceiptContent />
        </div>
        
        {/* Separator */}
        <div className="receipt-separator print:block hidden"></div>
        
        {/* Second Receipt */}
        <div className="receipt-container">
          <ReceiptContent />
        </div>
      </main>
    </div>
  )
}