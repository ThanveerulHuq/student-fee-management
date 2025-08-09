# API Design Best Practices

## 🛠️ Current API Issues & Modern Solutions

This guide addresses the API design problems in the BlueMoon Student Fee Management System and provides Next.js 15 best practices for modern API architecture.

## 1. Current API Architecture Problems

### ❌ Issue: Overuse of API Routes
**Problem**: Using API routes for simple data fetching that should be server-side

```typescript
// CURRENT BAD PATTERN - Unnecessary API route
// app/api/students/route.ts
export async function GET(request: NextRequest) {
  const students = await prisma.student.findMany()
  return NextResponse.json(students)
}

// app/students/page.tsx
"use client"
export default function StudentsPage() {
  const [students, setStudents] = useState([])
  useEffect(() => {
    fetch('/api/students').then(res => res.json()).then(setStudents)
  }, [])
  return <StudentsTable students={students} />
}
```

**Solution**: Direct server component data fetching

```typescript
// MODERN PATTERN - No API route needed
// app/students/page.tsx
import { getStudents } from '@/lib/data/students'

export default async function StudentsPage() {
  const students = await getStudents()
  return <StudentsTable students={students} />
}

// lib/data/students.ts
export async function getStudents() {
  return await prisma.student.findMany({
    include: { mobileNumbers: true },
    orderBy: { createdAt: 'desc' }
  })
}
```

## 2. When to Use API Routes vs Server Components

### ✅ Use API Routes For:
1. **Mutations** (POST, PUT, DELETE)
2. **External API integrations**
3. **Webhooks**
4. **File uploads**
5. **Third-party service callbacks**

### ✅ Use Server Components For:
1. **Data fetching for pages**
2. **Simple database queries**
3. **Authentication checks**
4. **Static data rendering**

### API Routes - Correct Usage Examples

```typescript
// app/api/students/route.ts - ✅ GOOD: For mutations only
export async function POST(request: NextRequest) {
  const session = await requireAuth()
  const data = await request.json()
  const validatedData = studentSchema.parse(data)
  
  const student = await prisma.student.create({
    data: validatedData
  })
  
  revalidatePath('/students') // Revalidate the students page
  return NextResponse.json(student)
}

// app/api/fees/collect/route.ts - ✅ GOOD: Complex transaction
export async function POST(request: NextRequest) {
  const session = await requireAuth()
  const data = await request.json()
  
  // Complex transaction that spans multiple tables
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({ data: paymentData })
    await tx.studentEnrollment.update({ 
      where: { id: enrollmentId },
      data: { updatedFees }
    })
    return payment
  })
  
  revalidatePath('/fees')
  return NextResponse.json(result)
}
```

## 3. Server Actions - The Modern Alternative

### Replace Simple API Routes with Server Actions

```typescript
// lib/actions/student-actions.ts - Modern approach
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'
import { studentSchema } from '@/lib/validations/student'

export async function createStudent(formData: FormData) {
  const session = await requireAuth()
  
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = studentSchema.parse(rawData)
  
  const student = await prisma.student.create({
    data: {
      ...validatedData,
      dateOfBirth: new Date(validatedData.dateOfBirth),
      admissionDate: new Date(validatedData.admissionDate),
    }
  })
  
  revalidatePath('/students')
  redirect(`/students/${student.id}`)
}

export async function updateStudent(studentId: string, formData: FormData) {
  const session = await requireAuth()
  
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = studentUpdateSchema.parse(rawData)
  
  const student = await prisma.student.update({
    where: { id: studentId },
    data: validatedData
  })
  
  revalidatePath(`/students/${studentId}`)
  revalidatePath('/students')
  
  return { success: true, student }
}

export async function deleteStudent(studentId: string) {
  const session = await requireAuth()
  
  if (session.user.role !== 'ADMIN') {
    throw new Error('Insufficient permissions')
  }
  
  await prisma.student.update({
    where: { id: studentId },
    data: { isActive: false }
  })
  
  revalidatePath('/students')
}
```

### Using Server Actions in Forms

```typescript
// app/students/add/page.tsx
import { createStudent } from '@/lib/actions/student-actions'

export default function AddStudentPage() {
  return (
    <form action={createStudent}>
      <input name="name" placeholder="Student Name" required />
      <input name="admissionNo" placeholder="Admission Number" required />
      <select name="gender" required>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
      </select>
      <button type="submit">Create Student</button>
    </form>
  )
}
```

