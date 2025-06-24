// Utility functions for receipt generation and fee calculations

export function generateReceiptNumber(): string {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `RCP${timestamp.slice(-8)}${random}`
}

export function calculateTotalFee(enrollment: {
  commonFee: { schoolFee: number; bookFee: number }
  uniformFee: number
  islamicStudies: number
  vanFee: number
  scholarship: number
}) {
  return (
    enrollment.commonFee.schoolFee +
    enrollment.commonFee.bookFee +
    enrollment.uniformFee +
    enrollment.islamicStudies +
    enrollment.vanFee -
    enrollment.scholarship
  )
}

export function calculateOutstandingBalance(
  totalFee: number,
  paidFee: {
    schoolFeePaid: number
    bookFeePaid: number
    uniformFeePaid: number
    islamicStudiesPaid: number
    vanFeePaid: number
  }
) {
  const totalPaid = 
    paidFee.schoolFeePaid +
    paidFee.bookFeePaid +
    paidFee.uniformFeePaid +
    paidFee.islamicStudiesPaid +
    paidFee.vanFeePaid

  return Math.max(0, totalFee - totalPaid)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}