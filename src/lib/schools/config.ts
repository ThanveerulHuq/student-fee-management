import { SchoolConfig } from './types'

// Default configuration that matches current receipt
export const DHAARUS_SALAAM_CONFIG: SchoolConfig = {
  id: 'dhaarus-salaam',
  name: 'DHAARUS SALAAM MATRICULATION HIGHER SECONDARY SCHOOL',
  shortName: 'Dhaarus Salaam',
  template: 'formal',
  branding: {
    colors: {
      primary: '#000000',
      secondary: '#666666',
      background: '#ffffff',
      text: '#000000'
    },
    fonts: {
      header: 'Times New Roman, serif',
      body: 'Calibri, sans-serif',
      size: {
        small: '9px',
        medium: '10px',
        large: '12px'
      }
    },
    borderStyle: 'double',
    spacing: 'compact'
  },
  header: {
    schoolName: 'DHAARUS SALAAM MATRICULATION HIGHER SECONDARY SCHOOL',
    managedBy: 'Dhaarus Salaam Trust, Salem – 636 005',
    phone: '(0427) 2442018, +91 98942 50320',
    email: 'dhaarussalaam1@gmail.com',
    showLogo: true,
    logoPath: '/schools/dhaarus-salaam/logo.jpg',
    logoSize: {
      width: '70px',
      height: '70px'
    }
  },
  footer: {
    showRemarks: true,
    showSignature: true,
    customText: '',
    additionalInfo: []
  },
  customFields: [
    {
      name: 'section',
      label: 'SECTION',
      position: 'student-info',
      type: 'text',
      required: false,
      defaultValue: 'A'
    }
  ],
  formatting: {
    pageSize: 'A4',
    margins: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in'
    },
    showDuplicateCopy: true,
    duplicateLabel: 'DUPLICATE COPY',
    tableStyle: 'striped',
    currencyFormat: 'INR',
    dateFormat: 'DD-MM-YYYY'
  },
  isActive: true
}

// Modern school configuration example
export const BLUEMOON_MODERN_CONFIG: SchoolConfig = {
  id: 'bluemoon-modern',
  name: 'BlueMoon International School',
  shortName: 'BlueMoon',
  template: 'modern',
  branding: {
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      background: '#f8fafc',
      text: '#1e293b'
    },
    fonts: {
      header: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      size: {
        small: '10px',
        medium: '12px',
        large: '14px'
      }
    },
    borderStyle: 'single',
    spacing: 'normal'
  },
  header: {
    schoolName: 'BlueMoon International School',
    managedBy: 'BlueMoon Education Trust',
    address: '123 Education Street, Learning City - 500001',
    phone: '+91 12345 67890',
    email: 'info@bluemoon.edu.in',
    showLogo: true,
    logoPath: '/schools/bluemoon-modern/logo.png',
    logoSize: {
      width: '50px',
      height: '50px'
    }
  },
  footer: {
    showRemarks: true,
    showSignature: true,
    customText: 'Thank you for choosing BlueMoon International School',
    additionalInfo: [
      'Visit our website: www.bluemoon.edu.in',
      'For queries, call our helpline: +91 12345 67890'
    ]
  },
  customFields: [],
  formatting: {
    pageSize: 'A4',
    margins: {
      top: '1in',
      right: '0.75in',
      bottom: '1in',
      left: '0.75in'
    },
    showDuplicateCopy: true,
    duplicateLabel: 'OFFICE COPY',
    tableStyle: 'bordered',
    currencyFormat: 'INR',
    dateFormat: 'DD-MM-YYYY'
  },
  isActive: true
}

// Islamic school configuration example
export const ISLAMIC_ACADEMY_CONFIG: SchoolConfig = {
  id: 'islamic-academy',
  name: 'Al-Noor Islamic Academy',
  shortName: 'Al-Noor',
  template: 'islamic',
  branding: {
    colors: {
      primary: '#065f46',
      secondary: '#059669',
      accent: '#10b981',
      background: '#f0fdf4',
      text: '#064e3b'
    },
    fonts: {
      header: 'Times New Roman, serif',
      body: 'Arial, sans-serif',
      size: {
        small: '9px',
        medium: '11px',
        large: '13px'
      }
    },
    borderStyle: 'double',
    spacing: 'normal'
  },
  header: {
    schoolName: 'Al-Noor Islamic Academy',
    managedBy: 'Al-Noor Educational Trust',
    address: 'Masjid Road, Islamic Colony - 600001',
    phone: '+91 98765 43210',
    email: 'info@alnoor.edu.in',
    showLogo: true,
    logoPath: '/schools/islamic-academy/logo.png',
    logoSize: {
      width: '45px',
      height: '45px'
    }
  },
  footer: {
    showRemarks: true,
    showSignature: true,
    customText: 'بارک اللہ فیکم - May Allah bless you',
    additionalInfo: [
      'Established: 1995',
      'Affiliated to State Board'
    ]
  },
  customFields: [
    {
      name: 'parentName',
      label: 'PARENT NAME',
      position: 'student-info',
      type: 'text',
      required: false
    }
  ],
  formatting: {
    pageSize: 'A4',
    margins: {
      top: '0.75in',
      right: '0.75in',
      bottom: '0.75in',
      left: '0.75in'
    },
    showDuplicateCopy: true,
    duplicateLabel: 'PARENT COPY',
    tableStyle: 'bordered',
    currencyFormat: 'INR',
    dateFormat: 'DD-MM-YYYY'
  },
  isActive: true
}

// School configurations registry
export const SCHOOL_CONFIGS: Record<string, SchoolConfig> = {
  'dhaarus-salaam': DHAARUS_SALAAM_CONFIG,
  'bluemoon-modern': BLUEMOON_MODERN_CONFIG,
  'islamic-academy': ISLAMIC_ACADEMY_CONFIG
}

// Helper function to get school config by ID
export function getSchoolConfig(schoolId?: string): SchoolConfig {
  if (!schoolId || !SCHOOL_CONFIGS[schoolId]) {
    // Return default config (Dhaarus Salaam) if school ID not found
    return DHAARUS_SALAAM_CONFIG
  }
  return SCHOOL_CONFIGS[schoolId]
}

// Helper function to get school config from environment
export function getSchoolConfigFromEnv(): SchoolConfig {
  const schoolId = process.env.SCHOOL_ID || process.env.NEXT_PUBLIC_SCHOOL_ID
  return getSchoolConfig(schoolId)
}