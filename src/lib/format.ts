/**
 * Utility functions for formatting numbers and currency in Indian format
 */

/**
 * Format currency in Indian Rupees with Indian numbering system
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., ₹89,18,600)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format numbers using Indian numbering system
 * @param num - The number to format
 * @returns Formatted number string (e.g., 89,18,600)
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num)
}

/**
 * Format currency with decimal places when needed
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string with decimals
 */
export const formatCurrencyWithDecimals = (amount: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}