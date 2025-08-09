# Security Improvements Guide

## 🔒 Critical Security Issues & Solutions

This document addresses security vulnerabilities identified in the BlueMoon Student Fee Management System and provides comprehensive solutions.

## 1. Critical Security Issues

### ❌ Issue: Prisma Client in Auth Configuration
**Risk Level**: HIGH
**Current Problem**: Creating new PrismaClient instances in auth configuration

```typescript
// lib/auth.ts - PROBLEMATIC
const prisma = new PrismaClient() // ❌ Should use singleton

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({ // ❌ Direct usage
          where: { username: credentials.username }
        })
        // ...
      }
    })
  ]
}
```

**Solution**: Use centralized Prisma instance and proper error handling

```typescript
// lib/auth.ts - SECURE
import { prisma } from '@/lib/prisma' // ✅ Use singleton

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
            select: { // ✅ Only select needed fields
              id: true,
              username: true,
              password: true,
              role: true,
              isActive: true
            }
          })

          if (!user?.isActive) {
            throw new Error('Account disabled')
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
            throw new Error('Invalid credentials')
          }

          // ✅ Don't return password
          const { password, ...safeUser } = user
          return safeUser
        } catch (error) {
          console.error('Auth error:', error)
          return null // ✅ Never expose error details to client
        }
      }
    })
  ]
}
```

### ❌ Issue: No CSRF Protection
**Risk Level**: HIGH
**Current Problem**: State-changing operations without CSRF protection

**Solution**: Implement CSRF protection for forms

```typescript
// middleware.ts - Add CSRF protection
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // CSRF protection for POST/PUT/DELETE requests
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const token = await getToken({ req: request })
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    // Verify origin for CSRF protection
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    if (origin && !origin.includes(host || '')) {
      return NextResponse.json(
        { error: 'CSRF check failed' },
        { status: 403 }
      )
    }
  }

  return NextResponse.next()
}
```

### ❌ Issue: Weak Session Strategy
**Risk Level**: MEDIUM
**Current Problem**: JWT without refresh tokens

**Solution**: Implement proper session management

```typescript
// lib/auth.ts - Enhanced session configuration
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours instead of default 30 days
    updateAge: 2 * 60 * 60, // Update session every 2 hours
  },
  jwt: {
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === "update") {
        // Refresh user data on session update
        const refreshedUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true, username: true, role: true, isActive: true }
        })
        
        if (!refreshedUser?.isActive) {
          throw new Error('Account disabled')
        }
        
        return { ...token, ...refreshedUser }
      }

      if (user) {
        token.role = user.role
        token.username = user.username
      }
      
      return token
    },
    async session({ session, token }) {
      // Validate token isn't expired
      if (Date.now() > (token.exp || 0) * 1000) {
        throw new Error('Token expired')
      }

      session.user.id = token.sub!
      session.user.role = token.role as string
      session.user.username = token.username as string
      
      return session
    }
  }
}
```

## 2. Input Validation & Sanitization

### ❌ Issue: Direct Prisma Queries Without Additional Validation
**Current Problem**: Trusting Zod validation alone

```typescript
// VULNERABLE: Direct database insertion
export async function POST(request: NextRequest) {
  const body = await request.json()
  const validatedData = studentSchema.parse(body) // Only Zod validation
  
  const student = await prisma.student.create({
    data: validatedData // ❌ Direct insertion
  })
}
```

**Solution**: Multi-layer validation and sanitization

```typescript
// lib/validation/enhanced-validation.ts
import DOMPurify from 'isomorphic-dompurify'
import { z } from 'zod'

export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input.trim(), { 
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: []
  })
}

export function sanitizeStudentData(data: any) {
  return {
    ...data,
    name: sanitizeString(data.name),
    fatherName: sanitizeString(data.fatherName),
    motherName: sanitizeString(data.motherName),
    address: sanitizeString(data.address),
    remarks: data.remarks ? sanitizeString(data.remarks) : null
  }
}

// Enhanced validation schema
export const secureStudentSchema = z.object({
  admissionNo: z.string()
    .min(1).max(20)
    .regex(/^[A-Z0-9]+$/) // Only alphanumeric
    .transform(sanitizeString),
  name: z.string()
    .min(2).max(100)
    .regex(/^[a-zA-Z\s.'-]+$/) // Only letters, spaces, dots, apostrophes, hyphens
    .transform(sanitizeString),
  // ... other fields with proper sanitization
})
```

