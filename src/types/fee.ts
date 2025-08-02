export interface FeeItem {
  id?: string
  templateId: string
  templateName: string
  templateCategory: string
  amount: number
  isCompulsory: boolean
  isEditableDuringEnrollment: boolean
  order: number
}

export interface ScholarshipItem {
  id?: string
  templateId: string
  templateName: string
  templateType: string
  amount: number
  isAutoApplied: boolean
  isEditableDuringEnrollment: boolean
  order: number
}