"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import WhatsAppShare from "@/components/ui/whatsapp-share"
import { formatCurrency } from "@/lib/format"
import { 
  FileText,
  Printer,
  Receipt,
  Calendar,
  User
} from "lucide-react"
import { Payment } from "../page"

interface FeePaymentsTableProps {
  payments: Payment[]
  loading: boolean
  onPrintReceipt: (payment: Payment) => void
}

export default function FeePaymentsTable({
  payments,
  loading,
  onPrintReceipt
}: FeePaymentsTableProps) {

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "CASH": return "bg-green-100 text-green-800"
      case "ONLINE": return "bg-blue-100 text-blue-800"
      case "CHEQUE": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-16" />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50">
              <Skeleton className="h-3 w-12" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
              <TableHead className="font-semibold text-gray-700 py-2 px-3 text-xs w-[20%]">
                Student Details & Class
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-2 px-3 text-xs w-[12%]">
                Receipt No
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-2 px-3 text-xs w-[13%]">
                Payment Details
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-2 px-3 text-xs w-[15%]">
                Amount & Method
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-2 px-3 text-xs w-[20%]">
                Fee Items
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-2 px-3 text-xs w-[20%]">
                Remarks
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-2 px-3 text-xs text-center w-[15%]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20 px-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                      <Calendar className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-700 font-semibold text-xl">No Payments Found</p>
                      <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                        No payments match the current filters. Try adjusting your search criteria.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow 
                  key={payment.id} 
                  className="hover:bg-green-50/30 transition-colors border-b border-gray-100 last:border-b-0 group"
                >
                  {/* Student Details & Class Combined */}
                  <TableCell className="py-2 px-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-green-50 rounded-full flex-shrink-0">
                        <User className="w-3 h-3 text-green-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 group-hover:text-green-700 transition-colors text-sm truncate">
                              {payment.studentName}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              Father: {payment.studentFatherName}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="font-medium text-gray-900 text-sm bg-gray-100 px-2 py-1 rounded">
                              {payment.studentClass} - {payment.studentSection || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Receipt No */}
                  <TableCell className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-50 rounded-full flex-shrink-0">
                        <Receipt className="w-3 h-3 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {payment.receiptNo}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Payment Details */}
                  <TableCell className="py-2 px-3">
                    <div>
                      <div className="text-sm text-gray-900">
                        {format(new Date(payment.paymentDate), "dd MMM yyyy")}
                      </div>
                      <div className="text-xs text-gray-500">
                        by {payment.createdBy}
                      </div>
                    </div>
                  </TableCell>

                  {/* Amount & Method */}
                  <TableCell className="py-2 px-3">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(payment.totalAmount)}
                      </div>
                      <Badge className={getPaymentMethodColor(payment.paymentMethod)}>
                        {payment.paymentMethod}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Fee Items */}
                  <TableCell className="py-2 px-3">
                    <div className="space-y-1 text-xs">
                      {payment.paymentItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-start text-md">
                          <span className="text-sm text-gray-900">{item.feeTemplateName}:</span>
                          <span className="text-green-600 text-sm font-medium ml-1">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>

                  {/* Remarks */}
                  <TableCell className="py-2 px-3">
                    <div className="text-sm text-gray-900">
                      {payment.remarks || (
                        <span className="text-gray-400 italic">No remarks</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-2 px-3">
                    <div className="flex space-x-2">
                      <WhatsAppShare
                        receiptId={payment.id}
                        receiptNo={payment.receiptNo}
                        studentName={payment.studentName}
                        totalAmount={payment.totalAmount}
                        paymentDate={payment.paymentDate}
                        phoneNumber={payment.studentPhone}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPrintReceipt(payment)}
                        className="h-8 px-3 hover:bg-blue-50 hover:border-blue-300 text-blue-700 text-xs font-medium"
                        title="View & Print Receipt"
                      >
                        <Printer className="h-3 w-3 mr-1" />
                        View & Print
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}