**Secure API Implementation**:

```typescript
// api/students/route.ts - SECURE
import { requireAuth } from '@/lib/auth-utils'
import { secureStudentSchema, sanitizeStudentData } from '@/lib/validation/enhanced-validation'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    await rateLimit(request)
    
    // Authentication
    const session = await requireAuth()
    
    // Parse and validate input
    const body = await request.json()
    const validatedData = secureStudentSchema.parse(body)
    const sanitizedData = sanitizeStudentData(validatedData)
    
    // Check permissions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    // Additional business logic validation
    const existingStudent = await prisma.student.findUnique({
      where: { admissionNo: sanitizedData.admissionNo }
    })
    
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Admission number already exists' },
        { status: 409 }
      )
    }
    
    // Secure database operation
    const student = await prisma.student.create({
      data: {
        ...sanitizedData,
        createdBy: session.user.id, // Audit trail
        dateOfBirth: new Date(sanitizedData.dateOfBirth),
        admissionDate: new Date(sanitizedData.admissionDate)
      },
      select: { // Only return safe fields
        id: true,
        admissionNo: true,
        name: true,
        gender: true,
        age: true,
        createdAt: true
      }
    })
    
    // Audit logging
    await logAuditEvent({
      userId: session.user.id,
      action: 'CREATE_STUDENT',
      resourceId: student.id,
      details: { admissionNo: student.admissionNo }
    })
    
    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    // Log error but don't expose details
    console.error('Student creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 3. Rate Limiting Implementation

```typescript
// lib/rate-limit.ts
import { NextRequest } from 'next/server'
import { LRUCache } from 'lru-cache'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

const rateLimit = (options: Options = {}) => {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000, // 1 minute
  })

  return {
    check: (request: NextRequest, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit

        if (isRateLimited) {
          reject(new Error('Rate limit exceeded'))
        } else {
          resolve()
        }
      }),
  }
}

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
})

export async function rateLimit(request: NextRequest, limit: number = 10) {
  const token = request.ip || 'anonymous'
  await limiter.check(request, limit, token)
}
```

## 4. Audit Logging System

```typescript
// lib/audit.ts
interface AuditEvent {
  userId: string
  action: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function logAuditEvent(event: AuditEvent) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: event.userId,
        action: event.action,
        resourceType: event.resourceType || 'UNKNOWN',
        resourceId: event.resourceId,
        details: event.details || {},
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: new Date()
      }
    })
  } catch (error) {
    // Audit logging should never break the application
    console.error('Audit logging failed:', error)
  }
}

// Usage in API routes
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  const studentId = params.id
  
  // ... update logic
  
  await logAuditEvent({
    userId: session.user.id,
    action: 'UPDATE_STUDENT',
    resourceType: 'STUDENT',
    resourceId: studentId,
    details: { updatedFields: Object.keys(validatedData) },
    ipAddress: request.ip,
    userAgent: request.headers.get('user-agent') || undefined
  })
}
```

## 5. Database Security Enhancements

### Prisma Schema Security Updates

```prisma
// prisma/schema.prisma - Add audit trail
model AuditLog {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  userId       String   @db.ObjectId
  action       String
  resourceType String
  resourceId   String?
  details      Json?
  ipAddress    String?
  userAgent    String?
  timestamp    DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId, timestamp])
  @@index([action, timestamp])
  @@map("audit_logs")
}

model User {
  // ... existing fields
  auditLogs AuditLog[]
  lastLogin DateTime?
  loginAttempts Int @default(0)
  lockedUntil   DateTime?
  
  @@index([username]) // Ensure username queries are fast
}

