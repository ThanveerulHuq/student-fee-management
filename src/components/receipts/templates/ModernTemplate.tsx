import { ReceiptProps } from '@/lib/schools/types'
import { formatCurrency, formatDate } from "@/lib/utils/receipt"

export default function ModernTemplate({ receipt, schoolConfig }: ReceiptProps) {
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

  return (
    <div 
      className="w-full bg-white rounded-lg shadow-lg border-2 p-6"
      style={{ 
        fontSize: schoolConfig.branding.fonts.size?.medium || '12px', 
        fontFamily: schoolConfig.branding.fonts.body,
        color: schoolConfig.branding.colors.text,
        borderColor: schoolConfig.branding.colors.primary
      }}
    >
      {/* Modern Header with Gradient */}
      <div 
        className="rounded-t-lg p-4 mb-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${schoolConfig.branding.colors.primary} 0%, ${schoolConfig.branding.colors.secondary} 100%)`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {schoolConfig.header.showLogo && (
              <img 
                src={schoolConfig.header.logoPath} 
                alt="School Logo" 
                style={{
                  width: schoolConfig.header.logoSize?.width || '60px',
                  height: schoolConfig.header.logoSize?.height || '60px'
                }}
                className="rounded-full bg-white p-1" 
              />
            )}
            <div>
              <h1 
                className="text-xl font-bold" 
                style={{ fontFamily: schoolConfig.branding.fonts.header }}
              >
                {schoolConfig.header.schoolName}
              </h1>
              {schoolConfig.header.managedBy && (
                <p className="text-sm opacity-90">{schoolConfig.header.managedBy}</p>
              )}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold">Receipt #{receipt.receiptNo}</div>
            <div>{formatDate(receipt.paymentDate)}</div>
          </div>
        </div>
        
        <div className="mt-2 flex justify-between text-sm opacity-90">
          <div>
            {schoolConfig.header.address && <div>{schoolConfig.header.address}</div>}
            <div>
              {schoolConfig.header.phone && `📞 ${schoolConfig.header.phone}`}
              {schoolConfig.header.phone && schoolConfig.header.email && ' • '}
              {schoolConfig.header.email && `✉️ ${schoolConfig.header.email}`}
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">Academic Year</div>
            <div>{receipt.academicYear.year}</div>
          </div>
        </div>
      </div>

      {/* Student Information Card */}
      <div 
        className="rounded-lg p-4 mb-4"
        style={{ backgroundColor: schoolConfig.branding.colors.background }}
      >
        <h2 
          className="text-lg font-semibold mb-2"
          style={{ color: schoolConfig.branding.colors.primary }}
        >
          Student Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Student Name:</span>
            <span className="ml-2 font-bold uppercase">{receipt.student.name}</span>
          </div>
          <div>
            <span className="font-medium">Admission No:</span>
            <span className="ml-2 font-bold">{receipt.student.admissionNo}</span>
          </div>
          <div>
            <span className="font-medium">Class:</span>
            <span className="ml-2 font-bold">{receipt.student.class}</span>
          </div>
          <div>
            <span className="font-medium">Father's Name:</span>
            <span className="ml-2">{receipt.student.fatherName}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <h2 
        className="text-lg font-semibold mb-3"
        style={{ color: schoolConfig.branding.colors.primary }}
      >
        Payment Details
      </h2>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: schoolConfig.branding.colors.primary }}>
              <th className="py-3 px-4 text-left text-white font-semibold">Description</th>
              <th className="py-3 px-4 text-center text-white font-semibold">Total Amount</th>
              <th className="py-3 px-4 text-center text-white font-semibold">Paid</th>
              <th className="py-3 px-4 text-center text-white font-semibold">Balance</th>
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
                  className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  <td className="py-2 px-4 font-medium">{feeItem.templateName} Fee</td>
                  <td className="py-2 px-4 text-center">₹{feeItem.total.toLocaleString()}</td>
                  <td 
                    className="py-2 px-4 text-center font-bold"
                    style={{ color: schoolConfig.branding.colors.primary }}
                  >
                    ₹{paidAmount.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-center">₹{feeItem.outstanding.toLocaleString()}</td>
                </tr>
              );
            })}
            {receipt.currentFeeStatus.scholarships.length > 0 && 
              receipt.currentFeeStatus.scholarships.map((scholarship: any, index: number) => (
                <tr key={`scholarship-${index}`} className="bg-green-50">
                  <td className="py-2 px-4 font-medium text-green-700">{scholarship.templateName} (Discount)</td>
                  <td className="py-2 px-4 text-center text-green-700">-₹{scholarship.amount.toLocaleString()}</td>
                  <td className="py-2 px-4 text-center">-</td>
                  <td className="py-2 px-4 text-center">-</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mt-6 mb-4">
        <div 
          className="rounded-lg p-4 text-center"
          style={{ backgroundColor: schoolConfig.branding.colors.background }}
        >
          <div className="text-sm font-medium text-gray-600">Total Fee</div>
          <div 
            className="text-xl font-bold"
            style={{ color: schoolConfig.branding.colors.primary }}
          >
            {formatCurrency(receipt.calculatedData.totalAnnualFee)}
          </div>
        </div>
        <div 
          className="rounded-lg p-4 text-center"
          style={{ backgroundColor: schoolConfig.branding.colors.background }}
        >
          <div className="text-sm font-medium text-gray-600">Total Paid</div>
          <div 
            className="text-xl font-bold text-green-600"
          >
            {formatCurrency(receipt.calculatedData.totalPaidSoFar)}
          </div>
        </div>
        <div 
          className="rounded-lg p-4 text-center"
          style={{ backgroundColor: schoolConfig.branding.colors.background }}
        >
          <div className="text-sm font-medium text-gray-600">Balance</div>
          <div 
            className="text-xl font-bold text-orange-600"
          >
            {formatCurrency(receipt.calculatedData.remainingBalance)}
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div 
        className="rounded-lg p-4 mb-4"
        style={{ backgroundColor: schoolConfig.branding.colors.background }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Amount in Words:</span>
            <div className="mt-1 font-semibold">Rs. {convertToWords(receipt.totalAmount)}</div>
          </div>
          <div>
            <span className="font-medium">Received By:</span>
            <div className="mt-1 font-semibold">{receipt.createdBy}</div>
          </div>
        </div>
        
        {schoolConfig.footer.showRemarks && (
          <div className="mt-3">
            <span className="font-medium">Remarks:</span>
            <div className="mt-1">{receipt.remarks || 'No remarks'}</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center border-t pt-4">
        {schoolConfig.footer.customText && (
          <p 
            className="font-medium mb-2"
            style={{ color: schoolConfig.branding.colors.primary }}
          >
            {schoolConfig.footer.customText}
          </p>
        )}
        {schoolConfig.footer.additionalInfo?.map((info, index) => (
          <p key={index} className="text-sm text-gray-600">{info}</p>
        ))}
      </div>
    </div>
  )
}