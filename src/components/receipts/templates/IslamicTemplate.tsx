import { ReceiptProps } from '@/lib/schools/types'
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils/receipt"

export default function IslamicTemplate({ receipt, schoolConfig }: ReceiptProps) {
  const convertToWords = (num: number): string => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ',
      'six ', 'seven ', 'eight ', 'nine ', 'ten ',
      'eleven ', 'twelve ', 'thirteen ', 'fourteen ',
      'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ',
      'nineteen ']
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty',
      'sixty', 'seventy', 'eighty', 'ninety']
    
    if (num.toString().length > 9) return 'Not Available'
    
    const n = ('000000000' + num).substring(('000000000' + num).length - 9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/)
    if (!n) return ''
    
    let str = ''
    str += (n[1] != '00') ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'crore ' : ''
    str += (n[2] != '00') ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'lakh ' : ''
    str += (n[3] != '00') ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'thousand ' : ''
    str += (n[4] != '0') ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'hundred ' : ''
    str += (n[5] != '00') ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) + 'only' : 'only'
    
    return str
  }

  const borderClass = schoolConfig.branding.borderStyle === 'double' ? 'border-double border-4' : 
                     schoolConfig.branding.borderStyle === 'dashed' ? 'border-dashed border-2' :
                     'border-solid border-2'

  return (
    <div 
      className={`w-full rounded-lg ${borderClass} p-3`}
      style={{ 
        fontSize: schoolConfig.branding.fonts.size?.small || '10px', 
        fontFamily: schoolConfig.branding.fonts.body,
        color: schoolConfig.branding.colors.text,
        backgroundColor: schoolConfig.branding.colors.background,
        borderColor: schoolConfig.branding.colors.primary
      }}
    >
      {/* Islamic Header with Bismillah */}
      <div className="text-center mb-3">
        <div 
          className="text-lg font-bold mb-2"
          style={{ 
            fontFamily: 'Arabic Typesetting, Times New Roman, serif',
            color: schoolConfig.branding.colors.primary 
          }}
        >
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </div>
        <div className="text-xs text-gray-600 mb-3">In the name of Allah, the Most Gracious, the Most Merciful</div>
      </div>

      {/* School Header */}
      <div 
        className="border-2 rounded-lg p-3 mb-3"
        style={{ 
          borderColor: schoolConfig.branding.colors.primary,
          backgroundColor: 'rgba(16, 185, 129, 0.05)'
        }}
      >
        <div className="flex items-center justify-center space-x-4">
          {schoolConfig.header.showLogo && (
            <img 
              src={schoolConfig.header.logoPath} 
              alt="School Logo" 
              style={{
                width: schoolConfig.header.logoSize?.width || '50px',
                height: schoolConfig.header.logoSize?.height || '50px',
                borderColor: schoolConfig.branding.colors.primary
              }}
              className="rounded-full border-2"
            />
          )}
          <div className="text-center">
            <h1 
              className="text-lg font-bold leading-tight"
              style={{ 
                fontFamily: schoolConfig.branding.fonts.header,
                color: schoolConfig.branding.colors.primary 
              }}
            >
              {schoolConfig.header.schoolName}
            </h1>
            {schoolConfig.header.managedBy && (
              <div className="text-xs font-medium mt-1">
                {schoolConfig.header.managedBy}
              </div>
            )}
            {schoolConfig.header.address && (
              <div className="text-xs mt-1">{schoolConfig.header.address}</div>
            )}
            <div className="text-xs mt-1">
              {schoolConfig.header.phone && `📞 ${schoolConfig.header.phone}`}
              {schoolConfig.header.phone && schoolConfig.header.email && ' | '}
              {schoolConfig.header.email && `✉️ ${schoolConfig.header.email}`}
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Info Bar */}
      <div 
        className="grid grid-cols-3 gap-2 p-2 rounded-lg mb-3 text-xs"
        style={{ 
          backgroundColor: schoolConfig.branding.colors.primary,
          color: 'white'
        }}
      >
        <div className="text-center">
          <div className="font-semibold">Date</div>
          <div>{formatDate(receipt.paymentDate)}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">Receipt #</div>
          <div>{receipt.receiptNo}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">Academic Year</div>
          <div>{receipt.academicYear.year}</div>
        </div>
      </div>

      {/* Student Information */}
      <div 
        className="rounded-lg p-3 mb-3"
        style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
      >
        <h2 
          className="text-sm font-bold mb-2 text-center"
          style={{ color: schoolConfig.branding.colors.primary }}
        >
          طالب علم کی تفصیلات - Student Details
        </h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-semibold">Student Name:</span>
            <span className="ml-2 font-bold uppercase">{receipt.student.name}</span>
          </div>
          <div>
            <span className="font-semibold">Admission No:</span>
            <span className="ml-2 font-bold">{receipt.student.admissionNo}</span>
          </div>
          <div>
            <span className="font-semibold">Class:</span>
            <span className="ml-2 font-bold">{receipt.student.class}</span>
          </div>
          <div>
            <span className="font-semibold">Father's Name:</span>
            <span className="ml-2">{receipt.student.fatherName}</span>
          </div>
          {/* Custom fields for Islamic template */}
          {schoolConfig.customFields
            .filter(field => field.position === 'student-info')
            .map((field, index) => (
              <div key={index}>
                <span className="font-semibold">{field.label}:</span>
                <span className="ml-2">{field.defaultValue || '-'}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Payment Details */}
      <h2 
        className="text-sm font-bold mb-2 text-center"
        style={{ color: schoolConfig.branding.colors.primary }}
      >
        فیس کی تفصیلات - Fee Details
      </h2>

      <div className="overflow-hidden rounded-lg border-2 mb-3" style={{ borderColor: schoolConfig.branding.colors.primary }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: schoolConfig.branding.colors.primary }}>
              <th className="py-2 px-2 text-left text-white font-semibold">Description</th>
              <th className="py-2 px-2 text-center text-white font-semibold">Amount</th>
              <th className="py-2 px-2 text-center text-white font-semibold">Paid</th>
              <th className="py-2 px-2 text-center text-white font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {receipt.currentFeeStatus.fees.map((feeItem: any, index: number) => {
              const currentPayment = receipt.paymentBreakdown.find(
                (payment: any) => payment.feeType.toLowerCase() === feeItem.templateName.toLowerCase()
              );
              const paidAmount = currentPayment ? currentPayment.amount : 0;
              
              return (
                <tr 
                  key={index} 
                  className={index % 2 === 0 ? 'bg-green-50' : 'bg-white'}
                >
                  <td className="py-1 px-2 font-medium">{feeItem.templateName} Fee</td>
                  <td className="py-1 px-2 text-center">₹{feeItem.total}</td>
                  <td 
                    className="py-1 px-2 text-center font-bold"
                    style={{ color: schoolConfig.branding.colors.primary }}
                  >
                    ₹{paidAmount}
                  </td>
                  <td className="py-1 px-2 text-center">₹{feeItem.outstanding}</td>
                </tr>
              );
            })}
            {receipt.currentFeeStatus.scholarships.length > 0 && 
              receipt.currentFeeStatus.scholarships.map((scholarship: any, index: number) => (
                <tr key={`scholarship-${index}`} className="bg-green-100">
                  <td className="py-1 px-2 font-medium text-green-700">{scholarship.templateName} (Scholarship)</td>
                  <td className="py-1 px-2 text-center text-green-700">₹{scholarship.amount}</td>
                  <td className="py-1 px-2 text-center">-</td>
                  <td className="py-1 px-2 text-center">-</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div 
        className="grid grid-cols-3 gap-2 mb-3 text-xs"
      >
        <div 
          className="text-center p-2 rounded"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
        >
          <div className="font-semibold text-gray-600">Total Fee</div>
          <div 
            className="text-sm font-bold"
            style={{ color: schoolConfig.branding.colors.primary }}
          >
            {formatCurrency(receipt.calculatedData.totalAnnualFee)}
          </div>
        </div>
        <div 
          className="text-center p-2 rounded"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
        >
          <div className="font-semibold text-gray-600">Paid</div>
          <div className="text-sm font-bold text-green-600">
            {formatCurrency(receipt.calculatedData.totalPaidSoFar)}
          </div>
        </div>
        <div 
          className="text-center p-2 rounded"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
        >
          <div className="font-semibold text-gray-600">Balance</div>
          <div className="text-sm font-bold text-orange-600">
            {formatCurrency(receipt.calculatedData.remainingBalance)}
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div 
        className="rounded-lg p-3 mb-3 text-xs"
        style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="font-semibold">Amount in Words:</span>
            <div className="mt-1 font-medium">Rs. {convertToWords(receipt.totalAmount)}</div>
          </div>
          <div>
            <span className="font-semibold">Received By:</span>
            <div className="mt-1 font-bold">{receipt.createdBy}</div>
          </div>
        </div>
        
        {schoolConfig.footer.showRemarks && (
          <div className="mt-2">
            <span className="font-semibold">Remarks:</span>
            <div className="mt-1">{receipt.remarks || 'No remarks'}</div>
          </div>
        )}
      </div>

      {/* Islamic Footer */}
      <div className="text-center border-t-2 pt-3" style={{ borderColor: schoolConfig.branding.colors.primary }}>
        {schoolConfig.footer.customText && (
          <div 
            className="font-medium mb-2 text-sm"
            style={{ color: schoolConfig.branding.colors.primary }}
          >
            {schoolConfig.footer.customText}
          </div>
        )}
        
        {schoolConfig.footer.additionalInfo?.map((info, index) => (
          <div key={index} className="text-xs text-gray-600 mb-1">{info}</div>
        ))}
        
        <div 
          className="text-sm font-semibold mt-3"
          style={{ 
            fontFamily: 'Arabic Typesetting, Times New Roman, serif',
            color: schoolConfig.branding.colors.primary 
          }}
        >
          جَزَاكَ اللهُ خَيْرًا
        </div>
        <div className="text-xs text-gray-600 mt-1">May Allah reward you with goodness</div>
      </div>
    </div>
  )
}