// Add row-level security fields
model Student {
  // ... existing fields
  createdBy String @db.ObjectId
  updatedBy String @db.ObjectId
  
  creator User @relation("StudentCreator", fields: [createdBy], references: [id])
  updater User @relation("StudentUpdater", fields: [updatedBy], references: [id])
  
  @@index([createdBy])
  @@index([updatedBy])
}
```

## 6. Environment Security

### Secure Environment Variables

```bash
# .env.example - Document required variables
DATABASE_URL="mongodb://username:password@localhost:27017/dbname"
NEXTAUTH_SECRET="your-super-secure-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Security headers
SECURITY_HEADERS="true"

# Rate limiting
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_MAX="100"

# Audit logging
AUDIT_ENABLED="true"
```

### Security Headers Middleware

```typescript
// middleware.ts - Add security headers
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  )
  
  // Remove server information
  response.headers.delete('Server')
  response.headers.delete('X-Powered-By')
  
  return response
}
```

## 7. Password Security Enhancement

```typescript
// lib/auth-utils.ts - Enhanced password handling
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12 // Increased from default 10

export async function hashPassword(password: string): Promise<string> {
  // Validate password strength
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
    throw new Error('Password must contain uppercase, lowercase, number and special character')
  }
  
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// Account lockout mechanism
export async function handleFailedLogin(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, loginAttempts: true, lockedUntil: true }
  })
  
  if (!user) return
  
  const attempts = user.loginAttempts + 1
  const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null // 15 minute lockout
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      loginAttempts: attempts,
      lockedUntil: lockUntil
    }
  })
}
```

## 8. Secure File Upload (if needed)

```typescript
// lib/file-upload.ts - Secure file handling
import { writeFile } from 'fs/promises'
import { join } from 'path'

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadFile(file: File, type: 'student-photo' | 'document') {
  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('File type not allowed')
  }
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large')
  }
  
  // Generate secure filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = file.name.split('.').pop()
  const filename = `${type}_${timestamp}_${randomString}.${extension}`
  
  // Save file
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const path = join(process.cwd(), 'uploads', type, filename)
  
  await writeFile(path, buffer)
  
  return {
    filename,
    originalName: file.name,
    size: file.size,
    type: file.type,
    path: `/uploads/${type}/${filename}`
  }
}
```

## 9. Security Testing Checklist

### Automated Security Tests

```typescript
// __tests__/security/auth.test.ts
describe('Authentication Security', () => {
  test('should reject weak passwords', async () => {
    const weakPasswords = ['123456', 'password', 'abc123']
    
    for (const password of weakPasswords) {
      await expect(hashPassword(password)).rejects.toThrow('Password must contain')
    }
  })
  
  test('should lock account after failed attempts', async () => {
    const username = 'test@example.com'
    
    // Simulate 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await handleFailedLogin(username)
    }
    
    const user = await prisma.user.findUnique({ where: { username } })
    expect(user?.lockedUntil).toBeTruthy()
  })
  
  test('should validate CSRF tokens', async () => {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://malicious-site.com' // Different origin
      },
      body: JSON.stringify({ name: 'Test Student' })
    })
    
    expect(response.status).toBe(403)
  })
})
```

## 10. Security Monitoring

### Security Alerts

```typescript
// lib/security-monitoring.ts
export async function detectSuspiciousActivity(userId: string, action: string) {
  const recentActions = await prisma.auditLog.findMany({
    where: {
      userId,
      timestamp: {
        gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      }
    }
  })
  
  // Alert if too many actions in short time
  if (recentActions.length > 20) {
    await sendSecurityAlert({
      type: 'SUSPICIOUS_ACTIVITY',
      userId,
      details: { actionCount: recentActions.length, timeWindow: '5 minutes' }
    })
  }
  
  // Alert on sensitive actions from new IPs
  if (['DELETE_STUDENT', 'UPDATE_USER'].includes(action)) {
    const recentLogins = await prisma.auditLog.findMany({
      where: {
        userId,
        action: 'LOGIN',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })
    
    if (recentLogins.length > 5) {
      await sendSecurityAlert({
        type: 'MULTIPLE_IP_ACCESS',
        userId,
        details: { loginCount: recentLogins.length }
      })
    }
  }
}
```

This security enhancement guide addresses the most critical vulnerabilities and provides a robust security foundation for your application. Implement these changes progressively, starting with the highest-risk items first.