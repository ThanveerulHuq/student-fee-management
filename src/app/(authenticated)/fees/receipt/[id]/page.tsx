"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Download,
  Printer,
  ArrowLeft
} from "lucide-react"
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils/receipt"
import SecondaryHeader from "@/components/ui/secondary-header"
import LoaderWrapper from "@/components/ui/loader-wrapper"
import { trackReceiptViewed, trackReceiptDownloaded } from "@/lib/analytics"

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
}

interface ReceiptPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ReceiptPage({ params }: ReceiptPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [receiptId, setReceiptId] = useState<string>("")

  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

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
      const response = await fetch(`/api/fees/receipt/${receiptId}`)
      if (response.ok) {
        const data = await response.json()
        setReceipt(data)
        
        // Track receipt viewed event
        trackReceiptViewed()
      } else {
        console.error("Failed to fetch receipt")
      }
    } catch (error) {
      console.error("Error fetching receipt:", error)
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

  const convertToWords = (num: number): string => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ',
      'six ', 'seven ', 'eight ', 'nine ', 'ten ',
      'eleven ', 'twelve ', 'thirteen ', 'fourteen ',
      'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ',
      'nineteen ']
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty',
      'sixty', 'seventy', 'eighty', 'ninety']
    
    if (num.toString().length > 9) return 'Not Available'
    
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/)
    if (!n) return ''
    
    let str = ''
    str += (n[1] != '00') ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'crore ' : ''
    str += (n[2] != '00') ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'lakh ' : ''
    str += (n[3] != '00') ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'thousand ' : ''
    str += (n[4] != '0') ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'hundred ' : ''
    str += (n[5] != '00') ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) + 'only' : 'only'
    
    return str
  }

  if (status === "loading" || loading) {
    return <LoaderWrapper fullScreen label="Loading receipt..." />
  }

  if (!session || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Receipt not found</p>
        </div>
      </div>
    )
  }

  const ReceiptContent = () => (
    <div className="w-full bg-white border-4 border-black border-double p-1" style={{ fontSize: '9px', fontFamily: 'Calibri, sans-serif' }}>
      {/* School Header - Black & White */}
      <div className="border-b-4 border-double border-black pb-1 mb-1">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="w-12 text-center">
                <img src="/school_logo.jpg" alt="School Logo" className="w-10 h-10 mx-auto" />
              </td>
              <td className="text-center">
                <div className="text-sm font-black leading-tight tracking-wide" style={{ fontFamily: 'Times New Roman, serif', letterSpacing: '0.5px' }}>
                  DHAARUS SALAAM MATRICULATION HIGHER SECONDARY SCHOOL
                </div>
                <div className="text-xs leading-tight font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
                  (Managed by : Dhaarus Salaam Trust, Salem – 636 005)
                </div>
                <div className="text-xs leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Ph: (0427) 2442018, +91 98942 50320 | E-mail: dhaarussalaam1@gmail.com
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Key Info Bar */}
      <div className="border-b-2 border-black pb-0.5 mb-1">
        <table className="w-full" style={{ fontSize: '10px' }}>
          <tbody>
            <tr>
              <td className="border-r border-black px-1 py-0.5">
                <span className="font-bold">DATE:</span>
                <span className="ml-2 font-extrabold">{formatDate(receipt.paymentDate)}</span>
              </td>
              <td className="border-r border-black px-1 py-0.5 text-center">
                <span className="font-bold">RECEIPT #:</span>
                <span className="ml-2 font-extrabold">{receipt.receiptNo}</span>
              </td>
              <td className="px-1 py-0.5">
                <span className="font-bold">ACADEMIC YEAR:</span>
                <span className="ml-2 font-extrabold">{receipt.academicYear.year}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section Header */}
      <div className="text-center font-black mb-0.5 py-0.5 border-t-2 border-b-2 border-black tracking-widest" style={{ fontSize: '10px' }}>
        RECEIVED FROM
      </div>

      {/* Student Details */}
      <div className="mb-1 border-l-4 border-black pl-1">
        <table className="w-full" style={{ fontSize: '10px' }}>
          <tbody>
            <tr>
              <td className="w-2/5 py-0.5">
                <span className="font-bold">STUDENT:</span>
                <span className="ml-2 font-extrabold uppercase">{receipt.student.name}</span>
              </td>
              <td className="w-1/5 py-0.5">
                <span className="font-bold">CLASS:</span>
                <span className="ml-2 font-extrabold">{receipt.student.class}</span>
              </td>
              <td className="w-1/5 py-0.5">
                <span className="font-bold">SECTION:</span>
                <span className="ml-2 font-extrabold">A</span>
              </td>
              <td className="w-1/5 py-0.5">
                <span className="font-bold">ADM NO:</span>
                <span className="ml-2 font-extrabold">{receipt.student.admissionNo}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Details Header */}
      <div className="text-center font-black mb-0.5 py-0.5 border-t-2 border-b-2 border-black tracking-widest" style={{ fontSize: '10px' }}>
        PAYMENT DETAILS
      </div>

      {/* Payment Table - Black & White */}
      <table className="w-full border-collapse mb-1" style={{ fontSize: '10px' }}>
        <thead>
          <tr className="border-2 border-black">
            <th className="border border-black py-0.5 px-1 text-center font-black bg-black text-white">DESCRIPTION</th>
            <th className="border border-black py-0.5 px-1 text-center font-black bg-black text-white">AMOUNT</th>
            <th className="border border-black py-0.5 px-1 text-center font-black bg-black text-white">PAID</th>
            <th className="border border-black py-0.5 px-1 text-center font-black bg-black text-white">BALANCE</th>
          </tr>
        </thead>
        <tbody>
          {receipt.currentFeeStatus.fees.map((feeItem, index) => {
            // Find if this fee type was paid in current transaction
            const currentPayment = receipt.paymentBreakdown.find(
              payment => payment.feeType.toLowerCase() === feeItem.templateName.toLowerCase()
            );
            const paidAmount = currentPayment ? currentPayment.amount : 0;
            
            return (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                <td className="border border-black py-0.5 px-1 font-bold">{feeItem.templateName.toUpperCase()} FEE</td>
                <td className="border border-black py-0.5 px-1 text-center font-bold">₹{feeItem.total}</td>
                <td className="border border-black py-0.5 px-1 text-center font-extrabold">₹{paidAmount}</td>
                <td className="border border-black py-0.5 px-1 text-center font-bold">₹{feeItem.outstanding}</td>
              </tr>
            );
          })}
          {receipt.currentFeeStatus.scholarships.length > 0 && 
            receipt.currentFeeStatus.scholarships.map((scholarship, index) => (
              <tr key={`scholarship-${index}`} className="bg-gray-200">
                <td className="border border-black py-0.5 px-1 font-bold">{scholarship.templateName.toUpperCase()} (-)</td>
                <td className="border border-black py-0.5 px-1 text-center font-bold">₹{scholarship.amount}</td>
                <td className="border border-black py-0.5 px-1 text-center">-</td>
                <td className="border border-black py-0.5 px-1 text-center">-</td>
              </tr>
            ))
          }
        </tbody>
      </table>

      {/* Summary Section */}
      <table className="w-full border-collapse mb-0.5 text-xs">
        <tbody>
          <tr>
            <td rowSpan={3} className="w-2/5 px-1 py-0.5 align-top border-2 border-black">
              <div className="font-black text-xs">Payment History:</div>
              <div className="text-xs font-medium">Recent payments recorded</div>
            </td>
            <td className="border border-black py-0.5 px-1 text-right font-black bg-gray-200">
              TOTAL FEE
            </td>
            <td className="border border-black py-0.5 px-1 font-black text-sm">
              {formatCurrency(receipt.calculatedData.totalAnnualFee)}
            </td>
          </tr>
          <tr>
            <td className="border border-black py-0.5 px-1 text-right font-black bg-gray-200">
              TOTAL PAID
            </td>
            <td className="border border-black py-0.5 px-1 font-black text-sm">
              {formatCurrency(receipt.calculatedData.totalPaidSoFar)}
            </td>
          </tr>
          <tr>
            <td className="border border-black py-0.5 px-1 text-right font-black bg-gray-200">
              BALANCE
            </td>
            <td className="border border-black py-0.5 px-1 font-black text-sm">
              {formatCurrency(receipt.calculatedData.remainingBalance)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Bottom Section */}
      <table className="w-full border-collapse mb-0.5 text-xs">
        <tbody>
          <tr>
            <td className="border border-black py-0.5 px-1 font-black text-center bg-gray-100">
              AMOUNT IN WORDS:
            </td>
            <td className="border border-black py-0.5 px-1 font-bold">
              Rs. {convertToWords(receipt.totalAmount)}
            </td>
            <td className="border border-black py-0.5 px-1 font-black text-center bg-gray-100">
              RECEIVED BY:
            </td>
            <td className="border border-black py-0.5 px-1 font-extrabold">
              {receipt.createdBy}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Remarks */}
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr>
            <td className="border border-black py-0.5 px-1 bg-gray-100">
              <span className="font-black">REMARKS:</span>
              <span className="ml-2 font-medium">{receipt.remarks || 'No remarks'}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden">
        <SecondaryHeader 
          title="Fee Receipt" 
          showBackButton={true}
          backPath={"/fees"}
        >
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                trackReceiptDownloaded()
                // Add PDF download functionality here
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </SecondaryHeader>
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
            .receipt-container *,
            .receipt-separator {
              visibility: visible;
            }
            
            /* Position receipt content at top of page */
            .receipt-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              page-break-inside: avoid;
              height: 48vh;
              margin-bottom: 1vh;
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
              top: 50vh;
            }
            
            /* Ensure print only shows receipt content */
            header, nav, .print\\:hidden {
              display: none !important;
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