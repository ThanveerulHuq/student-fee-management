'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import LoaderOne from '@/components/ui/loader-one'

interface StudentSearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  isSearching: boolean
}

export default function StudentSearch({ searchTerm, onSearchChange, isSearching }: StudentSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        placeholder="Search by student name, admission number, or father name..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
        autoFocus
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <LoaderOne />
        </div>
      )}
    </div>
  )
}