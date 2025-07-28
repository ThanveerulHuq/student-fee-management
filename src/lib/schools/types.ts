export interface SchoolColors {
  primary: string
  secondary: string
  accent?: string
  background?: string
  text?: string
}

export interface SchoolFonts {
  header: string
  body: string
  size?: {
    small: string
    medium: string
    large: string
  }
}

export interface SchoolBranding {
  colors: SchoolColors
  fonts: SchoolFonts
  borderStyle?: 'single' | 'double' | 'dotted' | 'dashed'
  spacing?: 'compact' | 'normal' | 'spacious'
}

export interface SchoolHeaderConfig {
  schoolName: string
  managedBy?: string
  address?: string
  phone?: string
  email?: string
  showLogo: boolean
  logoPath: string
  logoSize?: {
    width: string
    height: string
  }
}

export interface SchoolFooterConfig {
  showRemarks: boolean
  showSignature: boolean
  customText?: string
  additionalInfo?: string[]
}

export interface CustomField {
  name: string
  label: string
  position: 'header' | 'student-info' | 'payment-info' | 'footer'
  type: 'text' | 'number' | 'date'
  required: boolean
  defaultValue?: string
}

export interface ReceiptFormattingConfig {
  pageSize: 'A4' | 'A5' | 'custom'
  margins: {
    top: string
    right: string
    bottom: string
    left: string
  }
  showDuplicateCopy: boolean
  duplicateLabel?: string
  tableStyle: 'striped' | 'bordered' | 'minimal'
  currencyFormat: 'INR' | 'USD' | 'EUR'
  dateFormat: 'DD-MM-YYYY' | 'MM-DD-YYYY' | 'YYYY-MM-DD'
}

export type ReceiptTemplate = 'formal' | 'modern' | 'compact' | 'islamic'

export interface SchoolConfig {
  id: string
  name: string
  shortName: string
  template: ReceiptTemplate
  branding: SchoolBranding
  header: SchoolHeaderConfig
  footer: SchoolFooterConfig
  customFields: CustomField[]
  formatting: ReceiptFormattingConfig
  isActive: boolean
}

export interface ReceiptProps {
  receipt: any // PaymentReceipt from the main page
  schoolConfig: SchoolConfig
}