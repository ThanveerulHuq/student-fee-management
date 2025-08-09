'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { studentSchema } from '@/lib/validations/student'
import { requireAuth } from '@/lib/auth-utils'

export async function createStudent(formData: FormData) {
  await requireAuth()
  
  // Convert FormData to object
  const rawData = Object.fromEntries(formData.entries())
  
  // Handle mobile numbers array (now as embedded type)
  const mobileNumbers = []
  let index = 0
  while (rawData[`mobileNumbers.${index}.number`]) {
    mobileNumbers.push({
      number: rawData[`mobileNumbers.${index}.number`] as string,
      isWhatsApp: rawData[`mobileNumbers.${index}.isWhatsApp`] === 'true',
      isPrimary: rawData[`mobileNumbers.${index}.isPrimary`] === 'true',
      label: rawData[`mobileNumbers.${index}.label`] as string || undefined
    })
    delete rawData[`mobileNumbers.${index}.number`]
    delete rawData[`mobileNumbers.${index}.isWhatsApp`]
    delete rawData[`mobileNumbers.${index}.isPrimary`]
    delete rawData[`mobileNumbers.${index}.label`]
    index++
  }
  
  const dataWithMobileNumbers = {
    ...rawData,
    mobileNumbers
  }
  
  const validatedData = studentSchema.parse(dataWithMobileNumbers)
  
  try {
    // Calculate age from date of birth
    const age = new Date().getFullYear() - new Date(validatedData.dateOfBirth).getFullYear()
    
    // Check if admission number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { admissionNo: validatedData.admissionNo },
    })
    
    if (existingStudent) {
      throw new Error('Admission number already exists')
    }
    
    const student = await prisma.student.create({
      data: {
        ...validatedData,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        admissionDate: new Date(validatedData.admissionDate),
        age,
        mobileNumbers: validatedData.mobileNumbers
      }
    })
    
    revalidatePath('/students')
    redirect(`/students/${student.id}`)
  } catch (error) {
    console.error('Error creating student:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to create student')
  }
}

export async function updateStudent(id: string, formData: FormData) {
  await requireAuth()
  
  // Convert FormData to object
  const rawData = Object.fromEntries(formData.entries())
  
  // Handle mobile numbers array (now as embedded type)
  const mobileNumbers = []
  let index = 0
  while (rawData[`mobileNumbers.${index}.number`]) {
    mobileNumbers.push({
      number: rawData[`mobileNumbers.${index}.number`] as string,
      isWhatsApp: rawData[`mobileNumbers.${index}.isWhatsApp`] === 'true',
      isPrimary: rawData[`mobileNumbers.${index}.isPrimary`] === 'true',
      label: rawData[`mobileNumbers.${index}.label`] as string || undefined
    })
    delete rawData[`mobileNumbers.${index}.number`]
    delete rawData[`mobileNumbers.${index}.isWhatsApp`]
    delete rawData[`mobileNumbers.${index}.isPrimary`]
    delete rawData[`mobileNumbers.${index}.label`]
    index++
  }
  
  const dataWithMobileNumbers = {
    ...rawData,
    mobileNumbers
  }
  
  const validatedData = studentSchema.parse(dataWithMobileNumbers)
  
  try {
    // Calculate age from date of birth
    const age = new Date().getFullYear() - new Date(validatedData.dateOfBirth).getFullYear()
    
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    })
    
    if (!existingStudent) {
      throw new Error('Student not found')
    }
    
    // Check if admission number already exists for a different student
    if (validatedData.admissionNo !== existingStudent.admissionNo) {
      const duplicateStudent = await prisma.student.findUnique({
        where: { admissionNo: validatedData.admissionNo },
      })
      
      if (duplicateStudent) {
        throw new Error('Admission number already exists')
      }
    }
    
    // Update student with new data (mobile numbers are now embedded)
    const student = await prisma.student.update({
      where: { id },
      data: {
        ...validatedData,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        admissionDate: new Date(validatedData.admissionDate),
        age,
        mobileNumbers: validatedData.mobileNumbers
      }
    })
    
    revalidatePath('/students')
    revalidatePath(`/students/${id}`)
    redirect(`/students/${student.id}`)
  } catch (error) {
    console.error('Error updating student:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to update student')
  }
}

export async function deactivateStudent(id: string) {
  await requireAuth()
  
  try {
    const student = await prisma.student.update({
      where: { id },
      data: { isActive: false }
    })
    
    revalidatePath('/students')
    revalidatePath(`/students/${id}`)
    
    return { success: true, message: 'Student deactivated successfully' }
  } catch (error) {
    console.error('Error deactivating student:', error)
    throw new Error('Failed to deactivate student')
  }
}

export async function reactivateStudent(id: string) {
  await requireAuth()
  
  try {
    const student = await prisma.student.update({
      where: { id },
      data: { isActive: true }
    })
    
    revalidatePath('/students')
    revalidatePath(`/students/${id}`)
    
    return { success: true, message: 'Student reactivated successfully' }
  } catch (error) {
    console.error('Error reactivating student:', error)
    throw new Error('Failed to reactivate student')
  }
}

export async function deleteStudent(id: string) {
  const session = await requireAuth()
  
  // Only admin can delete students
  if (session.user.role !== 'ADMIN') {
    throw new Error('Admin access required to delete students')
  }
  
  try {
    // Check if student has any enrollments
    const enrollmentsCount = await prisma.studentEnrollment.count({
      where: { studentId: id }
    })
    
    if (enrollmentsCount > 0) {
      throw new Error('Cannot delete student with existing enrollments. Deactivate instead.')
    }
    
    // Check if student has any documents
    const documentsCount = await prisma.document.count({
      where: { studentId: id }
    })
    
    if (documentsCount > 0) {
      // Delete documents first
      await prisma.document.deleteMany({
        where: { studentId: id }
      })
    }
    
    // Delete student (mobile numbers are embedded, so they'll be deleted automatically)
    await prisma.student.delete({
      where: { id }
    })
    
    revalidatePath('/students')
    
    return { success: true, message: 'Student deleted successfully' }
  } catch (error) {
    console.error('Error deleting student:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to delete student')
  }
}