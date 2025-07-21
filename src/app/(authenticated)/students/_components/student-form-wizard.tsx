"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Form } from "@/components/ui/form"
import { Save, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { studentSchema, type StudentFormData } from "@/lib/validations/student"
import { defineStepper } from "@stepperize/react"
import BasicInfoStep from "./basic-info-step"
import FamilyInfoStep from "./family-info-step"
import AdditionalInfoStep from "./additional-info-step"

interface StudentFormWizardProps {
  initialData?: Partial<StudentFormData>
  onSubmit: (data: StudentFormData) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

// Define step-specific schemas for validation
const basicInfoSchema = studentSchema.pick({
  admissionNo: true,
  admissionDate: true,
  name: true,
  gender: true,
  dateOfBirth: true,
  aadharNo: true,
  emisNo: true,
})

const familyInfoSchema = studentSchema.pick({
  fatherName: true,
  motherName: true,
  mobileNo1: true,
  mobileNo2: true,
})

const additionalInfoSchema = studentSchema.pick({
  community: true,
  motherTongue: true,
  religion: true,
  caste: true,
  nationality: true,
  address: true,
  previousSchool: true,
  remarks: true,
  isActive: true,
})


const { useStepper, steps, utils } = defineStepper(
  { id: "basic-info", label: "Basic Information", schema: basicInfoSchema },
  { id: "family-info", label: "Family Information", schema: familyInfoSchema },
  { id: "additional-info", label: "Additional Information", schema: additionalInfoSchema },
)

export default function StudentFormWizard({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isEdit = false 
}: StudentFormWizardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<Partial<StudentFormData>>(initialData)
  const stepper = useStepper()


  const form = useForm<StudentFormData>({
    mode: "onTouched",
    // Remove resolver to prevent automatic validation of all fields
    defaultValues: {
      admissionNo: formData.admissionNo || "",
      admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0],
      aadharNo: formData.aadharNo || undefined,
      emisNo: formData.emisNo || undefined,
      name: formData.name || "",
      gender: formData.gender as "MALE" | "FEMALE" | undefined,
      dateOfBirth: formData.dateOfBirth || "",
      community: formData.community || "",
      motherTongue: formData.motherTongue || "",
      mobileNo1: formData.mobileNo1 || "",
      mobileNo2: formData.mobileNo2 || undefined,
      fatherName: formData.fatherName || "",
      motherName: formData.motherName || "",
      address: formData.address || "",
      previousSchool: formData.previousSchool || undefined,
      religion: formData.religion || "",
      caste: formData.caste || "",
      nationality: formData.nationality || "Indian",
      remarks: formData.remarks || undefined,
      isActive: formData.isActive ?? true,
    },
  })

  // Step field mappings for validation
  const stepFields = {
    "basic-info": ["admissionNo", "admissionDate", "name", "gender", "dateOfBirth"] as const,
    "family-info": ["fatherName", "motherName", "mobileNo1"] as const,
    "additional-info": ["community", "motherTongue", "religion", "caste", "nationality", "address"] as const,
  }

  // Update form when formData changes
  React.useEffect(() => {
    form.reset({
      admissionNo: formData.admissionNo || "",
      admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0],
      aadharNo: formData.aadharNo || undefined,
      emisNo: formData.emisNo || undefined,
      name: formData.name || "",
      gender: formData.gender as "MALE" | "FEMALE" | undefined,
      dateOfBirth: formData.dateOfBirth || "",
      community: formData.community || "",
      motherTongue: formData.motherTongue || "",
      mobileNo1: formData.mobileNo1 || "",
      mobileNo2: formData.mobileNo2 || undefined,
      fatherName: formData.fatherName || "",
      motherName: formData.motherName || "",
      address: formData.address || "",
      previousSchool: formData.previousSchool || undefined,
      religion: formData.religion || "",
      caste: formData.caste || "",
      nationality: formData.nationality || "Indian",
      remarks: formData.remarks || undefined,
      isActive: formData.isActive ?? true,
    })
  }, [formData, form])

  // Custom validation function for current step
  const validateCurrentStep = async (values: StudentFormData) => {
    const currentStepId = stepper.current.id as keyof typeof stepFields
    const fieldsToValidate = stepFields[currentStepId]
    
    // Get current step schema
    let currentSchema
    switch (currentStepId) {
      case "basic-info":
        currentSchema = basicInfoSchema
        break
      case "family-info":
        currentSchema = familyInfoSchema
        break
      case "additional-info":
        currentSchema = additionalInfoSchema
        break
      default:
        return false
    }

    try {
      // Extract only current step fields from values
      const stepData: Record<string, unknown> = {}
      fieldsToValidate.forEach(field => {
        stepData[field] = values[field as keyof StudentFormData]
      })
      
      // Validate current step data
      currentSchema.parse(stepData)
      return true
    } catch (error: unknown) {
      // Set validation errors on form
      if (error && typeof error === 'object' && 'issues' in error) {
        const fieldErrors: Record<string, { message: string }> = {}
        const zodError = error as { issues: Array<{ path: string[]; message: string }> }
        zodError.issues.forEach((issue) => {
          if (issue.path?.length > 0) {
            fieldErrors[issue.path[0]] = { message: issue.message }
          }
        })
        
        // Set errors on the form
        Object.entries(fieldErrors).forEach(([field, error]) => {
          form.setError(field as keyof StudentFormData, {
            type: "manual",
            message: error.message
          })
        })
      }
      return false
    }
  }

  const handleStepSubmit = async (values: StudentFormData) => {
    if (stepper.isLast) {
      // Final submission - validate complete form
      try {
        setLoading(true)
        setError("")
        const validatedData = studentSchema.parse(values)
        await onSubmit(validatedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
      } finally {
        setLoading(false)
      }
    } else {
      // Validate only current step and move to next step
      const isStepValid = await validateCurrentStep(values)
      
      if (isStepValid) {
        // Store current step data and move to next step
        const updatedFormData = { ...formData, ...values }
        setFormData(updatedFormData)
        stepper.next()
      }
    }
  }

  const currentIndex = utils.getIndex(stepper.current.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isEdit ? "Edit Student" : "Add New Student"}
              </h1>
              <p className="text-gray-600 text-lg">
                {isEdit ? "Update student information" : "Complete all steps to add a new student"}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-md">
              <span className="text-sm font-medium">
                Step {currentIndex + 1} of {steps.length}
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </div>
                <span className="text-red-800">{error}</span>
              </div>
            </Alert>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const values = form.getValues()
              await handleStepSubmit(values)
            }}
            className="space-y-8"
          >

            {/* Modern Stepper Navigation */}
            <nav aria-label="Student Form Steps" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between relative">
                {/* Progress Line Background */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 -z-10"></div>
                {/* Active Progress Line */}
                <div 
                  className="absolute top-6 left-6 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 -z-10 transition-all duration-500 ease-in-out"
                  style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                ></div>
                
                {stepper.all.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <button
                      type="button"
                      role="tab"
                      aria-current={stepper.current.id === step.id ? "step" : undefined}
                      className={`w-12 h-12 rounded-full border-4 transition-all duration-300 flex items-center justify-center font-bold text-sm shadow-lg hover:scale-105 ${
                        index <= currentIndex 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-white shadow-blue-200' 
                          : index === currentIndex + 1
                          ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                          : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={async () => {
                        if (index > currentIndex) {
                          const currentFormValues = form.getValues()
                          const isStepValid = await validateCurrentStep(currentFormValues)
                          if (!isStepValid) return
                          setFormData(prev => ({ ...prev, ...currentFormValues }))
                        }
                        stepper.goTo(step.id)
                      }}
                      disabled={loading || (index > currentIndex + 1)}
                    >
                      {index < currentIndex ? '✓' : index + 1}
                    </button>
                    <span className={`mt-3 text-sm font-medium transition-colors ${
                      index <= currentIndex ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </nav>

            {/* Step Content Card - Full Width */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
              <div className="min-h-[500px] w-full">
                {stepper.switch({
                  "basic-info": () => <BasicInfoStep loading={loading} />,
                  "family-info": () => <FamilyInfoStep loading={loading} />,
                  "additional-info": () => <AdditionalInfoStep loading={loading} />,
                })}
              </div>
            </div>

            {/* Modern Controls */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </Button>
                  {!stepper.isFirst && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const currentFormValues = form.getValues()
                        setFormData(prev => ({ ...prev, ...currentFormValues }))
                        stepper.prev()
                      }}
                      disabled={loading}
                      className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </>
                  ) : stepper.isLast ? (
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
                  ) : (
                    <>
                      Next Step
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
