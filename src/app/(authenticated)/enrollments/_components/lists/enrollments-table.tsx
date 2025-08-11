"use client"

import { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  User, 
  Edit, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  IndianRupee,
  Award,
  GraduationCap
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { StudentEnrollmentWithTotals } from '@/types/enrollment'

const statusColors = {
  PAID: 'bg-green-100 text-green-800 border-green-200',
  PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  OVERDUE: 'bg-red-100 text-red-800 border-red-200',
  WAIVED: 'bg-gray-100 text-gray-800 border-gray-200'
}

interface EnrollmentsTableProps {
  enrollments: StudentEnrollmentWithTotals[]
  loading: boolean
  onEnrollmentClick: (enrollmentId: string) => void
  onEdit: (enrollment: StudentEnrollmentWithTotals) => void
  onDelete: (enrollment: StudentEnrollmentWithTotals) => void
}

export default function EnrollmentsTable({ 
  enrollments, 
  loading, 
  onEnrollmentClick,
  onEdit,
  onDelete
}: EnrollmentsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRowExpansion = (enrollmentId: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (expandedRows.has(enrollmentId)) {
      newExpandedRows.delete(enrollmentId)
    } else {
      newExpandedRows.add(enrollmentId)
    }
    setExpandedRows(newExpandedRows)
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            {Array.from({ length: 8 }).map((_, i) => (
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
            <TableRow className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200 hover:bg-gray-100">
              <TableHead className="font-bold text-gray-800 py-3 px-4 text-sm tracking-wide uppercase">
                Student
              </TableHead>
              <TableHead className="font-bold text-gray-800 py-3 px-4 text-sm tracking-wide uppercase">
                Admission No.
              </TableHead>
              <TableHead className="font-bold text-gray-800 py-3 px-4 text-sm tracking-wide uppercase">
                Class
              </TableHead>
              <TableHead className="font-bold text-gray-800 py-3 px-4 text-sm tracking-wide uppercase">
                Section
              </TableHead>
              <TableHead className="font-bold text-gray-800 py-3 px-4 text-sm tracking-wide uppercase text-right">
                Total Fees
              </TableHead>
              <TableHead className="font-bold text-gray-800 py-3 px-4 text-sm tracking-wide uppercase text-right">
                Due Amount
              </TableHead>
              <TableHead className="font-bold text-gray-800 py-3 px-4 text-sm tracking-wide uppercase text-center">
                Status
              </TableHead>
              <TableHead className="font-bold text-gray-800 py-3 px-4 text-sm tracking-wide uppercase text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-20 px-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                      <GraduationCap className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-700 font-semibold text-xl">No enrollments found</p>
                      <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                        Try adjusting your search criteria or add a new enrollment
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((enrollment) => (
                <>
                  {/* Collapsed Row */}
                  <TableRow 
                    key={enrollment.id} 
                    className="hover:bg-blue-50/30 transition-all duration-200 border-b border-gray-100 last:border-b-0 cursor-pointer group"
                    onClick={() => onEnrollmentClick(enrollment.id)}
                  >
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleRowExpansion(enrollment.id)
                          }}
                        >
                          {expandedRows.has(enrollment.id) ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </Button>
                        <div className="p-1.5 bg-blue-50 rounded-full">
                          <User className="w-3 h-3 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors text-sm">
                            {enrollment.student.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {enrollment.student.fatherName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="font-mono text-xs font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {enrollment.student.admissionNumber}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="text-gray-700 text-xs font-medium">
                        {enrollment.class.className}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="text-gray-700 text-xs font-medium">
                        {enrollment.section}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right">
                      <div className="font-medium text-gray-900 text-sm">
                        ₹{enrollment.totals.netAmount.total.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right">
                      <div className={`font-medium text-sm ${enrollment.totals.netAmount.due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{enrollment.totals.netAmount.due.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center">
                      <Badge 
                        className={`${statusColors[enrollment.feeStatus.status as keyof typeof statusColors]} border text-xs font-medium`}
                      >
                        {enrollment.feeStatus.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(enrollment)
                          }}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(enrollment)
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row */}
                  {expandedRows.has(enrollment.id) && (
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={8} className="px-4 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Fee Items */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <IndianRupee className="w-4 h-4 mr-2 text-blue-600" />
                              Fee Items
                            </h4>
                            <div className="space-y-2">
                              {enrollment.fees.map((fee, index) => (
                                <div key={index} className="bg-white rounded-lg p-3 border">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{fee.templateName}</div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                      <div className="text-gray-600">Amount</div>
                                      <div className="font-medium">₹{fee.amount.toFixed(2)}</div>
                                    </div>
                                    <div>
                                      <div className="text-gray-600">Paid</div>
                                      <div className="font-medium text-green-600">₹{fee.amountPaid.toFixed(2)}</div>
                                    </div>
                                    <div>
                                      <div className="text-gray-600">Due</div>
                                      <div className="font-medium text-red-600">₹{fee.amountDue.toFixed(2)}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Scholarships */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <Award className="w-4 h-4 mr-2 text-green-600" />
                              Scholarships
                            </h4>
                            <div className="space-y-2">
                              {enrollment.scholarships.length > 0 ? (
                                enrollment.scholarships.map((scholarship, index) => (
                                  <div key={index} className="bg-white rounded-lg p-3 border">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <div className="font-medium text-gray-900">{scholarship.templateName}</div>
                                        <div className="text-sm text-green-600 font-medium">-₹{scholarship.amount.toFixed(2)}</div>
                                      </div>
                                      <Badge 
                                        variant={scholarship.isActive ? "default" : "secondary"}
                                        className="text-xs"
                                      >
                                        {scholarship.isActive ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="bg-white rounded-lg p-4 border text-center text-gray-500">
                                  <Award className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                  <p className="text-sm">No scholarships applied</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payment Summary */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                            <div className="bg-white rounded-lg p-4 border space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Fees</span>
                                <span className="font-medium">₹{enrollment.totals.fees.total.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Scholarships Applied</span>
                                <span className="font-medium text-green-600">-₹{enrollment.totals.scholarships.applied.toFixed(2)}</span>
                              </div>
                              <div className="border-t pt-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Net Amount</span>
                                  <span className="font-bold">₹{enrollment.totals.netAmount.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Amount Paid</span>
                                  <span className="font-medium text-green-600">₹{enrollment.totals.netAmount.paid.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Amount Due</span>
                                  <span className="font-bold text-red-600">₹{enrollment.totals.netAmount.due.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}