## 4. Proper Error Handling in APIs

### Current Problem: Generic Error Handling
```typescript
// BAD: Generic error handling
export async function GET() {
  try {
    const data = await prisma.student.findMany()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" }, // ❌ Not helpful
      { status: 500 }
    )
  }
}
```

### Solution: Structured Error Handling
```typescript
// lib/errors.ts - Structured error classes
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`)
    this.name = 'NotFoundError'
  }
}

export class PermissionError extends Error {
  constructor(action: string) {
    super(`Insufficient permissions for ${action}`)
    this.name = 'PermissionError'
  }
}

// lib/api-utils.ts - Error handler
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)
  
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: 400 }
    )
  }
  
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    )
  }
  
  if (error instanceof PermissionError) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    )
  }
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation failed', 
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      },
      { status: 400 }
    )
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const data = await request.json()
    
    if (session.user.role !== 'ADMIN') {
      throw new PermissionError('create student')
    }
    
    const validatedData = studentSchema.parse(data)
    
    const existingStudent = await prisma.student.findUnique({
      where: { admissionNo: validatedData.admissionNo }
    })
    
    if (existingStudent) {
      throw new ValidationError('Admission number already exists', {
        field: 'admissionNo',
        value: validatedData.admissionNo
      })
    }
    
    const student = await prisma.student.create({
      data: validatedData
    })
    
    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
```

## 5. API Response Standardization

### Consistent Response Format
```typescript
// lib/api-response.ts
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  errors?: Array<{ field: string; message: string }>
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function successResponse<T>(
  data: T, 
  pagination?: ApiResponse<T>['pagination']
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    pagination
  })
}

export function errorResponse(
  error: string, 
  status: number = 400,
  errors?: Array<{ field: string; message: string }>
): NextResponse {
  return NextResponse.json({
    success: false,
    error,
    errors
  }, { status })
}

// Usage
export async function GET(request: NextRequest) {
  try {
    const students = await getStudents()
    return successResponse(students.data, students.pagination)
  } catch (error) {
    return errorResponse('Failed to fetch students', 500)
  }
}
```

## 6. API Middleware Pattern

### Reusable Middleware for Common Tasks
```typescript
// lib/api-middleware.ts
export function withAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    try {
      const session = await requireAuth()
      return await handler(request, context, session)
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }
}

export function withValidation<T>(schema: z.ZodSchema<T>, handler: Function) {
  return async (request: NextRequest, context: any, session?: any) => {
    try {
      const body = await request.json()
      const validatedData = schema.parse(body)
      return await handler(request, context, session, validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse('Validation failed', 400, 
          error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        )
      }
      throw error
    }
  }
}

export function withRateLimit(limit: number = 10) {
  return function(handler: Function) {
    return async (request: NextRequest, context: any, ...args: any[]) => {
      try {
        await rateLimit(request, limit)
        return await handler(request, context, ...args)
      } catch (error) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        )
      }
    }
  }
}

