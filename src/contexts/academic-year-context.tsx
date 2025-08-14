"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
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
  isReady: boolean
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined)

interface AcademicYearProviderProps {
  children: ReactNode
}

export function AcademicYearProvider({ children }: AcademicYearProviderProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [academicYear, setAcademicYear] = useState<AcademicYear | null>(null)
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Initialize academic year automatically
  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      setLoading(false)
      return
    }

    initializeAcademicYear()
  }, [session, status]) // eslint-disable-line react-hooks/exhaustive-deps

  const initializeAcademicYear = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch available academic years
      const response = await fetch('/api/academic-years')
      if (!response.ok) throw new Error('Failed to fetch academic years')
      
      const years: AcademicYear[] = await response.json()
      setAcademicYears(years)

      // Get academic year from localStorage first, then fallback to active
      const storedAcademicYear = localStorage.getItem('selectedAcademicYear')
      let selectedYear: AcademicYear | null = null

      if (storedAcademicYear) {
        try {
          const parsed = JSON.parse(storedAcademicYear)
          selectedYear = years.find(year => year.id === parsed.id) || null
        } catch {
          // Invalid stored data, clear it
          localStorage.removeItem('selectedAcademicYear')
        }
      }

      // Fallback to active academic year if no valid stored year
      if (!selectedYear) {
        selectedYear = years.find(year => year.isActive) || years[0] || null
      }

      if (selectedYear) {
        setAcademicYear(selectedYear)
        localStorage.setItem('selectedAcademicYear', JSON.stringify(selectedYear))
      } else {
        setError('No academic years available')
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
      
      // Use router refresh for smoother UX instead of hard reload
      router.refresh()
    }
  }

  const value: AcademicYearContextType = {
    academicYear,
    academicYears,
    loading,
    error,
    switchAcademicYear,
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