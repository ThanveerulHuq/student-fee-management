"use client"

import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Users } from "lucide-react"
import { StudentStatusBadge } from "@/components/students/student-status-badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Student {
  id: string
  admissionNo: string
  name: string
  gender: string
  age: number
  fatherName: string
  mobileNo1: string
  isActive: boolean
  createdAt: string
}

interface AcademicYear {
  id: string
  year: string
  isActive: boolean
}

interface StudentsTableProps {
  students: Student[]
  loading: boolean
  onStudentClick: (studentId: string) => void
  academicYear?: AcademicYear
}

export default function StudentsTable({ 
  students, 
  loading, 
  onStudentClick, 
  academicYear 
}: StudentsTableProps) {
  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-4 border-b border-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-6 border-b border-gray-50">
              <Skeleton className="h-4 w-16" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded" />
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
              <TableHead className="font-bold text-gray-800 py-5 px-8 text-sm tracking-wide uppercase">
                Admission No
              </TableHead>
              <TableHead className="font-bold text-gray-800 py-5 px-8 text-sm tracking-wide uppercase">
                Student Name
              </TableHead>
              <TableHead className="font-bold text-gray-800 py-5 px-8 text-sm tracking-wide uppercase">
                Father&apos;s Name
              </TableHead>
              <TableHead className="font-bold text-gray-800 py-5 px-8 text-sm tracking-wide uppercase">
                Contact
              </TableHead>
              <TableHead className="font-bold text-gray-800 py-5 px-8 text-sm tracking-wide uppercase">
                Details
              </TableHead>
              <TableHead className="font-bold text-gray-800 py-5 px-8 text-sm tracking-wide uppercase">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 px-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-700 font-semibold text-xl">No students found</p>
                      <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                        Try adjusting your search criteria or check your filters
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => {
                return (
                  <TableRow 
                    key={student.id} 
                    className="hover:bg-blue-50/30 transition-all duration-200 border-b border-gray-100 last:border-b-0 cursor-pointer group"
                    onClick={() => onStudentClick(student.id)}
                  >
                    <TableCell className="py-6 px-8">
                      <div className="font-mono text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {student.admissionNo}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <div className="font-medium text-gray-900 text-base group-hover:text-blue-700 transition-colors">
                        {student.name}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <div className="text-gray-700 text-sm font-medium">
                        {student.fatherName}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <div className="text-sm text-gray-900 font-mono">
                        {student.mobileNo1}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium ${
                            student.gender === 'MALE' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-pink-50 text-pink-700 border-pink-200'
                          }`}
                        >
                          {student.gender}
                        </Badge>
                        <span className="text-sm text-gray-600 font-medium">Age {student.age}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-8">
                      <StudentStatusBadge 
                        student={student} 
                        showDeactivationInfo={true}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}