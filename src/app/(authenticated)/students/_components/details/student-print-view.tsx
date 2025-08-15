"use client"

import { MobileNumber } from "@/generated/prisma"
import { StudentEnrollment } from "@/types/enrollment"
import { getSchoolConfigFromEnv } from "@/lib/schools/config"

interface Student {
  id: string
  admissionNo: string
  aadharNo?: string
  emisNo?: string
  penNumber?: string
  udiseNumber?: string
  name: string
  gender: string
  dateOfBirth: string
  age?: number
  community: string
  motherTongue: string
  mobileNo: string
  fatherName: string
  motherName: string
  address: string
  previousSchool?: string
  religion: string
  caste: string
  nationality: string
  remarks?: string
  siblingIds: string[]
  isActive: boolean
  admissionDate: string
  enrollments: Array<StudentEnrollment>
  mobileNumbers: Array<MobileNumber>
}

interface StudentPrintViewProps {
  student: Student
}

export default function StudentPrintView({ student }: StudentPrintViewProps) {
  const schoolConfig = getSchoolConfigFromEnv()
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const borderClass = schoolConfig.branding.borderStyle === 'double' ? 'border-double border-4' : 
                     schoolConfig.branding.borderStyle === 'dashed' ? 'border-dashed border-2' :
                     'border-solid border-2'

  return (
    <div 
      className={`w-full bg-white ${borderClass} border-black p-1 print:p-4 print:border-0`}
      style={{ 
        fontSize: schoolConfig.branding.fonts.size?.small || '9px', 
        fontFamily: schoolConfig.branding.fonts.body,
        color: schoolConfig.branding.colors.text 
      }}
    >
      {/* School Header */}
      <div className="border-b-4 border-double border-black pb-2 mb-4">
        <div className="grid grid-cols-[1fr_3fr_1fr] gap-4 items-center px-2">
          <div className="flex justify-center items-center">
            {schoolConfig.header.showLogo && (
              <img 
                src={schoolConfig.header.logoPath} 
                alt="School Logo" 
                style={{
                  width: schoolConfig.header.logoSize?.width || '40px',
                  height: schoolConfig.header.logoSize?.height || '40px'
                }}
                className="mx-auto"
              />
            )}
          </div>
          <div className="text-center">
            <div 
              className="text-lg font-black leading-tight tracking-wide" 
              style={{ 
                fontFamily: schoolConfig.branding.fonts.header,
                letterSpacing: '0.5px',
                color: schoolConfig.branding.colors.primary 
              }}
            >
              {schoolConfig.header.schoolName}
            </div>
            {schoolConfig.header.managedBy && (
              <div 
                className="text-sm leading-tight font-medium" 
                style={{ fontFamily: schoolConfig.branding.fonts.header }}
              >
                (Managed by : {schoolConfig.header.managedBy})
              </div>
            )}
            {schoolConfig.header.address && (
              <div 
                className="text-sm leading-tight" 
                style={{ fontFamily: schoolConfig.branding.fonts.header }}
              >
                {schoolConfig.header.address}
              </div>
            )}
            <div 
              className="text-sm leading-tight" 
              style={{ fontFamily: schoolConfig.branding.fonts.header }}
            >
              {schoolConfig.header.phone && `Ph: ${schoolConfig.header.phone}`}
              {schoolConfig.header.phone && schoolConfig.header.email && ' | '}
              {schoolConfig.header.email && `E-mail: ${schoolConfig.header.email}`}
            </div>
          </div>
          <div></div>
        </div>
      </div>

      {/* Document Title */}
      <div 
        className="text-center font-black mb-4 py-2 border-t-2 border-b-2 border-black tracking-widest" 
        style={{ 
          fontSize: schoolConfig.branding.fonts.size?.medium || '10px',
          backgroundColor: schoolConfig.branding.colors.background 
        }}
      >
        STUDENT INFORMATION
      </div>

      {/* Student Photo and Basic Info */}
      <div className="grid grid-cols-[1fr_120px] gap-6 mb-6">
        <div>
          <table 
            className="w-full border-collapse" 
            style={{ fontSize: schoolConfig.branding.fonts.size?.medium || '10px' }}
          >
            <tbody>
              <tr>
                <td className="border border-black py-2 px-3 font-bold bg-gray-100 w-1/3">
                  Admission No.
                </td>
                <td className="border border-black py-2 px-3 font-bold">
                  {student.admissionNo}
                </td>
              </tr>
              <tr>
                <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                  Student Name
                </td>
                <td className="border border-black py-2 px-3 font-bold uppercase">
                  {student.name}
                </td>
              </tr>
              <tr>
                <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                  Date of Birth
                </td>
                <td className="border border-black py-2 px-3">
                  {formatDate(student.dateOfBirth)}
                </td>
              </tr>
              <tr>
                <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                  Age
                </td>
                <td className="border border-black py-2 px-3">
                  {student.age || calculateAge(student.dateOfBirth)} years
                </td>
              </tr>
              <tr>
                <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                  Gender
                </td>
                <td className="border border-black py-2 px-3">
                  {student.gender}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="border-2 border-black p-2 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <div className="text-xs mb-1">STUDENT</div>
            <div className="text-xs">PHOTO</div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="mb-6">
        <div 
          className="text-center font-black mb-2 py-1 border-t-2 border-b-2 border-black tracking-widest bg-gray-100"
          style={{ fontSize: schoolConfig.branding.fonts.size?.medium || '10px' }}
        >
          PERSONAL INFORMATION
        </div>
        <table 
          className="w-full border-collapse" 
          style={{ fontSize: schoolConfig.branding.fonts.size?.medium || '10px' }}
        >
          <tbody>
            <tr>
              <td className="border border-black py-2 px-3 font-bold bg-gray-100 w-1/4">
                Admission Date
              </td>
              <td className="border border-black py-2 px-3 w-1/4">
                {formatDate(student.admissionDate)}
              </td>
              <td className="border border-black py-2 px-3 font-bold bg-gray-100 w-1/4">
                Religion
              </td>
              <td className="border border-black py-2 px-3 w-1/4">
                {student.religion}
              </td>
            </tr>
            <tr>
              <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                Community
              </td>
              <td className="border border-black py-2 px-3">
                {student.community}
              </td>
              <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                Caste
              </td>
              <td className="border border-black py-2 px-3">
                {student.caste}
              </td>
            </tr>
            <tr>
              <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                Mother Tongue
              </td>
              <td className="border border-black py-2 px-3">
                {student.motherTongue}
              </td>
              <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                Nationality
              </td>
              <td className="border border-black py-2 px-3">
                {student.nationality}
              </td>
            </tr>
            {student.aadharNo && (
              <tr>
                <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                  Aadhar No.
                </td>
                <td className="border border-black py-2 px-3">
                  {student.aadharNo}
                </td>
                <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                  EMIS No.
                </td>
                <td className="border border-black py-2 px-3">
                  {student.emisNo || 'N/A'}
                </td>
              </tr>
            )}
            {student.penNumber && (
              <tr>
                <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                  PEN Number
                </td>
                <td className="border border-black py-2 px-3">
                  {student.penNumber}
                </td>
                <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                  UDISE Number
                </td>
                <td className="border border-black py-2 px-3">
                  {student.udiseNumber || 'N/A'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Family Information */}
      <div className="mb-6">
        <div 
          className="text-center font-black mb-2 py-1 border-t-2 border-b-2 border-black tracking-widest bg-gray-100"
          style={{ fontSize: schoolConfig.branding.fonts.size?.medium || '10px' }}
        >
          FAMILY INFORMATION
        </div>
        <table 
          className="w-full border-collapse" 
          style={{ fontSize: schoolConfig.branding.fonts.size?.medium || '10px' }}
        >
          <tbody>
            <tr>
              <td className="border border-black py-2 px-3 font-bold bg-gray-100 w-1/4">
                Father's Name
              </td>
              <td className="border border-black py-2 px-3 w-3/4">
                {student.fatherName}
              </td>
            </tr>
            <tr>
              <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                Mother's Name
              </td>
              <td className="border border-black py-2 px-3">
                {student.motherName}
              </td>
            </tr>
            <tr>
              <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                Address
              </td>
              <td className="border border-black py-2 px-3">
                {student.address}
              </td>
            </tr>
            {student.mobileNumbers && student.mobileNumbers.length > 0 && (
              <tr>
                <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                  Mobile Numbers
                </td>
                <td className="border border-black py-2 px-3">
                  {student.mobileNumbers
                    .map(mobile => `${mobile.number} (${mobile.label})`)
                    .join(', ')}
                </td>
              </tr>
            )}
            {student.previousSchool && (
              <tr>
                <td className="border border-black py-2 px-3 font-bold bg-gray-100">
                  Previous School
                </td>
                <td className="border border-black py-2 px-3">
                  {student.previousSchool}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Remarks */}
      {student.remarks && (
        <div className="mb-6">
          <div 
            className="text-center font-black mb-2 py-1 border-t-2 border-b-2 border-black tracking-widest bg-gray-100"
            style={{ fontSize: schoolConfig.branding.fonts.size?.medium || '10px' }}
          >
            REMARKS
          </div>
          <div 
            className="border border-black py-2 px-3" 
            style={{ fontSize: schoolConfig.branding.fonts.size?.medium || '10px' }}
          >
            {student.remarks}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="mb-6">
        <table 
          className="w-full border-collapse" 
          style={{ fontSize: schoolConfig.branding.fonts.size?.medium || '10px' }}
        >
          <tbody>
            <tr>
              <td className="border border-black py-2 px-3 font-bold bg-gray-100 w-1/4">
                Student Status
              </td>
              <td className="border border-black py-2 px-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  student.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </td>
              <td className="border border-black py-2 px-3 font-bold bg-gray-100 w-1/4">
                Print Date
              </td>
              <td className="border border-black py-2 px-3">
                {new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}