import React from 'react'
import LoaderOne from './loader-one'

interface LoaderWrapperProps {
  label?: string
  center?: boolean
  fullScreen?: boolean
}

export default function LoaderWrapper({ 
  label, 
  center = false, 
  fullScreen = false
}: LoaderWrapperProps) {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <LoaderOne />
      {label && (
        <p className="text-sm text-gray-600 text-center">
          {label}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    )
  }

  if (center) {
    return (
      <div className="flex items-center justify-center py-8">
        {content}
      </div>
    )
  }

  return content
}