"use client"

import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Save, User } from "lucide-react"
import { studentSchema, type StudentFormData } from "@/lib/validations/student"

interface StudentFormProps {
  initialData?: Partial<StudentFormData>
  onSubmit: (data: StudentFormData) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

export default function StudentForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isEdit = false 
}: StudentFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    mode: "onChange",
    defaultValues: {
      admissionNo: initialData.admissionNo || "",
      aadharNo: initialData.aadharNo || "",
      emisNo: initialData.emisNo || "",
      name: initialData.name || "",
      gender: initialData.gender as "MALE" | "FEMALE" | undefined,
      dateOfBirth: initialData.dateOfBirth || "",
      community: initialData.community || "",
      motherTongue: initialData.motherTongue || "",
      mobileNo1: initialData.mobileNo1 || "",
      mobileNo2: initialData.mobileNo2 || "",
      fatherName: initialData.fatherName || "",
      motherName: initialData.motherName || "",
      address: initialData.address || "",
      previousSchool: initialData.previousSchool || "",
      religion: initialData.religion || "",
      caste: initialData.caste || "",
      nationality: initialData.nationality || "Indian",
      remarks: initialData.remarks || "",
      isActive: initialData.isActive ?? true,
    },
  })

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>{isEdit ? "Edit Student Information" : "Student Information"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              {error}
            </Alert>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="admissionNo">Admission Number *</Label>
              <Input
                id="admissionNo"
                {...register("admissionNo")}
                disabled={loading}
                className={errors.admissionNo ? "border-red-500" : ""}
              />
              {errors.admissionNo && (
                <p className="text-sm text-red-600">{errors.admissionNo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Student Name *</Label>
              <Input
                id="name"
                {...register("name")}
                disabled={loading}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                {...register("gender")}
                disabled={loading}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.gender ? "border-red-500" : ""}`}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                disabled={loading}
                className={errors.dateOfBirth ? "border-red-500" : ""}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="aadharNo">Aadhar Number</Label>
              <Input
                id="aadharNo"
                {...register("aadharNo")}
                disabled={loading}
                placeholder="12 digit Aadhar number"
                className={errors.aadharNo ? "border-red-500" : ""}
              />
              {errors.aadharNo && (
                <p className="text-sm text-red-600">{errors.aadharNo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emisNo">EMIS Number</Label>
              <Input
                id="emisNo"
                {...register("emisNo")}
                disabled={loading}
                placeholder="Educational Management Information System ID"
                className={errors.emisNo ? "border-red-500" : ""}
              />
              {errors.emisNo && (
                <p className="text-sm text-red-600">{errors.emisNo.message}</p>
              )}
            </div>
          </div>

          {/* Family Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father&apos;s Name *</Label>
                <Input
                  id="fatherName"
                  {...register("fatherName")}
                  disabled={loading}
                  className={errors.fatherName ? "border-red-500" : ""}
                />
                {errors.fatherName && (
                  <p className="text-sm text-red-600">{errors.fatherName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName">Mother&apos;s Name *</Label>
                <Input
                  id="motherName"
                  {...register("motherName")}
                  disabled={loading}
                  className={errors.motherName ? "border-red-500" : ""}
                />
                {errors.motherName && (
                  <p className="text-sm text-red-600">{errors.motherName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNo1">Primary Mobile *</Label>
                <Input
                  id="mobileNo1"
                  {...register("mobileNo1")}
                  disabled={loading}
                  placeholder="10 digit mobile number"
                  className={errors.mobileNo1 ? "border-red-500" : ""}
                />
                {errors.mobileNo1 && (
                  <p className="text-sm text-red-600">{errors.mobileNo1.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNo2">Secondary Mobile</Label>
                <Input
                  id="mobileNo2"
                  {...register("mobileNo2")}
                  disabled={loading}
                  placeholder="10 digit mobile number (optional)"
                  className={errors.mobileNo2 ? "border-red-500" : ""}
                />
                {errors.mobileNo2 && (
                  <p className="text-sm text-red-600">{errors.mobileNo2.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="community">Community *</Label>
                <Input
                  id="community"
                  {...register("community")}
                  disabled={loading}
                  className={errors.community ? "border-red-500" : ""}
                />
                {errors.community && (
                  <p className="text-sm text-red-600">{errors.community.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherTongue">Mother Tongue *</Label>
                <Input
                  id="motherTongue"
                  {...register("motherTongue")}
                  disabled={loading}
                  className={errors.motherTongue ? "border-red-500" : ""}
                />
                {errors.motherTongue && (
                  <p className="text-sm text-red-600">{errors.motherTongue.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="religion">Religion *</Label>
                <Input
                  id="religion"
                  {...register("religion")}
                  disabled={loading}
                  className={errors.religion ? "border-red-500" : ""}
                />
                {errors.religion && (
                  <p className="text-sm text-red-600">{errors.religion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="caste">Caste *</Label>
                <Input
                  id="caste"
                  {...register("caste")}
                  disabled={loading}
                  className={errors.caste ? "border-red-500" : ""}
                />
                {errors.caste && (
                  <p className="text-sm text-red-600">{errors.caste.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  {...register("nationality")}
                  disabled={loading}
                  className={errors.nationality ? "border-red-500" : ""}
                />
                {errors.nationality && (
                  <p className="text-sm text-red-600">{errors.nationality.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousSchool">Previous School</Label>
                <Input
                  id="previousSchool"
                  {...register("previousSchool")}
                  disabled={loading}
                  className={errors.previousSchool ? "border-red-500" : ""}
                />
                {errors.previousSchool && (
                  <p className="text-sm text-red-600">{errors.previousSchool.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="address">Address *</Label>
              <textarea
                id="address"
                rows={3}
                {...register("address")}
                disabled={loading}
                placeholder="Complete address with landmark"
                className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.address ? "border-red-500" : ""}`}
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <textarea
                id="remarks"
                rows={3}
                {...register("remarks")}
                disabled={loading}
                placeholder="Additional notes or comments"
                className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.remarks ? "border-red-500" : ""}`}
              />
              {errors.remarks && (
                <p className="text-sm text-red-600">{errors.remarks.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !isValid}>
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? "Update Student" : "Save Student"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}