import { SchoolConfig } from '@/lib/schools/types'
import FormalTemplate from './templates/FormalTemplate'
import ModernTemplate from './templates/ModernTemplate'
import IslamicTemplate from './templates/IslamicTemplate'

interface ReceiptRendererProps {
  receipt: any // PaymentReceipt type from main page
  schoolConfig: SchoolConfig
}

export default function ReceiptRenderer({ receipt, schoolConfig }: ReceiptRendererProps) {
  const renderTemplate = () => {
    const templateProps = { receipt, schoolConfig }

    console.log(templateProps)
    
    switch (schoolConfig.template) {
      case 'formal':
        return <FormalTemplate {...templateProps} />
      case 'modern':
        return <ModernTemplate {...templateProps} />
      case 'islamic':
        return <IslamicTemplate {...templateProps} />
      case 'compact':
        // For now, use formal template for compact. Can create a separate CompactTemplate later
        return <FormalTemplate {...templateProps} />
      default:
        return <FormalTemplate {...templateProps} />
    }
  }

  return (
    <div className="receipt-content">
      {renderTemplate()}
    </div>
  )
}