"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Download,
  Printer,
  Receipt,
  School,
  CheckCircle
} from "lucide-react"
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils/receipt"
import SecondaryHeader from "@/components/ui/secondary-header"
import LoaderWrapper from "@/components/ui/loader-wrapper"

interface ReceiptData {
  id: string
  receiptNo: string
  schoolFee: number
  bookFee: number
  uniformFee: number
  islamicStudies: number
  vanFee: number
  totalAmountPaid: number
  paymentDate: string
  paymentMethod: string
  remarks?: string
  createdBy: string
  createdAt: string
  studentYear: {
    section: string
    scholarship: number
    student: {
      name: string
      admissionNo: string
      fatherName: string
      mobileNo1: string
    }
    academicYear: {
      year: string
    }
    class: {
      className: string
    }
    commonFee: {
      schoolFee: number
      bookFee: number
    }
  }
  calculatedData: {
    totalAnnualFee: number
    totalPaidSoFar: number
    remainingBalance: number
    scholarship: number
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

  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden">
        <SecondaryHeader 
          title="Fee Receipt" 
          showBackButton={true}
        >
          <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
        </SecondaryHeader>
      </div>

      {/* Receipt Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 print:max-w-full print:py-0 print:px-0">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="text-center border-b print:border-b-2 print:border-black">
            {/* School Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-3">
                <School className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">BlueMoon School</h1>
                  <p className="text-sm text-gray-600">School Data Management System</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2 pt-2">
                <Receipt className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-green-700">Fee Payment Receipt</h2>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>

            {/* Receipt Info */}
            <div className="flex justify-between items-center pt-4 text-sm">
              <div>
                <span className="font-semibold">Receipt No:</span> {receipt.receiptNo}
              </div>
              <div>
                <span className="font-semibold">Date:</span> {formatDateTime(receipt.paymentDate)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 print:p-4">
            {/* Student Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Student Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="ml-2">{receipt.studentYear.student.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Admission No:</span>
                    <span className="ml-2">{receipt.studentYear.student.admissionNo}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Father&apos;s Name:</span>
                    <span className="ml-2">{receipt.studentYear.student.fatherName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Mobile:</span>
                    <span className="ml-2">{receipt.studentYear.student.mobileNo1}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Academic Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Academic Year:</span>
                    <span className="ml-2">{receipt.studentYear.academicYear.year}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Class:</span>
                    <span className="ml-2">{receipt.studentYear.class.className}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Section:</span>
                    <span className="ml-2">{receipt.studentYear.section}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Payment Method:</span>
                    <Badge variant="outline" className="ml-2">
                      {receipt.paymentMethod}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Payment Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Fee Type</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.schoolFee > 0 && (
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">School Fee</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {formatCurrency(receipt.schoolFee)}
                        </td>
                      </tr>
                    )}
                    {receipt.bookFee > 0 && (
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Book Fee</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {formatCurrency(receipt.bookFee)}
                        </td>
                      </tr>
                    )}
                    {receipt.uniformFee > 0 && (
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Uniform Fee</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {formatCurrency(receipt.uniformFee)}
                        </td>
                      </tr>
                    )}
                    {receipt.islamicStudies > 0 && (
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Islamic Studies</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {formatCurrency(receipt.islamicStudies)}
                        </td>
                      </tr>
                    )}
                    {receipt.vanFee > 0 && (
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Van Fee</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {formatCurrency(receipt.vanFee)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-blue-50 font-semibold">
                      <td className="border border-gray-300 px-4 py-2">Total Payment</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {formatCurrency(receipt.totalAmountPaid)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fee Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Annual Fee Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Annual Fee:</span>
                    <span className="font-medium">{formatCurrency(receipt.calculatedData.totalAnnualFee)}</span>
                  </div>
                  {receipt.calculatedData.scholarship > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Scholarship Applied:</span>
                      <span className="font-medium">-{formatCurrency(receipt.calculatedData.scholarship)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid So Far:</span>
                    <span className="font-medium text-green-600">{formatCurrency(receipt.calculatedData.totalPaidSoFar)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Remaining Balance:</span>
                    <span className={`font-bold ${receipt.calculatedData.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(receipt.calculatedData.remainingBalance)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Payment Date:</span>
                    <span className="ml-2">{formatDate(receipt.paymentDate)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Payment Method:</span>
                    <span className="ml-2">{receipt.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Collected By:</span>
                    <span className="ml-2">{receipt.createdBy}</span>
                  </div>
                  {receipt.remarks && (
                    <div>
                      <span className="font-medium text-gray-600">Remarks:</span>
                      <span className="ml-2">{receipt.remarks}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4 text-center text-xs text-gray-500">
              <p>This is a computer-generated receipt and does not require signature.</p>
              <p className="mt-1">For any queries, please contact the school office.</p>
              <p className="mt-2">Generated on: {formatDateTime(new Date())}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}