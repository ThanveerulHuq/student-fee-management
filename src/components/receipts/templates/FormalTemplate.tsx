import { ReceiptProps } from '@/lib/schools/types'
import { formatCurrency, formatDate } from "@/lib/utils/receipt"

export default function FormalTemplate({ receipt, schoolConfig }: ReceiptProps) {
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
      className={`w-full bg-white ${borderClass} border-black p-1`}
      style={{ 
        fontSize: schoolConfig.branding.fonts.size?.small || '9px', 
        fontFamily: schoolConfig.branding.fonts.body,
        color: schoolConfig.branding.colors.text 
      }}
    >
      {/* School Header */}
      <div className="border-b-4 border-double border-black pb-1 mb-1">
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
              className="text-sm font-black leading-tight tracking-wide" 
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
                className="text-xs leading-tight font-medium" 
                style={{ fontFamily: schoolConfig.branding.fonts.header }}
              >
                (Managed by : {schoolConfig.header.managedBy})
              </div>
            )}
            {schoolConfig.header.address && (
              <div 
                className="text-xs leading-tight" 
                style={{ fontFamily: schoolConfig.branding.fonts.header }}
              >
                {schoolConfig.header.address}
              </div>
            )}
            <div 
              className="text-xs leading-tight" 
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

      {/* Key Info Bar */}
      <div className="border-b-2 border-black pb-0.5 mb-1">
        <table className="w-full" style={{ fontSize: schoolConfig.branding.fonts.size?.medium || '10px' }}>
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
      <div 
        className="text-center font-black mb-0.5 py-0.5 border-t-2 border-b-2 border-black tracking-widest" 
        style={{ 
          fontSize: schoolConfig.branding.fonts.size?.medium || '10px',
          backgroundColor: schoolConfig.branding.colors.background 
        }}
      >
        RECEIVED FROM
      </div>

      {/* Student Details */}
      <div className="mb-1 pl-1">
        <table className="w-full" style={{ fontSize: schoolConfig.branding.fonts.size?.medium || '10px' }}>
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
              {/* Render custom fields */}
              {schoolConfig.customFields
                .filter(field => field.position === 'student-info')
                .map((field, index) => (
                  <td key={index} className="w-1/5 py-0.5">
                    <span className="font-bold">{field.label}:</span>
                    <span className="ml-2 font-extrabold">{field.defaultValue || '-'}</span>
                  </td>
                ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Details Header */}
      <div 
        className="text-center font-black mb-0.5 py-0.5 border-t-2 border-b-2 border-black tracking-widest" 
        style={{ fontSize: schoolConfig.branding.fonts.size?.medium || '10px' }}
      >
        PAYMENT DETAILS
      </div>

      {/* Payment Table */}
      <table 
        className="w-full border-collapse mb-1" 
        style={{ fontSize: schoolConfig.branding.fonts.size?.medium || '10px' }}
      >
        <thead>
          <tr className="border-2 border-black">
            <th 
              className="border border-black py-0.5 px-1 text-center font-black text-white"
              style={{ backgroundColor: schoolConfig.branding.colors.primary }}
            >
              DESCRIPTION
            </th>
            <th 
              className="border border-black py-0.5 px-1 text-center font-black text-white"
              style={{ backgroundColor: schoolConfig.branding.colors.primary }}
            >
              AMOUNT
            </th>
            <th 
              className="border border-black py-0.5 px-1 text-center font-black text-white"
              style={{ backgroundColor: schoolConfig.branding.colors.primary }}
            >
              PAID
            </th>
            <th 
              className="border border-black py-0.5 px-1 text-center font-black text-white"
              style={{ backgroundColor: schoolConfig.branding.colors.primary }}
            >
              BALANCE
            </th>
          </tr>
        </thead>
        <tbody>
          {receipt.currentFeeStatus.fees.map((feeItem: any, index: number) => {
            const currentPayment = receipt.paymentBreakdown.find(
              (payment: any) => payment.feeType.toLowerCase() === feeItem.templateName.toLowerCase()
            );
            const paidAmount = currentPayment ? currentPayment.amount : 0;
            
            return (
              <tr key={index} className={
                schoolConfig.formatting.tableStyle === 'striped' && index % 2 === 0 
                  ? 'bg-gray-100' 
                  : 'bg-white'
              }>
                <td className="border border-black py-0.5 px-1 font-bold">{feeItem.templateName.toUpperCase()} FEE</td>
                <td className="border border-black py-0.5 px-1 text-center font-bold">₹{feeItem.total}</td>
                <td className="border border-black py-0.5 px-1 text-center font-extrabold">₹{paidAmount}</td>
                <td className="border border-black py-0.5 px-1 text-center font-bold">₹{feeItem.outstanding}</td>
              </tr>
            );
          })}
          {receipt.currentFeeStatus.scholarships.length > 0 && 
            receipt.currentFeeStatus.scholarships.map((scholarship: any, index: number) => (
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
              {receipt.recentPayments.map((payment: any) => (
                <div key={payment.id} className="text-xs font-medium">
                  {formatDate(payment.paymentDate)} - {formatCurrency(payment.totalAmount)}
                </div>
              ))}
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
              PAID
            </td>
            <td className="border border-black py-0.5 px-1 font-black text-sm">
              {formatCurrency(receipt.calculatedData.totalPaidSoFar)}
            </td>
          </tr>
          <tr>
            <td className="border border-black py-0.5 px-1 text-right font-black bg-gray-200">
              BALANCE
            </td>
            <td className="border border-black py-0.5 px-1 font-black text-lg">
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
      {schoolConfig.footer.showRemarks && (
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
      )}

      {/* Custom Footer Text */}
      {schoolConfig.footer.customText && (
        <div className="text-center text-xs mt-1 font-medium" style={{ color: schoolConfig.branding.colors.secondary }}>
          {schoolConfig.footer.customText}
        </div>
      )}
    </div>
  )
}