"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormProgressProps {
  currentStep: number
  totalSteps: number
  steps: string[]
}

export default function FormProgress({ currentStep, totalSteps, steps }: FormProgressProps) {
  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={step} className="flex items-center">
              {/* Step Circle */}
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200",
                    {
                      "border-green-500 bg-green-500 text-white": isCompleted,
                      "border-blue-500 bg-blue-500 text-white": isCurrent,
                      "border-gray-300 bg-white text-gray-500": isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>
                
                {/* Step Label */}
                <div className="ml-3 hidden sm:block">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors duration-200",
                      {
                        "text-green-600": isCompleted,
                        "text-blue-600": isCurrent,
                        "text-gray-500": isUpcoming,
                      }
                    )}
                  >
                    {step}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-4 h-0.5 w-16 transition-colors duration-200 sm:w-24",
                    {
                      "bg-green-500": isCompleted,
                      "bg-gray-300": !isCompleted,
                    }
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Step Labels */}
      <div className="mt-4 text-center sm:hidden">
        <p className="text-sm font-medium text-blue-600">
          {steps[currentStep - 1]}
        </p>
        <p className="text-xs text-gray-500">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  )
}