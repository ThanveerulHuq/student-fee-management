/**
 * Calculate accurate age based on date of birth
 * @param dateOfBirth - Date of birth as Date object or string
 * @param referenceDate - Reference date to calculate age from (defaults to current date)
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: Date | string, referenceDate?: Date): number {
  const birthDate = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth)
  const refDate = referenceDate || new Date()

  let age = refDate.getFullYear() - birthDate.getFullYear()
  
  // Check if birthday has occurred this year
  const monthDiff = refDate.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}