"use client"

import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  User, 
  Phone,
  MessageCircle,
  FileText
} from "lucide-react"
import { OutstandingStudent } from "../page"

interface OutstandingFeesTableProps {
  students: OutstandingStudent[]
  loading: boolean
  onStudentClick: (studentId: string) => void
  onSendWhatsAppReminder: (student: OutstandingStudent) => void
}

export default function OutstandingFeesTable({
  students,
  loading,
  onStudentClick,
  onSendWhatsAppReminder
}: OutstandingFeesTableProps) {

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
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
              <TableHead className="font-semibold text-gray-700 py-2 px-3 text-xs w-[15%]">
                Student Details & Class
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-2 px-3 text-xs w-[10%]">
                Fee Breakdown
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-2 px-3 text-xs text-right w-[15%]">
                Outstanding
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-2 px-3 text-xs text-right w-[15%]">
                Contact
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-2 px-3 text-xs text-right w-[15%]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 px-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-700 font-semibold text-xl">No Outstanding Fees Found</p>
                      <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                        All students have paid their fees or no students match the current filters.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                  <TableRow 
                    key={student.id} 
                    className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer group"
                    onClick={() => onStudentClick(student.id)}
                  >
                    {/* Student Details & Class Combined */}
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-orange-50 rounded-full flex-shrink-0">
                          <User className="w-3 h-3 text-orange-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors text-sm truncate">
                                {student.student.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                Father: {student.student.fatherName}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="font-medium text-gray-900 text-sm bg-gray-100 px-2 py-1 rounded">
                                {student.class.className} - {student.section}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Fee Breakdown */}
                    <TableCell className="py-2 px-3">
                      <div className="space-y-1 text-xs">
                        {student.fees && student.fees.length > 0 && (
                          student.fees
                            .filter((fee: any) => fee.outstandingAmount > 0)
                            .map((fee: any, index: number) => (
                              <div key={index} className="flex items-center gap-1">
                                <span className="text-gray-600 font-medium">{fee.name}:</span>
                                <span className="text-orange-600 font-medium">₹{fee.outstandingAmount.toLocaleString()}</span>
                              </div>
                            ))
                        )}
                      </div>
                    </TableCell>

                    {/* Outstanding Amount */}
                    <TableCell className="py-2 px-3 text-right">
                      <div className="text-lg font-bold text-orange-600">
                        ₹{student.outstanding.toLocaleString()}
                      </div>
                    </TableCell>

                    {/* Contact - Right Aligned */}
                    <TableCell className="py-2 px-3 text-right">
                      {student.student.mobileNo ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `tel:${student.student.mobileNo}`
                        }}
                        className="h-8 px-3 hover:bg-blue-50 text-blue-600 text-xs font-medium border border-blue-200 hover:border-blue-300"
                        title="Call this number"
                      >
                        <Phone className="h-3 w-3 mr-2" />
                        {student.student.mobileNo}
                      </Button>): (
                        <div className="text-xs text-gray-500 italic text-center">
                          No Contact
                        </div>
                      )}
                    </TableCell>

                    {/* Action - Right Aligned */}
                    <TableCell className="py-2 px-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSendWhatsAppReminder(student)
                        }}
                        className="h-8 px-3 hover:bg-green-50 hover:border-green-300 text-green-700 text-xs font-medium"
                        title="Send WhatsApp Reminder"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Send Reminder
                      </Button>
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