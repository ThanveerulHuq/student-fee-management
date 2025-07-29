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
import { GraduationCap, UserPlus, CreditCard } from "lucide-react"
import { StudentEnrollment } from "@/types/enrollment"

interface EnrollmentHistoryCardProps {
  enrollments: StudentEnrollment[]
  onEnrollClick: () => void
  onFeeCollectionClick: (enrollmentId: string) => void
}

export default function EnrollmentHistoryCard({ 
  enrollments, 
  onEnrollClick, 
  onFeeCollectionClick 
}: EnrollmentHistoryCardProps) {


  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Enrollment History</h3>
          </div>
          {enrollments.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEnrollClick}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Enroll Student
            </Button>
          )}
        </div>
      </div>
      
      {enrollments.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-30 text-gray-400" />
          <p className="text-gray-500 text-lg font-medium">No enrollments found</p>
          <p className="text-gray-400 text-sm mt-1">This student has not been enrolled in any academic year yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                <TableHead className="font-semibold text-gray-700">Academic Year</TableHead>
                <TableHead className="font-semibold text-gray-700">Class</TableHead>
                <TableHead className="font-semibold text-gray-700">Section</TableHead>
                <TableHead className="font-semibold text-gray-700">Total Fee</TableHead>
                <TableHead className="font-semibold text-gray-700">Paid</TableHead>
                <TableHead className="font-semibold text-gray-700">Outstanding</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => {
                const totalFee = enrollment.totals?.netAmount?.total || 0
                const paid = enrollment.totals?.netAmount?.paid || 0
                const outstanding = enrollment.totals?.netAmount?.due || 0
                
                return (
                  <TableRow key={enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{enrollment.academicYear.year}</span>
                        {enrollment.academicYear.isActive && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Current
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-medium">{enrollment.class.className}</TableCell>
                    <TableCell className="py-4">{enrollment.section}</TableCell>
                    <TableCell className="py-4 font-mono">₹{totalFee.toLocaleString()}</TableCell>
                    <TableCell className="py-4 font-mono">₹{paid.toLocaleString()}</TableCell>
                    <TableCell className="py-4">
                      <span className={`font-semibold font-mono ${outstanding > 0 ? "text-red-600" : "text-green-600"}`}>
                        ₹{outstanding.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={enrollment.isActive ? "default" : "secondary"} className="font-medium">
                        {enrollment.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      {outstanding > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onFeeCollectionClick(enrollment.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}