"use client"

import { useState } from "react"
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Save, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { studentSchema, type StudentFormData } from "@/lib/validations/student"
import FormProgress from "./form-progress"
import BasicInfoStep from "./basic-info-step"
import FamilyInfoStep from "./family-info-step"
import AdditionalInfoStep from "./additional-info-step"

interface StudentFormWizardProps {
  initialData?: Partial<StudentFormData>
  onSubmit: (data: StudentFormData) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

const STEPS = [
  "Basic Information",
  "Family Information", 
  "Additional Information"
]

export default function StudentFormWizard({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isEdit = false 
}: StudentFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    trigger,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema) as Resolver<StudentFormData>,
    mode: "onChange",
    defaultValues: {
      admissionNo: initialData.admissionNo || "",
      admissionDate: initialData.admissionDate || new Date().toISOString().split('T')[0],
      aadharNo: initialData.aadharNo || undefined,
      emisNo: initialData.emisNo || undefined,
      name: initialData.name || "",
      gender: initialData.gender as "MALE" | "FEMALE" | undefined,
      dateOfBirth: initialData.dateOfBirth || "",
      community: initialData.community || "",
      motherTongue: initialData.motherTongue || "",
      mobileNo1: initialData.mobileNo1 || "",
      mobileNo2: initialData.mobileNo2 || undefined,
      fatherName: initialData.fatherName || "",
      motherName: initialData.motherName || "",
      address: initialData.address || "",
      previousSchool: initialData.previousSchool || undefined,
      religion: initialData.religion || "",
      caste: initialData.caste || "",
      nationality: initialData.nationality || "Indian",
      remarks: initialData.remarks || undefined,
      isActive: initialData.isActive ?? true,
    },
  })

  // Define fields for each step for validation
  const stepFields = {
    1: ["admissionNo", "admissionDate", "name", "gender", "dateOfBirth"] as const,
    2: ["fatherName", "motherName", "mobileNo1"] as const,
    3: ["community", "motherTongue", "religion", "caste", "nationality", "address"] as const,
  }

  const handleFormSubmit: SubmitHandler<StudentFormData> = async (data) => {
    try {
      setLoading(true)
      setError("")
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    // Validate current step fields
    const fieldsToValidate = stepFields[currentStep as keyof typeof stepFields]
    const isStepValid = await trigger(fieldsToValidate)
    
    if (isStepValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }



  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            register={register}
            control={control}
            errors={errors}
            loading={loading}
          />
        )
      case 2:
        return (
          <FamilyInfoStep
            register={register}
            errors={errors}
            loading={loading}
          />
        )
      case 3:
        return (
          <AdditionalInfoStep
            register={register}
            errors={errors}
            loading={loading}
          />
        )
      default:
        return null
    }
  }

  const isLastStep = currentStep === STEPS.length
  const isFirstStep = currentStep === 1

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <FormProgress
        currentStep={currentStep}
        totalSteps={STEPS.length}
        steps={STEPS}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Current Step Content */}
        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            
            {!isFirstStep && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={loading}
                className="min-w-[100px]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex space-x-4">
            {!isLastStep ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={loading || !isValid}
                className="min-w-[120px] bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    {isEdit ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Student
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Student
                      </>
                    )}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Form Completion Indicator */}
      <div className="text-center text-sm text-gray-500">
        Step {currentStep} of {STEPS.length}
      </div>
    </div>
  )
}