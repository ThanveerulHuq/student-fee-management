import { sendGAEvent } from '@next/third-parties/google'

// Authentication events
export const trackLogin = (method: string = 'credentials') => {
  sendGAEvent('event', 'login', {
    method,
    category: 'authentication'
  })
}

export const trackLogout = () => {
  sendGAEvent('event', 'logout', {
    category: 'authentication'
  })
}

export const trackLoginFailed = (reason?: string) => {
  sendGAEvent('event', 'login_failed', {
    reason: reason || 'invalid_credentials',
    category: 'authentication'
  })
}

// Student management events
export const trackStudentCreated = () => {
  sendGAEvent('event', 'student_created', {
    category: 'student_management'
  })
}

export const trackStudentUpdated = () => {
  sendGAEvent('event', 'student_updated', {
    category: 'student_management'
  })
}

export const trackStudentDeactivated = () => {
  sendGAEvent('event', 'student_deactivated', {
    category: 'student_management'
  })
}

export const trackStudentReactivated = () => {
  sendGAEvent('event', 'student_reactivated', {
    category: 'student_management'
  })
}

export const trackStudentEnrolled = () => {
  sendGAEvent('event', 'student_enrolled', {
    category: 'enrollment'
  })
}

// Fee management events
export const trackFeePayment = () => {
  sendGAEvent('event', 'fee_payment', {
    category: 'fee_management'
  })
}

export const trackReceiptViewed = () => {
  sendGAEvent('event', 'receipt_viewed', {
    category: 'fee_management'
  })
}

export const trackReceiptDownloaded = () => {
  sendGAEvent('event', 'receipt_downloaded', {
    category: 'fee_management'
  })
}

export const trackOutstandingFeesViewed = () => {
  sendGAEvent('event', 'outstanding_fees_viewed', {
    category: 'reports'
  })
}

// Administrative events
export const trackFeeStructureCreated = () => {
  sendGAEvent('event', 'fee_structure_created', {
    category: 'administration'
  })
}

export const trackFeeStructureUpdated = () => {
  sendGAEvent('event', 'fee_structure_updated', {
    category: 'administration'
  })
}

export const trackUserCreated = () => {
  sendGAEvent('event', 'user_created', {
    category: 'administration'
  })
}

export const trackReportGenerated = (reportType: string) => {
  sendGAEvent('event', 'report_generated', {
    report_type: reportType,
    category: 'reports'
  })
}

// Navigation and engagement events
export const trackDashboardVisit = () => {
  sendGAEvent('event', 'dashboard_visit', {
    category: 'navigation'
  })
}

export const trackSearch = (searchType: string) => {
  sendGAEvent('event', 'search', {
    search_type: searchType,
    category: 'engagement'
  })
}

export const trackPageView = (pageName: string, section?: string) => {
  sendGAEvent('event', 'page_view', {
    page_title: pageName,
    page_section: section,
    category: 'navigation'
  })
}

// Error tracking
export const trackError = (errorType: string, page?: string) => {
  sendGAEvent('event', 'error', {
    error_type: errorType,
    page,
    category: 'errors'
  })
}

// Performance tracking
export const trackPerformance = (action: string) => {
  sendGAEvent('event', 'performance', {
    action,
    category: 'performance'
  })
}