// Usage - Composable middleware
export const POST = withRateLimit(5)(
  withAuth(
    withValidation(studentSchema, async (request, context, session, validatedData) => {
      const student = await prisma.student.create({
        data: {
          ...validatedData,
          createdBy: session.user.id
        }
      })
      
      return successResponse(student)
    })
  )
)
```

## 7. Optimized API Routes for Complex Operations

### Fee Collection API - Optimized Transaction
```typescript
// app/api/fees/collect/route.ts
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const data = await request.json()
    const validatedData = feeCollectionSchema.parse(data)
    
    // Use database transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validate student enrollment exists
      const enrollment = await tx.studentEnrollment.findUnique({
        where: { id: validatedData.studentEnrollmentId },
        include: { student: true, academicYear: true }
      })
      
      if (!enrollment) {
        throw new NotFoundError('StudentEnrollment', validatedData.studentEnrollmentId)
      }
      
      // 2. Validate payment amounts
      const totalCalculated = validatedData.paymentItems.reduce((sum, item) => sum + item.amount, 0)
      if (Math.abs(validatedData.totalAmount - totalCalculated) > 0.01) {
        throw new ValidationError('Total amount mismatch')
      }
      
      // 3. Generate receipt number
      const receiptNo = await generateReceiptNumber(enrollment.academicYear.year)
      
      // 4. Create payment record
      const payment = await tx.payment.create({
        data: {
          receiptNo,
          studentEnrollmentId: validatedData.studentEnrollmentId,
          totalAmount: validatedData.totalAmount,
          paymentItems: validatedData.paymentItems,
          paymentMethod: validatedData.paymentMethod,
          createdBy: session.user.id,
          student: enrollment.student,
          academicYear: enrollment.academicYear
        }
      })
      
      // 5. Update enrollment fee status
      const updatedFees = calculateUpdatedFees(enrollment.fees, validatedData.paymentItems)
      await tx.studentEnrollment.update({
        where: { id: validatedData.studentEnrollmentId },
        data: { fees: updatedFees }
      })
      
      return payment
    })
    
    // 6. Revalidate affected pages
    revalidatePath('/fees')
    revalidatePath(`/students/${result.student.id}`)
    
    // 7. Log audit event
    await logAuditEvent({
      userId: session.user.id,
      action: 'COLLECT_FEE',
      resourceId: result.id,
      details: { amount: result.totalAmount, receiptNo: result.receiptNo }
    })
    
    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
```

## 8. API Documentation with TypeScript

### Self-Documenting API Types
```typescript
// types/api.ts
export interface StudentCreateRequest {
  admissionNo: string
  name: string
  gender: 'MALE' | 'FEMALE'
  dateOfBirth: string
  fatherName: string
  motherName: string
  mobileNumbers: Array<{
    number: string
    isPrimary: boolean
    isWhatsApp: boolean
    label?: string
  }>
}

export interface StudentResponse {
  id: string
  admissionNo: string
  name: string
  gender: string
  age: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  errors?: Array<{
    field: string
    message: string
  }>
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Usage provides full type safety
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<StudentResponse>>> {
  // Implementation
}
```

## 9. API Testing Strategy

### Comprehensive API Tests
```typescript
// __tests__/api/students.test.ts
describe('/api/students', () => {
  describe('POST /api/students', () => {
    it('should create a student with valid data', async () => {
      const studentData: StudentCreateRequest = {
        admissionNo: 'TEST001',
        name: 'Test Student',
        gender: 'MALE',
        dateOfBirth: '2010-01-01',
        fatherName: 'Test Father',
        motherName: 'Test Mother',
        mobileNumbers: [{
          number: '9876543210',
          isPrimary: true,
          isWhatsApp: true
        }]
      }
      
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send(studentData)
        .expect(201)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data.admissionNo).toBe(studentData.admissionNo)
    })
    
    it('should return validation error for invalid data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        gender: 'INVALID' // Invalid: not in enum
      }
      
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)
      
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toHaveLength(2)
    })
    
    it('should require authentication', async () => {
      await request(app)
        .post('/api/students')
        .send({})
        .expect(401)
    })
  })
})
```

## 10. Migration from Current API to Best Practices

### Phase 1: Immediate Fixes (Week 1)
1. ✅ Add proper error handling to existing API routes
2. ✅ Implement rate limiting
3. ✅ Add input validation with Zod
4. ✅ Standardize response formats

### Phase 2: Architecture Changes (Week 2)
1. ✅ Convert simple GET API routes to server components
2. ✅ Implement server actions for forms
3. ✅ Add proper authentication middleware
4. ✅ Implement audit logging

### Phase 3: Advanced Features (Week 3)
1. ✅ Add caching strategies
2. ✅ Implement optimistic updates
3. ✅ Add comprehensive API tests
4. ✅ Performance monitoring

### Phase 4: Optimization (Week 4)
1. ✅ Remove unused API routes
2. ✅ Optimize database queries
3. ✅ Add API documentation
4. ✅ Performance analysis

## Summary

The key to modern Next.js 15 API design is:
1. **Use server components** for data fetching, not API routes
2. **Use server actions** for simple mutations
3. **Use API routes** only for complex operations, webhooks, and external integrations  
4. **Implement proper error handling** with structured error classes
5. **Add comprehensive validation** and security measures
6. **Focus on type safety** throughout the API layer

This approach will result in better performance, improved developer experience, and more maintainable code.