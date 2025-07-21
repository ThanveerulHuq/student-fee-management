"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
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
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const values = form.getValues()
            await handleStepSubmit(values)
          }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {isEdit ? "Edit Student" : "Add New Student"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Step {currentIndex + 1} of {steps.length}
              </span>
            </div>
          </div>

          {/* Stepper Navigation */}
          <nav aria-label="Student Form Steps" className="group my-6">
            <ol className="flex items-center justify-between gap-2">
              {stepper.all.map((step, index, array) => (
                <React.Fragment key={step.id}>
                  <li className="flex items-center gap-4 flex-shrink-0">
                    <Button
                      type="button"
                      role="tab"
                      variant={index <= currentIndex ? "default" : "secondary"}
                      aria-current={
                        stepper.current.id === step.id ? "step" : undefined
                      }
                      aria-posinset={index + 1}
                      aria-setsize={steps.length}
                      aria-selected={stepper.current.id === step.id}
                      className="flex size-10 items-center justify-center rounded-full"
                      onClick={async () => {
                        // Can't skip steps forwards but can go back anywhere
                        if (index > currentIndex) {
                          // Validate current step before moving forward
                          const currentFormValues = form.getValues()
                          const isStepValid = await validateCurrentStep(currentFormValues)
                          if (!isStepValid) return
                          // Save current step data before moving
                          setFormData(prev => ({ ...prev, ...currentFormValues }))
                        }
                        stepper.goTo(step.id)
                      }}
                      disabled={loading}
                    >
                      {index + 1}
                    </Button>
                    <span className="text-sm font-medium">{step.label}</span>
                  </li>
                  {index < array.length - 1 && (
                    <Separator
                      className={`flex-1 ${
                        index < currentIndex ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </ol>
          </nav>

          {/* Step Content */}
          <div className="min-h-[400px] space-y-4">
            {stepper.switch({
              "basic-info": () => <BasicInfoStep loading={loading} />,
              "family-info": () => <FamilyInfoStep loading={loading} />,
              "additional-info": () => <AdditionalInfoStep loading={loading} />,
            })}
          </div>

          {/* Controls */}
          <div className="flex justify-between pt-6 border-t">
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
              
              {!stepper.isFirst && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Save current step data before going back
                    const currentFormValues = form.getValues()
                    setFormData(prev => ({ ...prev, ...currentFormValues }))
                    stepper.prev()
                  }}
                  disabled={loading}
                  className="min-w-[100px]"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex space-x-4">
              <Button 
                type="submit" 
                disabled={loading}
                className={`min-w-[120px] ${
                  stepper.isLast 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  "Processing..."
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
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
