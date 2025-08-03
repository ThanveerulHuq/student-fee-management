'use client'

import { Search, User } from 'lucide-react'

interface EmptyStateProps {
  type: 'initial' | 'no-results'
}

export default function EmptyState({ type }: EmptyStateProps) {
  if (type === 'initial') {
    return (
      <div className="text-center py-8 text-gray-500">
        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Start typing to search for students to collect fees...</p>
      </div>
    )
  }

  return (
    <div className="text-center py-8 text-gray-500">
      <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>No students found matching your search.</p>
    </div>
  )
}