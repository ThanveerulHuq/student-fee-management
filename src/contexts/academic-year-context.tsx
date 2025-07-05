"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface AcademicYear {
  id: string
  year: string
  isActive: boolean
}

interface AcademicYearContextType {
  academicYear: AcademicYear | null
  academicYears: AcademicYear[]
  loading: boolean
  error: string | null
  switchAcademicYear: (yearId: string) => void
  navigate: (path: string) => void
  isReady: boolean
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined)

interface AcademicYearProviderProps {
  children: ReactNode
}

export function AcademicYearProvider({ children }: AcademicYearProviderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  
  const [academicYear, setAcademicYear] = useState<AcademicYear | null>(null)
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Initialize academic year from URL or localStorage
  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      setLoading(false)
      return
    }

    initializeAcademicYear()
  }, [session, status, searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const initializeAcademicYear = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch available academic years
      const response = await fetch('/api/academic-years')
      if (!response.ok) throw new Error('Failed to fetch academic years')
      
      const years: AcademicYear[] = await response.json()
      setAcademicYears(years)

      // Get academic year from URL parameter or localStorage
      const urlAcademicYear = searchParams.get('academicYear')
      const storedAcademicYear = localStorage.getItem('selectedAcademicYear')
      
      let selectedYear: AcademicYear | null = null

      if (urlAcademicYear) {
        selectedYear = years.find(year => year.id === urlAcademicYear) || null
      } else if (storedAcademicYear) {
        const parsed = JSON.parse(storedAcademicYear)
        selectedYear = years.find(year => year.id === parsed.id) || null
      }

      // Fallback to active academic year
      if (!selectedYear) {
        selectedYear = years.find(year => year.isActive) || years[0] || null
      }

      if (selectedYear) {
        setAcademicYear(selectedYear)
        localStorage.setItem('selectedAcademicYear', JSON.stringify(selectedYear))
        
        // Update URL if needed
        if (!urlAcademicYear || urlAcademicYear !== selectedYear.id) {
          const currentPath = window.location.pathname
          const newUrl = `${currentPath}?academicYear=${selectedYear.id}`
          window.history.replaceState({}, '', newUrl)
        }
      } else {
        // No academic years available - redirect to selection
        router.push('/select-academic-year')
        return
      }

      setIsReady(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize academic year')
      console.error('Academic year initialization error:', err)
    } finally {
      setLoading(false)
    }
  }

  const switchAcademicYear = (yearId: string) => {
    const newYear = academicYears.find(year => year.id === yearId)
    if (newYear) {
      setAcademicYear(newYear)
      localStorage.setItem('selectedAcademicYear', JSON.stringify(newYear))
      
      // Update URL
      const currentPath = window.location.pathname
      const newUrl = `${currentPath}?academicYear=${newYear.id}`
      window.history.replaceState({}, '', newUrl)
      
      // Refresh page to reload data for new academic year
      window.location.reload()
    }
  }

  const navigate = (path: string) => {
    if (!academicYear) return
    
    // Add academic year parameter to navigation
    const separator = path.includes('?') ? '&' : '?'
    const fullPath = `${path}${separator}academicYear=${academicYear.id}`
    router.push(fullPath)
  }

  const value: AcademicYearContextType = {
    academicYear,
    academicYears,
    loading,
    error,
    switchAcademicYear,
    navigate,
    isReady
  }

  return (
    <AcademicYearContext.Provider value={value}>
      {children}
    </AcademicYearContext.Provider>
  )
}

export const useAcademicYear = () => {
  const context = useContext(AcademicYearContext)
  if (context === undefined) {
    throw new Error('useAcademicYear must be used within an AcademicYearProvider')
  }
  return context
}

// Utility hook for navigation
export const useAcademicYearNavigation = () => {
  const { navigate, academicYear } = useAcademicYear()
  
  return {
    navigateTo: navigate,
    currentAcademicYear: academicYear,
    // Convenience methods
    goToDashboard: () => navigate('/dashboard'),
    goToStudents: () => navigate('/students'),
    goToFees: () => navigate('/fees'),
    goToReports: () => navigate('/reports'),
    goToStudent: (id: string) => navigate(`/students/${id}`),
    goToFeeCollection: () => navigate('/fees/collect'),
  }
}